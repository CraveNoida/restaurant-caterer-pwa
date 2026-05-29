import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, trim: true },
    bookingId: { type: String, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Razorpay"],
      default: "Razorpay"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    transactionId: { type: String, trim: true },
    razorpayOrderId: { type: String, trim: true, index: true },
    razorpayPaymentId: { type: String, trim: true },
    razorpaySignature: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
