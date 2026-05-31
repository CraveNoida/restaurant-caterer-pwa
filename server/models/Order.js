import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: String,
    customizations: {
      portion: String,
      spiceLevel: String,
      addOns: [{ name: String, price: { type: Number, default: 0 } }],
      instruction: String
    }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    packingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderType: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery"
    },
    deliveryAddress: { type: String, trim: true },
    houseDetails: { type: String, trim: true },
    rawDetectedAddress: { type: String, trim: true },
    landmark: { type: String, trim: true },
    customerLocation: {
      lat: Number,
      lng: Number,
      accuracy: Number,
      mapsLink: String,
      updatedAt: Date
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Razorpay"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    transactionId: { type: String, trim: true },
    orderStatus: {
      type: String,
      enum: ["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"],
      default: "placed"
    },
    deliveryStatus: {
      type: String,
      enum: ["assigned", "picked_up", "on_the_way", "delivered", "failed_delivery"],
      default: "assigned"
    },
    deliveryLocation: {
      lat: Number,
      lng: Number,
      accuracy: Number,
      heading: Number,
      speed: Number,
      updatedAt: Date
    },
    deliveryTracking: {
      isLive: { type: Boolean, default: false },
      startedAt: Date,
      stoppedAt: Date,
      lastUpdatedAt: Date
    },
    assignedDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryBoy" },
    orderNotes: { type: String, trim: true },
    estimatedTime: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
