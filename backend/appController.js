const express = require('express');
const { pool } = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const appService = require('./appService');

const router = express.Router();

// Helper function to set CORS headers
const setCorsHeaders = (res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
};

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    setCorsHeaders(res);
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    setCorsHeaders(res);
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

router.post("/initiate-demotable", async (req, res) => {
    setCorsHeaders(res);
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/insert-demotable", async (req, res) => {
    setCorsHeaders(res);
    const { id, name } = req.body;
    const insertResult = await appService.insertDemotable(id, name);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post("/update-name-demotable", async (req, res) => {
    setCorsHeaders(res);
    const { oldName, newName } = req.body;
    
    const updateResult = await appService.updateNameDemotable(oldName, newName);
    if (updateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/count-demotable', async (req, res) => {
    setCorsHeaders(res);
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

// Login endpoint
router.post('/login', async (req, res) => {
    setCorsHeaders(res);
    try {
        const { phone,password } = req.body;
        const result = await appService.loginUser(phone, password);
        if (result.success) {
            res.json(result);
        } else {
            res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//Register endpoint
router.post('/users/register',async(req,res) => {
    setCorsHeaders(res);
    try{
        const { name,phone,password,userType,unitNumber,hostInformation,role = 'user'} = req.body;
        const result = await appService.registerUser(name,phone,password,userType,unitNumber,hostInformation,role);
        if (result.success) {
                res.json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
    }} catch (error) {
        console.error('Reigister error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// get current occupancy in the parking lot
router.get('/admin/occupancy', async (req, res) => {
    setCorsHeaders(res);
    try {
        const result = await appService.fetchCurrentOccupancy();
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get occupancy data' });
    }
});

// get the flagged vehicles
router.get('/admin/violations', async (req, res) => {
    setCorsHeaders(res);
    try {
        const result = await appService.fetchFlaggedVehicles();
        res.json({ vehicles: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to get flagged vehicles' });
    }
});

// 4.1 get information of all parking lots
router.get('/parking-lots', async (req, res) => {
    setCorsHeaders(res);
    try {
        const result = await appService.getAllParkingLots();
        res.json({
            status: "success",
            data: {
                parkingLots: result
            }
        });
    } catch (error) {
        console.error('Get parking lots error:', error);
        res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to get parking lots"
            }
        });
    }
});

// 4.2 get info of specific parking lot
router.get('/parking-lots/:lotId', async (req, res) => {
    setCorsHeaders(res);
    try {
        const { lotId } = req.params;
        const result = await appService.getParkingLotById(lotId);
        if (result) {
            res.json({
                status: "success",
                data: result
            });
        } else {
            res.status(404).json({
                status: "error",
                error: {
                    code: "NOT_FOUND",
                    message: "Parking lot not found"
                }
            });
        }
    } catch (error) {
        console.error('Get parking lot error:', error);
        res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to get parking lot"
            }
        });
    }
});

//5.1 get user violation
router.get('/violations/user/:userId', async (req, res) => {
    setCorsHeaders(res);
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        const result = await appService.getUserViolations(userId, startDate, endDate);
        res.json({
            status: "success",
            data: {
                violations: result
            }
        });
    } catch (error) {
        console.error('Get violations error:', error);
        res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to get violations"
            }
        });
    }
});

// 5.2 Create violation admin only
router.post('/violations', async (req, res) => {
    setCorsHeaders(res);
    try {
        const { lotId, province, licensePlate, reason, time } = req.body;
        const result = await appService.createViolation(lotId, province, licensePlate, reason, time);
        res.status(201).json({
            status: "success",
            data: {
                ticketId: result
            }
        });
    } catch (error) {
        console.error('Create violation error:', error);
        res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to create violation"
            }
        });
    }
});

// 6.1 create payment
router.post('/payments', async (req, res) => {
    setCorsHeaders(res);
    try {
        const { amount, paymentMethod, cardNumber, userId, lotId, ticketId } = req.body;
        const result = await appService.createPayment(amount, paymentMethod, cardNumber, userId, lotId, ticketId);
        res.status(201).json({
            status: "success",
            data: {
                payId: result.payId,
                amount: result.amount,
                status: result.status
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to create payment"
            }
        });
    }
});

//6.2 get payment history
router.get('/payments/user/:userId', async (req, res) => {
    setCorsHeaders(res);
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
        const result = await appService.getUserPayments(userId, startDate, endDate);
        res.json({
            status: "success",
            data: {
                payments: result
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            status: "error",
            error: {
                code: "INTERNAL_ERROR",
                message: "Failed to get payments"
            }
        });
    }
});

module.exports = router;