const express = require("express");
const c = require("../controllers/paymentController");
const router = express.Router();
router.get("/", c.list);
router.get("/sales", c.unpaid);
router.post("/", c.create);
module.exports = router;
