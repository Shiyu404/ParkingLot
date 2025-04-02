const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');
const envVariables = loadEnvFile('./.env');

// Database configuration
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

// async function fetchDemotableFromDb() {
//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute('SELECT * FROM DEMOTABLE');
//         return result.rows;
//     }).catch(() => {
//         return [];
//     });
// }

// async function initiateDemotable() {
//     return await withOracleDB(async (connection) => {
//         try {
//             await connection.execute(`DROP TABLE DEMOTABLE`);
//         } catch(err) {
//             console.log('Table might not exist, proceeding to create...');
//         }

//         const result = await connection.execute(`
//             CREATE TABLE DEMOTABLE (
//                 id NUMBER PRIMARY KEY,
//                 name VARCHAR2(20)
//             )
//         `);
//         return true;
//     }).catch(() => {
//         return false;
//     });
// }

//1.1 Log in
async function loginUser(phone, password) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Users WHERE phone = :phone AND password = :password`,
            { phone, password },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (result.rows.length > 0) {
            const user = result.rows[0];
            return {
                success: true,
                user: {
                    id: user.ID,
                    phone: user.PHONE,
                    name: user.NAME,
                    role: user.ROLE,
                    userType: user.USER_TYPE,
                    unitNumber: user.UNIT_NUMBER,
                    hostInformation: user.HOST_INFORMATION
                }
            };
        }
        return { success: false };
    }).catch((error) => {
        console.error('Login error:', error);
        return { success: false };
    });
}

//1.2 Register user
async function registerUser(name, phone, password, userType, unitNumber, hostInformation, role) {
    return await withOracleDB(async (connection) => {
        try {
            // check if phone already exist
            const phoneResult = await connection.execute(
                `SELECT PHONE FROM Users 
                 WHERE PHONE = :phone`,
                 {phone},
                 { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            if (phoneResult.rows.length > 0){
                return { success: false, message: 'Phone number should be unique' };
            }
            // check userType and unitNumber/hostInformation
            if((userType == "resident"&&unitNumber == null )){
                return { success: false, message: 'Resident should have unitNumber' };
            } else if ((userType == "resident"&&hostInformation!= null )){
                return { success: false, message: 'Resident should not have hostInformation' };
            } else if((userType == "visitor"&&unitNumber != null )){
                return { success: false, message: 'Visitor should not have unitNumber' };
            } else if((userType == "visitor"&&hostInformation == null )){
                return { success: false, message: 'Visitor should have hostInformation' };
            }

            const result = await connection.execute(
                `INSERT INTO Users(NAME, PHONE, PASSWORD, USER_TYPE, UNIT_NUMBER, HOST_INFORMATION, ROLE)
                 VALUES(:name, :phone, :password, :userType, :unitNumber, :hostInformation, :role)`,
                {
                    name,
                    phone,
                    password,
                    userType,
                    unitNumber,
                    hostInformation,
                    role
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rowsAffected === 0) {
                return { success: false, message: 'User not inserted' };
            }

            // Commit the transaction
            await connection.commit();

            // Check if the user exists now
            const result1 = await connection.execute(
                `SELECT * FROM Users WHERE phone = :phone AND password = :password`,
                { phone, password },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result1.rows.length > 0) {
                const user = result1.rows[0];
                return {
                    success: true,
                    user: {
                        id: user.ID,
                        name: user.NAME,
                        userType: user.USER_TYPE
                    }
                };
            }

            return { success: false, message: 'Register error' };

        } catch (error) {
            return { success: false, message: 'Server error' };
        }
    });
}

// 1.3 Get user's information
async function getUserInformation(userId) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT * FROM Users u
            LEFT JOIN Vehicles v ON u.ID = v.USER_ID
            WHERE u.ID = :userId`,
            {userId},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (result.rows.length > 0) {
            const userInfo = {
                id: result.rows[0].ID,
                phone: result.rows[0].PHONE,
                name: result.rows[0].NAME,
                role: result.rows[0].ROLE,
                userType: result.rows[0].USER_TYPE,
                unitNumber: result.rows[0].UNIT_NUMBER,
                hostInformation: result.rows[0].HOST_INFORMATION,
                vehicles: []
            };

            result.rows.forEach(row => {
                if (row.PROVINCE && row.LICENSE_PLATE) {
                    userInfo.vehicles.push({
                        province: row.PROVINCE,
                        licensePlate: row.LICENSE_PLATE,
                        parkingUntil: row.PARKING_UNTIL.toISOString().replace('T', ' ').substring(0, 19)
                    });
                }
            });

            return { success: true, userInfo: userInfo };
        } 
        return { success: false, message: "User does not exist"};
    }).catch((error) => {
        return { success: false, message: "Get information error" };
    });
}

