const mongoose = require("mongoose");
const connectDB = require("./config/db");

const Ride = require("./models/rideModel");
const Schedule = require("./models/scheduleModel");

const ridesData = require("./seed/ride.json");


const importData = async () => {
  try {
    await connectDB();

    await Ride.deleteMany();
    // await Schedule.deleteMany();

    await Ride.insertMany(ridesData);
    // await Schedule.insertMany(schedulesData);

    console.log("✅ Data Imported Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  }
};

importData();
