const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Trying to connect to MongoDB with URI:", process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI); // No options needed
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
