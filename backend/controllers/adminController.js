const adminService = require('../services/adminService');

exports.getCurrentOccupancy = async (req, res) => {
  try {
    const result = await adminService.fetchCurrentOccupancy();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get occupancy data.' });
  }
};

exports.getFlaggedVehicles = async (req, res) => {
  try {
    const result = await adminService.fetchFlaggedVehicles();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get violations.' });
  }
};
