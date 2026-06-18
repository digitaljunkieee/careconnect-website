import { config as loadEnv } from "dotenv";
import mongoose from "mongoose";

loadEnv({ path: ".env.local" });
loadEnv();

const { connectDB } = await import("../src/lib/mongodb");
const models = await import("../src/models");

async function createIndexes() {
  await connectDB();

  const entries = Object.entries(models).filter(([, model]) => {
    return (
      typeof model === "function" &&
      "createIndexes" in model &&
      typeof model.createIndexes === "function"
    );
  });

  for (const [name, model] of entries) {
    await model.createIndexes();
    console.log(`Indexes ready for ${name}.`);
  }

  await mongoose.disconnect();
}

createIndexes().catch(async (error) => {
  console.error("Unable to create indexes:", error);
  await mongoose.disconnect();
  process.exit(1);
});
