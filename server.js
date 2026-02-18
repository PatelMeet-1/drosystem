const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const adminRoutes = require("./routes/adminroute11");
const memberRoutes = require("./routes/memberRoutes");
const drawRoutes = require("./routes/drawRoutes"); // ✅ CORRECT FILE

const app = express();
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error(err));

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/draw", drawRoutes); // ✅ THIS ENABLES /run

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
