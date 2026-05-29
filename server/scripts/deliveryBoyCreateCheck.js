import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import { createDeliveryBoy } from "../controllers/adminController.js";

const phone = `7${String(Date.now()).slice(-9)}`;
const email = `delivery-create-check-${Date.now()}@example.com`;

function mockResponse() {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    }
  };
  return response;
}

async function main() {
  await connectDB();
  const response = mockResponse();
  await createDeliveryBoy(
    {
      body: {
        name: "Create Check Delivery",
        phone,
        email,
        password: "Delivery123",
        isActive: true,
        vehicleNumber: "CHECK-1"
      }
    },
    response,
    (error) => {
      if (error) throw error;
    }
  );

  if (response.statusCode !== 201 || !response.body?.deliveryBoy) {
    throw new Error(`Create failed: ${response.statusCode} ${JSON.stringify(response.body)}`);
  }

  const user = await User.findOne({ phone });
  if (!user || user.role !== "delivery") throw new Error("Delivery user was not created correctly");

  const deliveryBoy = await DeliveryBoy.findOne({ user: user._id });
  if (!deliveryBoy) throw new Error("DeliveryBoy profile was not created");

  await DeliveryBoy.deleteOne({ _id: deliveryBoy._id });
  await User.deleteOne({ _id: user._id });
  console.log(JSON.stringify({ ok: true, phone, role: user.role }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await DeliveryBoy.deleteMany({ phone }).catch(() => {});
  await User.deleteMany({ phone }).catch(() => {});
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
