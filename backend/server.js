const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");
const Ride = require("./models/rideModel");
const Schedule = require("./models/scheduleModel");
const ridesData = require("./seed/ride.json");
const schedulesData = require("./seed/schedules.json");

const app = express();
app.use(cors());
app.use(express.json());

// Auto-seed database if empty
const seedDatabaseIfEmpty = async () => {
  try {
    const rideCount = await Ride.countDocuments();
    const scheduleCount = await Schedule.countDocuments();
    
    if (rideCount === 0) {
      console.log("🌱 Seeding Rides data...");
      await Ride.insertMany(ridesData);
      console.log("✅ Database seeded successfully with " + ridesData.length + " rides");
    } else {
      console.log("✅ Database already has " + rideCount + " rides");
    }
    
    if (scheduleCount === 0) {
      console.log("🌱 Seeding Schedules data...");
      await Schedule.insertMany(schedulesData);
      console.log("✅ Database seeded successfully with " + schedulesData.length + " schedules");
    } else {
      console.log("✅ Database already has " + scheduleCount + " schedules");
    }
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

// Seed database endpoint (manual)
app.get("/api/seed", async (req, res) => {
  try {
    await Ride.deleteMany();
    await Schedule.deleteMany();
    const seedRides = await Ride.insertMany(ridesData);
    const seedSchedules = await Schedule.insertMany(schedulesData);
    res.json({ 
      message: "Database seeded successfully",
      rides: { count: seedRides.length, data: seedRides },
      schedules: { count: seedSchedules.length, data: seedSchedules }
    });
  } catch (error) {
    res.status(500).json({ message: "Error seeding database", error: error.message });
  }
});

// APIs FIRST
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoute"));
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/bookings", require("./routes/bookingRoute"));


// PAGE ROUTES - Serve specific HTML pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});



app.get("/schedule", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "schedule.html"));
});

app.get("/routes", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "routes.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "about.html"));
});

app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "upload.html"));
});

app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "map.html"));
});

// Auth pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// NEW PAGE ROUTES
app.get("/search-results", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "search-results.html"));
});

app.get("/booking", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "booking.html"));
});

app.get("/ticket", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ticket.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// STATIC FILES - Serve backend public assets
app.use(express.static(path.join(__dirname, "public")));

// React frontend production build support (if exists)
const reactBuildPath = path.join(__dirname, "..", "frontend", "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(reactBuildPath));

  // fallback for client-side routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(reactBuildPath, "index.html"));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const startServer = async () => {
  await connectDB();
  await seedDatabaseIfEmpty();

  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
      console.log(`📊 Seed data: http://localhost:${PORT}/api/seed`);
      console.log(`🚌 Rides API: http://localhost:${PORT}/api/rides`);
      console.log(`📅 Schedules API: http://localhost:${PORT}/api/schedules`);
    });
  }
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

module.exports = app;
