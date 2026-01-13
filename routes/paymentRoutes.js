const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createPayment,
  getPayments,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  retrievePaymentPeriod,
  retrievePaymentAndVAPeriod,
} = require("../controllers/paymentController");

router.post("/", verifyToken, createPayment);
router.get("/", verifyToken, getPayments);
router.get("/:id", verifyToken, getPaymentById);
router.put("/:id", verifyToken, updatePaymentStatus);
router.delete("/:id", verifyToken, deletePayment);
router.post("/retrieve", verifyToken, retrievePaymentPeriod);
router.post("/retrieve-with-va", verifyToken, retrievePaymentAndVAPeriod);

module.exports = router;
