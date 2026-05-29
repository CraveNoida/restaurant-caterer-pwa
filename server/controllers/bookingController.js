import CateringBooking from "../models/CateringBooking.js";
import { generateBookingId } from "../utils/generateBookingId.js";

const BOOKING_STATUSES = [
  "new",
  "contacted",
  "quotation_sent",
  "confirmed",
  "advance_paid",
  "completed",
  "cancelled"
];

export async function createBooking(req, res, next) {
  try {
    const {
      customerName,
      phone,
      email,
      eventType,
      eventDate,
      guestCount,
      eventTime,
      venue,
      foodPreference,
      packageType,
      selectedMenuItems,
      estimatedPrice,
      budget,
      specialRequirements
    } = req.body;

    if (!customerName || !phone || !eventType || !eventDate || !guestCount) {
      return res.status(400).json({
        message: "Customer name, phone, event type, event date, and guest count are required"
      });
    }

    const booking = await CateringBooking.create({
      bookingId: generateBookingId(),
      customerId: req.user?._id,
      customerName,
      phone,
      email,
      eventType,
      eventDate,
      eventTime,
      venue,
      guestCount,
      foodPreference,
      packageType,
      selectedMenuItems,
      estimatedPrice,
      budget,
      specialRequirements
    });

    return res.status(201).json({ booking });
  } catch (error) {
    return next(error);
  }
}

export async function getMyBookings(req, res, next) {
  try {
    const bookings = await CateringBooking.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ count: bookings.length, bookings });
  } catch (error) {
    return next(error);
  }
}

export async function getBookings(req, res, next) {
  try {
    const bookings = await CateringBooking.find().sort({ createdAt: -1 });
    return res.json({ count: bookings.length, bookings });
  } catch (error) {
    return next(error);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await CateringBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwner = booking.customerId?.toString() === req.user._id.toString();
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Not allowed to view this booking" });
    }

    return res.json({ booking });
  } catch (error) {
    return next(error);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { bookingStatus } = req.body;
    if (!BOOKING_STATUSES.includes(bookingStatus)) {
      return res.status(400).json({ message: "Invalid booking status" });
    }

    const booking = await CateringBooking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus },
      { returnDocument: "after", runValidators: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json({ booking });
  } catch (error) {
    return next(error);
  }
}

export async function updateQuotation(req, res, next) {
  try {
    const { quotationAmount, advancePaid = 0, finalPayment = 0, adminNotes } = req.body;
    const booking = await CateringBooking.findByIdAndUpdate(
      req.params.id,
      {
        quotationAmount,
        advancePaid,
        finalPayment,
        adminNotes,
        bookingStatus: "quotation_sent"
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    return res.json({ booking });
  } catch (error) {
    return next(error);
  }
}
