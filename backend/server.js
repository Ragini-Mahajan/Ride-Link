const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const connectDB = require("./config/db");
const Ride = require("./models/rideModel");
const Schedule = require("./models/scheduleModel");

const ridesData = require("./seed/ride.json");
const schedulesData = require("./seed/schedules.json");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ================= DATABASE SEED =================
const seedDatabaseIfEmpty = async () => {
  try {
    const rideCount = await Ride.countDocuments();
    const scheduleCount = await Schedule.countDocuments();

    if (rideCount === 0) {
      console.log("🌱 Seeding Rides...");
      await Ride.insertMany(ridesData);
      console.log(`✅ Seeded ${ridesData.length} rides`);
    }

    if (scheduleCount === 0) {
      console.log("🌱 Seeding Schedules...");
      await Schedule.insertMany(schedulesData);
      console.log(`✅ Seeded ${schedulesData.length} schedules`);
    }

  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};

// ================= API ROUTES =================
app.use("/api/rides", require("./routes/rideRoutes"));
app.use("/api/schedules", require("./routes/scheduleRoute"));
app.use("/api/auth", require("./routes/authRoute"));
app.use("/api/bookings", require("./routes/bookingRoute"));

// ================= STATIC HTML ROUTES =================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "home.html"))
);

app.get("/schedule", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "schedule.html"))
);

app.get("/routes", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "routes.html"))
);

app.get("/about", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "about.html"))
);

app.get("/upload", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "upload.html"))
);

app.get("/map", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "map.html"))
);

// Auth pages
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "register.html"))
);

// Extra pages
app.get("/search-results", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "search-results.html"))
);

app.get("/booking", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "booking.html"))
);

app.get("/ticket", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "ticket.html"))
);

app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "dashboard.html"))
);

// ================= SEED ROUTE =================
app.get("/api/seed", async (req, res) => {
  try {
    await Ride.deleteMany();
    await Schedule.deleteMany();

    const seedRides = await Ride.insertMany(ridesData);
    const seedSchedules = await Schedule.insertMany(schedulesData);

    res.json({
      message: "Database seeded successfully",
      rides: seedRides.length,
      schedules: seedSchedules.length,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= REACT BUILD (SAFE) =================
const reactBuildPath = path.join(__dirname, "..", "frontend", "dist");

if (process.env.NODE_ENV === "production") {
  if (fs.existsSync(reactBuildPath)) {
    app.use(express.static(reactBuildPath));

    // ✅ SAFE fallback (FIXED)
    app.use((req, res) => {
      res.sendFile(path.join(reactBuildPath, "index.html"));
    });
  } else {
    console.log("⚠️ React build not found, skipping frontend serving");
  }
}

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
});

// ================= START SERVER =================
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabaseIfEmpty();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();

module.exports = app;
