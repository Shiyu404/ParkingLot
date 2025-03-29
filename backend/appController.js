const express = require('express');

const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    const { oldName, newName } = req.body;
    
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    const tableCount = await appService.countDemotable();
    if (tableCount >= 0) {
        res.json({ 
            success: true,  
            count: tableCount
        });
    } else {
        res.status(500).json({ 
            success: false, 
            count: tableCount
        });
    }
});

// get current occupancy in the parking lot
router.get('/admin/occupancy', async (req, res) => {
    try {
        const result = await appService.fetchCurrentOccupancy(); // 建议直接在 appService 里写
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to get occupancy data' });
    }
});

// get the flagged vehicles
router.get('/admin/violations', async (req, res) => {
    try {
        const result = await appService.fetchFlaggedVehicles();
        res.status(200).json({
            success: true,
            vehicles: result
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to get flagged vehicles' });
    }
});
module.exports = router;