import mongoose from "mongoose";
import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";

const TERMINAL_DELIVERY_STATUSES = ["delivered", "failed_delivery"];
const TERMINAL_ORDER_STATUSES = ["delivered", "cancelled"];

function orderLookup(id) {
  return mongoose.isValidObjectId(id)
    ? { $or: [{ _id: id }, { orderId: id }] }
    : { orderId: id };
}

function serializeLocation(order) {
  return {
    orderId: order.orderId,
    deliveryLocation: order.deliveryLocation || null,
    deliveryTracking: order.deliveryTracking || { isLive: false },
    deliveryStatus: order.deliveryStatus,
    orderStatus: order.orderStatus,
    updatedAt: order.deliveryLocation?.updatedAt || order.deliveryTracking?.lastUpdatedAt || null
  };
}

function assertTrackable(order) {
  if (!order.assignedDeliveryBoy) {
    const error = new Error("Order is not assigned to a delivery boy");
    error.statusCode = 400;
    throw error;
  }
  if (TERMINAL_DELIVERY_STATUSES.includes(order.deliveryStatus) || TERMINAL_ORDER_STATUSES.includes(order.orderStatus)) {
    const error = new Error("Tracking is not available for completed or cancelled orders");
    error.statusCode = 400;
    throw error;
  }
}

export function emitLocationUpdate(io, order) {
  if (!io || !order?.orderId) return;
  const payload = serializeLocation(order);
  io.to(`order:${order.orderId}:tracking`).emit("location:update", payload);
}

export function emitLocationError(socket, message) {
  socket?.emit("location:error", { message });
}

export async function getDeliveryBoyForUser(userId) {
  return DeliveryBoy.findOne({ user: userId });
}

export async function getAssignedOrderForDelivery({ userId, orderId }) {
  const deliveryBoy = await getDeliveryBoyForUser(userId);
  if (!deliveryBoy) {
    const error = new Error("Delivery profile not found");
    error.statusCode = 404;
    throw error;
  }

  const order = await Order.findOne({ ...orderLookup(orderId), assignedDeliveryBoy: deliveryBoy._id });
  if (!order) {
    const error = new Error("Assigned order not found");
    error.statusCode = 404;
    throw error;
  }

  return { deliveryBoy, order };
}

export async function getViewableOrderForUser({ user, orderId }) {
  const order = await Order.findOne(orderLookup(orderId)).populate("assignedDeliveryBoy");
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  const isOwner = order.customerId?.toString() === user._id.toString();
  const isAdmin = user.role === "admin";
  const isAssignedDelivery =
    user.role === "delivery" &&
    order.assignedDeliveryBoy &&
    (await DeliveryBoy.exists({ _id: order.assignedDeliveryBoy._id || order.assignedDeliveryBoy, user: user._id }));

  if (!isAdmin && !isOwner && !isAssignedDelivery) {
    const error = new Error("Not allowed to view this order location");
    error.statusCode = 403;
    throw error;
  }

  return order;
}

export async function startTracking({ userId, orderId, io }) {
  const { order } = await getAssignedOrderForDelivery({ userId, orderId });
  assertTrackable(order);

  const now = new Date();
  order.deliveryTracking = {
    ...(order.deliveryTracking?.toObject?.() || order.deliveryTracking || {}),
    isLive: true,
    startedAt: order.deliveryTracking?.startedAt || now,
    stoppedAt: undefined,
    lastUpdatedAt: now
  };
  await order.save();
  emitLocationUpdate(io, order);
  return order;
}

export async function stopTracking({ userId, orderId, io }) {
  const { order } = await getAssignedOrderForDelivery({ userId, orderId });
  const now = new Date();
  order.deliveryTracking = {
    ...(order.deliveryTracking?.toObject?.() || order.deliveryTracking || {}),
    isLive: false,
    stoppedAt: now,
    lastUpdatedAt: now
  };
  await order.save();
  emitLocationUpdate(io, order);
  return order;
}

export async function stopTrackingForOrder(order, io) {
  if (!order) return order;
  const now = new Date();
  order.deliveryTracking = {
    ...(order.deliveryTracking?.toObject?.() || order.deliveryTracking || {}),
    isLive: false,
    stoppedAt: now,
    lastUpdatedAt: now
  };
  await order.save();
  emitLocationUpdate(io, order);
  return order;
}

export async function updateDeliveryLocation({ userId, orderId, location, io }) {
  const { order } = await getAssignedOrderForDelivery({ userId, orderId });
  assertTrackable(order);

  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const error = new Error("Valid lat and lng are required");
    error.statusCode = 400;
    throw error;
  }

  const now = new Date();
  order.deliveryLocation = {
    lat,
    lng,
    accuracy: Number.isFinite(Number(location.accuracy)) ? Number(location.accuracy) : undefined,
    heading: Number.isFinite(Number(location.heading)) ? Number(location.heading) : undefined,
    speed: Number.isFinite(Number(location.speed)) ? Number(location.speed) : undefined,
    updatedAt: now
  };
  order.deliveryTracking = {
    ...(order.deliveryTracking?.toObject?.() || order.deliveryTracking || {}),
    isLive: true,
    startedAt: order.deliveryTracking?.startedAt || now,
    lastUpdatedAt: now
  };
  await order.save();
  emitLocationUpdate(io, order);
  return order;
}

export { serializeLocation };
