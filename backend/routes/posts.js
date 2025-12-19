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

// ✅ EXPORT MUST BE THIS
module.exports = router;
