import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

function authResponse(user) {
  return {
    user,
    token: generateToken({ id: user._id, role: user.role })
  };
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "").slice(-10);
}

function normalizeEmail(email = "") {
  const trimmed = String(email).trim().toLowerCase();
  return trimmed || undefined;
}

export async function register(req, res, next) {
  try {
    const { name, phone, email, password, addresses = [] } = req.body;
    const normalizedPhone = normalizePhone(phone);
    const normalizedEmail = normalizeEmail(email);

    if (!name?.trim() || !normalizedPhone || !password) {
      return res.status(400).json({ message: "Name, phone, and password are required" });
    }

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({ message: "Enter a valid 10 digit Indian mobile number" });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const duplicateChecks = [{ phone: normalizedPhone }];
    if (normalizedEmail) duplicateChecks.push({ email: normalizedEmail });

    const existingUser = await User.findOne({ $or: duplicateChecks });

    if (existingUser) {
      return res.status(409).json({ message: "User with this phone or email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      phone: normalizedPhone,
      email: normalizedEmail,
      password,
      role: "customer",
      addresses
    });
    return res.status(201).json(authResponse(user));
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { identifier, emailOrPhone, email, phone, password } = req.body;
    const loginId = identifier || emailOrPhone || email || phone;
    const normalizedLogin = String(loginId || "").trim();

    if (!normalizedLogin || !password) {
      return res.status(400).json({ message: "Email or phone and password are required" });
    }

    const phoneDigits = normalizePhone(normalizedLogin);
    const user = await User.findOne({
      $or: [{ email: normalizedLogin.toLowerCase() }, { phone: phoneDigits || normalizedLogin }]
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid phone/email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is inactive" });
    }

    return res.json(authResponse(user));
  } catch (error) {
    return next(error);
  }
}

export function getProfile(req, res) {
  return res.json({ user: req.user });
}
