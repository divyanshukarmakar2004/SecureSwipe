const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config({ path: "./config.env" });

// Import routes
const usersRouter = require("./routes/users");
const transactionsRouter = require("./routes/transactions");
const flaggedTransactionsRouter = require("./routes/flaggedTransactions");
const analyticsRouter = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); 
app.use(morgan("combined"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); bodies

// CORS configuration - Allow multiple origins for development
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Fraud Detection API is running",
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/flagged-transactions", flaggedTransactionsRouter);
app.use("/api/analytics", analyticsRouter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Fraud Detection Analytics API",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
      transactions: "/api/transactions",
      flaggedTransactions: "/api/flagged-transactions",
      analytics: "/api/analytics",
      health: "/health",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Fraud Detection API server running on port ${PORT}`);
  console.log(`📊 API Documentation: http://localhost:${PORT}`);
  console.log(
    `🔗 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`
  );
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
