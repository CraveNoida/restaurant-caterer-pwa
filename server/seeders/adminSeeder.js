import "dotenv/config";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

const admin = {
  name: process.env.DEFAULT_ADMIN_NAME || "Ahmad Admin",
  phone: process.env.DEFAULT_ADMIN_PHONE || "9999999999",
  email: process.env.DEFAULT_ADMIN_EMAIL || "admin@ahmadcaterers.local",
  password: process.env.DEFAULT_ADMIN_PASSWORD || "admin123"
};

async function seedAdmin() {
  const connection = await connectDB();
  const existingAdmin = await User.findOne({
    $or: [{ role: "admin" }, { phone: admin.phone }, { email: admin.email }]
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${existingAdmin.email || existingAdmin.phone}`);
    await connection.disconnect();
    return;
  }

  const createdAdmin = await User.create({
    ...admin,
    role: "admin",
    isActive: true
  });

  console.log(`Default admin created: ${createdAdmin.email || createdAdmin.phone}`);
  await connection.disconnect();
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
