const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const controller = require("../controllers/reportController");

router.get("/top-fruits", asyncHandler(controller.topFruits));
router.get("/revenue", asyncHandler(controller.revenue));
router.get("/highest-volume-vendor", asyncHandler(controller.highestVendor));
router.get("/stock-by-packaging", asyncHandler(controller.stock));

module.exports = router;
