const express = require("express");
const c = require("../controllers/vendorStockController");
const router = express.Router();
router.get("/low", c.lowStock);   // GET /api/stock/low?threshold=10
module.exports = router;
