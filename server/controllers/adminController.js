import User from "../models/User.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import CateringBooking from "../models/CateringBooking.js";
import DeliveryBoy from "../models/DeliveryBoy.js";
import Payment from "../models/Payment.js";

export async function getDashboardStats(req, res, next) {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      menuItems,
      orders,
      bookings,
      activeDeliveryBoys,
      todayOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      todayRevenue,
      recentOrders,
      recentBookings
    ] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      MenuItem.countDocuments(),
      Order.countDocuments(),
      CateringBooking.countDocuments(),
      DeliveryBoy.countDocuments({ isAvailable: true }),
      Order.countDocuments({ createdAt: { $gte: startOfDay } }),
      Order.countDocuments({ orderStatus: "placed" }),
      Order.countDocuments({ orderStatus: { $in: ["accepted", "preparing", "ready", "out_for_delivery"] } }),
      Order.countDocuments({ orderStatus: "delivered" }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfDay }, orderStatus: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(6),
      CateringBooking.find().sort({ createdAt: -1 }).limit(6)
    ]);

    return res.json({
      stats: {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        pendingOrders,
        activeOrders,
        completedOrders,
        cateringEnquiries: bookings,
        totalCustomers,
        activeDeliveryBoys,
        users: totalCustomers,
        menuItems,
        orders,
        bookings
      },
      recentOrders,
      recentBookings
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCustomers(req, res, next) {
  try {
    const search = req.query.search?.trim();
    const filter = { role: "customer" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const customers = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "customerId",
          as: "orders"
        }
      },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          isActive: 1,
          createdAt: 1,
          joinedDate: "$createdAt",
          totalOrders: { $size: "$orders" },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$orders",
                    as: "order",
                    cond: { $ne: ["$$order.orderStatus", "cancelled"] }
                  }
                },
                as: "order",
                in: "$$order.totalAmount"
              }
            }
          },
          lastOrderDate: { $max: "$orders.createdAt" }
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    return res.json({ count: customers.length, customers });
  } catch (error) {
    return next(error);
  }
}

export async function getDeliveryBoys(req, res, next) {
  try {
    const deliveryBoys = await DeliveryBoy.find()
      .sort({ createdAt: -1 })
      .populate("user", "name phone email isActive role");

    return res.json({ count: deliveryBoys.length, deliveryBoys });
  } catch (error) {
    return next(error);
  }
}

export async function createDeliveryBoy(req, res, next) {
  try {
    const { name, phone, email, password, isActive = true, vehicleNumber } = req.body;
    const trimmedName = String(name || "").trim();
    const phoneDigits = String(phone || "").replace(/\D/g, "").slice(-10);
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!trimmedName || !phoneDigits || !password) {
      return res.status(400).json({ message: "Name, phone, and password are required" });
    }

    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      return res.status(400).json({ message: "Enter a valid 10 digit mobile number" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ phone: phoneDigits }, ...(normalizedEmail ? [{ email: normalizedEmail }] : [])]
    });

    if (existingUser) {
      return res.status(409).json({ message: "User with this phone or email already exists" });
    }

    const user = await User.create({
      name: trimmedName,
      phone: phoneDigits,
      email: normalizedEmail || undefined,
      password,
      role: "delivery",
      isActive
    });

    const deliveryBoy = await DeliveryBoy.create({
      user: user._id,
      name: trimmedName,
      phone: phoneDigits,
      isAvailable: isActive,
      vehicleNumber: String(vehicleNumber || "").trim()
    });

    await deliveryBoy.populate("user", "name phone email isActive role");
    return res.status(201).json({ deliveryBoy });
  } catch (error) {
    return next(error);
  }
}

export async function updateDeliveryBoy(req, res, next) {
  try {
    const { name, phone, email, password, isActive, vehicleNumber } = req.body;
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);

    if (!deliveryBoy) return res.status(404).json({ message: "Delivery boy not found" });

    const user = await User.findById(deliveryBoy.user);
    if (!user) return res.status(404).json({ message: "Delivery user not found" });

    if (name !== undefined) {
      const trimmedName = String(name || "").trim();
      if (!trimmedName) return res.status(400).json({ message: "Name is required" });
      user.name = trimmedName;
      deliveryBoy.name = trimmedName;
    }
    if (phone !== undefined) {
      const phoneDigits = String(phone || "").replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        return res.status(400).json({ message: "Enter a valid 10 digit mobile number" });
      }
      const duplicatePhone = await User.findOne({ phone: phoneDigits, _id: { $ne: user._id } });
      if (duplicatePhone) return res.status(409).json({ message: "User with this phone already exists" });
      user.phone = phoneDigits;
      deliveryBoy.phone = phoneDigits;
    }
    if (email !== undefined) {
      const normalizedEmail = String(email || "").trim().toLowerCase();
      if (normalizedEmail) {
        const duplicateEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
        if (duplicateEmail) return res.status(409).json({ message: "User with this email already exists" });
      }
      user.email = normalizedEmail || undefined;
    }
    if (password) {
      if (String(password).length < 6) return res.status(400).json({ message: "Password must be at least 6 characters" });
      user.password = password;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
      deliveryBoy.isAvailable = isActive;
    }
    if (vehicleNumber !== undefined) deliveryBoy.vehicleNumber = String(vehicleNumber || "").trim();

    await user.save();
    await deliveryBoy.save();
    await deliveryBoy.populate("user", "name phone email isActive role");

    return res.json({ deliveryBoy });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDeliveryBoy(req, res, next) {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);

    if (!deliveryBoy) return res.status(404).json({ message: "Delivery boy not found" });

    await User.findByIdAndUpdate(deliveryBoy.user, { isActive: false });
    deliveryBoy.isAvailable = false;
    deliveryBoy.currentOrder = undefined;
    await deliveryBoy.save();

    return res.json({ message: "Delivery boy deactivated", deliveryBoy });
  } catch (error) {
    return next(error);
  }
}

export async function getAdminPayments(req, res, next) {
  try {
    const [payments, orders] = await Promise.all([
      Payment.find().sort({ createdAt: -1 }).limit(100).populate("customerId", "name phone email"),
      Order.find().sort({ createdAt: -1 }).limit(100)
    ]);

    return res.json({ payments, orders });
  } catch (error) {
    return next(error);
  }
}
