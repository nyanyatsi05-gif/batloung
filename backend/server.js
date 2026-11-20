
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db"); // Existing callback-based routes
const { checkDatabaseConnection } = require("./config/database");

// Import API routes
const supplierRoutes = require("./routes/supplierRoutes");
const fruitRoutes = require("./routes/fruitRoutes");
const stockRoutes = require("./routes/stockRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const salesRoutes = require("./routes/salesRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const mapRoutes = require("./routes/mapRoutes");
const vendorExtraRoutes = require("./routes/vendorExtraRoutes");
const stockExtraRoutes = require("./routes/stockExtraRoutes");
const advancedReportRoutes = require("./routes/advancedReportRoutes");
const errorHandler = require("./middleware/errorHandler");
const { verifyToken, requireRole, adminOnlyWrites, noStaffDelete } = require("./middleware/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "BF Distribution System Backend is running!"
    });
});

// Authentication routes (login is public)
app.use("/api/auth", authRoutes);

// Everything below requires a valid login.
// Admin: full access.
// Staff: can view fruits/stock, manage vendors, record sales and payments (no deleting).
app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth")) return next();
    verifyToken(req, res, next);
});

app.use("/api/suppliers", requireRole("Admin"), supplierRoutes);
app.use("/api/purchases", requireRole("Admin"), purchaseRoutes);
app.use("/api/reports", requireRole("Admin"), reportRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/advanced-reports", requireRole("Admin"), advancedReportRoutes);
app.use("/api/fruits", adminOnlyWrites, fruitRoutes);
app.use("/api/stock", adminOnlyWrites, stockExtraRoutes);
app.use("/api/stock", adminOnlyWrites, stockRoutes);
app.use("/api/vendors", noStaffDelete, vendorExtraRoutes);
app.use("/api/vendors", noStaffDelete, vendorRoutes);
app.use("/api/sales", noStaffDelete, salesRoutes);
app.use("/api/payments", noStaffDelete, paymentRoutes);

// Handle unknown API routes
app.use("/api", (req, res) => {
    res.status(404).json({
        message: "API route not found",
        route: req.originalUrl
    });
});

// Central error handler (including errors forwarded by async controllers).
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
    await checkDatabaseConnection();
    app.listen(PORT, () => {
        console.log("--------------------------------");
        console.log("BF Distribution System Backend");
        console.log(`Server running on port ${PORT}`);
        console.log("Database status checked; API remains available for retries.");
        console.log("--------------------------------");
    });
}

startServer().catch((error) => {
    console.error("Server startup error:", error.message);
    process.exitCode = 1;
});
