const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { protect, admin } = require("../middleware/auth");

// Public routes - MUST come first
router.get("/ticket/:ticketNumber", bookingController.getTicketByNumber);

// Protected routes (User)
router.post("/", protect, bookingController.createBooking);
router.get("/my-bookings", protect, bookingController.getUserBookings);

// Admin routes - specific routes before parameterized
router.get("/admin/all", protect, admin, bookingController.getAllBookings);
router.get("/admin/stats", protect, admin, bookingController.getBookingStats);

// Parameterized routes - MUST come last
router.get("/:id", protect, bookingController.getBookingById);
router.put("/:id/cancel", protect, bookingController.cancelBooking);

module.exports = router;

