const express = require("express");
const Post = require("../models/Post");

const router = express.Router();

router.get("/", async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.post("/", async (req, res) => {
  const { userName, headline, text } = req.body;

  const newPost = await Post.create({
    userName,
    headline,
    text,
    likes: [],
    comments: [],
  });

  res.status(201).json(newPost);
});

// ✅ LIKE ROUTE
router.post("/:id/like", async (req, res) => {
  const { userName } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json({ message: "Post not found" });

  const index = post.likes.indexOf(userName);
  if (index === -1) post.likes.push(userName);
  else post.likes.splice(index, 1);

  await post.save();
  res.json({ likes: post.likes });
});


// ❌ DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// 💬 ADD COMMENT
router.post("/:id/comments", async (req, res) => {
  try {
    const { userName, text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const newComment = {
      userName,
      text,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    // last added comment return karo
    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    console.error("❌ Add comment error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ EXPORT MUST BE THIS
module.exports = router;
