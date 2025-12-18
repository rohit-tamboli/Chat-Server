require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ---------- MIDDLEWARE ----------


// app.use(cors({ origin: "http://localhost:5174" }));
app.use(
  cors({
    origin: [
      "http://localhost:5174",
      "https://hrconnect.vercel.app"
    ],
    credentials: true,  
  })
);


app.use(express.json());

// static folder for uploaded files
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}
app.use("/uploads", express.static(uploadsPath));

// Multer storage for file uploads (isko router me bhi use karna hoga)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ---------- DATABASE CONNECT ----------

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// ---------- ROUTES ----------

// Test route
app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});

// 🧩 Yahan router mount karenge
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes(upload));

// ---------- START SERVER ----------

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
