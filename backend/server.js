const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/adminroute11");
const memberRoutes = require("./routes/memberRoutes");
const droRoutes = require("./routes/dro");

const app = express();

// 🔥 GLOBAL TIMER SETUP - SAB USERS KE LIYE (YE LINE ADD KARO)
app.locals.globalTimer = { hours: 0, minutes: 0, seconds: 5 }; // Default 5 seconds
console.log('🚀 Server started with DEFAULT GLOBAL TIMER: 00h:00m:05s');

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// MONGOOSE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ROUTES ✅ FIXED - NO DUPLICATES
app.use("/api/admin", adminRoutes);
app.use("/api/members", memberRoutes);  // ← SINGLE SOURCE
app.use("/api/dro", droRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
