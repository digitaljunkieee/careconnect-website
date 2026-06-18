import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv();

const { default: bcrypt } = await import("bcrypt");
const { connectDB } = await import("../src/lib/mongodb");
const { default: User } = await import("../src/models/User");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME?.trim() || "Care";
  const lastName = process.env.ADMIN_LAST_NAME?.trim() || "Admin";

  if (!email || !password) {
    throw new Error(
      "Set ADMIN_EMAIL and ADMIN_PASSWORD before running the admin seed script."
    );
  }

  await connectDB();

  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    console.log(`Admin account already exists for ${email}.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: "ADMIN",
    isActive: true
  });

  console.log(`Seeded admin account for ${email}.`);
}

seedAdmin()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exit(1);
  });
