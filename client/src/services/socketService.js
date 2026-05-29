import { io } from "socket.io-client";
import { getStoredToken } from "./api.js";

const getDefaultSocketUrl = () => {
  if (typeof window === "undefined") return "http://localhost:5000";
  return `${window.location.protocol}//${window.location.hostname}:5000`;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || getDefaultSocketUrl();

let socket;
let socketToken;

export function getSocket() {
  const token = getStoredToken();
  if (!token) return null;

  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500
    });
  }
  socketToken = token;
  socket.auth = { token };

  if (!socket.connected) socket.connect();
  return socket;
}

export function joinOrderTracking(orderId, role, handlers = {}) {
  const activeSocket = getSocket();
  if (!activeSocket || !orderId) return null;

  const joinEvent = role === "delivery"
    ? "delivery:join-order"
    : role === "admin"
      ? "admin:join-order-tracking"
      : "customer:join-order-tracking";

  const handleUpdate = (payload) => handlers.onLocation?.(payload);
  const handleError = (payload) => handlers.onError?.(payload?.message || "Live tracking is unavailable.");
  const handleConnect = () => {
    handlers.onConnect?.();
    activeSocket.emit(joinEvent, { orderId });
  };
  const handleDisconnect = () => handlers.onDisconnect?.();

  activeSocket.on("location:update", handleUpdate);
  activeSocket.on("location:error", handleError);
  activeSocket.on("connect", handleConnect);
  activeSocket.on("disconnect", handleDisconnect);

  if (activeSocket.connected) {
    activeSocket.emit(joinEvent, { orderId });
  }

  return {
    socket: activeSocket,
    emitLocation: (location) => activeSocket.emit("delivery:location-update", { orderId, location }),
    cleanup: () => {
      if (role === "delivery") activeSocket.emit("delivery:leave-order", { orderId });
      activeSocket.off("location:update", handleUpdate);
      activeSocket.off("location:error", handleError);
      activeSocket.off("connect", handleConnect);
      activeSocket.off("disconnect", handleDisconnect);
    }
  };
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
