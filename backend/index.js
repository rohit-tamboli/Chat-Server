require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ---------- MIDDLEWARE ----------
// app.use(cors({ origin: "http://localhost:5173" }));
app.use(cors());
app.use(express.json());

// ---------- DATABASE ----------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.send("Backend Running ✔");
});

// ✅ THIS WAS MISSING
app.use("/api/posts", require("./routes/posts"));

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5002;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
