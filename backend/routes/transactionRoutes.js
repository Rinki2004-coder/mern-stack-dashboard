const express = require("express");
const router = express.Router();

const {
  initializeDB,
  getTransactions,
  getStats,
  getBarData,
  getPieData,
  getCombined
} = require("../controllers/transactionController");

// Routes
router.get("/initialize", initializeDB);
router.get("/transactions", getTransactions);
router.get("/statistics", getStats);
router.get("/bar-chart", getBarData);
router.get("/pie-chart", getPieData);
router.get("/combined-data", getCombined);





module.exports = router;
