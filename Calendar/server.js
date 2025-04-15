const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow public requests
app.use(bodyParser.json()); // Parse JSON request bodies

// In-memory storage (will later be replaced with a database)
let scheduleData = [];

// Test Route - Check if backend is running
app.get("/", (req, res) => {
    res.send("✅ Node.js Backend is Running!");
});

// Start Server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
