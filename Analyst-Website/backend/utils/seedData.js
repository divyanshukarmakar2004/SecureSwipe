const { db } = require("../config/firebase");

// Sample data for seeding Firebase database - Updated to match new structure
const sampleUsers = {
  UserID_1: {
    Name: "Rahul",
    City: "Mumbai",
    SendTransaction: {
      TransactionID_1: {
        Amount: 1000,
        Location: "Mumbai",
        Date: "2025-01-15",
      },
      TransactionID_2: {
        Amount: 500,
        Location: "Delhi",
        Date: "2025-01-14",
      },
      TransactionID_3: {
        Amount: 750,
        Location: "Mumbai",
        Date: "2025-01-13",
      },
    },
  },
  UserID_2: {
    Name: "Priya",
    City: "Bangalore",
    SendTransaction: {
      TransactionID_4: {
        Amount: 250,
        Location: "Bangalore",
        Date: "2025-01-15",
      },
      TransactionID_5: {
        Amount: 1200,
        Location: "Chennai",
        Date: "2025-01-14",
      },
    },
  },
  UserID_3: {
    Name: "Amit",
    City: "Delhi",
    SendTransaction: {
      TransactionID_6: {
        Amount: 800,
        Location: "Delhi",
        Date: "2025-01-15",
      },
      TransactionID_7: {
        Amount: 300,
        Location: "Mumbai",
        Date: "2025-01-13",
      },
      TransactionID_8: {
        Amount: 1500,
        Location: "Delhi",
        Date: "2025-01-12",
      },
    },
  },
  UserID_4: {
    Name: "Sneha",
    City: "Chennai",
    SendTransaction: {
      TransactionID_9: {
        Amount: 600,
        Location: "Chennai",
        Date: "2025-01-15",
      },
      TransactionID_10: {
        Amount: 900,
        Location: "Bangalore",
        Date: "2025-01-14",
      },
    },
  },
  UserID_5: {
    Name: "Vikram",
    City: "Hyderabad",
    SendTransaction: {
      TransactionID_11: {
        Amount: 400,
        Location: "Hyderabad",
        Date: "2025-01-15",
      },
      TransactionID_12: {
        Amount: 1100,
        Location: "Mumbai",
        Date: "2025-01-13",
      },
      TransactionID_13: {
        Amount: 700,
        Location: "Delhi",
        Date: "2025-01-12",
      },
    },
  },
};

const sampleFlaggedTransactions = {
  TransactionID_1: {
    Amount: 1000,
    Location: "Mumbai",
    Date: "2025-01-15",
    IPAddress: "192.168.1.1",
  },
  TransactionID_4: {
    Amount: 250,
    Location: "Bangalore",
    Date: "2025-01-15",
    IPAddress: "192.168.1.2",
  },
  TransactionID_6: {
    Amount: 800,
    Location: "Delhi",
    Date: "2025-01-15",
    IPAddress: "192.168.1.3",
  },
  TransactionID_9: {
    Amount: 600,
    Location: "Chennai",
    Date: "2025-01-15",
    IPAddress: "192.168.1.1",
  },
  TransactionID_11: {
    Amount: 400,
    Location: "Hyderabad",
    Date: "2025-01-15",
    IPAddress: "192.168.1.4",
  },
  TransactionID_2: {
    Amount: 500,
    Location: "Delhi",
    Date: "2025-01-14",
    IPAddress: "192.168.1.5",
  },
  TransactionID_7: {
    Amount: 300,
    Location: "Mumbai",
    Date: "2025-01-13",
    IPAddress: "192.168.1.1",
  },
};

// Function to seed data to Firebase
async function seedData() {
  try {
    console.log("🌱 Starting data seeding...");

    // Seed users
    console.log("📝 Seeding users...");
    await db.ref("User").set(sampleUsers);
    console.log("✅ Users seeded successfully");

    // Seed flagged transactions
    console.log("🚨 Seeding flagged transactions...");
    await db.ref("FlaggedTransaction").set(sampleFlaggedTransactions);
    console.log("✅ Flagged transactions seeded successfully");

    console.log("🎉 All data seeded successfully!");
    console.log(`📊 Sample data includes:`);
    console.log(`   - ${Object.keys(sampleUsers).length} users`);
    console.log(
      `   - ${Object.values(sampleUsers).reduce(
        (total, user) => total + Object.keys(user.SendTransaction || {}).length,
        0
      )} transactions`
    );
    console.log(
      `   - ${
        Object.keys(sampleFlaggedTransactions).length
      } flagged transactions`
    );
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Function to clear all data
async function clearData() {
  try {
    console.log("🗑️ Clearing all data...");

    await db.ref().remove();
    console.log("✅ All data cleared successfully");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
    throw error;
  }
}

// Function to get current data count
async function getDataCount() {
  try {
    const [usersSnapshot, flaggedSnapshot] = await Promise.all([
      db.ref("User").once("value"),
      db.ref("FlaggedTransaction").once("value"),
    ]);

    const users = usersSnapshot.val() || {};
    const flagged = flaggedSnapshot.val() || {};

    const totalTransactions = Object.values(users).reduce(
      (total, user) => total + Object.keys(user.SendTransaction || {}).length,
      0
    );

    console.log("📊 Current data count:");
    console.log(`   - Users: ${Object.keys(users).length}`);
    console.log(`   - Transactions: ${totalTransactions}`);
    console.log(`   - Flagged Transactions: ${Object.keys(flagged).length}`);

    return {
      users: Object.keys(users).length,
      transactions: totalTransactions,
      flagged: Object.keys(flagged).length,
    };
  } catch (error) {
    console.error("❌ Error getting data count:", error);
    throw error;
  }
}

module.exports = {
  seedData,
  clearData,
  getDataCount,
  sampleUsers,
  sampleFlaggedTransactions,
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log("🎯 Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
