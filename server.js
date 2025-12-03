const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // allow frontend
    credentials: true,
  })
);

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const institutionRoutes = require("./routes/institutionRoutes");
app.use("/api/institution", institutionRoutes);

const vaRoutes = require("./routes/vaRoutes");
app.use("/api/va", vaRoutes);

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

const transactionRoutes = require("./routes/transactionRoutes");
app.use("/api/transaction", transactionRoutes);

const settlementRoutes = require("./routes/settlementRoutes");
app.use("/api/settlement", settlementRoutes);

const reportRoutes = require("./routes/reportRoutes");
app.use("/api/report", reportRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
