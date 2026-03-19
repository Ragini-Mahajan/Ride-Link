const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride',
    required: true
  },
  passengers: [{
    name: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    seatNumber: {
      type: String
    }
  }],
  travelDate: {
    type: Date,
    required: true
  },
  boardingPoint: {
    type: String,
    required: true
  },
  droppingPoint: {
    type: String,
    required: true
  },
  totalFare: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalFare: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet'],
    default: 'card'
  },
  paymentId: {
    type: String
  },
  transactionId: {
    type: String
  },
  ticketNumber: {
    type: String,
    unique: true
  },
  seatNumbers: [{
    type: String
  }],
  busType: {
    type: String
  },
  departureTime: {
    type: String
  },
  arrivalTime: {
    type: String
  },
  operator: {
    type: String
  },
  routeNumber: {
    type: String
  },
  routeName: {
    type: String
  },
  cancellationDetails: {
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'completed']
    }
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
bookingSchema.pre('save', async function() {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.ticketNumber = `RL${timestamp}${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model("Booking", bookingSchema);

