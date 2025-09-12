// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
//test
// Middleware
app.use(cors());
app.use(express.json()); // for parsing JSON

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Schema & Model
const formSchema = new mongoose.Schema({
  preset: String,
  language: String,
  firstName: String,
  lastName: String,
  gender: String,
  phoneNumber: String,
  email: String,
  company: String,
  agreeToTerms: Boolean,
  tab: String, // "tab1" or "tab2"
  createdAt: { type: Date, default: Date.now },
});

const Form = mongoose.model("Form", formSchema);

// Routes
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

app.post("/api/forms", async (req, res) => {
  try {
    const formData = new Form(req.body);
    await formData.save();
    res.status(201).json({ message: "Form saved successfully!" });
  } catch (error) {
    console.error("Error saving form:", error);
    res.status(500).json({ message: "Failed to save form data" });
  }
});

app.get("/api/forms", async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Failed to fetch forms" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
