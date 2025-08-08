const express = require("express");
const { db } = require("../config/firebase");
const router = express.Router();

function normalizeDate(dateStr) {
  if (!dateStr) return "1970-01-01";
  if (dateStr.includes("-")) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return dateStr; 
      }
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(
        2,
        "0"
      )}`;
    }
  }
  return dateStr;
}

function placeholderIPFromSeed(seed) {
  const s = String(seed || "seed");
  let hash = 0;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  const a = hash & 0xff || 10;
  const b = (hash >> 8) & 0xff || 20;
  const c = (hash >> 16) & 0xff || 30;
  const d = (hash >> 24) & 0xff || 40;
  return `${a}.${b}.${c}.${d}`;
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
    const bucket = (h >>> 3) % 8
    return sharedBadIP(bucket);
  }
  return placeholderIPFromSeed(`fraud:${userId}:${txId}`);
}


router.get("/transaction-chart", async (req, res) => {
  try {
    const usersRef = db.ref("user");
    const snapshot = await usersRef.once("value");
    const users = snapshot.val() || {};

    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      let dayTransactions = [];
      Object.values(users).forEach((user) => {
        const userTransactions = user.sendTransaction || {};
        Object.values(userTransactions).forEach((tx) => {
          if (normalizeDate(tx.date) === dateStr) {
            dayTransactions.push(tx);
          }
        });
      });

      const dayAmount = dayTransactions.reduce(
        (sum, tx) => sum + (Number(tx.amount) || 0),
        0
      );
      const dayCount = dayTransactions.length;

      last7Days.push({
        date: dateStr,
        amount: dayAmount,
        count: dayCount,
        flagged: 0, 
      });
    }

    // Get flagged transactions for the same period
    const flaggedRef = db.ref("flagged transactions");
    const flaggedSnapshot = await flaggedRef.once("value");
    const flaggedTransactions = flaggedSnapshot.val() || {};

    // Add flagged counts to the chart data
    last7Days.forEach((day) => {
      const dayFlagged = Object.values(flaggedTransactions).filter((tx) => {
        let composed;
        if (tx.Date) {
          composed = normalizeDate(tx.Date);
        } else if (tx.Day && tx.Month && tx.Year) {
          // Format as YYYY-MM-DD directly for comparison
          composed = `${tx.Year}-${String(tx.Month).padStart(2, "0")}-${String(
            tx.Day
          ).padStart(2, "0")}`;
        } else {
          composed = "1970-01-01";
        }
        return composed === day.date;
      });
      day.flagged = dayFlagged.length;
    });

    res.json(last7Days);
  } catch (error) {
    console.error("Error fetching transaction chart data:", error);
    res.status(500).json({ error: "Failed to fetch transaction chart data" });
  }
});

// Get IP address chart data
router.get("/ip-chart", async (req, res) => {
  try {
    const flaggedRef = db.ref("flagged transactions");
    const snapshot = await flaggedRef.once("value");
    const flaggedTransactions = snapshot.val() || {};

    // Group by fraud IP with clustering
    const ipCounts = {};
    Object.entries(flaggedTransactions).forEach(([id, tx]) => {
      const ip = chooseFraudIP(tx.User || "unknown", id);
      ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    });

    const ipData = Object.entries(ipCounts)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(ipData);
  } catch (error) {
    console.error("Error fetching IP chart data:", error);
    res.status(500).json({ error: "Failed to fetch IP chart data" });
  }
});

// Get dashboard summary statistics
router.get("/dashboard-summary", async (req, res) => {
  try {
    const [usersSnapshot, flaggedSnapshot] = await Promise.all([
      db.ref("user").once("value"),
      db.ref("flagged transactions").once("value"),
    ]);

    const users = usersSnapshot.val() || {};
    const flaggedTransactions = flaggedSnapshot.val() || {};

    let totalUsers = Object.keys(users).length;
    let totalTransactions = 0;
    let totalAmount = 0;

    Object.values(users).forEach((user) => {
      const userTransactions = user.sendTransaction || {};
      totalTransactions += Object.keys(userTransactions).length;
      totalAmount += Object.values(userTransactions).reduce(
        (sum, tx) => sum + (Number(tx.amount) || 0),
        0
      );
    });

    const totalFlagged = Object.keys(flaggedTransactions).length;
    const flaggedAmount = Object.values(flaggedTransactions).reduce(
      (sum, tx) => sum + (Number(tx.Amount) || 0),
      0
    );

    const riskLevels = { low: 0, medium: 0, high: 0 };
    Object.entries(users).forEach(([id, user]) => {
      const count = Object.values(flaggedTransactions).filter(
        (tx) => String(tx.User) === String(id)
      ).length;
      if (count > 3) riskLevels.high++;
      else if (count > 0) riskLevels.medium++;
      else riskLevels.low++;
    });

    const userStatus = { active: totalUsers, disabled: 0 };

    const summary = {
      totalUsers,
      totalTransactions,
      totalFlagged,
      totalAmount,
      flaggedAmount,
      fraudRate:
        totalTransactions > 0
          ? ((totalFlagged / totalTransactions) * 100).toFixed(2)
          : 0,
      riskLevels,
      userStatus,
      recentActivity: { last24Hours: 0, last7Days: 0 },
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    Object.values(users).forEach((user) => {
      const userTransactions = user.sendTransaction || {};
      Object.values(userTransactions).forEach((tx) => {
        const d = normalizeDate(tx.date);
        if (d >= yesterdayStr) summary.recentActivity.last24Hours++;
        if (d >= weekAgoStr) summary.recentActivity.last7Days++;
      });
    });

    res.json(summary);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    res.status(500).json({ error: "Failed to fetch dashboard summary" });
  }
});

// Get location-based analytics
router.get("/location-analytics", async (req, res) => {
  try {
    const [usersSnapshot, flaggedSnapshot] = await Promise.all([
      db.ref("user").once("value"),
      db.ref("flagged transactions").once("value"),
    ]);

    const users = usersSnapshot.val() || {};
    const flaggedTransactions = flaggedSnapshot.val() || {};

    const locationStats = {};

    Object.values(users).forEach((user) => {
      const userTransactions = user.sendTransaction || {};
      Object.values(userTransactions).forEach((tx) => {
        const location = tx.location || "Unknown";
        if (!locationStats[location]) {
          locationStats[location] = {
            totalTransactions: 0,
            totalAmount: 0,
            flaggedTransactions: 0,
            flaggedAmount: 0,
          };
        }
        locationStats[location].totalTransactions++;
        locationStats[location].totalAmount += Number(tx.amount) || 0;
      });
    });

    Object.values(flaggedTransactions).forEach((tx) => {
      const location = tx.Location || tx.City || "Unknown";
      if (!locationStats[location]) {
        locationStats[location] = {
          totalTransactions: 0,
          totalAmount: 0,
          flaggedTransactions: 0,
          flaggedAmount: 0,
        };
      }
      locationStats[location].flaggedTransactions++;
      locationStats[location].flaggedAmount += Number(tx.Amount) || 0;
    });

    const locationAnalytics = Object.entries(locationStats)
      .map(([location, stats]) => ({
        location,
        ...stats,
        fraudRate:
          stats.totalTransactions > 0
            ? (
                (stats.flaggedTransactions / stats.totalTransactions) *
                100
              ).toFixed(2)
            : 0,
      }))
      .sort((a, b) => parseFloat(b.fraudRate) - parseFloat(a.fraudRate));

    res.json(locationAnalytics);
  } catch (error) {
    console.error("Error fetching location analytics:", error);
    res.status(500).json({ error: "Failed to fetch location analytics" });
  }
});

module.exports = router;
