// Mounted BEFORE vendorRoutes so "/search" and "/balances" are not read as "/:id".
const express = require("express");
const c = require("../controllers/vendorStockController");
const router = express.Router();
router.get("/search", c.search);
router.get("/balances", c.balances);
router.get("/:id/balance", c.balanceOne);
module.exports = router;
