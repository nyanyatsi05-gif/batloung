const model = require("../models/distributionModel");

async function topFruits(req, res, next) {
  try { res.status(200).json(await model.getTopFiveFruits()); }
  catch (error) { next(error); }
}

async function revenue(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate || startDate > endDate) {
      return res.status(400).json({ message: "Provide a valid startDate and endDate (YYYY-MM-DD)." });
    }
    res.status(200).json(await model.getRevenueByDateRange(startDate, endDate));
  } catch (error) { next(error); }
}

async function highestVendor(req, res, next) {
  try { res.status(200).json(await model.getHighestVolumeVendor()); }
  catch (error) { next(error); }
}

async function stock(req, res, next) {
  try { res.status(200).json(await model.getStockByPackaging()); }
  catch (error) { next(error); }
}

module.exports = { topFruits, revenue, highestVendor, stock };
