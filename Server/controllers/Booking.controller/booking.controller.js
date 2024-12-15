const Booking = require("../../models/Booking.Model/booking.model");
const Schedule = require("../../models/Schedule.model/schedule.model");
const User = require("../../models/User.Login.Signup/user.model");
const mailSender = require("../../utls/emailSender.utls/bookingEmail/bookingEmail");
exports.createBooking = async (req, res) => {
  try {
    const { scheduleId, seats, passengers, contactDetails } = req.body;
    const userId = req.user._id;

    // Validate user exists

    if (!userId || !scheduleId || !seats || !contactDetails || !passengers) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    // Validate schedule exists and seats are available
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }
    // Check if seats are available
    const existingBookings = await Booking.find({
      scheduleId,
      status: "confirmed",
      "seats.seatNumber": { $in: seats.map((seat) => seat.seatNumber) },
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({
        success: false,
        message: "One or more selected seats are already booked",
      });
    }

    // Calculate total amount
    const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0);

    // Create booking
    const booking = await Booking.create({
      userId,
      scheduleId,
      seats,
      passengers,
      contactDetails,
      totalAmount,
      status: "confirmed",
      paymentStatus: "pending", // You might want to integrate with a payment gateway
    });

    // Populate necessary fields
    const populatedBooking = await booking.populate([
      { path: "userId", select: "name email" },
      {
        path: "scheduleId",
        populate: [
          {
            path: "routeId",
            select: "source destination routeName",
          },
          {
            path: "busId",
            select: "busNumber busType",
          },
        ],
      },
    ]);

    // Add debug logging
    console.log("Populated booking data:", {
      route: populatedBooking.scheduleId.routeId,
      bus: populatedBooking.scheduleId.busId,
    });

    // Send booking confirmation email with the populated schedule data
    await mailSender.sendBookingConfirmation(
      populatedBooking,
      populatedBooking.scheduleId
    );

    res.status(201).json({
      success: true,
      data: populatedBooking,
      message: "booking successfully",
    });
  } catch (error) {
    console.error("Error creating booking:", error.message);
    res.status(500).json({
      success: false,
      message: "error while creating booking",
    });
  }
};

// get userbooking info

exports.getUserBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own bookings
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access these bookings",
      });
    }

    const bookings = await Booking.find({ userId })
      .populate("scheduleId", "departureTime arrivalTime")
      .populate({
        path: "scheduleId",
        populate: [
          { path: "routeId", select: "routeName source destination" },
          { path: "busId", select: "busNumber busType" },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bookings,
      message: "user bookings retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching user bookings:", error.message);
    res.status(500).json({
      success: false,
      message: "error while fetching user bookings",
    });
  }
};

// Get single booking
exports.getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("userId", "name email")
      .populate({
        path: "scheduleId",
        populate: [
          { path: "routeId", select: "routeName source destination stops" },
          { path: "busId", select: "busNumber busType" },
        ],
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Ensure user can only access their own booking
    if (booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Ensure user can only cancel their own booking
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Check if booking can be cancelled (e.g., time limit)
    const schedule = await Schedule.findById(booking.scheduleId);
    const currentTime = new Date();
    const departureTime = new Date(schedule.departureTime);
    const hoursDifference = (departureTime - currentTime) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return res.status(400).json({
        success: false,
        message: "Booking cannot be cancelled within 24 hours of departure",
      });
    }

    // Calculate refund amount based on your business rules
    const refundAmount = calculateRefundAmount(
      booking.totalAmount,
      hoursDifference
    );

    // Update booking status
    booking.status = "cancelled";
    booking.cancellationDetails = {
      cancelledAt: new Date(),
      reason,
      refundAmount,
      refundStatus: "pending",
    };

    await booking.save();

    // Trigger refund process (implement based on your payment gateway)
    // await processRefund(booking);

    // Send cancellation confirmation email
    await mailSender.sendCancellationConfirmation(booking, refundDetails);

    res.status(200).json({
      success: true,
      data: booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// Helper function to calculate refund amount
const calculateRefundAmount = (totalAmount, hoursToDeparture) => {
  let refundPercentage;
  if (hoursToDeparture >= 72) {
    refundPercentage = 0.9; // 90% refund
  } else if (hoursToDeparture >= 48) {
    refundPercentage = 0.7; // 70% refund
  } else {
    refundPercentage = 0.5; // 50% refund
  }
  return totalAmount * refundPercentage;
};
