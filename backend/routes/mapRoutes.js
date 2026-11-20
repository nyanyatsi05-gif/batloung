const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const { getLocations } = require("../controllers/mapController");

router.get("/locations", asyncHandler(getLocations));

module.exports = router;
