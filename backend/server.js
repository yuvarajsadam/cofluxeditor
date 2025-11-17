 const express = require("express");
const mongoose = require("mongoose");
const env = require("dotenv");
const cors = require("cors");
const text = require("./model/usermodel");

env.config();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "https://cofluxeditor-frontend.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

const port = process.env.PORT || 5001;

// Mongo Connect
async function connect() {
  try {
    await mongoose.connect(process.env.MONOGO_URL);
    console.log("database connected successfully");
  } catch (e) {
    console.error("database is not connected ", e.message);
  }
}
connect();

// GET all documents
app.get("/", async (req, res) => {
  try {
    const data = await text.find();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new document
app.post("/create", async (req, res) => {
  try {
    const { content } = req.body;

    const doc = await text.create({ content });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE existing (🔥 this is what your frontend calls)
app.put("/update/:id", async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    const updated = await text.findByIdAndUpdate(
      id,
      { content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Document not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

app.listen(port, () => {
  console.log("Server running on " + port);
});
