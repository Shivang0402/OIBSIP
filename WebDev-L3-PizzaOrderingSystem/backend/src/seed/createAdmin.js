require("dotenv").config();
const connectDb = require("../config/db");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");

const run = async () => {
  const [email, password, phoneArg, name = "Admin"] = process.argv.slice(2);
  const clean = process.argv.includes("--clean");

  if (!email || !password) {
    console.log(
      "Usage: node src/seed/createAdmin.js <email> <password> [phone] [name] [--clean]",
    );
    console.log("--clean deletes every other admin account.");
    process.exit(1);
  }

  const phone =
    phoneArg || `9${String(Math.floor(Math.random() * 1e9)).padStart(9, "0")}`;

  await connectDb();

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        phone,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
      },
    },
    { returnDocument: "after", upsert: true },
  );

  console.log(
    `Admin ready: ${user.email} (role: ${user.role}, verified: ${user.isVerified})`,
  );

  if (clean) {
    const result = await User.deleteMany({
      role: "admin",
      email: { $ne: email },
    });
    console.log(`Removed ${result.deletedCount} other admin account(s).`);
  }

  const mongoose = require("mongoose");
  await mongoose.disconnect();
};

run();