// 2.1 Get user's vehicles information
async function getUserVehiclesInformation(userId) {
    return await withOracleDB(async (connection) => {
        const userResult = await connection.execute(
            `SELECT * FROM Users u
            WHERE u.ID = :userId`,
            {userId},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (userResult.rows.length <= 0) {
            return { success: false, message: "User does not exist"};
        }
        const vehicleResult = await connection.execute(
            `SELECT * FROM Vehicles v
            WHERE v.USER_ID = :userId`,
            {userId},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        const vehicles = [];
        if (vehicleResult.rows.length > 0) {
            vehicleResult.rows.forEach(row => {
                if (row.PROVINCE && row.LICENSE_PLATE) {
                    vehicles.push({
                        province: row.PROVINCE,
                        licensePlate: row.LICENSE_PLATE,
                        parkingUntil: row.PARKING_UNTIL.toISOString().replace('T', ' ').substring(0, 19),
                        currentLotId: row.CURRENT_LOT_ID
                    });
                }
            });

            return { success: true, vehicles:vehicles };
        } 
        return { success: false, message: "User does not have vehicles"};
    }).catch((error) => {
        return { success: false, message: "Get information error" };
    });
}

// 2.2 Register vehicles
async function registerVehicle(userId,province,licensePlate,lotId,parkingUntil) {
    return await withOracleDB(async (connection) => {
        // check if user already exist
        const userResult = await connection.execute(
            `SELECT * FROM Users WHERE ID = :userId`,
            { userId },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (userResult.rows.length <= 0) {
            return { success: false, message: "User does not exist"};
        }

        // check if (licensePlate,province) already exist
        const result = await connection.execute(
            `SELECT * FROM Vehicles WHERE PROVINCE=:province AND LICENSE_PLATE = :licensePlate`,
            {   province,
                licensePlate
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (result.rows.length > 0)
            return { success: false,message: '(licensePlate,province) should be unique'};

        const vehicleResult = await connection.execute(
            `INSERT INTO Vehicles(USER_ID, PROVINCE, LICENSE_PLATE, CURRENT_LOT_ID,PARKING_UNTIL)
            VALUES(:userId, :province, :licensePlate,:lotId ,TO_TIMESTAMP(:parkingUntil, 'YYYY-MM-DD HH24:MI:SS'))`,
             {
                userId,
                province,
                licensePlate,
                lotId,
                parkingUntil
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        await connection.commit();
        if (vehicleResult.rowsAffected === 0) {
            return { success: false, message: 'Vehicle not registered' };
        }
        const searchResult = await connection.execute(
            `SELECT * FROM Vehicles WHERE PROVINCE=:province AND LICENSE_PLATE = :licensePlate`,
            {   province,
                licensePlate
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        if (searchResult.rows.length > 0) {
            const vehicle = searchResult.rows[0];
            return {
                success: true,
                vehicle: {
                    province: searchResult.rows[0].PROVINCE,
                    licensePlate: searchResult.rows[0].LICENSE_PLATE,
                    parkingUntil: searchResult.rows[0].PARKING_UNTIL.toISOString().replace('T', ' ').substring(0, 19)
                }
            };
        }

    }).catch((error) => {
        return {success:false, message:"Server error"};
    });
}

// 3.1 Get user's visitor passes
async function getUserVisitorPasses(userId) {
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT 
                    vp.PASS_ID,
                    vp.VALID_TIME,
                    vp.STATUS,
                    vp.CREATED_AT,
                    vp.VISITOR_PLATE,
                    CASE 
                        WHEN CURRENT_TIMESTAMP < vp.CREATED_AT + NUMTODSINTERVAL(vp.VALID_TIME, 'HOUR') 
                        THEN 'active' 
                        ELSE 'expired' 
                    END as CURRENT_STATUS
                 FROM VisitorPasses vp
                 WHERE vp.USER_ID = :userId
                 ORDER BY vp.CREATED_AT DESC`,
                { userId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length > 0) {
                const visitorPasses = result.rows.map(row => {
                    // 计算通行证有效期
                    const validTime = new Date(row.CREATED_AT);
                    validTime.setHours(validTime.getHours() + row.VALID_TIME);
                    
                    return {
                        visitorPassId: row.PASS_ID,
                        validTime: validTime.toISOString().replace('T', ' ').substring(0, 19),
                        status: row.CURRENT_STATUS,
                        createdAt: row.CREATED_AT.toISOString().replace('T', ' ').substring(0, 19),
                        plate: row.VISITOR_PLATE || 'Not assigned'
                    };
                });

                return {
                    success: true,
                    visitorPasses: visitorPasses
                };
            }
            return { 
                success: true,
                visitorPasses: []
            };
        } catch (error) {
            console.error('Get visitor passes error:', error);
            return { success: false, message: 'Failed to get visitor passes' };
        }
    });
}

// 3.2 Apply for visitor passes
async function applyVisitorPasses(userId, hours, visitorPlate) {
    return await withOracleDB(async (connection) => {
        try {
            // 检查用户是否存在
            const userResult = await connection.execute(
                `SELECT * FROM Users WHERE ID = :userId`,
                { userId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (userResult.rows.length === 0) {
                return { success: false, message: 'User not found' };
            }
            
            // 检查用户配额
            const quotaResult = await connection.execute(
                `SELECT COUNT(*) as active_passes
                 FROM VisitorPasses 
                 WHERE USER_ID = :userId 
                 AND STATUS = 'active'
                 AND VALID_TIME = :hours`,
                { userId, hours },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            const activePasses = quotaResult.rows[0].ACTIVE_PASSES;
            let maxPasses;
            
            // 根据通行证时长设置最大配额
            if (hours === 8) {
                maxPasses = 5;
            } else if (hours === 24) {
                maxPasses = 3;
            } else if (hours === 48) {
                maxPasses = 1;
            } else {
                return { success: false, message: 'Invalid pass duration' };
            }
            
            if (activePasses >= maxPasses) {
                return { success: false, message: 'Pass quota exceeded' };
            }

            // 解析车牌号
            const [province, licensePlate] = visitorPlate.split('-');
            if (!province || !licensePlate) {
                return { success: false, message: 'Invalid visitor plate format' };
            }

            // 计算停车结束时间（默认24小时，可以根据需要修改）
            const parkingUntil = new Date();
            parkingUntil.setHours(parkingUntil.getHours() + 24); // 添加24小时
            const parkingUntilStr = parkingUntil.toISOString().replace('T', ' ').substring(0, 19);
            
            // 1. 创建访客通行证
            const passResult = await connection.execute(
                `INSERT INTO VisitorPasses (USER_ID, VALID_TIME, STATUS, VISITOR_PLATE)
                 VALUES (:userId, :hours, 'active', :visitorPlate)
                 RETURNING PASS_ID INTO :passId`,
                { 
                    userId, 
                    hours,
                    visitorPlate,
                    passId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (!passResult.outBinds.passId) {
                return { success: false, message: 'Failed to create visitor pass' };
            }

            // 2. 在Vehicles表中添加或更新车辆记录
            const vehicleResult = await connection.execute(
                `MERGE INTO Vehicles v
                 USING DUAL ON (v.PROVINCE = :province AND v.LICENSE_PLATE = :licensePlate)
                 WHEN MATCHED THEN
                    UPDATE SET 
                        USER_ID = :userId,
                        PARKING_UNTIL = TO_TIMESTAMP(:parkingUntil, 'YYYY-MM-DD HH24:MI:SS')
                 WHEN NOT MATCHED THEN
                    INSERT (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL)
                    VALUES (:userId, :province, :licensePlate, TO_TIMESTAMP(:parkingUntil, 'YYYY-MM-DD HH24:MI:SS'))`,
                { 
                    userId,
                    province,
                    licensePlate,
                    parkingUntil: parkingUntilStr
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            // 3. 获取更新后的通行证信息
            const updatedPass = await connection.execute(
                `SELECT 
                    vp.PASS_ID,
                    vp.VALID_TIME,
                    vp.STATUS,
                    vp.VISITOR_PLATE,
                    vp.CREATED_AT
                 FROM VisitorPasses vp
                 WHERE vp.PASS_ID = :passId`,
                {
                    passId: passResult.outBinds.passId
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            // 提交事务
            await connection.commit();
            
            return { 
                success: true, 
                message: 'Visitor pass created and vehicle registered successfully',
                visitorPass: {
                    passId: passResult.outBinds.passId,
                    validTime: hours,
                    status: 'active',
                    visitorPlate: visitorPlate,
                    createdAt: updatedPass.rows[0].CREATED_AT.toISOString().replace('T', ' ').substring(0, 19),
                    parkingUntil: parkingUntilStr
                }
            };
        } catch (error) {
            console.error('Apply visitor passes error:', error);
            return { success: false, message: 'Server error' };
        }
    });
}

// 3.3 get user's visitor pass quota and usage history
async function getUserVisitorPassQuota(userId) {
    return await withOracleDB(async (connection) => {
        try {
            // First, check if user exists and is a resident
            const userResult = await connection.execute(
                `SELECT * FROM Users u
                WHERE u.ID = :userId AND u.USER_TYPE = 'resident'`,
                {userId},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (userResult.rows.length <= 0) {
                return { success: false, message: "User does not exist or is not a resident"};
            }

            // Define pass types and quotas
            const passTypes = [
                { type: "8 hour", hours: 8, total: 5 },
                { type: "24 hour", hours: 24, total: 3 },
                { type: "Weekend", hours: 48, total: 1 }
            ];
            
            // Get active passes counts grouped by type
            const activePassesResult = await connection.execute(
                `SELECT 
                    VALID_TIME,
                    COUNT(*) AS active_count
                FROM VisitorPasses vp
                WHERE vp.USER_ID = :userId
                AND vp.STATUS = 'active'
                AND CURRENT_TIMESTAMP < vp.CREATED_AT + NUMTODSINTERVAL(vp.VALID_TIME, 'HOUR')
                GROUP BY VALID_TIME`,
                {userId},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            // Create a map of active passes by type
            const activePassesByType = {};
            activePassesResult.rows.forEach(row => {
                activePassesByType[row.VALID_TIME] = row.ACTIVE_COUNT;
            });
            
            // Calculate remaining quota for each pass type
            const quotaWithRemaining = passTypes.map(passType => ({
                ...passType,
                remaining: Math.max(0, passType.total - (activePassesByType[passType.hours] || 0))
            }));
            
            // Get pass usage history (both active and expired)
            const passHistoryResult = await connection.execute(
                `SELECT 
                    vp.PASS_ID,
                    vp.VALID_TIME,
                    vp.STATUS,
                    vp.CREATED_AT,
                    vp.VISITOR_PLATE,
                    CASE 
                        WHEN CURRENT_TIMESTAMP < vp.CREATED_AT + NUMTODSINTERVAL(vp.VALID_TIME, 'HOUR') 
                        THEN 'active' 
                        ELSE 'expired' 
                    END as CURRENT_STATUS
                FROM VisitorPasses vp
                WHERE vp.USER_ID = :userId
                ORDER BY vp.CREATED_AT DESC`,
                {userId},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            // Format pass history data
            const passHistory = passHistoryResult.rows.map(row => {
                // Convert hours to display format
                let passTypeDisplay = "";
                switch(row.VALID_TIME) {
                    case 8:
                        passTypeDisplay = "8 hour";
                        break;
                    case 24:
                        passTypeDisplay = "24 hour";
                        break;
                    case 48:
                        passTypeDisplay = "Weekend";
                        break;
                    default:
                        passTypeDisplay = `${row.VALID_TIME} hour`;
                }
                
                return {
                    passId: row.PASS_ID,
                    passType: passTypeDisplay,
                    hours: row.VALID_TIME,
                    createdAt: row.CREATED_AT.toISOString().replace('T', ' ').substring(0, 19),
                    status: row.CURRENT_STATUS,
                    visitorPlate: row.VISITOR_PLATE
                };
            });
            
            return { 
                success: true, 
                quota: quotaWithRemaining,
                passHistory: passHistory 
            };
        } catch (error) {
            console.error('Get visitor pass quota error:', error);
            return { success: false, message: "Failed to get visitor pass quota" };
        }
    });
}

// 4.1 get information of all parking lots
async function getAllParkingLots() {
    const query = `
        SELECT 
            p.LOT_ID as lotId,
            p.TOTAL_SPACES as capacity,
            p.AVAILABLE_SPACES as currentRemain,
            (p.TOTAL_SPACES - p.AVAILABLE_SPACES) as currentOccupancy,
            COUNT(DISTINCT v.VEHICLE_ID) as currentVehicles
        FROM ParkingLot p
        LEFT JOIN Vehicles v ON v.CURRENT_LOT_ID = p.LOT_ID
        GROUP BY p.LOT_ID, p.TOTAL_SPACES, p.AVAILABLE_SPACES
        ORDER BY p.LOT_ID
    `;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query);
        return result.rows.map(row => ({
            lotId: row[0],
            capacity: row[1],
            currentRemain: row[2],
            currentOccupancy: row[3],
            currentVehicles: row[4]
        }));
    });
}

// 4.2 get info of specific parking lot
async function getParkingLotById(lotId) {
    const query = `
        SELECT 
            p.LOT_ID as lotId,
            p.TOTAL_SPACES as capacity,
            p.AVAILABLE_SPACES as currentRemain,
            (p.TOTAL_SPACES - p.AVAILABLE_SPACES) as currentOccupancy,
            v.PROVINCE,
            v.LICENSE_PLATE,
            v.PARKING_UNTIL
        FROM ParkingLot p
        LEFT JOIN Vehicles v ON v.CURRENT_LOT_ID = p.LOT_ID
        WHERE p.LOT_ID = :1
    `;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, [lotId]);
        if (result.rows.length === 0) return null;
        
        const lot = {
            lotId: result.rows[0][0],
            capacity: result.rows[0][1],
            currentRemain: result.rows[0][2],
            currentOccupancy: result.rows[0][3],
            vehicles: result.rows
                .filter(row => row[4] && row[5] && row[6])
                .map(row => ({
                    province: row[4],
                    licensePlate: row[5],
                    parkingUntil: row[6].toISOString().replace('T', ' ').substring(0, 19)
                }))
        };
        return lot;
    });
}

//5.1 get user violation
async function getUserViolations(userId, startDate, endDate) {
    let query = `
        SELECT 
            v.TICKET_ID as ticketId,
            v.REASON,
            v.TIME,
            v.LOT_ID as lotId,
            v.PROVINCE,
            v.LICENSE_PLATE,
            v.STATUS
        FROM Violations v
        JOIN Vehicles ve ON v.PROVINCE = ve.PROVINCE AND v.LICENSE_PLATE = ve.LICENSE_PLATE
        WHERE ve.USER_ID = :1
    `;
    const params = [userId];
    
    if (startDate) {
        query += ` AND v.TIME >= :${params.length + 1}`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND v.TIME <= :${params.length + 1}`;
        params.push(endDate);
    }
    
    query += ` ORDER BY v.TIME DESC`;
    
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, params);
        return result.rows.map(row => ({
            ticketId: row[0],
            reason: row[1],
            time: row[2],
            lotId: row[3],
            province: row[4],
            licensePlate: row[5],
            status: row[6]
        }));
    });
}

// 创建停车违规记录 - 管理员界面使用
async function createViolation(province, licensePlate, reason, lotId, vehicleId = null) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // 当前时间作为违规记录创建时间
        const currentTime = new Date();

        // 创建违规记录
        const insertQuery = `
            INSERT INTO Violations (
                LOT_ID, PROVINCE, LICENSE_PLATE, 
                REASON, TIME
            ) VALUES (
                :lotId, :province, :licensePlate, 
                :reason, :time
            ) RETURNING TICKET_ID INTO :ticketId
        `;

        console.log(`Creating violation with params: lotId=${lotId}, province=${province}, licensePlate=${licensePlate}, reason=${reason}`);
        
        const result = await connection.execute(
            insertQuery,
            {
                lotId: parseInt(lotId, 10),
                province,
                licensePlate,
                reason,
                time: currentTime,
                ticketId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            },
            { autoCommit: true }
        );

        console.log(`Violation created with ID: ${result.outBinds.ticketId[0]}`);
        
        return {
            success: true,
            message: 'Violation record created successfully',
            ticketId: result.outBinds.ticketId[0]
        };
    } catch (error) {
        console.error('Error creating violation:', error);
        return {
            success: false,
            message: `Database error while creating violation record: ${error.message || '未知错误'}`,
            errorCode: error.errorNum || -1,
            errorDetails: error.toString()
        };
    } finally {
        // 确保连接始终被关闭，即使发生错误
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully');
            } catch (err) {
                console.error('Error closing database connection:', err);
            }
        }
    }
}

//6.1 create payment
async function createPayment(amount, paymentMethod, cardNumber, userId, lotId, ticketId) {
    const query = `
        INSERT INTO Payments (AMOUNT, PAYMENT_METHOD, CARD_NUMBER, USER_ID, LOT_ID, TICKET_ID, STATUS)
        VALUES (:1, :2, :3, :4, :5, :6, 'completed')
        RETURNING PAY_ID INTO :7
    `;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, {
            bindDefs: [
                { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: amount },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: paymentMethod },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: cardNumber },
                { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: userId },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: lotId },
                { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: ticketId },
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            ]
        });
        
        if (ticketId) {
            await connection.execute(
                `UPDATE Violations SET STATUS = 'paid' WHERE TICKET_ID = :1`,
                [ticketId]
            );
        }
        
        return {
            payId: result.outBinds[0],
            amount,
            status: 'completed'
        };
    });
}

