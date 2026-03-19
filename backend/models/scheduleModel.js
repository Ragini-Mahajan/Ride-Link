const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  routeNumber: String,
  transportType: {
    type: String,
    enum: ["bus", "metro", "train"],
    default: "bus"
  },
  from: String,
  to: String,
  departureTimes: [String],
  arrivalTimes: [String],
  frequency: String,
  day: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "All Days"],
    default: "All Days"
  },
  status: {
    type: String,
    enum: ["On Time", "Delayed", "Cancelled"],
    default: "On Time"
  },
  delay: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Schedule", scheduleSchema);
