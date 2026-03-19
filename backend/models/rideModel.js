const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  id: Number,
  route_number: String,
  route_name: String,
  start_point: String,
  start_lat: { type: Number, required: false },
  start_lng: { type: Number, required: false },
  end_point: String,
  end_lat: { type: Number, required: false },
  end_lng: { type: Number, required: false },
  bus_type: String,
  departure_time: String,
  arrival_time: String,
  frequency_minutes: Number,
  major_stops: { type: mongoose.Schema.Types.Mixed, required: false }, // Can be array of strings or objects
  fare_inr: Number,
  operator: String,
  city: String,
  coordinates: { type: [Object], required: false }
});

module.exports = mongoose.model("Ride", rideSchema);
