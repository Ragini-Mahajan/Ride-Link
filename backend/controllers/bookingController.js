const Booking = require("../models/bookingModel");
const Ride = require("../models/rideModel");

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    const {
      rideId,
      passengers,
      travelDate,
      boardingPoint,
      droppingPoint,
      totalFare,
      discount,
      finalFare,
      paymentMethod,
      paymentId
    } = req.body;

    // Get ride details
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      ride: rideId,
      passengers,
      travelDate,
      boardingPoint,
      droppingPoint,
      totalFare,
      discount: discount || 0,
      finalFare,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod,
      paymentId,
      seatNumbers: passengers.map(p => p.seatNumber),
      busType: ride.bus_type,
      departureTime: ride.departure_time,
      arrivalTime: ride.arrival_time,
      operator: ride.operator,
      routeNumber: ride.route_number,
      routeName: ride.route_name
    });

    await booking.populate('ride');

    res.status(201).json(booking);
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
};

// Get all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.travelDate = { $gte: startDate, $lte: endDate };
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('ride')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Error getting bookings", error: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('ride');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns booking or is admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Error getting booking", error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user owns booking
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to cancel this booking" });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    // Calculate refund (50% if cancelled before 2 hours of departure)
    const departureTime = new Date(booking.travelDate);
    const now = new Date();
    const hoursUntilDeparture = (departureTime - now) / (1000 * 60 * 60);

    let refundAmount = 0;
    if (hoursUntilDeparture > 2) {
      refundAmount = Math.floor(booking.finalFare * 0.5); // 50% refund
    }

    booking.status = 'cancelled';
    booking.cancellationDetails = {
      cancelledAt: now,
      refundAmount,
      refundStatus: refundAmount > 0 ? 'pending' : 'none'
    };

    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking, refundAmount });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Error cancelling booking", error: error.message });
  }
};

// Get ticket by ticket number
exports.getTicketByNumber = async (req, res) => {
  try {
    const { ticketNumber } = req.params;
    
    const booking = await Booking.findOne({ ticketNumber })
      .populate('user', 'name email phone')
      .populate('ride');

    if (!booking) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ message: "Error getting ticket", error: error.message });
  }
};

// Get booking stats (admin)
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });

    const revenue = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: "$finalFare" } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today }
    });

    const todayRevenue = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: today }
        } 
      },
      { $group: { _id: null, total: { $sum: "$finalFare" } } }
    ]);

    res.json({
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue: revenue[0]?.total || 0,
      todayBookings,
      todayRevenue: todayRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Error getting stats", error: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('ride')
      .sort({ createdAt: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ message: "Error getting bookings", error: error.message });
  }
};

