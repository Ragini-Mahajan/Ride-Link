const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");

// Get all schedules
router.get("/", scheduleController.getSchedules);

// Search schedules
router.get("/search", scheduleController.searchSchedules);

// Get schedule by route number
router.get("/route/:routeNumber", scheduleController.getScheduleByRoute);

// Add new schedule
router.post("/", scheduleController.addSchedule);

// Update schedule
router.put("/:id", scheduleController.updateSchedule);

// Delete schedule
router.delete("/:id", scheduleController.deleteSchedule);

module.exports = router;
