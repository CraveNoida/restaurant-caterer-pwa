import "dotenv/config";
import http from "node:http";
import crypto from "node:crypto";
import mongoose from "mongoose";
import app from "../app.js";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

const runId = `pay${Date.now()}`;
const phone = `9${String(Date.now()).slice(-9)}`;
const adminEmail = process.env.SMOKE_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || "admin123";
const password = "PaySmoke123";
const cleanup = { userIds: [], orderIds: [], orderPublicIds: [], paymentIds: [] };

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

async function login(baseUrl, identifier, loginPassword) {
  return request(baseUrl, "POST", "/api/auth/login", { body: { identifier, password: loginPassword } });
}

async function createOrder(baseUrl, token, paymentMethod, transactionId = "") {
  const data = await request(baseUrl, "POST", "/api/orders", {
    expected: 201,
    token,
    body: {
      customerName: "Payment Smoke Customer",
      customerPhone: phone,
      items: [{ name: `Smoke ${paymentMethod}`, price: 100, quantity: 1 }],
      subtotal: 100,
      deliveryCharge: 0,
      packingCharge: 0,
      tax: 0,
      discount: 0,
      totalAmount: 100,
      orderType: "pickup",
      paymentMethod,
      paymentStatus: "pending",
      transactionId,
      orderNotes: `payment smoke ${runId}`,
      estimatedTime: "25-30 min"
    }
  });
  cleanup.orderIds.push(data.order._id);
  cleanup.orderPublicIds.push(data.order.orderId);
  return data.order;
}

async function cleanupData() {
  await Payment.deleteMany({ $or: [{ _id: { $in: cleanup.paymentIds } }, { orderId: { $in: cleanup.orderPublicIds } }] });
  await Order.deleteMany({ $or: [{ _id: { $in: cleanup.orderIds } }, { orderNotes: `payment smoke ${runId}` }] });
  await User.deleteMany({ _id: { $in: cleanup.userIds } });
}

function signatureFor(razorpayOrderId, razorpayPaymentId) {
  if (!process.env.RAZORPAY_KEY_SECRET) return "local_signature";
  return crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
}

async function main() {
  let server;
  try {
    await connectDB();
    server = await listen();
    const baseUrl = `http://127.0.0.1:${server.address().port}`;
    const results = [];

    const customer = await request(baseUrl, "POST", "/api/auth/register", {
      expected: 201,
      body: { name: "Payment Smoke Customer", phone, email: `${runId}@example.com`, password }
    });
    cleanup.userIds.push(customer.user._id);
    const admin = await login(baseUrl, adminEmail, adminPassword);

    const codOrder = await createOrder(baseUrl, customer.token, "COD");
    const codPayment = await Payment.findOne({ orderId: codOrder.orderId });
    assert(codPayment?.paymentMethod === "COD" && codPayment.paymentStatus === "pending", "COD payment record missing");
    cleanup.paymentIds.push(codPayment._id);
    results.push("COD order/payment pending ok");

    const upiOrder = await createOrder(baseUrl, customer.token, "UPI", "UPI-SMOKE-123");
    const upiPayment = await Payment.findOne({ orderId: upiOrder.orderId });
    assert(upiPayment?.transactionId === "UPI-SMOKE-123", "UPI transaction ID not saved");
    cleanup.paymentIds.push(upiPayment._id);
    const marked = await request(baseUrl, "PUT", `/api/payments/${upiPayment._id}/status`, {
      token: admin.token,
      body: { paymentStatus: "paid", transactionId: "UPI-SMOKE-123" }
    });
    assert(marked.payment.paymentStatus === "paid", "Admin mark paid failed");
    const updatedUpiOrder = await Order.findOne({ orderId: upiOrder.orderId });
    assert(updatedUpiOrder.paymentStatus === "paid", "UPI order was not marked paid");
    results.push("UPI manual payment and admin mark-paid ok");

    const razorpayOrder = await createOrder(baseUrl, customer.token, "Razorpay");
    const createPayment = await request(baseUrl, "POST", "/api/payments/create-order", {
      expected: 201,
      token: customer.token,
      body: { orderId: razorpayOrder.orderId, amount: razorpayOrder.totalAmount, paymentMethod: "Razorpay" }
    });
    assert(createPayment.providerOrder?.id, "Razorpay provider order ID missing");
    cleanup.paymentIds.push(createPayment.payment._id);
    results.push("Razorpay create-order ok");

    const razorpayPaymentId = `pay_${runId}`;
    const verified = await request(baseUrl, "POST", "/api/payments/verify", {
      token: customer.token,
      body: {
        paymentId: createPayment.payment._id,
        orderId: razorpayOrder.orderId,
        razorpay_order_id: createPayment.providerOrder.id,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: signatureFor(createPayment.providerOrder.id, razorpayPaymentId),
        paymentStatus: "paid"
      }
    });
    assert(verified.payment.paymentStatus === "paid", "Razorpay verify did not mark paid");
    const paidOrder = await Order.findOne({ orderId: razorpayOrder.orderId });
    assert(paidOrder.paymentStatus === "paid" && paidOrder.transactionId === razorpayPaymentId, "Razorpay order payment status not synced");
    results.push("Razorpay verify and order sync ok");

    const badOrder = await createOrder(baseUrl, customer.token, "Razorpay");
    const badPayment = await request(baseUrl, "POST", "/api/payments/create-order", {
      expected: 201,
      token: customer.token,
      body: { orderId: badOrder.orderId, amount: badOrder.totalAmount, paymentMethod: "Razorpay" }
    });
    cleanup.paymentIds.push(badPayment.payment._id);
    if (process.env.RAZORPAY_KEY_SECRET) {
      await request(baseUrl, "POST", "/api/payments/verify", {
        expected: 400,
        token: customer.token,
        body: {
          paymentId: badPayment.payment._id,
          orderId: badOrder.orderId,
          razorpay_order_id: badPayment.providerOrder.id,
          razorpay_payment_id: `pay_bad_${runId}`,
          razorpay_signature: "bad_signature",
          paymentStatus: "paid"
        }
      });
      results.push("Razorpay bad signature rejected ok");
    } else {
      await request(baseUrl, "POST", "/api/payments/verify", {
        expected: 400,
        token: customer.token,
        body: { paymentId: badPayment.payment._id, orderId: badOrder.orderId, paymentStatus: "failed", transactionId: "cancelled_by_customer" }
      });
      const stillPending = await Payment.findById(badPayment.payment._id);
      assert(stillPending.paymentStatus === "pending", "Frontend-style failed update should not mark Razorpay payment paid/failed");
      results.push("Razorpay cancelled placeholder stays pending without verification payload");
    }

    const adminPayments = await request(baseUrl, "GET", "/api/admin/payments", { token: admin.token });
    assert(adminPayments.payments?.length >= 3, "Admin payments did not return payment records");
    results.push("Admin payments listing ok");

    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    await cleanupData().catch((error) => console.error("Cleanup failed", error));
    if (server) await close(server);
    await mongoose.disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await cleanupData().catch(() => {});
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
