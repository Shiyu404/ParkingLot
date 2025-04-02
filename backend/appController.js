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

//1.1 Login endpoint
router.post('/users/login', async (req, res) => {
    try {
        const { phone,password } = req.body;
        const result = await appService.loginUser(phone, password);
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(401).json({ success: false, message: 'Invalid phone number or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//1.2 Register endpoint
router.post('/users/register',async(req,res) => {
    try{
        const { name,phone,password,userType,unitNumber,hostInformation,role = 'user'} = req.body;
        const result = await appService.registerUser(name,phone,password,userType,unitNumber,hostInformation,role);
        if (result.success) {
                res.status(201).json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
    }} catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
    
});

//1.3 Get user's information
router.get('/users/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const result = await appService.getUserInformation(userId);
        if (result.success) {
                res.status(200).json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
        }
    } catch (error) {
        console.error('Get information error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//2.1 Get user's vehicles information
router.get('/vehicles/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const result = await appService.getUserVehiclesInformation(userId);
        if (result.success) {
                res.status(200).json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
        }
    } catch (error) {
        console.error('Get information error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

//2.2 Register vehicles
router.post('/vehicles',async(req,res) => {
    try{
        const {userId,province,licensePlate,lotId,parkingUntil} = req.body;
        const result = await appService.registerVehicle(userId,province,licensePlate,lotId,parkingUntil);
        if (result.success) {
                res.status(201).json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
    }} catch (error) {
        console.error('Reigister error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
    
});

// 3.1 get user's visitor passes
router.get('/visitorPasses/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const result = await appService.getUserVisitorPasses(userId);
        console.log("userID: ", userId);
        console.log("result", result);
        if (result.success) {
                res.status(200).json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
        }
    } catch (error) {
        console.error('Get visitor passes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 3.2 apply for visitor passes
router.post('/visitorPasses',async(req,res) => {
    try{
        const {userId, hours, visitorPlate} = req.body;
        if (!userId || !hours || !visitorPlate) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: userId, hours, visitorPlate"
            });
        }
        
        const result = await appService.applyVisitorPasses(userId, hours, visitorPlate);
        if (result.success) {
                res.status(201).json(result);
        } else {
                res.status(400).json({ success: false, message: result.message});
    }} catch (error) {
        console.error('Apply visitor passes error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
    
});

// 3.3 get user's visitor pass quota and usage history
router.get('/visitorPasses/quota/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const result = await appService.getUserVisitorPassQuota(userId);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Get visitor pass quota error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 4.1 get information of all parking lots
router.get('/parkingLots', async (req, res) => {
    try {
        const parkingLots = await appService.getAllParkingLots();
        res.status(200).json({
            success: true,
            parkingLots
        });
    } catch (error) {
        console.error('Get parking lots error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch parking lots information"
        });
    }
});

// 4.2 get info of specific parking lot
router.get('/parkingLots/:lotId', async (req, res) => {
    try {
        const { lotId } = req.params;
        if (!lotId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid parking lot ID in the URL"
            });
        }
        const parkingLots = await appService.getParkingLotById(lotId);
        if (parkingLots) {
            res.status(200).json({
                success: true,
                parkingLots
            });
        } else {
            res.status(404).json({
                success: false,
                message: "No parking lot with this id is found"
            });
        }
    } catch (error) {
        console.error('Get parking lot error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch parking lot information"
        });
    }
});

//5.1 get user violation
router.get('/violations/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;
            
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid user ID in the URL"
            });
        }

        if (startDate && !isValidDate(startDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date should be in ISO 8601 format (YYYY-MM-DD)"
            });
        }

        if (endDate && !isValidDate(endDate)) {
            return res.status(400).json({
                success: false,
                message: "End date should be in ISO 8601 format (YYYY-MM-DD)"
            });
        }

        const result = await appService.getUserViolations(userId, startDate, endDate);
        res.status(200).json({
            success: true,
            data: {
                violations: result
            }
        });
    } catch (error) {
        console.error('Get violations error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user violations"
        });
    }
});

// 5.2 Create violation admin only
router.post('/violations', async (req, res) => {
    try {
        const { lotId, province, licensePlate, reason, time } = req.body;
        if (!lotId || !province || !licensePlate || !reason || !time) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: lotId, province, licensePlate, reason, and time"
            });
        }

        if (!isValidDate(time)) {
            return res.status(400).json({
                success: false,
                message: "Time should be in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)"
            });
        }

        const result = await appService.createViolation(lotId, province, licensePlate, reason, time);
        res.status(201).json({result});
    } catch (error) {
        console.error('Create violation error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create violation record"
        });
    }
});

// 6.1 create payment
router.post('/payments', async (req, res) => {
    try {
        const { amount, paymentMethod, cardNumber, userId, lotId, ticketId } = req.body;

        if (!amount || !paymentMethod || !cardNumber || !userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: amount, paymentMethod, cardNumber, and userId"
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Payment amount must be greater than 0"
            });
        }

        if (!isValidCardNumber(cardNumber)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid card number"
            });
        }


        const result = await appService.createPayment(amount, paymentMethod, cardNumber, userId, lotId, ticketId);
        res.status(201).json({
            success: true,
            data: {
                payId: result.payId,
                amount: result.amount,
                status: result.status
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment"
        });
    }
});

//6.2 get payment history
router.get('/payments/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid user ID in the URL"
            });
        }

        if (startDate && !isValidDate(startDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date should be in ISO 8601 format (YYYY-MM-DD)"
            });
        }

        if (endDate && !isValidDate(endDate)) {
            return res.status(400).json({
                success: false,
                message: "End date should be in ISO 8601 format (YYYY-MM-DD)"
            });
        }


        const result = await appService.getUserPayments(userId, startDate, endDate);
        res.status(200).json({
            success: true,
            data: {
                payments: result
            }
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user payments"
        });
    }
});

// 7.1 Admin Login
router.post('/admin/login', async (req, res) => {
    try {
        const { staffId, password } = req.body;
        
        if (!staffId || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide both staffId and password"
            });
        }

        const result = await appService.adminLogin(staffId, password);
        if (result.success) {
            res.status(201).json({
                success: true,
                data: result.data
            });
        } else {
            res.status(401).json({
                success: false,
                message: "The provided staff ID or password is incorrect"
            });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to process admin login"
        });
    }
});



//7.2 Generate Report
router.post('/admin/reports', async (req, res) => {
    try {
        const { lotId, description, type } = req.body;

        if (!lotId || !description || !type) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields: lotId, description, and type"
            });
        }

        if (!['monthly', 'quarterly', 'incident'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Report type must be one of: monthly, quarterly, incident"
            });
        }



        const result = await appService.generateReport(lotId, description, type);
        res.status(201).json({
            success: true,
            data: {
                reportId: result.reportId,
                dateGenerated: result.dateGenerated
            }
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: "Failed to generate report"
        });
    }
});

function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function isValidCardNumber(cardNumber) {
    // Basic validation: 13-19 digits
    return /^\d{13,19}$/.test(cardNumber);
}


module.exports = router;