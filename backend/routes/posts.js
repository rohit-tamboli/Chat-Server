const express = require("express");
const Post = require("../models/Post");

module.exports = function (upload) {
  const router = express.Router();

  // GET ALL POSTS  ->  GET /api/posts
  router.get("/", async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: -1 });
      res.json(posts);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Unable to fetch posts" });
    }
  });

  // CREATE POST  ->  POST /api/posts
  router.post("/", upload.single("file"), async (req, res) => {
    try {
      const { userName, headline, text } = req.body;

      let fileUrl = "";
      let fileType = "";

      if (req.file) {
        fileUrl = "/uploads/" + req.file.filename;

        if (req.file.mimetype.startsWith("image/")) fileType = "image";
        else if (req.file.mimetype === "application/pdf") fileType = "pdf";
        else fileType = "other";
      }

      const newPost = await Post.create({
        userName,
        headline,
        text,
        fileUrl,
        fileType,
      });

      res.status(201).json(newPost);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Unable to create post" });
    }
  });

  // COMMENT ON POST  ->  POST /api/posts/:id/comments
  router.post("/:id/comments", async (req, res) => {
    try {
      const { userName, text } = req.body;
      const { id } = req.params;

      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      post.comments.push({ userName, text });
      await post.save();

      res.status(201).json(post.comments[post.comments.length - 1]);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Unable to add comment" });
    }
  });

  // LIKE / UNLIKE POST  ->  POST /api/posts/:id/like
  router.post("/:id/like", async (req, res) => {
    try {
      const { userName } = req.body;
      const { id } = req.params;

      if (!userName) {
        return res.status(400).json({ error: "userName required" });
      }

      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ error: "Post not found" });

      if (!Array.isArray(post.likes)) {
        post.likes = [];
      }

      const idx = post.likes.indexOf(userName);
      let liked;

      if (idx === -1) {
        // Like
        post.likes.push(userName);
        liked = true;
      } else {
        // Unlike
        post.likes.splice(idx, 1);
        liked = false;
      }

      await post.save();

      res.json({
        liked,
        likesCount: post.likes.length,
        likes: post.likes,
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Unable to like post" });
    }
  });

  return router;
};
