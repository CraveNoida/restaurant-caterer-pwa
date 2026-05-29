import DeliveryBoy from "../models/DeliveryBoy.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import {
  serializeLocation,
  startTracking,
  stopTracking,
  stopTrackingForOrder,
  updateDeliveryLocation
} from "../services/deliveryTrackingService.js";

const DELIVERY_STATUS_MAP = {
  picked_up: "out_for_delivery",
  on_the_way: "out_for_delivery",
  delivered: "delivered",
  failed_delivery: "cancelled"
};

function findDeliveryProfile(userId) {
  return DeliveryBoy.findOne({ user: userId });
}

export async function getAssignedOrders(req, res, next) {
  try {
    const deliveryBoy = await findDeliveryProfile(req.user._id).populate("user", "name phone email isActive");
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery profile not found" });

    const orders = await Order.find({ assignedDeliveryBoy: deliveryBoy._id }).sort({ createdAt: -1 });
    return res.json({ count: orders.length, orders, deliveryBoy });
  } catch (error) {
    return next(error);
  }
}

export async function getAssignedOrderById(req, res, next) {
  try {
    const deliveryBoy = await findDeliveryProfile(req.user._id);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery profile not found" });

    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
      : { orderId: req.params.id };
    const order = await Order.findOne({ ...lookup, assignedDeliveryBoy: deliveryBoy._id });
    if (!order) return res.status(404).json({ message: "Assigned order not found" });

    return res.json({ order });
  } catch (error) {
    return next(error);
  }
}

export async function updateDeliveryStatus(req, res, next) {
  try {
    const { deliveryStatus } = req.body;
    if (!DELIVERY_STATUS_MAP[deliveryStatus]) {
      return res.status(400).json({ message: "Invalid delivery status" });
    }

    const deliveryBoy = await findDeliveryProfile(req.user._id);
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery profile not found" });

    const lookup = mongoose.isValidObjectId(req.params.id)
      ? { $or: [{ _id: req.params.id }, { orderId: req.params.id }] }
      : { orderId: req.params.id };
    const order = await Order.findOneAndUpdate(
      { ...lookup, assignedDeliveryBoy: deliveryBoy._id },
      { orderStatus: DELIVERY_STATUS_MAP[deliveryStatus], deliveryStatus },
      { returnDocument: "after", runValidators: true }
    );

    if (!order) return res.status(404).json({ message: "Assigned order not found" });

    if (deliveryStatus === "delivered" || deliveryStatus === "failed_delivery") {
      await stopTrackingForOrder(order, req.app.get("io"));
      deliveryBoy.currentOrder = undefined;
      await deliveryBoy.save();
    }

    return res.json({ order, deliveryStatus });
  } catch (error) {
    return next(error);
  }
}

export async function startOrderTracking(req, res, next) {
  try {
    const order = await startTracking({ userId: req.user._id, orderId: req.params.id, io: req.app.get("io") });
    return res.json({ order, tracking: serializeLocation(order) });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    return next(error);
  }
}

export async function stopOrderTracking(req, res, next) {
  try {
    const order = await stopTracking({ userId: req.user._id, orderId: req.params.id, io: req.app.get("io") });
    return res.json({ order, tracking: serializeLocation(order) });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    return next(error);
  }
}

export async function updateOrderLocation(req, res, next) {
  try {
    const order = await updateDeliveryLocation({
      userId: req.user._id,
      orderId: req.params.id,
      location: req.body,
      io: req.app.get("io")
    });
    return res.json({ order, tracking: serializeLocation(order) });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    return next(error);
  }
}

export async function getDeliveryProfile(req, res, next) {
  try {
    const deliveryBoy = await findDeliveryProfile(req.user._id).populate("user", "name phone email isActive");
    if (!deliveryBoy) return res.status(404).json({ message: "Delivery profile not found" });

    const completedDeliveries = await Order.countDocuments({
      assignedDeliveryBoy: deliveryBoy._id,
      orderStatus: "delivered"
    });

    return res.json({ deliveryBoy, completedDeliveries });
  } catch (error) {
    return next(error);
  }
}
