import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import { getAllowedOrigins } from "./config/origins.js";
import {
  emitLocationError,
  getAssignedOrderForDelivery,
  getViewableOrderForUser,
  serializeLocation,
  updateDeliveryLocation
} from "./services/deliveryTrackingService.js";

async function authenticateSocket(socket, next) {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace("Bearer ", "");
    if (!token) return next(new Error("Authentication token missing"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user || !user.isActive) return next(new Error("User unavailable"));

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error("Authentication failed"));
  }
}

export function configureSocket(server, app) {
  const allowedOrigins = getAllowedOrigins();
  const io = new Server(server, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : false,
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    socket.on("delivery:join-order", async ({ orderId } = {}) => {
      try {
        if (socket.user.role !== "delivery") throw new Error("Delivery access required");
        const { order } = await getAssignedOrderForDelivery({ userId: socket.user._id, orderId });
        socket.join(`delivery:${order.orderId}`);
        socket.join(`order:${order.orderId}:tracking`);
        socket.emit("location:update", serializeLocation(order));
      } catch (error) {
        emitLocationError(socket, error.message || "Could not join delivery tracking");
      }
    });

    socket.on("delivery:leave-order", ({ orderId } = {}) => {
      if (!orderId) return;
      socket.leave(`delivery:${orderId}`);
      socket.leave(`order:${orderId}:tracking`);
    });

    socket.on("delivery:location-update", async ({ orderId, location } = {}) => {
      try {
        if (socket.user.role !== "delivery") throw new Error("Delivery access required");
        await updateDeliveryLocation({ userId: socket.user._id, orderId, location, io });
      } catch (error) {
        emitLocationError(socket, error.message || "Could not update delivery location");
      }
    });

    socket.on("customer:join-order-tracking", async ({ orderId } = {}) => {
      try {
        const order = await getViewableOrderForUser({ user: socket.user, orderId });
        if (socket.user.role !== "admin" && order.customerId.toString() !== socket.user._id.toString()) {
          throw new Error("Not allowed to track this order");
        }
        socket.join(`order:${order.orderId}:tracking`);
        socket.emit("location:update", serializeLocation(order));
      } catch (error) {
        emitLocationError(socket, error.message || "Could not join order tracking");
      }
    });

    socket.on("admin:join-order-tracking", async ({ orderId } = {}) => {
      try {
        if (socket.user.role !== "admin") throw new Error("Admin access required");
        const order = await getViewableOrderForUser({ user: socket.user, orderId });
        socket.join(`order:${order.orderId}:tracking`);
        socket.emit("location:update", serializeLocation(order));
      } catch (error) {
        emitLocationError(socket, error.message || "Could not join admin tracking");
      }
    });
  });

  app.set("io", io);
  return io;
}
