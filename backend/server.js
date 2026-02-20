const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/adminroute11");
const memberRoutes = require("./routes/memberRoutes");
const droRoutes = require("./routes/dro");

const app = express();

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
