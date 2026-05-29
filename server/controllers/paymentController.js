import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import crypto from "node:crypto";

function normalizePaymentMethod(value = "Razorpay") {
  return value === "Cash on Delivery" ? "COD" : value === "Razorpay Online" || value === "Razorpay ready" ? "Razorpay" : value;
}

function makeLocalRazorpayOrderId() {
  return `order_local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function allowRazorpayDevStub() {
  return process.env.ALLOW_RAZORPAY_DEV_STUB === "true" && process.env.NODE_ENV !== "production";
}

async function createRazorpayProviderOrder({ amount, receipt }) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    if (!allowRazorpayDevStub()) {
      const error = new Error("Razorpay is not configured");
      error.statusCode = 503;
      throw error;
    }

    return {
      id: makeLocalRazorpayOrderId(),
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt,
      localPlaceholder: true
    };
  }

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.description || "Unable to create Razorpay order");
  }
  return data;
}

function isValidRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return allowRazorpayDevStub();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  if (!razorpaySignature || expected.length !== razorpaySignature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature || ""));
}

export async function createPaymentOrder(req, res, next) {
  try {
    const { orderId, bookingId, amount, paymentMethod = "Razorpay", transactionId } = req.body;

    if (!amount || (!orderId && !bookingId)) {
      return res.status(400).json({ message: "Amount and orderId or bookingId are required" });
    }

    const method = normalizePaymentMethod(paymentMethod);
    const existingPayment = orderId
      ? await Payment.findOne({ orderId, paymentMethod: method }).sort({ createdAt: -1 })
      : null;
    if (existingPayment?.paymentStatus === "paid") {
      return res.status(409).json({ message: "Payment is already completed for this order" });
    }

    const providerOrder = method === "Razorpay"
      ? await createRazorpayProviderOrder({ amount, receipt: orderId || bookingId })
      : null;

    const payment = existingPayment
      ? await Payment.findByIdAndUpdate(
        existingPayment._id,
        { amount, transactionId, razorpayOrderId: providerOrder?.id, paymentStatus: "pending" },
        { returnDocument: "after", runValidators: true }
      )
      : await Payment.create({
        orderId,
        bookingId,
        customerId: req.user._id,
        amount,
        paymentMethod: method,
        paymentStatus: "pending",
        transactionId,
        razorpayOrderId: providerOrder?.id
      });

    return res.status(201).json({
      message: method === "Razorpay" ? "Razorpay order created" : "Payment record created",
      payment,
      providerOrder,
      keyId: process.env.RAZORPAY_KEY_ID || ""
    });
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    return next(error);
  }
}

export async function verifyPayment(req, res, next) {
  try {
    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature
    } = req.body;
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Razorpay order ID, payment ID, and signature are required" });
    }

    if (razorpayOrderId && !isValidRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature })) {
      const failedPayment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: "failed", razorpayPaymentId, razorpaySignature },
        { returnDocument: "after", runValidators: true }
      );
      if (failedPayment?.orderId) await Order.findOneAndUpdate({ orderId: failedPayment.orderId }, { paymentStatus: "failed" });
      return res.status(400).json({ message: "Payment signature verification failed", payment: failedPayment });
    }

    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        transactionId: razorpayPaymentId,
        paymentStatus: "paid",
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.orderId) {
      await Order.findOneAndUpdate(
        { orderId: payment.orderId },
        {
          paymentStatus: "paid",
          paymentId: payment._id,
          transactionId: razorpayPaymentId
        },
        { returnDocument: "after" }
      );
    }

    return res.json({ message: "Payment verified", payment });
  } catch (error) {
    return next(error);
  }
}

export async function getPayments(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? {} : { customerId: req.user._id };
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).populate("customerId", "name phone email");
    return res.json({ count: payments.length, payments });
  } catch (error) {
    return next(error);
  }
}

export async function getPaymentById(req, res, next) {
  try {
    const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, customerId: req.user._id };
    const payment = await Payment.findOne(filter).populate("customerId", "name phone email");
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    return res.json({ payment });
  } catch (error) {
    return next(error);
  }
}

export async function updatePaymentStatus(req, res, next) {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    const { paymentStatus = "paid", transactionId } = req.body;
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, transactionId },
      { returnDocument: "after", runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: "Payment not found" });
    if (payment.orderId) {
      await Order.findOneAndUpdate(
        { orderId: payment.orderId },
        { paymentStatus, paymentId: payment._id, transactionId: transactionId || payment.transactionId },
        { returnDocument: "after" }
      );
    }
    return res.json({ payment });
  } catch (error) {
    return next(error);
  }
}
