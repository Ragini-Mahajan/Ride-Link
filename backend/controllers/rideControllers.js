const Ride = require("../models/rideModel");

exports.getRides = async (req, res) => {
  try {
    const rides = await Ride.find();
    if (!rides || rides.length === 0) {
      return res.status(404).json({ message: "No rides found. Please seed the database first." });
    }
    res.json(rides);
  } catch (error) {
    console.error("Error fetching rides:", error);
    res.status(500).json({ message: "Error fetching rides", error: error.message });
  }
};

exports.addRide = async (req, res) => {
  try {
    if (!req.body.route_number || !req.body.route_name) {
      return res.status(400).json({ message: "route_number and route_name are required" });
    }
    const newRide = new Ride(req.body);
    await newRide.save();
    res.status(201).json({ message: "Ride added successfully", data: newRide });
  } catch (error) {
    console.error("Error adding ride:", error);
    res.status(500).json({ message: "Error adding ride", error: error.message });
  }
};

exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    res.json(ride);
  } catch (error) {
    console.error("Error fetching ride:", error);
    res.status(500).json({ message: "Error fetching ride", error: error.message });
  }
};

// Search rides by route name, number, or start/end point
exports.searchRides = async (req, res) => {
  try {
    const { routeName, routeNumber, startPoint, endPoint, busType, city } = req.query;
    
    let query = {};
    
    if (routeName) {
      query.route_name = { $regex: routeName, $options: "i" };
    }
    
    if (routeNumber) {
      query.route_number = { $regex: routeNumber, $options: "i" };
    }
    
    if (startPoint) {
      query.start_point = { $regex: startPoint, $options: "i" };
    }
    
    if (endPoint) {
      query.end_point = { $regex: endPoint, $options: "i" };
    }
    
    if (busType) {
      query.bus_type = busType;
    }
    
    if (city) {
      query.city = city;
    }
    
    const rides = await Ride.find(query);
    
    if (!rides || rides.length === 0) {
      return res.status(404).json({
        message: "No rides found matching the criteria",
        data: []
      });
    }
    
    res.json({
      message: "Rides found successfully",
      count: rides.length,
      data: rides
    });
  } catch (error) {
    console.error("Error searching rides:", error);
    res.status(500).json({
      message: "Error searching rides",
      error: error.message
    });
  }
};

// Get rides by route number with coordinates
exports.getRidesByRoute = async (req, res) => {
  try {
    const { routeNumber } = req.params;
    const rides = await Ride.find({ route_number: routeNumber });
    
    if (!rides || rides.length === 0) {
      return res.status(404).json({
        message: `No rides found for route ${routeNumber}`,
        data: []
      });
    }
    
    res.json(rides);
  } catch (error) {
    console.error("Error fetching rides by route:", error);
    res.status(500).json({
      message: "Error fetching rides by route",
      error: error.message
    });
  }
};

// Get rides within a bounding box (for map)
exports.getRidesInBounds = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng } = req.query;
    
    const rides = await Ride.find({
      start_lat: { $gte: minLat, $lte: maxLat },
      start_lng: { $gte: minLng, $lte: maxLng }
    });
    
    if (!rides || rides.length === 0) {
      return res.status(404).json({
        message: "No rides found in this area",
        data: []
      });
    }
    
    res.json({
      count: rides.length,
      data: rides
    });
  } catch (error) {
    console.error("Error fetching rides in bounds:", error);
    res.status(500).json({
      message: "Error fetching rides",
      error: error.message
    });
  }
};
