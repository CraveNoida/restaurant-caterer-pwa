import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    foodType: {
      type: String,
      enum: ["veg", "nonveg"],
      required: true
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    prepTime: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
    customizationOptions: {
      portions: [{ name: String, price: { type: Number, default: 0 } }],
      spiceLevels: [{ type: String, trim: true }],
      addOns: [{ name: String, price: { type: Number, default: 0 } }]
    }
  },
  { timestamps: true }
);

export default mongoose.model("MenuItem", menuItemSchema);
