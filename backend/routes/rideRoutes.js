const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const rideController = require("../controllers/rideControllers");
const Ride = require("../models/rideModel");

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
const upload = multer({ dest: uploadDir });

// Specific routes MUST come BEFORE generic :id route

// GET all rides
router.get("/", rideController.getRides);

// Search rides
router.get("/search", rideController.searchRides);

// Get rides in bounds (for map)
router.get("/bounds", rideController.getRidesInBounds);

// GET AC buses - specific route
router.get("/type/ac", async (req, res) => {
  try {
    const rides = await Ride.find({ bus_type: "AC" });
    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: "No AC buses found", data: [] });
    }
    res.json(rides);
  } catch (err) {
    console.error("Error fetching AC buses:", err);
    res.status(500).json({ error: "Error fetching AC buses: " + err.message });
  }
});

// GET by city - specific route
router.get("/city/:city", async (req, res) => {
  try {
    const rides = await Ride.find({ city: req.params.city });
    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: `No rides found for city: ${req.params.city}`, data: [] });
    }
    res.json(rides);
  } catch (err) {
    console.error("Error fetching rides by city:", err);
    res.status(500).json({ error: "Error fetching rides: " + err.message });
  }
});

// GET rides by route number
router.get("/route/:routeNumber", rideController.getRidesByRoute);

// GET single ride by ID - generic route (COMES LAST)
router.get("/:id", rideController.getRideById);

// POST add new ride
router.post("/", rideController.addRide);

// Upload file endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    console.log("File received:", req.file.originalname);
    res.status(201).json({ message: "File uploaded successfully", filename: req.file.filename });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Error uploading file: " + err.message });
  }
});

module.exports = router;