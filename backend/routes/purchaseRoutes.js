const express = require("express");
const c = require("../controllers/purchaseController");
const router = express.Router();
router.get("/", c.list);
router.get("/:id/details", c.details);
router.post("/", c.create);
module.exports = router;
