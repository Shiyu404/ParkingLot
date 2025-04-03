const express = require('express');

const appService = require('./appService');
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

const router = express.Router();

// 添加全局请求日志记录中间件
router.use((req, res, next) => {
    console.log('【接收请求】方法:', req.method, '路径:', req.originalUrl);
    console.log('【接收请求】查询参数:', req.query);
    console.log('【接收请求】请求体:', req.body);
    console.log('【接收请求】请求头:', req.headers);
    
    // 记录原始响应发送方法
    const originalSend = res.send;
    
    // 重写send方法以记录响应
    res.send = function(body) {
        console.log('【发送响应】状态码:', res.statusCode);
        console.log('【发送响应】内容:', typeof body === 'string' ? body : '[对象/Buffer]');
        return originalSend.apply(this, arguments);
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
        
        // 确保响应头设置为JSON
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

// 获取所有违规记录，可选按停车场ID过滤
router.get('/violations', async (req, res) => {
    try {
        const lotId = req.query.lotId;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // 验证日期格式
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

// 获取所有支付记录
router.get('/payments', async (req, res) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // 验证日期格式
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

// 辅助函数：验证日期格式
function isValidDateFormat(dateString) {
    // 检查是否为ISO 8601格式（YYYY-MM-DD）
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // 进一步验证日期是否有效
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
        
        // 确保响应头设置为JSON
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

// 新增路由：获取所有停车场的名称和ID
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

// 新增路由：注册访客信息
router.post('/visitors/register', async (req, res) => {
    try {
        const { fullName, phone, unitToVisit, region, licensePlate, parkingLotId } = req.body;
        
        // 验证所有必填字段
        if (!fullName || !phone || !unitToVisit || !region || !licensePlate || !parkingLotId) {
            return res.status(400).json({
                success: false,
                message: '所有字段都是必填的'
            });
        }
        
        // 验证电话号码格式（可选）
        if (!/^\d{10,15}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: '请输入有效的电话号码'
            });
        }
        
        // 验证单元号是否为数字（可选）
        const unitNumber = parseInt(unitToVisit, 10);
        if (isNaN(unitNumber)) {
            return res.status(400).json({
                success: false,
                message: '单元号必须是数字'
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
            message: '服务器错误'
        });
    }
});

// 获取单个违规记录
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
        
        // 调用服务层方法获取单个违规记录
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

// 根据车牌和区域搜索违规记录
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
        
        // 调用服务层方法搜索违规记录
        const result = await appService.findViolationsByPlate(plate, region);
        
        if (result.success) {
            // 处理字段名差异，确保一致的API响应
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

// 获取指定停车场的活跃车辆
router.get('/active-vehicles/:lotId', async (req, res) => {
    try {
        const { lotId } = req.params;
        
        if (!lotId) {
            return res.status(400).json({
                success: false,
                message: "请提供有效的停车场ID"
            });
        }
        
        console.log(`获取停车场ID ${lotId} 的活跃车辆`);
        const result = await appService.getActiveVehiclesByLotId(lotId);
        
        if (result.success) {
            res.status(200).json(result);
        } else {
            console.error('获取活跃车辆失败:', result.message);
            res.status(500).json({
                success: false,
                message: result.message || "获取活跃车辆数据时发生错误"
            });
        }
    } catch (error) {
        console.error('获取活跃车辆路由错误:', error);
        res.status(500).json({
            success: false,
            message: "服务器错误，无法获取活跃车辆数据"
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