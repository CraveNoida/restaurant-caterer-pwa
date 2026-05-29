import "dotenv/config";
import http from "node:http";
import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

const runId = `smoke${Date.now()}`;
const adminEmail = process.env.SMOKE_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || "admin123";
const customerPhone = `9${String(Date.now()).slice(-9)}`;
const otherCustomerPhone = `8${String(Date.now()).slice(-9)}`;
const deliveryPhone = `7${String(Date.now()).slice(-9)}`;
const otherDeliveryPhone = `6${String(Date.now()).slice(-9)}`;
const password = "Smoke123";
const cleanup = {
  userIds: [],
  orderIds: [],
  deliveryBoyIds: []
};

function listen() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.once("error", reject);
    server.listen(0, () => resolve(server));
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(baseUrl, method, path, { token, body, expected = 200 } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await response.json().catch(() => ({}));
  if (response.status !== expected) {
    throw new Error(`${method} ${path} expected ${expected}, got ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function login(baseUrl, identifier, loginPassword = password) {
  const data = await request(baseUrl, "POST", "/api/auth/login", {
    body: { identifier, password: loginPassword }
  });
  assert(data.token, `Login did not return token for ${identifier}`);
  return data;
}

async function registerCustomer(baseUrl, name, phone) {
  const data = await request(baseUrl, "POST", "/api/auth/register", {
    expected: 201,
    body: {
      name,
      phone,
      email: `${phone}-${runId}@example.com`,
      password
    }
  });
  cleanup.userIds.push(data.user._id);
  return data;
}

async function createOrder(baseUrl, token, suffix = "") {
  const data = await request(baseUrl, "POST", "/api/orders", {
    expected: 201,
    token,
    body: {
      customerName: `Smoke Customer ${suffix}`.trim(),
      customerPhone,
      items: [
        {
          name: `Smoke Biryani ${suffix}`.trim(),
          price: 250,
          quantity: 2
        }
      ],
      subtotal: 500,
      deliveryCharge: 45,
      packingCharge: 20,
      tax: 0,
      discount: 0,
      totalAmount: 565,
      orderType: "delivery",
      deliveryAddress: `Smoke Address ${runId}, Test Area`,
      landmark: "Smoke Landmark",
      paymentMethod: "COD",
      orderNotes: "Smoke order notes",
      estimatedTime: "35-45 min"
    }
  });
  cleanup.orderIds.push(data.order._id);
  return data.order;
}

async function createDeliveryBoy(baseUrl, adminToken, name, phone) {
  const data = await request(baseUrl, "POST", "/api/admin/delivery-boys", {
    expected: 201,
    token: adminToken,
    body: {
      name,
      phone,
      email: `${phone}-${runId}@example.com`,
      password,
      isActive: true,
      vehicleNumber: `SMK-${phone.slice(-4)}`
    }
  });
  cleanup.deliveryBoyIds.push(data.deliveryBoy._id);
  cleanup.userIds.push(data.deliveryBoy.user._id);
  return data.deliveryBoy;
}

async function cleanupSmokeData() {
  await Order.deleteMany({
    $or: [
      { _id: { $in: cleanup.orderIds.filter(Boolean) } },
      { orderNotes: "Smoke order notes" }
    ]
  });
  await DeliveryBoy.deleteMany({ _id: { $in: cleanup.deliveryBoyIds.filter(Boolean) } });
  await User.deleteMany({
    $or: [
      { _id: { $in: cleanup.userIds.filter(Boolean) } },
      { email: { $regex: `${runId}@example\\.com$` } }
    ]
  });
}

async function main() {
  let server;
  try {
    await connectDB();
    await cleanupSmokeData();
    server = await listen();
    const { port } = server.address();
    const baseUrl = `http://127.0.0.1:${port}`;
    const results = [];

    const health = await request(baseUrl, "GET", "/api/health");
    assert(health.status === "ok", "Health route did not return ok");
    results.push("health ok");

    const admin = await login(baseUrl, adminEmail, adminPassword);
    assert(admin.user.role === "admin", "Admin login did not return admin role");
    results.push("admin login ok");

    const deliveryBoy = await createDeliveryBoy(baseUrl, admin.token, `Smoke Delivery ${runId}`, deliveryPhone);
    assert(deliveryBoy.user.role === "delivery", "Delivery boy user was not created with delivery role");
    const otherDeliveryBoy = await createDeliveryBoy(baseUrl, admin.token, `Other Delivery ${runId}`, otherDeliveryPhone);
    results.push("delivery boys created");

    const deliveryLogin = await login(baseUrl, deliveryPhone);
    assert(deliveryLogin.user.role === "delivery", "Delivery login did not return delivery role");
    results.push("delivery login ok");

    await request(baseUrl, "GET", "/api/admin/dashboard", { token: deliveryLogin.token, expected: 403 });
    results.push("delivery blocked from admin API");

    const customer = await registerCustomer(baseUrl, `Smoke Customer ${runId}`, customerPhone);
    await request(baseUrl, "GET", "/api/delivery/orders", { token: customer.token, expected: 403 });
    results.push("customer blocked from delivery API");

    const otherCustomer = await registerCustomer(baseUrl, `Other Customer ${runId}`, otherCustomerPhone);
    const order = await createOrder(baseUrl, customer.token, "Assigned");
    const unassignedOrder = await createOrder(baseUrl, customer.token, "Unassigned");
    const otherAssignedOrder = await createOrder(baseUrl, otherCustomer.token, "Other Assigned");
    results.push("customer orders created");

    await request(baseUrl, "GET", "/api/orders", { token: customer.token, expected: 403 });
    await request(baseUrl, "GET", "/api/orders", { token: deliveryLogin.token, expected: 403 });
    results.push("non-admin users blocked from all-orders API");

    const assigned = await request(baseUrl, "PUT", `/api/orders/${order._id}/assign-delivery`, {
      token: admin.token,
      body: { deliveryBoyId: deliveryBoy._id }
    });
    assert(assigned.order.assignedDeliveryBoy === deliveryBoy._id, "Order was not assigned to delivery boy");

    await request(baseUrl, "PUT", `/api/orders/${otherAssignedOrder._id}/assign-delivery`, {
      token: admin.token,
      body: { deliveryBoyId: otherDeliveryBoy._id }
    });
    results.push("admin assignment ok");

    const assignedOrders = await request(baseUrl, "GET", "/api/delivery/orders", { token: deliveryLogin.token });
    const assignedIds = assignedOrders.orders.map((item) => item.orderId);
    assert(assignedIds.includes(order.orderId), "Assigned order missing from delivery list");
    assert(!assignedIds.includes(unassignedOrder.orderId), "Unassigned order leaked into delivery list");
    assert(!assignedIds.includes(otherAssignedOrder.orderId), "Other delivery boy order leaked into delivery list");
    results.push("delivery order filtering ok");

    const details = await request(baseUrl, "GET", `/api/delivery/orders/${order.orderId}`, { token: deliveryLogin.token });
    assert(details.order.customerName, "Order details missing customer name");
    assert(details.order.customerPhone, "Order details missing phone");
    assert(details.order.deliveryAddress, "Order details missing address");
    assert(details.order.landmark, "Order details missing landmark");
    assert(details.order.items.length === 1, "Order details missing items");
    assert(details.order.totalAmount === 565, "Order details missing total amount");
    assert(details.order.paymentMethod === "COD", "Order details missing payment method");
    assert(details.order.paymentStatus === "pending", "Order details missing payment status");
    assert(details.order.orderNotes === "Smoke order notes", "Order details missing notes");
    results.push("delivery details ok");

    const pickedUp = await request(baseUrl, "PUT", `/api/delivery/orders/${order.orderId}/status`, {
      token: deliveryLogin.token,
      body: { deliveryStatus: "picked_up" }
    });
    assert(pickedUp.deliveryStatus === "picked_up", "picked_up response wrong");
    assert(pickedUp.order.deliveryStatus === "picked_up", "picked_up not saved");
    assert(pickedUp.order.orderStatus === "out_for_delivery", "picked_up broke orderStatus");

    const onTheWay = await request(baseUrl, "PUT", `/api/delivery/orders/${order.orderId}/status`, {
      token: deliveryLogin.token,
      body: { deliveryStatus: "on_the_way" }
    });
    assert(onTheWay.order.deliveryStatus === "on_the_way", "on_the_way not saved");
    assert(onTheWay.order.orderStatus === "out_for_delivery", "on_the_way broke orderStatus");

    const delivered = await request(baseUrl, "PUT", `/api/delivery/orders/${order.orderId}/status`, {
      token: deliveryLogin.token,
      body: { deliveryStatus: "delivered" }
    });
    assert(delivered.order.deliveryStatus === "delivered", "delivered not saved");
    assert(delivered.order.orderStatus === "delivered", "delivered did not update orderStatus");
    results.push("delivery status happy path ok");

    const customerTrack = await request(baseUrl, "GET", `/api/orders/${order.orderId}`, { token: customer.token });
    assert(customerTrack.order.orderStatus === "delivered", "Customer tracking did not see delivered status");

    const adminOrders = await request(baseUrl, "GET", "/api/orders", { token: admin.token });
    assert(adminOrders.orders.some((item) => item.orderId === order.orderId && item.orderStatus === "delivered"), "Admin orders did not reflect delivered status");
    results.push("customer/admin status sync ok");

    const completedOrders = await request(baseUrl, "GET", "/api/delivery/orders", { token: deliveryLogin.token });
    assert(completedOrders.orders.some((item) => item.orderId === order.orderId && item.deliveryStatus === "delivered"), "Delivered order missing from delivery orders");

    const profile = await request(baseUrl, "GET", "/api/delivery/profile", { token: deliveryLogin.token });
    assert(profile.completedDeliveries >= 1, "Completed delivery count did not update");
    results.push("completed delivery count ok");

    const failedOrder = await createOrder(baseUrl, customer.token, "Failed");
    await request(baseUrl, "PUT", `/api/orders/${failedOrder._id}/assign-delivery`, {
      token: admin.token,
      body: { deliveryBoyId: deliveryBoy._id }
    });
    const failed = await request(baseUrl, "PUT", `/api/delivery/orders/${failedOrder.orderId}/status`, {
      token: deliveryLogin.token,
      body: { deliveryStatus: "failed_delivery" }
    });
    assert(failed.order.deliveryStatus === "failed_delivery", "failed_delivery not saved");
    assert(failed.order.orderStatus === "cancelled", "failed_delivery did not map cleanly to cancelled");
    results.push("failed delivery status ok");

    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    await cleanupSmokeData().catch((error) => console.error("Cleanup failed", error));
    if (server) await close(server);
    await mongoose.disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await cleanupSmokeData().catch(() => {});
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
