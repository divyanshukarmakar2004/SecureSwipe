const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

// Helpers
function normalizeDate(dateStr) {
  if (!dateStr) return "1970-01-01";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      if (yyyy && mm && dd) {
        return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
          2,
          "0"
        )}`;
      }
    }
  }
  return dateStr;
}

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const usersRef = db.ref("user");
    const snapshot = await usersRef.once("value");
    const users = snapshot.val();

    if (!users) {
      return res.json([]);
    }

    // Extract all transactions from all users
    const allTransactions = [];

    Object.keys(users).forEach((userId) => {
      const user = users[userId];
      const userTransactions = user.sendTransaction || {};

      Object.keys(userTransactions).forEach((transactionId) => {
        const transaction = userTransactions[transactionId];
        allTransactions.push({
          id: transactionId,
          userId: userId,
          userName: user.name,
          userCity: user.city,
          amount: Number(transaction.amount) || 0,
          location: transaction.location || "",
          dateTime: normalizeDate(transaction.date),
          status: "success", 
        });
      });
    });

    res.json(allTransactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Get transactions by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const userRef = db.ref(`user/${userId}`);
    const snapshot = await userRef.once("value");
    const user = snapshot.val();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userTransactions = user.sendTransaction || {};
    const transactionsArray = Object.keys(userTransactions).map(
      (transactionId) => ({
        id: transactionId,
        userId: userId,
        userName: user.name,
        userCity: user.city,
        amount: Number(userTransactions[transactionId].amount) || 0,
        location: userTransactions[transactionId].location || "",
        dateTime: normalizeDate(userTransactions[transactionId].date),
        status: "success",
      })
    );

    res.json(transactionsArray);
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({ error: "Failed to fetch user transactions" });
  }
});

// Get transaction statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const usersRef = db.ref("User");
    const snapshot = await usersRef.once("value");
    const users = snapshot.val() || {};

    let totalTransactions = 0;
    let totalAmount = 0;
    let successfulTransactions = 0;
    let failedTransactions = 0;

    // Calculate statistics from all users
    Object.values(users).forEach((user) => {
      const userTransactions = user.SendTransaction || {};
      const userTransactionCount = Object.keys(userTransactions).length;
      const userTransactionAmount = Object.values(userTransactions).reduce(
        (sum, tx) => sum + (tx.Amount || 0),
        0
      );

      totalTransactions += userTransactionCount;
      totalAmount += userTransactionAmount;
      successfulTransactions += userTransactionCount; // All transactions are considered successful by default
    });

    failedTransactions = 0; 

    const stats = {
      totalTransactions,
      totalAmount,
      successfulTransactions,
      failedTransactions,
      successRate:
        totalTransactions > 0
          ? ((successfulTransactions / totalTransactions) * 100).toFixed(2)
          : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    res.status(500).json({ error: "Failed to fetch transaction statistics" });
  }
});

module.exports = router;
