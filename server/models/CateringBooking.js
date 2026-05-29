import mongoose from "mongoose";

const cateringBookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    eventType: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    eventTime: { type: String, trim: true },
    venue: { type: String, trim: true },
    guestCount: { type: Number, required: true, min: 1 },
    foodPreference: { type: String, trim: true },
    packageType: { type: String, trim: true },
    selectedMenuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" }],
    estimatedPrice: { type: Number, default: 0 },
    budget: { type: String, trim: true },
    specialRequirements: { type: String, trim: true },
    bookingStatus: {
      type: String,
      enum: ["new", "contacted", "quotation_sent", "confirmed", "advance_paid", "completed", "cancelled"],
      default: "new"
    },
    quotationAmount: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    finalPayment: { type: Number, default: 0 },
    adminNotes: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("CateringBooking", cateringBookingSchema);
