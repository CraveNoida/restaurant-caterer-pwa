import Order from "../models/Order.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import Payment from "../models/Payment.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import mongoose from "mongoose";
import { getViewableOrderForUser, serializeLocation, stopTrackingForOrder } from "../services/deliveryTrackingService.js";

const ORDER_STATUSES = ["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];

function normalizePaymentMethod(value = "COD") {
  const methods = {
    "Cash on Delivery": "COD",
    COD: "COD",
    UPI: "UPI",
    Razorpay: "Razorpay",
    "Razorpay ready": "Razorpay",
    "Razorpay Online": "Razorpay"
  };
  return methods[value] || value;
}

function normalizeOrderType(value = "delivery") {
  return String(value).toLowerCase() === "pickup" ? "pickup" : "delivery";
}

export async function createOrder(req, res, next) {
  try {
    const {
      items,
      subtotal = 0,
      deliveryCharge = 0,
      packingCharge = 0,
      tax = 0,
      discount = 0,
      totalAmount,
      orderType,
      deliveryAddress,
      deliveryLocation,
      customerLocation,
      landmark,
      paymentMethod,
      paymentStatus = "pending",
      transactionId,
      orderNotes,
      estimatedTime,
      customerName,
      customerPhone
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const calculatedTotal =
      totalAmount ?? Number(subtotal) + Number(deliveryCharge) + Number(packingCharge) + Number(tax) - Number(discount);

    const method = normalizePaymentMethod(paymentMethod);
    const locationPayload = customerLocation || deliveryLocation;
    const lat = Number(locationPayload?.lat);
    const lng = Number(locationPayload?.lng);
    const normalizedCustomerLocation = Number.isFinite(lat) && Number.isFinite(lng)
      ? {
          lat,
          lng,
          accuracy: Number.isFinite(Number(locationPayload.accuracy)) ? Number(locationPayload.accuracy) : undefined,
          mapsLink: locationPayload.mapsLink || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
          updatedAt: new Date()
        }
      : undefined;
    const order = await Order.create({
      orderId: generateOrderId(),
      customerId: req.user._id,
      customerName: customerName || req.user.name,
      customerPhone: customerPhone || req.user.phone,
      items,
      subtotal,
      deliveryCharge,
      packingCharge,
      tax,
      discount,
      totalAmount: calculatedTotal,
      orderType: normalizeOrderType(orderType),
      deliveryAddress,
      customerLocation: normalizedCustomerLocation,
      landmark,
      paymentMethod: method,
      paymentStatus,
      transactionId,
      orderNotes,
      estimatedTime
    });

    const payment = await Payment.create({
      orderId: order.orderId,
      customerId: req.user._id,
      amount: calculatedTotal,
      paymentMethod: method,
      paymentStatus,
      transactionId
    });

    order.paymentId = payment._id;
    await order.save();

    return res.status(201).json({ order });
  } catch (error) {
    return next(error);
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ customerId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ count: orders.length, orders });
  } catch (error) {
    return next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
      : { orderId: req.params.id };
    const order = await Order.findOne(lookup).populate("assignedDeliveryBoy");
    if (!order) return res.status(404).json({ message: "Order not found" });

    const isOwner = order.customerId.toString() === req.user._id.toString();
    const isAssignedDelivery =
      req.user.role === "delivery" &&
      order.assignedDeliveryBoy &&
      (await DeliveryBoy.exists({ _id: order.assignedDeliveryBoy._id, user: req.user._id }));

    if (req.user.role !== "admin" && !isOwner && !isAssignedDelivery) {
      return res.status(403).json({ message: "Not allowed to view this order" });
    }

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate("assignedDeliveryBoy");
    return res.json({ count: orders.length, orders });
  } catch (error) {
    return next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { orderStatus } = req.body;
    if (!ORDER_STATUSES.includes(orderStatus)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { returnDocument: "after", runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (["delivered", "cancelled"].includes(orderStatus)) {
      await stopTrackingForOrder(order, req.app.get("io"));
    }
    return res.json({ order });
  } catch (error) {
    return next(error);
  }
}

export async function getOrderLocation(req, res, next) {
  try {
    const order = await getViewableOrderForUser({ user: req.user, orderId: req.params.id });
    return res.json({ tracking: serializeLocation(order) });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    return next(error);
  }
}

export async function assignDeliveryBoy(req, res, next) {
  try {
    const { deliveryBoyId } = req.body;
    if (!deliveryBoyId) return res.status(400).json({ message: "deliveryBoyId is required" });

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery boy not found" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { assignedDeliveryBoy: deliveryBoy._id, orderStatus: "out_for_delivery", deliveryStatus: "assigned" },
      { returnDocument: "after", runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    deliveryBoy.currentOrder = order._id;
    await deliveryBoy.save();

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
}
