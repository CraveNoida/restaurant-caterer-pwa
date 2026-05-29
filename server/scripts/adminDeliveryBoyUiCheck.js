const playwrightImport = process.env.PLAYWRIGHT_IMPORT || "playwright";
const { chromium } = await import(playwrightImport);
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import DeliveryBoy from "../models/DeliveryBoy.js";

const baseUrl = process.env.UI_QA_BASE_URL || "http://localhost:5173";
const adminIdentifier = process.env.SMOKE_ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.SMOKE_ADMIN_PASSWORD || "admin123";
const phone = `7${String(Date.now()).slice(-9)}`;
const email = `admin-ui-delivery-${Date.now()}@example.com`;

const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROME_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH } : {})
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const browserErrors = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) browserErrors.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Phone or email").fill(adminIdentifier);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Login to Dashboard" }).click();
  await page.waitForURL("**/admin/dashboard", { timeout: 15000 });

  await page.goto(`${baseUrl}/admin/delivery-boys`, { waitUntil: "domcontentloaded" });
  await page.getByPlaceholder("Name").fill("Admin UI Delivery Check");
  await page.getByPlaceholder("Phone").fill(phone);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill("Delivery123");
  await page.getByPlaceholder("Vehicle number").fill("UI-CHECK");
  await page.getByRole("button", { name: "Add Delivery Boy" }).click();

  await page.getByText("Delivery boy added.", { exact: false }).waitFor({ state: "visible", timeout: 15000 });
  await page.getByText("Admin UI Delivery Check", { exact: false }).waitFor({ state: "visible", timeout: 15000 });

  if (browserErrors.length) throw new Error(`Browser errors: ${browserErrors.join("; ")}`);
  console.log(JSON.stringify({ ok: true, phone, email }, null, 2));
} finally {
  await browser.close();
  await connectDB().catch(() => {});
  const user = await User.findOne({ phone }).catch(() => null);
  if (user) {
    await DeliveryBoy.deleteMany({ user: user._id }).catch(() => {});
    await User.deleteOne({ _id: user._id }).catch(() => {});
  }
  await mongoose.disconnect().catch(() => {});
}