//6.2 get payment history
async function getUserPayments(userId, startDate, endDate) {
    let query = `
        SELECT 
            p.PAY_ID as payId,
            p.AMOUNT,
            p.PAYMENT_METHOD,
            p.CARD_NUMBER,
            p.LOT_ID as lotId,
            p.CREATED_AT as createdAt,
            p.STATUS
        FROM Payments p
        WHERE p.USER_ID = :1
    `;
    const params = [userId];
    
    if (startDate) {
        query += ` AND p.CREATED_AT >= :${params.length + 1}`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND p.CREATED_AT <= :${params.length + 1}`;
        params.push(endDate);
    }
    
    query += ` ORDER BY p.CREATED_AT DESC`;
    
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, params);
        return result.rows.map(row => ({
            payId: row[0],
            amount: row[1],
            paymentMethod: row[2],
            cardNumber: row[3],
            lotId: row[4],
            createdAt: row[5],
            status: row[6]
        }));
    });
}

// 7.1 Admin Login
async function adminLogin(staffId, password) {
    const query = `
        SELECT 
            s.STAFF_ID as staffId,
            u.NAME,
            s.LOT_ID as lotId
        FROM Staff s
        JOIN Users u ON s.USER_ID = u.ID
        WHERE s.STAFF_ID = :1 AND u.PASSWORD = :2
    `;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, [staffId, password]);
        if (result.rows.length === 0) {
            return { success: false };
        }
        
        const row = result.rows[0];
        return {
            success: true,
            data: {
                staffId: row[0],
                name: row[1],
                lotId: row[2]
            }
        };
    });
}

//7.2 Generate Report
async function generateReport(lotId, description, type) {
    const query = `
        INSERT INTO Reports (LOT_ID, DESCRIPTION, TYPE, DATE_GENERATED)
        VALUES (:1, :2, :3, CURRENT_TIMESTAMP)
        RETURNING REPORT_ID INTO :4
    `;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, {
            bindDefs: [
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: lotId },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: description },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: type },
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            ]
        });
        
        return {
            reportId: result.outBinds[0],
            dateGenerated: new Date().toISOString()
        };
    });
}

async function getAllParkingLotNames() {
    const query = `
        SELECT 
            LOT_ID as lotId,
            LOT_NAME as lotName,
            ADDRESS as address
        FROM ParkingLot
        ORDER BY LOT_ID
    `;
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
            return {
                success: true,
                parkingLots: result.rows
            };
        } catch (error) {
            console.error('Error fetching parking lot names:', error);
            return {
                success: false,
                message: 'Failed to fetch parking lot names'
            };
        }
    });
}

// 新增函数：注册访客信息
async function registerVisitor(fullName, phone, unitToVisit, region, licensePlate, parkingLotId) {
    return await withOracleDB(async (connection) => {
        try {
            // 生成一个随机密码（在实际应用中应该让用户设置或使用更安全的方式）
            const password = Math.random().toString(36).substring(2, 10);
            
            // 检查电话号码是否已存在
            const phoneCheck = await connection.execute(
                `SELECT ID FROM Users WHERE PHONE = :phone`,
                { phone },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (phoneCheck.rows.length > 0) {
                return { 
                    success: false, 
                    message: '该电话号码已经被注册' 
                };
            }
            
            // 设置访客主机信息
            const hostInformation = `Visiting Unit ${unitToVisit}`;
            
            // 1. 插入到Users表中
            const userResult = await connection.execute(
                `INSERT INTO Users (
                    PHONE, 
                    PASSWORD, 
                    NAME, 
                    ROLE, 
                    USER_TYPE,
                    HOST_INFORMATION
                ) VALUES (
                    :phone,
                    :password,
                    :name,
                    'user',
                    'visitor',
                    :hostInformation
                ) RETURNING ID INTO :userId`,
                {
                    phone,
                    password,
                    name: fullName,
                    hostInformation,
                    userId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                }
            );
            
            if (!userResult.outBinds.userId) {
                return { success: false, message: '创建用户记录失败' };
            }
            
            const userId = userResult.outBinds.userId;
            
            // 计算停车结束时间（默认24小时，可以根据需要修改）
            const parkingUntil = new Date();
            parkingUntil.setHours(parkingUntil.getHours() + 24); // 添加24小时
            const parkingUntilStr = parkingUntil.toISOString().replace('T', ' ').substring(0, 19);
            
            // 2. 插入到Vehicles表中
            const vehicleResult = await connection.execute(
                `INSERT INTO Vehicles (
                    USER_ID, 
                    PROVINCE, 
                    LICENSE_PLATE, 
                    CURRENT_LOT_ID,
                    PARKING_UNTIL
                ) VALUES (
                    :userId, 
                    :province, 
                    :licensePlate,
                    :parkingLotId,
                    TO_TIMESTAMP(:parkingUntil, 'YYYY-MM-DD HH24:MI:SS')
                )`,
                {
                    userId,
                    province: region,
                    licensePlate,
                    parkingLotId,
                    parkingUntil: parkingUntilStr
                }
            );
            
            // 提交事务
            await connection.commit();
            
            return {
                success: true,
                message: '访客信息已成功记录',
                user: {
                    id: userId,
                    name: fullName,
                    phone,
                    unitToVisit,
                    region,
                    licensePlate,
                    parkingLotId,
                    parkingUntil: parkingUntilStr
                }
            };
            
        } catch (error) {
            console.error('Register visitor error:', error);
            return { success: false, message: '服务器错误，访客注册失败' };
        }
    });
}

// 验证车牌是否有有效的停车许可
async function verifyVehicle(plate, region, lotId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // 查询车辆是否在数据库中存在且有效期未过
        const query = `
            SELECT v.VEHICLE_ID, v.LICENSE_PLATE, v.PROVINCE, v.USER_ID, v.CURRENT_LOT_ID, v.PARKING_UNTIL
            FROM Vehicles v
            WHERE v.LICENSE_PLATE = :licensePlate 
            AND v.PROVINCE = :province 
            AND v.CURRENT_LOT_ID = :lotId
        `;

        const result = await connection.execute(
            query,
            {
                licensePlate: plate,
                province: region,
                lotId: parseInt(lotId, 10)
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: `No vehicle found with license plate ${region}-${plate} in lot ID ${lotId}`
            };
        }

        // 车辆存在，返回详细信息
        const vehicle = {
            id: result.rows[0].VEHICLE_ID,
            licensePlate: result.rows[0].LICENSE_PLATE,
            province: result.rows[0].PROVINCE,
            userId: result.rows[0].USER_ID,
            lotId: result.rows[0].CURRENT_LOT_ID,
            parkingUntil: result.rows[0].PARKING_UNTIL
        };

        return {
            success: true,
            message: 'Vehicle found',
            vehicle
        };
    } catch (error) {
        console.error('Error verifying vehicle:', error);
        // 返回更具体的错误信息
        return {
            success: false,
            message: `Database error while verifying vehicle: ${error.message || '未知错误'}`,
            errorCode: error.errorNum || -1,
            errorDetails: error.toString()
        };
    } finally {
        // 确保连接始终被关闭，即使发生错误
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully in verifyVehicle');
            } catch (err) {
                console.error('Error closing database connection in verifyVehicle:', err);
            }
        }
    }
}

module.exports = {
    testOracleConnection,
    loginUser,
    registerUser,
    getUserInformation,
    getUserVehiclesInformation,
    registerVehicle,
    getUserVisitorPasses,
    applyVisitorPasses,
    getAllParkingLots,
    getParkingLotById,
    getAllParkingLotNames,
    getUserViolations,
    createViolation,
    createPayment,
    getUserPayments,
    adminLogin,
    generateReport,
    getUserVisitorPassQuota,
    registerVisitor,
    verifyVehicle
};