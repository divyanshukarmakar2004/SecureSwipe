const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();


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

// Get all users
router.get("/", async (req, res) => {
  try {
    const usersRef = db.ref("user");
    const snapshot = await usersRef.once("value");
    const users = snapshot.val();

    if (!users) {
      return res.json([]);
    }

    // Convert object to array and add IDs
    const usersArray = Object.keys(users).map((key) => {
      const user = users[key] || {};
      const sendTx = user.sendTransaction || {};
      const lastActivity = Object.values(sendTx).reduce((latest, tx) => {
        const n = normalizeDate(tx.date);
        return n > latest ? n : latest;
      }, "1970-01-01");

      return {
        id: key,
        name: user.name,
        city: user.city,
        sendTransactionCount: Object.keys(sendTx).length,
        flaggedTransactionCount: 0, 
        riskLevel: "medium",
        status: "active",
        lastActivity,
      };
    });

    // Calculate flagged transaction count for each user
    const flaggedRef = db.ref("flagged transactions");
    const flaggedSnapshot = await flaggedRef.once("value");
    const flaggedTransactions = flaggedSnapshot.val() || {};

    usersArray.forEach((u) => {
      const userFlaggedCount = Object.values(flaggedTransactions).filter(
        (tx) => {
          // tx.User may be number or string; compare as string
          return String(tx.User) === String(u.id);
        }
      ).length;

      u.flaggedTransactionCount = userFlaggedCount;

      // Calculate risk level based on flagged transactions
      if (u.flaggedTransactionCount > 3) {
        u.riskLevel = "high";
      } else if (u.flaggedTransactionCount > 0) {
        u.riskLevel = "medium";
      } else {
        u.riskLevel = "low";
      }
    });

    res.json(usersArray);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userRef = db.ref(`user/${id}`);
    const snapshot = await userRef.once("value");
    const user = snapshot.val();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get flagged transactions for this user
    const flaggedRef = db.ref("flagged transactions");
    const flaggedSnapshot = await flaggedRef.once("value");
    const flaggedTransactions = flaggedSnapshot.val() || {};

    const userFlaggedCount = Object.values(flaggedTransactions).filter(
      (tx) => String(tx.User) === String(id)
    ).length;

    const userData = {
      id,
      name: user.name,
      city: user.city,
      sendTransactionCount: user.sendTransaction
        ? Object.keys(user.sendTransaction).length
        : 0,
      flaggedTransactionCount: userFlaggedCount,
      riskLevel:
        userFlaggedCount > 3 ? "high" : userFlaggedCount > 0 ? "medium" : "low",
      status: "active",
      lastActivity: user.sendTransaction
        ? Object.values(user.sendTransaction).reduce((latest, tx) => {
            const n = normalizeDate(tx.date);
            return n > latest ? n : latest;
          }, "1970-01-01")
        : "1970-01-01",
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Get user statistics
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    // Get user's transactions
    const userRef = db.ref(`User/${id}`);
    const userSnapshot = await userRef.once("value");
    const user = userSnapshot.val();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userTransactions = user.SendTransaction || {};
    const totalTransactions = Object.keys(userTransactions).length;
    const totalAmount = Object.values(userTransactions).reduce(
      (sum, tx) => sum + (tx.Amount || 0),
      0
    );

    // Get flagged transactions for this user
    const flaggedRef = db.ref("FlaggedTransaction");
    const flaggedSnapshot = await flaggedRef.once("value");
    const flaggedTransactions = flaggedSnapshot.val() || {};

    const userFlaggedTransactions = Object.values(flaggedTransactions).filter(
      (tx) => {
        return Object.keys(userTransactions).some(
          (txId) =>
            flaggedTransactions[txId] &&
            flaggedTransactions[txId].Amount === tx.Amount &&
            flaggedTransactions[txId].Location === tx.Location &&
            flaggedTransactions[txId].Date === tx.Date
        );
      }
    );

    const flaggedAmount = userFlaggedTransactions.reduce(
      (sum, tx) => sum + (tx.Amount || 0),
      0
    );

    const stats = {
      totalTransactions,
      flaggedTransactions: userFlaggedTransactions.length,
      totalAmount,
      flaggedAmount,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});

module.exports = router;
