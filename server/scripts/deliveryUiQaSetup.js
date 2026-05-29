import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";

const password = "Delivery123";
const customerPhone = "9123400001";
const deliveryPhone = "9123400002";
const otherDeliveryPhone = "9123400003";

async function upsertUser({ name, phone, email, role }) {
  let user = await User.findOne({ phone });
  if (!user) {
    user = await User.create({ name, phone, email, password, role, isActive: true });
    return user;
  }

  user.name = name;
  user.email = email;
  user.role = role;
  user.isActive = true;
  user.password = password;
  await user.save();
  return user;
}

async function upsertDeliveryBoy(user, vehicleNumber) {
  let deliveryBoy = await DeliveryBoy.findOne({ user: user._id });
  if (!deliveryBoy) {
    deliveryBoy = await DeliveryBoy.create({
      user: user._id,
      name: user.name,
      phone: user.phone,
      isAvailable: true,
      vehicleNumber
    });
    return deliveryBoy;
  }

  deliveryBoy.name = user.name;
  deliveryBoy.phone = user.phone;
  deliveryBoy.isAvailable = true;
  deliveryBoy.currentOrder = undefined;
  deliveryBoy.vehicleNumber = vehicleNumber;
  await deliveryBoy.save();
  return deliveryBoy;
}

async function main() {
  await connectDB();

  const customer = await upsertUser({
    name: "QA Customer",
    phone: customerPhone,
    email: "qa.customer@example.com",
    role: "customer"
  });
  const deliveryUser = await upsertUser({
    name: "QA Delivery",
    phone: deliveryPhone,
    email: "qa.delivery@example.com",
    role: "delivery"
  });
  const otherDeliveryUser = await upsertUser({
    name: "QA Other Delivery",
    phone: otherDeliveryPhone,
    email: "qa.other.delivery@example.com",
    role: "delivery"
  });

  const deliveryBoy = await upsertDeliveryBoy(deliveryUser, "QA-1001");
  const otherDeliveryBoy = await upsertDeliveryBoy(otherDeliveryUser, "QA-1002");

  await Order.deleteMany({ orderId: { $in: ["QA-DELIVERY-001", "QA-DELIVERY-002", "QA-DELIVERY-003", "QA-DELIVERY-004"] } });

  const assignedOrder = await Order.create({
    orderId: "QA-DELIVERY-001",
    customerId: customer._id,
    customerName: customer.name,
    customerPhone: customer.phone,
    items: [
      { name: "QA Chicken Biryani", price: 250, quantity: 2 },
      { name: "QA Gulab Jamun", price: 80, quantity: 1 }
    ],
    subtotal: 580,
    deliveryCharge: 45,
    packingCharge: 20,
    tax: 0,
    discount: 0,
    totalAmount: 645,
    orderType: "delivery",
    deliveryAddress: "QA House 12, Test Street, Margao, Goa",
    landmark: "Near QA Circle",
    paymentMethod: "COD",
    paymentStatus: "pending",
    orderStatus: "out_for_delivery",
    deliveryStatus: "assigned",
    assignedDeliveryBoy: deliveryBoy._id,
    orderNotes: "Ring the bell twice.",
    estimatedTime: "35-45 min"
  });

  const secondAssignedOrder = await Order.create({
    orderId: "QA-DELIVERY-002",
    customerId: customer._id,
    customerName: "QA Second Customer",
    customerPhone: "9123400004",
    items: [{ name: "QA Veg Thali", price: 180, quantity: 1 }],
    subtotal: 180,
    deliveryCharge: 45,
    packingCharge: 20,
    totalAmount: 245,
    orderType: "delivery",
    deliveryAddress: "QA Flat 8, Demo Road, Margao, Goa",
    landmark: "Opposite Demo Store",
    paymentMethod: "UPI",
    paymentStatus: "paid",
    orderStatus: "out_for_delivery",
    deliveryStatus: "assigned",
    assignedDeliveryBoy: deliveryBoy._id,
    orderNotes: "Leave at reception.",
    estimatedTime: "30-40 min"
  });

  await Order.create({
    orderId: "QA-DELIVERY-003",
    customerId: customer._id,
    customerName: "QA Unassigned Customer",
    customerPhone: "9123400005",
    items: [{ name: "QA Starter", price: 120, quantity: 1 }],
    subtotal: 120,
    totalAmount: 120,
    orderType: "delivery",
    deliveryAddress: "Unassigned QA Address",
    paymentMethod: "COD",
    paymentStatus: "pending",
    orderStatus: "placed",
    deliveryStatus: "assigned"
  });

  await Order.create({
    orderId: "QA-DELIVERY-004",
    customerId: customer._id,
    customerName: "QA Other Driver Customer",
    customerPhone: "9123400006",
    items: [{ name: "QA Combo", price: 300, quantity: 1 }],
    subtotal: 300,
    totalAmount: 300,
    orderType: "delivery",
    deliveryAddress: "Other Driver QA Address",
    paymentMethod: "Razorpay",
    paymentStatus: "paid",
    orderStatus: "out_for_delivery",
    deliveryStatus: "assigned",
    assignedDeliveryBoy: otherDeliveryBoy._id
  });

  deliveryBoy.currentOrder = assignedOrder._id;
  await deliveryBoy.save();

  console.log(JSON.stringify({
    deliveryLogin: { identifier: deliveryPhone, password },
    customerLogin: { identifier: customerPhone, password },
    assignedOrders: [assignedOrder.orderId, secondAssignedOrder.orderId],
    hiddenOrders: ["QA-DELIVERY-003", "QA-DELIVERY-004"]
  }, null, 2));

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
