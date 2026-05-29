import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

async function main() {
  await connectDB();
  const users = await User.find({
    $or: [
      { email: /^admin-ui-delivery-/ },
      { name: "Admin UI Delivery Check" }
    ]
  });
  const userIds = users.map((user) => user._id);
  const deliveryResult = await DeliveryBoy.deleteMany({ user: { $in: userIds } });
  const userResult = await User.deleteMany({ _id: { $in: userIds } });
  console.log(JSON.stringify({ ok: true, deliveryDeleted: deliveryResult.deletedCount, usersDeleted: userResult.deletedCount }, null, 2));
  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
