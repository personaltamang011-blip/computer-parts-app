import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔐 MongoDB Atlas connection
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("❌ MONGO_URI not set!");
  process.exit(1);
}

mongoose
  .connect(uri)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 📦 Schema
const partSchema = new mongoose.Schema({
  type: String,
  brand: String,
  model: String,
  quantity: Number,
  price: Number,
});

const Part = mongoose.model("Part", partSchema);

// ➕ Add part
app.post("/submit", async (req, res) => {
  try {
    const part = new Part(req.body);
    await part.save();
    res.json({ message: "✅ Part added successfully!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error saving data" });
  }
});

// 📥 Get parts
app.get("/parts", async (req, res) => {
  const parts = await Part.find().sort({ _id: -1 });
  res.json(parts);
});

// ✏️ Update part
app.put("/parts/:id", async (req, res) => {
  try {
    await Part.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "✅ Part updated successfully!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating part" });
  }
});

// ❌ Delete part
app.delete("/parts/:id", async (req, res) => {
  try {
    await Part.findByIdAndDelete(req.params.id);
    res.json({ message: "🗑️ Part deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting part" });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
