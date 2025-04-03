const express = require('express');

const appService = require('./appService');
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

const router = express.Router();

// Add global request logging middleware
router.use((req, res, next) => {
    console.log('【Request Received】Method:', req.method, 'Path:', req.originalUrl);
    console.log('【Request Received】Query Parameters:', req.query);
    console.log('【Request Received】Request Body:', req.body);
    console.log('【Request Received】Request Headers:', req.headers);
    
    // Record original response send method
    const originalSend = res.send;
    
    // Override send method to log responses
    res.send = function(body) {
        console.log('【Response Sent】Status Code:', res.statusCode);
        console.log('【Response Sent】Content:', typeof body === 'string' ? body : '[Object/Buffer]');
        return originalSend.call(this, body);
    };
    
    next();
});

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

//1.4 Update user information
router.put('/users/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        const { name, phone, password } = req.body;
        const result = await appService.updateUser(userId, name, phone, password);
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Update user error:', error);
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

//2.3 Verify Vehicle - Check if a vehicle has a valid visitor pass
router.get('/verify-vehicle', async (req, res) => {
    try {
        const { plate, region, lotId } = req.query;
        
        if (!plate || !region || !lotId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required parameters: plate, region, lotId"
            });
        }
        
        console.log(`Verifying vehicle: Plate=${plate}, Region=${region}, LotId=${lotId}`);
        const result = await appService.verifyVehicle(plate, region, lotId);
        console.log("Verification result:", result);
        
        // Ensure response header is set to JSON
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (error) {
        console.error('Verify vehicle error:', error);
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
router.get('/parking-lots', async (req, res) => {
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
router.get('/parking-lots/:lotId', async (req, res) => {
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

// Get all violations, optionally filtered by parking lot ID
router.get('/violations', async (req, res) => {
    try {
        const lotId = req.query.lotId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Validate date format
        if (startDate && !isValidDateFormat(startDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid startDate format. Please use YYYY-MM-DD'
            });
        }

        if (endDate && !isValidDateFormat(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid endDate format. Please use YYYY-MM-DD'
            });
        }
        
        console.log(`Fetching violations. Filters: lotId=${lotId || 'none'}, startDate=${startDate || 'none'}, endDate=${endDate || 'none'}`);
        
        const result = await appService.getAllViolations(lotId, startDate, endDate);
        
        if (result.success) {
            res.json({
                success: true,
                violations: result.violations
            });
        } else {
            console.error('Error fetching violations:', result.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch violations',
                error: result.message
            });
        }
    } catch (error) {
        console.error('Unexpected error in /violations route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Get all payment records
router.get('/payments', async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Validate date format
        if (startDate && !isValidDateFormat(startDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid startDate format. Please use YYYY-MM-DD'
            });
        }

        if (endDate && !isValidDateFormat(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid endDate format. Please use YYYY-MM-DD'
            });
        }
        
        console.log(`Fetching payment records. Filters: startDate=${startDate || 'none'}, endDate=${endDate || 'none'}`);
        
        const result = await appService.getAllPayments(startDate, endDate);
        
        if (result.success) {
            res.json({
                success: true,
                payments: result.payments
            });
        } else {
            console.error('Error fetching payments:', result.message);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch payment records',
                error: result.message
            });
        }
    } catch (error) {
        console.error('Unexpected error in /payments route:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

// Helper function: Validate date format
function isValidDateFormat(dateString) {
    // Check if it's ISO 8601 format (YYYY-MM-DD)
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Further validate if the date is valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    return true;
}

// 4.1 Create a parking violation
router.post('/violations', async (req, res) => {
    try {
        const { province, licensePlate, reason, lotId, vehicleId } = req.body;
        
        if (!province || !licensePlate || !reason || !lotId) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: province, licensePlate, reason, lotId"
            });
        }
        
        console.log(`Creating violation: Province=${province}, Plate=${licensePlate}, Reason=${reason}, LotId=${lotId}`);
        const result = await appService.createViolation(province, licensePlate, reason, lotId, vehicleId);
        console.log("Violation result:", result);
        
        // Ensure response header is set to JSON
        res.setHeader('Content-Type', 'application/json');
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Create violation error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
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

// New route: Get names and IDs of all parking lots
router.get('/parking-lots-names', async (req, res) => {
    try {
        const result = await appService.getAllParkingLotNames();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Get parking lot names error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// New route: Register visitor information
router.post('/visitors/register', async (req, res) => {
    try {
        const { fullName, phone, unitToVisit, region, licensePlate, parkingLotId } = req.body;
        
        // Validate all required fields
        if (!fullName || !phone || !unitToVisit || !region || !licensePlate || !parkingLotId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        
        // Validate phone number format (optional)
        if (!/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid phone number'
            });
        }
        
        // Validate unit number is a number (optional)
        const unitNumber = parseInt(unitToVisit, 10);
        if (isNaN(unitNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Unit number must be a number'
            });
        }
        
        const result = await appService.registerVisitor(
            fullName, 
            phone, 
            unitToVisit, 
            region, 
            licensePlate, 
            parkingLotId
        );
        
        if (result.success) {
            res.status(201).json(result);
        } else {
            res.status(400).json({
                success: false,
                message: result.message
            });
        }
    } catch (error) {
        console.error('Register visitor error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get a single violation record
router.get('/violations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: id'
            });
        }
        
        console.log(`Fetching violation with ID: ${id}`);
        
        // Call service layer method to get a single violation record
        const result = await appService.getViolationById(id);
        
        if (result.success) {
            console.log(`Found violation: ${JSON.stringify(result.violation)}`);
            res.status(200).json(result);
        } else {
            if (result.message.includes('No violation found')) {
                res.status(404).json(result);
            } else {
                throw new Error(result.message);
            }
        }
    } catch (error) {
        console.error('Error fetching violation by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch violation data: ' + error.message
        });
    }
});

// Search violations by license plate and region
router.get('/violations/search', async (req, res) => {
    try {
        const { plate, region } = req.query;
        
        if (!plate || !region) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: plate and region'
            });
        }
        
        console.log(`Searching violations by plate: ${plate}, region: ${region}`);
        
        // Call service layer method to search for violations
        const result = await appService.findViolationsByPlate(plate, region);
        
        if (result.success) {
            // Handle field name differences, ensure consistent API response
            const violations = result.violations.map(row => ({
                ticketId: row.TICKETID || row.ticketId,
                reason: row.REASON || row.reason,
                time: row.TIME || row.time,
                lotId: row.LOTID || row.lotId,
                province: row.PROVINCE || row.province,
                licensePlate: row.LICENSEPLATE || row.licensePlate,
                status: row.STATUS || row.status
            }));
            
            console.log(`Found ${violations.length} violations`);
            res.status(200).json({
                success: true,
                violations: violations
            });
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error searching violations by plate:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search violations: ' + error.message
        });
    }
});

// Get active vehicles for a specific parking lot
router.get('/active-vehicles/:lotId', async (req, res) => {
    try {
        const { lotId } = req.params;
        
        if (!lotId) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid parking lot ID"
            });
        }
        
        console.log(`Getting active vehicles for parking lot ID ${lotId}`);
        const result = await appService.getActiveVehiclesByLotId(lotId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            console.error('Failed to get active vehicles:', result.message);
            res.status(500).json({
                success: false,
                message: result.message || "Error occurred while getting active vehicles data"
            });
        }
    } catch (error) {
        console.error('Active vehicles route error:', error);
        res.status(500).json({
            success: false,
            message: "Server error, unable to retrieve active vehicles data"
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

//2.3 Delete vehicle
router.delete('/vehicles/:province/:licensePlate', async (req, res) => {
    try {
        const { province, licensePlate } = req.params;
        const result = await appService.deleteVehicle(province, licensePlate);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get all vehicles
router.get('/vehicles/all', async (req, res) => {
    try {
        const result = await appService.getAllVehicles();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        console.error('Get all vehicles error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;