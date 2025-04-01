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
                        parkingUntil: row.PARKING_UNTIL
                    });
                }
            });

            return { success: true, user: userInfo };
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
                        parkingUntil: row.PARKING_UNTIL,
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
                    parkingUntil: searchResult.rows[0].PARKING_UNTIL
                }
            };
        }

    }).catch((error) => {
        return {success:false, message:"Server error"};
    });
}

// Get current occupancy in the parking lot
async function fetchCurrentOccupancy() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT 
                COUNT(*) AS occupied_spaces,
                (SELECT total_spaces FROM ParkingLot WHERE lot_id = 'A') AS total_spaces
            FROM ParkingRecord
            WHERE exit_time IS NULL
        `);
        const row = result.rows[0];
        return {
            occupiedSpaces: row[0],
            totalSpaces: row[1],
            availableSpaces: row[1] - row[0]
        };
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

// Get flagged vehicles
async function fetchFlaggedVehicles() {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        const result = await connection.execute(`
            SELECT DISTINCT vehicle_plate
            FROM Violation
            WHERE resolved = 'N'
        `);
        return result.rows.map(row => row[0]);
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
            currentOccupancy: row[2],
            currentRemain: row[3],
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
            currentOccupancy: result.rows[0][2],
            currentRemain: result.rows[0][3],
            vehicles: result.rows
                .filter(row => row[4] && row[5] && row[6])
                .map(row => ({
                    province: row[4],
                    licensePlate: row[5],
                    parkingUntil: row[6]
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

//5.2 create violation admin only
async function createViolation(lotId, province, licensePlate, reason, time) {
    const query = `
        INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME)
        VALUES (:1, :2, :3, :4, :5)
        RETURNING TICKET_ID INTO :6
    `;
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(query, {
            bindDefs: [
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: lotId },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: province },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: licensePlate },
                { dir: oracledb.BIND_IN, type: oracledb.STRING, val: reason },
                { dir: oracledb.BIND_IN, type: oracledb.DATE, val: new Date(time) },
                { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
            ]
        });
        return result.outBinds[0];
    });
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






module.exports = {
    testOracleConnection,
    fetchCurrentOccupancy,
    fetchFlaggedVehicles,
    loginUser,
    registerUser,
    getUserInformation,
    getUserVehiclesInformation,
    registerVehicle,
    getAllParkingLots,
    getParkingLotById,
    getUserViolations,
    createViolation,
    createPayment,
    getUserPayments,
    adminLogin,
    generateReport
};