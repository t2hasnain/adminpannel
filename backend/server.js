
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());
app.use(express.static("public"));

// Video upload
app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No video uploaded" });
    
    cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "uploads" },
      (error, result) => {
        if (error) return res.status(500).json({ error: "Upload failed" });
        res.status(200).json({ url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

// Fetch videos
app.get("/videos", async (req, res) => {
  try {
    const { resources } = await cloudinary.api.resources({
      resource_type: "video",
      type: "upload",
      prefix: "uploads",
    });
    const videos = resources.map(file => file.secure_url);
    res.json({ videos });
  } catch (error) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
