const Schedule = require("../models/scheduleModel");

exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ message: "No schedules found", data: [] });
    }
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    res.status(500).json({ message: "Error fetching schedules", error: error.message });
  }
};

exports.addSchedule = async (req, res) => {
  try {
    if (!req.body.routeNumber) {
      return res.status(400).json({ message: "routeNumber is required" });
    }
    const schedule = new Schedule(req.body);
    await schedule.save();
    res.status(201).json({ message: "Schedule added successfully", data: schedule });
  } catch (error) {
    console.error("Error adding schedule:", error);
    res.status(500).json({ message: "Error adding schedule", error: error.message });
  }
};

// Search schedules by route number, transport type, or location
exports.searchSchedules = async (req, res) => {
  try {
    const { routeNumber, transportType, from, to, day } = req.query;
    
    let query = {};
    
    if (routeNumber) {
      query.routeNumber = { $regex: routeNumber, $options: "i" };
    }
    
    if (transportType) {
      query.transportType = transportType;
    }
    
    if (from) {
      query.from = { $regex: from, $options: "i" };
    }
    
    if (to) {
      query.to = { $regex: to, $options: "i" };
    }
    
    if (day) {
      query.day = day;
    }
    
    const schedules = await Schedule.find(query);
    
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ 
        message: "No schedules found matching the criteria", 
        data: [] 
      });
    }
    
    res.json({
      message: "Schedules found successfully",
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    console.error("Error searching schedules:", error);
    res.status(500).json({ 
      message: "Error searching schedules", 
      error: error.message 
    });
  }
};

// Get schedules by route number
exports.getScheduleByRoute = async (req, res) => {
  try {
    const { routeNumber } = req.params;
    const schedules = await Schedule.find({ routeNumber });
    
    if (!schedules || schedules.length === 0) {
      return res.status(404).json({ 
        message: `No schedules found for route ${routeNumber}`, 
        data: [] 
      });
    }
    
    res.json(schedules);
  } catch (error) {
    console.error("Error fetching schedule by route:", error);
    res.status(500).json({ 
      message: "Error fetching schedule", 
      error: error.message 
    });
  }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    res.json({ message: "Schedule updated successfully", data: schedule });
  } catch (error) {
    console.error("Error updating schedule:", error);
    res.status(500).json({ 
      message: "Error updating schedule", 
      error: error.message 
    });
  }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await Schedule.findByIdAndDelete(id);
    
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    
    res.json({ message: "Schedule deleted successfully", data: schedule });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({ 
      message: "Error deleting schedule", 
      error: error.message 
    });
  }
};

