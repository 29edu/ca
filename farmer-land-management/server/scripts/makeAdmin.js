// Run this script to make a user admin
// Usage: node scripts/makeAdmin.js <email>

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const makeAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`User with email "${email}" not found`);
      process.exit(1);
    }

    user.role = "admin";
    await user.save();

    console.log(`✓ User "${user.name}" (${user.email}) is now an admin!`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

const email = process.argv[2];

if (!email) {
  console.log("Usage: node scripts/makeAdmin.js <email>");
  console.log("Example: node scripts/makeAdmin.js user@example.com");
  process.exit(1);
}

makeAdmin(email);
