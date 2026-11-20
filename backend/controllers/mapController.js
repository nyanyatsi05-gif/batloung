const distributionModel = require("../models/distributionModel");

async function getLocations(req, res, next) {
  try {
    const locations = await distributionModel.getDistributionLocations();
    res.status(200).json(locations);
  } catch (error) {
    next(error);
  }
}

module.exports = { getLocations };
