const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

function placeholderIPFromSeed(seed) {
  const s = String(seed);
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  const a = hash & 0xff || 10;
  const b = (hash >> 8) & 0xff || 20;
  const c = (hash >> 16) & 0xff || 30;
  const d = (hash >> 24) & 0xff || 40;
  return `${a}.${b}.${c}.${d}`;
}

function baselineIPForUser(userId) {
  return placeholderIPFromSeed(`base:${String(userId)}`);
}

function fraudIPForTx(userId, txId) {
  return placeholderIPFromSeed(`fraud:${String(userId)}:${String(txId)}`);
}

function ipHash(input) {
  const s = String(input);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h >>> 0;
}

function sharedBadIP(bucketIndex) {
  const idx = (bucketIndex % 20) + 10;
  return `203.0.113.${idx}`; 
}


function chooseFraudIP(userId, txId) {
  const h = ipHash(`mix:${userId}:${txId}`);
  const useShared = h % 3 === 0; 
  if (useShared) {
    const bucket = (h >>> 3) % 8; 
    return sharedBadIP(bucket);
  }
  return fraudIPForTx(userId, txId);
}

function normalizeDateDDMMYYYY(dateStr) {
  if (!dateStr) return "1970-01-01";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
        2,
        "0"
      )}`;
    }
  }
  return dateStr;
}

// Get all flagged transactions
router.get("/", async (req, res) => {
  try {
    const flaggedRef = db.ref("flagged transactions");
    const snapshot = await flaggedRef.once("value");
    const flaggedTransactions = snapshot.val();

    if (!flaggedTransactions) {
      return res.json([]);
    }

    // Convert object to array and add IDs
    const flaggedArray = Object.keys(flaggedTransactions).map((key) => {
      const tx = flaggedTransactions[key];
      const dateFromParts = tx.Date
        ? tx.Date
        : tx.Day && tx.Month && tx.Year
        ? `${tx.Year}-${String(tx.Month).padStart(2, "0")}-${String(
            tx.Day
          ).padStart(2, "0")}`
        : undefined;

      const userId = tx.User != null ? String(tx.User) : undefined;

      return {
        id: key,
        amount: Number(tx.Amount) || 0,
        location: tx.Location || tx.City || "",
        date: normalizeDateDDMMYYYY(dateFromParts),
        ipAddress: chooseFraudIP(userId || "unknown", key),
        userId: userId || null,
      };
    });

    // Match flagged transactions with users
    const usersRef = db.ref("user");
    const usersSnapshot = await usersRef.once("value");
    const users = usersSnapshot.val() || {};

    flaggedArray.forEach((flaggedTx) => {
      // If userId already present, enrich from that user
      if (flaggedTx.userId && users[flaggedTx.userId]) {
        const user = users[flaggedTx.userId];
        flaggedTx.userName = user.name;
        flaggedTx.userCity = user.city;
        return;
      }

      // Otherwise try to match by amount/location/date
      Object.keys(users).forEach((userId) => {
        const user = users[userId];
        const userTransactions = user.sendTransaction || {};

        Object.keys(userTransactions).forEach((txId) => {
          const userTx = userTransactions[txId];
          if (
            Number(userTx.amount) === flaggedTx.amount &&
            (userTx.location || "") === (flaggedTx.location || "") &&
            normalizeDateDDMMYYYY(userTx.date) === flaggedTx.date
          ) {
            flaggedTx.userId = userId;
            flaggedTx.userName = user.name;
            flaggedTx.userCity = user.city;
          }
        });
      });
    });

    res.json(flaggedArray);
  } catch (error) {
    console.error("Error fetching flagged transactions:", error);
    res.status(500).json({ error: "Failed to fetch flagged transactions" });
  }
});

// Get flagged transactions by user ID
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's transactions first
    const userRef = db.ref(`user/${userId}`);
    const userSnapshot = await userRef.once("value");
    const user = userSnapshot.val();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all flagged transactions
    const flaggedRef = db.ref("flagged transactions");
    const flaggedSnapshot = await flaggedRef.once("value");
    const flaggedTransactions = flaggedSnapshot.val() || {};

    const userTransactions = user.sendTransaction || {};
    const userFlaggedTransactions = [];

    // Match user's transactions with flagged transactions
    Object.keys(flaggedTransactions).forEach((flaggedTxId) => {
      const flaggedTx = flaggedTransactions[flaggedTxId];

      Object.keys(userTransactions).forEach((userTxId) => {
        const userTx = userTransactions[userTxId];

        if (
          Number(userTx.amount) === Number(flaggedTx.Amount) &&
          (userTx.location || "") === (flaggedTx.Location || "") &&
          normalizeDateDDMMYYYY(userTx.date) ===
            normalizeDateDDMMYYYY(
              flaggedTx.Date ||
                `${flaggedTx.Year}-${flaggedTx.Month}-${flaggedTx.Day}`
            )
        ) {
          userFlaggedTransactions.push({
            id: flaggedTxId,
            userId: userId,
            userName: user.name,
            userCity: user.city,
            amount: Number(flaggedTx.Amount) || 0,
            location: flaggedTx.Location || flaggedTx.City || "",
            date: normalizeDateDDMMYYYY(
              flaggedTx.Date ||
                `${flaggedTx.Year}-${flaggedTx.Month}-${flaggedTx.Day}`
            ),
            ipAddress: chooseFraudIP(userId, flaggedTxId),
          });
        }
      });
    });

    res.json(userFlaggedTransactions);
  } catch (error) {
    console.error("Error fetching user flagged transactions:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch user flagged transactions" });
  }
});

// Get flagged transactions by IP address
router.get("/ip/:ipAddress", async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const flaggedRef = db.ref("FlaggedTransaction");
    const snapshot = await flaggedRef.once("value");
    const flaggedTransactions = snapshot.val();

    if (!flaggedTransactions) {
      return res.json([]);
    }

    // Filter by IP address
    const ipFlaggedTransactions = Object.keys(flaggedTransactions)
      .filter((key) => flaggedTransactions[key].IPAddress === ipAddress)
      .map((key) => ({
        id: key,
        amount: flaggedTransactions[key].Amount,
        location: flaggedTransactions[key].Location,
        date: flaggedTransactions[key].Date,
        ipAddress: flaggedTransactions[key].IPAddress,
        userId: null,
      }));

    // Match with users
    const usersRef = db.ref("User");
    const usersSnapshot = await usersRef.once("value");
    const users = usersSnapshot.val() || {};

    ipFlaggedTransactions.forEach((flaggedTx) => {
      Object.keys(users).forEach((userId) => {
        const user = users[userId];
        const userTransactions = user.SendTransaction || {};

        Object.keys(userTransactions).forEach((txId) => {
          const userTx = userTransactions[txId];
          if (
            userTx.Amount === flaggedTx.amount &&
            userTx.Location === flaggedTx.location &&
            userTx.Date === flaggedTx.date
          ) {
            flaggedTx.userId = userId;
            flaggedTx.userName = user.Name;
            flaggedTx.userCity = user.City;
          }
        });
      });
    });

    res.json(ipFlaggedTransactions);
  } catch (error) {
    console.error("Error fetching IP flagged transactions:", error);
    res.status(500).json({ error: "Failed to fetch IP flagged transactions" });
  }
});

// Get top flagged IP addresses
router.get("/stats/top-ips", async (req, res) => {
  try {
    const flaggedRef = db.ref("FlaggedTransaction");
    const snapshot = await flaggedRef.once("value");
    const flaggedTransactions = snapshot.val() || {};

    // Group by IP address and count
    const ipCounts = {};
    Object.values(flaggedTransactions).forEach((transaction) => {
      const ip = transaction.IPAddress;
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });

    // Convert to array and sort by count
    const topIPs = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 IPs

    res.json(topIPs);
  } catch (error) {
    console.error("Error fetching top IPs:", error);
    res.status(500).json({ error: "Failed to fetch top IP addresses" });
  }
});

// Get flagged transaction statistics
router.get("/stats/summary", async (req, res) => {
  try {
    const flaggedRef = db.ref("FlaggedTransaction");
    const snapshot = await flaggedRef.once("value");
    const flaggedTransactions = snapshot.val() || {};

    const totalFlagged = Object.keys(flaggedTransactions).length;
    const totalAmount = Object.values(flaggedTransactions).reduce(
      (sum, tx) => sum + (tx.Amount || 0),
      0
    );

    // Group by location
    const locationCounts = {};
    Object.values(flaggedTransactions).forEach((transaction) => {
      const location = transaction.Location;
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });

    const stats = {
      totalFlagged,
      totalAmount,
      uniqueIPs: new Set(
        Object.values(flaggedTransactions).map((tx) => tx.IPAddress)
      ).size,
      uniqueLocations: Object.keys(locationCounts).length,
      topLocations: Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching flagged stats:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch flagged transaction statistics" });
  }
});

module.exports = router;
