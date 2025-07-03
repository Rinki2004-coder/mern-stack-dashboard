const axios = require("axios");
const Transaction = require("../models/Transaction");
const moment = require("moment");

// ✅ Add this to seed data from 3rd-party API
const initializeDB = async (req, res) => {
  try {
    // Fetch data from API
    const { data } = await axios.get("https://s3.amazonaws.com/roxiler.com/product_transaction.json");

    // Clear old data (optional)
    await Transaction.deleteMany({});
    await Transaction.insertMany(data);

    res.status(200).json({ message: "Database initialized with seed data!" });
  } catch (err) {
    console.error("Error initializing DB:", err);
    res.status(500).json({ error: "Failed to initialize database" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const { month, page = 1, perPage = 10, search = "" } = req.query;

    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    // Convert month to number (e.g., March → 3)
    const monthNumber = moment().month(month).format("M");

    const query = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, Number(monthNumber)]
      }
    };

    // Add search filter if present
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { price: { $regex: search, $options: "i" } }
      ];
    }

    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    res.json({
      page: Number(page),
      perPage: Number(perPage),
      total,
      totalPages: Math.ceil(total / perPage),
      data: transactions
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getStats = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    const monthNumber = moment().month(month).format("M");

    // Filter for selected month
    const query = {
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, Number(monthNumber)]
      }
    };

    const transactions = await Transaction.find(query);

    const totalSaleAmount = transactions.reduce((sum, txn) => sum + (txn.sold ? txn.price : 0), 0);
    const totalSoldItems = transactions.filter(txn => txn.sold).length;
    const totalUnsoldItems = transactions.filter(txn => !txn.sold).length;

    res.json({
      month,
      totalSaleAmount,
      totalSoldItems,
      totalUnsoldItems
    });
  } catch (err) {
    console.error("Error in getStats:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getBarData = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    const monthNumber = moment().month(month).format("M");

    const transactions = await Transaction.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, Number(monthNumber)]
      },
      sold: true
    });

    const priceRanges = {
      "0-100": 0,
      "101-200": 0,
      "201-300": 0,
      "301-400": 0,
      "401-500": 0,
      "501-600": 0,
      "601-700": 0,
      "701-800": 0,
      "801-900": 0,
      "901-above": 0
    };

    transactions.forEach(txn => {
      const price = txn.price;
      if (price <= 100) priceRanges["0-100"]++;
      else if (price <= 200) priceRanges["101-200"]++;
      else if (price <= 300) priceRanges["201-300"]++;
      else if (price <= 400) priceRanges["301-400"]++;
      else if (price <= 500) priceRanges["401-500"]++;
      else if (price <= 600) priceRanges["501-600"]++;
      else if (price <= 700) priceRanges["601-700"]++;
      else if (price <= 800) priceRanges["701-800"]++;
      else if (price <= 900) priceRanges["801-900"]++;
      else priceRanges["901-above"]++;
    });

    res.json({
      month,
      priceRanges
    });
  } catch (err) {
    console.error("Error in getBarData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getPieData = async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ error: "Month is required" });
    }

    const monthNumber = moment().month(month).format("M");

    const transactions = await Transaction.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, Number(monthNumber)]
      },
      sold: true
    });

    const categoryData = {};

    transactions.forEach(txn => {
      const cat = txn.category || "Unknown";
      categoryData[cat] = (categoryData[cat] || 0) + 1;
    });

    res.json({
      month,
      categoryWiseCount: categoryData
    });
  } catch (err) {
    console.error("Error in getPieData:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getCombined = async (req, res) => {
  try {
    const { month } = req.query;
    if (!month) return res.status(400).json({ error: "Month is required" });

    const monthNumber = moment().month(month).format("M");

    const transactions = await Transaction.find({
      $expr: {
        $eq: [{ $month: "$dateOfSale" }, Number(monthNumber)]
      }
    });

    const totalSaleAmount = transactions.reduce((sum, txn) => sum + (txn.sold ? txn.price : 0), 0);
    const totalSoldItems = transactions.filter(txn => txn.sold).length;
    const totalUnsoldItems = transactions.filter(txn => !txn.sold).length;

    const priceRanges = {
      "0-100": 0, "101-200": 0, "201-300": 0, "301-400": 0,
      "401-500": 0, "501-600": 0, "601-700": 0, "701-800": 0,
      "801-900": 0, "901-above": 0
    };

    transactions.forEach(txn => {
      if (txn.sold) {
        const price = txn.price;
        if (price <= 100) priceRanges["0-100"]++;
        else if (price <= 200) priceRanges["101-200"]++;
        else if (price <= 300) priceRanges["201-300"]++;
        else if (price <= 400) priceRanges["301-400"]++;
        else if (price <= 500) priceRanges["401-500"]++;
        else if (price <= 600) priceRanges["501-600"]++;
        else if (price <= 700) priceRanges["601-700"]++;
        else if (price <= 800) priceRanges["701-800"]++;
        else if (price <= 900) priceRanges["801-900"]++;
        else priceRanges["901-above"]++;
      }
    });

    const categoryWiseCount = {};
    transactions.forEach(txn => {
      if (txn.sold) {
        const cat = txn.category || "Unknown";
        categoryWiseCount[cat] = (categoryWiseCount[cat] || 0) + 1;
      }
    });

    res.json({
      month,
      statistics: {
        totalSaleAmount,
        totalSoldItems,
        totalUnsoldItems
      },
      barChart: priceRanges,
      pieChart: categoryWiseCount
    });
  } catch (err) {
    console.error("Error in getCombined:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  initializeDB,
  getTransactions,
  getStats,
  getBarData,
  getPieData,
  getCombined 
};


