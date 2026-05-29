import mongoose from "mongoose";

const deliveryBoySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    isAvailable: { type: Boolean, default: true },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    vehicleNumber: { type: String, trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("DeliveryBoy", deliveryBoySchema);
