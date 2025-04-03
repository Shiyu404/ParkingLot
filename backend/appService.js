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

// initializeConnectionPool();

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


// Initialize database using init.sql file
async function initializeDatabase() {
    console.log('Initializing database using init.sql file...');
    return await withOracleDB(async (connection) => {
        try {
            // Read the SQL file content
            const fs = require('fs');
            const path = require('path');
            const sqlFilePath = path.join(__dirname, 'init.sql');
            
            // Check if file exists
            if (!fs.existsSync(sqlFilePath)) {
                console.error('init.sql file not found at path:', sqlFilePath);
                return false;
            }
            
            // Read and split the SQL statements by semicolon
            const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
            const sqlStatements = sqlContent.split(';')
                .map(statement => statement.trim())
                .filter(statement => statement.length > 0);
            
            // Execute each SQL statement
            for (const sql of sqlStatements) {
                try {
                    await connection.execute(sql);
                    console.log('Executed SQL statement successfully');
                } catch (err) {
                    // Log error but continue with next statement
                    console.error('Error executing SQL statement:', err.message);
                    console.log('SQL statement that failed:', sql);
                }
            }
            
            // Commit all changes
            await connection.commit();
            console.log('Database initialization completed successfully');
            return true;
        } catch (err) {
            console.error('Database initialization error:', err);
            return false;
        }
    });
}

// // Call database initialization when the application starts
// initializeDatabase().then(success => {
//     if (success) {
//         console.log('Database initialized successfully');
//     } else {
//         console.error('Failed to initialize database');
//     }
// });

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
                    ID: user.ID,
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
                        ID: user.ID,
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
                ID: result.rows[0].ID,
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

// 2.3 Delete vehicle
async function deleteVehicle(province, licensePlate) {
    return await withOracleDB(async (connection) => {
        // Check if vehicle exists
        const checkResult = await connection.execute(
            `SELECT * FROM Vehicles WHERE PROVINCE = :province AND LICENSE_PLATE = :licensePlate`,
            { province, licensePlate },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        if (checkResult.rows.length === 0) {
            return { success: false, message: "Vehicle not found" };
        }
        
        // Delete the vehicle
        const deleteResult = await connection.execute(
            `DELETE FROM Vehicles WHERE PROVINCE = :province AND LICENSE_PLATE = :licensePlate`,
            { province, licensePlate },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        await connection.commit();
        
        if (deleteResult.rowsAffected === 0) {
            return { success: false, message: "Failed to delete vehicle" };
        }
        
        return { success: true, message: "Vehicle deleted successfully" };
    }).catch((error) => {
        console.error('Error deleting vehicle:', error);
        return { success: false, message: "Server error" };
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
                    vp.STATUS as original_status,
                    vp.CREATED_AT,
                    vp.VISITOR_PLATE,
                    CASE 
                        WHEN vp.STATUS = 'not_used' THEN 'not_used'
                        WHEN CURRENT_TIMESTAMP < vp.CREATED_AT + NUMTODSINTERVAL(vp.VALID_TIME, 'HOUR') 
                        THEN 'active' 
                        ELSE 'expired' 
                    END as CURRENT_STATUS,
                    vp.VALID_TIME as hours
                 FROM VisitorPasses vp
                 WHERE vp.USER_ID = :userId
                 ORDER BY vp.CREATED_AT DESC`,
                { userId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (result.rows.length > 0) {
                const visitorPasses = result.rows.map(row => {
                    // Calculate pass validity period
                    const createdAt = new Date(row.CREATED_AT);
                    const validTime = new Date(createdAt.getTime() + (row.VALID_TIME * 60 * 60 * 1000));
                    
                    return {
                        visitorPassId: row.PASS_ID,
                        validTime: validTime.toISOString(),
                        status: row.ORIGINAL_STATUS,
                        createdAt: row.CREATED_AT.toISOString(),
                        plate: row.VISITOR_PLATE || 'Not assigned',
                        hours: row.VALID_TIME
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
            console.log('Applying visitor pass with params:', { userId, hours, visitorPlate });
            
            // Check if user exists
            const userResult = await connection.execute(
                `SELECT * FROM Users WHERE ID = :userId`,
                { userId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (userResult.rows.length === 0) {
                console.log('User not found:', userId);
                return { success: false, message: 'User not found' };
            }

            // Check user quota
            const quotaResult = await connection.execute(
                `SELECT COUNT(*) as active_passes
                 FROM VisitorPasses 
                 WHERE USER_ID = :userId 
                 AND STATUS = 'not_used'
                 AND VALID_TIME = :hours`,
                { userId, hours },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const availablePasses = quotaResult.rows[0].ACTIVE_PASSES;
            let maxPasses;

            if (hours === 8) {
                maxPasses = 5;
            } else if (hours === 24) {
                maxPasses = 3;
            } else if (hours === 48) {
                maxPasses = 1;
            } else {
                console.log('Invalid pass duration:', hours);
                return { success: false, message: 'Invalid pass duration' };
            }

            console.log('Available passes:', availablePasses);

            if (availablePasses === 0) {
                console.log('No available passes');
                return { success: false, message: 'No available passes of this type' };
            }

            // Get an available pass
            const getPassResult = await connection.execute(
                `SELECT PASS_ID 
                 FROM VisitorPasses 
                 WHERE USER_ID = :userId 
                 AND STATUS = 'not_used' 
                 AND VALID_TIME = :hours 
                 AND ROWNUM = 1`,
                { userId, hours },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!getPassResult.rows || getPassResult.rows.length === 0) {
                console.log('Failed to get available pass');
                return { success: false, message: 'Failed to get available pass' };
            }

            const passId = getPassResult.rows[0].PASS_ID;

            // Update the pass status and add visitor plate
            await connection.execute(
                `UPDATE VisitorPasses 
                 SET STATUS = 'active',
                     VISITOR_PLATE = :visitorPlate,
                     CREATED_AT = CURRENT_TIMESTAMP
                 WHERE PASS_ID = :passId`,
                { visitorPlate, passId }
            );

            // Parse license plate
            const [province, licensePlate] = visitorPlate.split('-');
            if (!province || !licensePlate) {
                console.log('Invalid visitor plate format:', visitorPlate);
                return { success: false, message: 'Invalid visitor plate format' };
            }

            // Calculate parking end time
            const parkingUntil = new Date();
            parkingUntil.setHours(parkingUntil.getHours() + hours);
            const parkingUntilStr = parkingUntil.toISOString().replace('T', ' ').substring(0, 19);

            // Upsert vehicle
            await connection.execute(
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
                }
            );

            // Get updated pass info
            const updatedPassResult = await connection.execute(
                `SELECT 
                    PASS_ID,
                    VALID_TIME,
                    STATUS,
                    VISITOR_PLATE,
                    CREATED_AT
                 FROM VisitorPasses
                 WHERE PASS_ID = :passId`,
                { passId },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            if (!updatedPassResult.rows || updatedPassResult.rows.length === 0) {
                console.log('Failed to retrieve visitor pass after update');
                return { success: false, message: 'Failed to retrieve visitor pass' };
            }

            const updatedPass = updatedPassResult.rows[0];

            // Commit
            await connection.commit();

            return {
                success: true,
                message: 'Visitor pass activated and vehicle registered successfully',
                visitorPass: {
                    passId: updatedPass.PASS_ID,
                    validTime: updatedPass.VALID_TIME,
                    status: updatedPass.STATUS,
                    visitorPlate: updatedPass.VISITOR_PLATE,
                    createdAt: updatedPass.CREATED_AT.toISOString().replace('T', ' ').substring(0, 19),
                    parkingUntil: parkingUntilStr
                }
            };
        } catch (error) {
            console.error('Apply visitor passes error:', error);
            return { success: false, message: error.message || 'Server error' };
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
        HAVING MAX(p.TOTAL_SPACES) >= MIN(p.TOTAL_SPACES)
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
            sub.lotId,
            sub.capacity,
            sub.currentRemain,
            sub.currentOccupancy,
            v.PROVINCE,
            v.LICENSE_PLATE,
            v.PARKING_UNTIL
        FROM (
            SELECT 
                p.LOT_ID AS lotId,
                p.TOTAL_SPACES AS capacity,
                p.AVAILABLE_SPACES AS currentRemain,
                (p.TOTAL_SPACES - p.AVAILABLE_SPACES) AS currentOccupancy,
                COUNT(*) AS count1 
            FROM ParkingLot p
            WHERE p.LOT_ID = :1
            GROUP BY p.LOT_ID, p.TOTAL_SPACES, p.AVAILABLE_SPACES
        ) sub
        LEFT JOIN Vehicles v
            ON v.CURRENT_LOT_ID = sub.lotId
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
        JOIN Vehicles ve ON v.PROVINCE = ve.PROVINCE
                        AND v.LICENSE_PLATE = ve.LICENSE_PLATE
        WHERE ve.USER_ID = :1
        AND NOT EXISTS (
            SELECT ve2.VEHICLE_ID
            FROM Vehicles ve2
            WHERE ve2.USER_ID = ve.USER_ID
            MINUS
            SELECT ve3.VEHICLE_ID
            FROM Vehicles ve3
            WHERE ve3.USER_ID = ve.USER_ID
        )
        ORDER BY v.TIME DESC
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

// Create parking violation record - for admin interface
async function createViolation(province, licensePlate, reason, lotId, vehicleId = null) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Use current time as violation record creation time
        const currentTime = new Date();

        // Create violation record
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
            message: `Database error while creating violation record: ${error.message || 'Unknown error'}`,
            errorCode: error.errorNum || -1,
            errorDetails: error.toString()
        };
    } finally {
        // Ensure connection is always closed, even if an error occurs
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
    
    // Print parameter type information for debugging
    console.log('Payment parameters:', {
        amount: { value: amount, type: typeof amount },
        paymentMethod: { value: paymentMethod, type: typeof paymentMethod },
        cardNumber: { value: cardNumber, type: typeof cardNumber },
        userId: { value: userId, type: typeof userId },
        lotId: { value: lotId, type: typeof lotId },
        ticketId: { value: ticketId, type: typeof ticketId }
    });
    
    return await withOracleDB(async (connection) => {
        try {
            // Don't use bindDefs, use simple parameter array instead
            const result = await connection.execute(
                query,
                [
                    amount,
                    paymentMethod,
                    cardNumber,
                    userId,
                    lotId,
                    ticketId,
                    { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                ]
            );
            
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
        } catch (error) {
            console.error('Error in createPayment:', error);
            throw error;
        }
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

// New function: Register visitor information
async function registerVisitor(fullName, phone, unitToVisit, region, licensePlate, parkingLotId) {
    return await withOracleDB(async (connection) => {
        try {
            // Generate a random password (in a real application, users should set this or use a more secure method)
            const password = Math.random().toString(36).substring(2, 10);
            
            // Check if phone number already exists
            const phoneCheck = await connection.execute(
                `SELECT ID FROM Users WHERE PHONE = :phone`,
                { phone },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (phoneCheck.rows.length > 0) {
                return { 
                    success: false, 
                    message: 'This phone number is already registered' 
                };
            }
            
            // Set visitor host information
            const hostInformation = `Visiting Unit ${unitToVisit}`;
            
            // 1. Insert into Users table
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
                return { success: false, message: 'Failed to create user record' };
            }
            
            const userId = userResult.outBinds.userId;
            
 
            const parkingUntil = new Date();
            parkingUntil.setHours(parkingUntil.getHours() + 8);
            const parkingUntilStr = parkingUntil.toISOString().replace('T', ' ').substring(0, 19);
            
            // 2. Insert into Vehicles table
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
            
            // Commit transaction
            await connection.commit();
            
            return {
                success: true,
                message: 'Visitor information recorded successfully',
                user: {
                    ID: userId,
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
            return { success: false, message: 'Server error, visitor registration failed' };
        }
    });
}

// Verify if a license plate has a valid parking permit
async function verifyVehicle(plate, region, lotId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Query whether the vehicle exists in the database and is still valid
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

        // Vehicle exists, return detailed information
        const vehicle = {
            ID: result.rows[0].VEHICLE_ID,
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
        // Return more specific error information
        return {
            success: false,
            message: `Database error while verifying vehicle: ${error.message || 'Unknown error'}`,
            errorCode: error.errorNum || -1,
            errorDetails: error.toString()
        };
    } finally {
        // Ensure connection is always closed, even if an error occurs
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

// Get all violation records, optionally filtered by parking lot ID and date range
async function getAllViolations(lotId, startDate, endDate) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        let query = `
            SELECT 
                v.TICKET_ID as TICKETID,
                v.REASON,
                v.TIME,
                v.LOT_ID as LOTID,
                v.PROVINCE,
                v.LICENSE_PLATE as LICENSEPLATE,
                v.STATUS
            FROM Violations v
            WHERE 1=1
        `;
        
        const params = {};
        
        // If parking lot ID is provided, add filter condition
        if (lotId) {
            query += ` AND v.LOT_ID = :lotId`;
            params.lotId = parseInt(lotId, 10);
        }
        
        // If start date is provided, add filter condition
        if (startDate) {
            query += ` AND v.TIME >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
            params.startDate = startDate;
        }
        
        // If end date is provided, add filter condition
        if (endDate) {
            query += ` AND v.TIME <= TO_TIMESTAMP(:endDate, 'YYYY-MM-DD') + INTERVAL '1' DAY - INTERVAL '1' SECOND`;
            params.endDate = endDate;
        }
        
        query += ` ORDER BY v.TIME DESC`;
        
        console.log("Executing query:", query);
        console.log("Parameters:", params);
        
        const result = await connection.execute(
            query,
            params,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        console.log(`Found ${result.rows.length} violations`);
        
        return {
            success: true,
            violations: result.rows.map(row => ({
                ticketId: row.TICKETID,
                reason: row.REASON,
                time: row.TIME,
                lotId: row.LOTID,
                province: row.PROVINCE,
                licensePlate: row.LICENSEPLATE,
                status: row.STATUS
            }))
        };
    } catch (error) {
        console.error('Error getting violations:', error);
        return {
            success: false,
            message: 'Database error while getting violations: ' + error.message
        };
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully in getAllViolations');
            } catch (err) {
                console.error('Error closing database connection in getAllViolations:', err);
            }
        }
    }
}

// Get all payment records, optionally filtered by date range
async function getAllPayments(startDate, endDate) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        let query = `
            SELECT 
                p.PAY_ID as payId,
                p.AMOUNT as amount,
                p.PAYMENT_METHOD as paymentMethod,
                p.CARD_NUMBER as cardNumber,
                p.LOT_ID as lotId,
                p.TICKET_ID as ticketId,
                p.STATUS as status,
                p.CREATED_AT as createdAt,
                u.NAME as userName,
                u.ID as userId
            FROM Payments p
            JOIN Users u ON p.USER_ID = u.ID
            WHERE 1=1
        `;
        
        const params = {};
        
        // If start date is provided, add filter condition
        if (startDate) {
            query += ` AND p.CREATED_AT >= TO_TIMESTAMP(:startDate, 'YYYY-MM-DD')`;
            params.startDate = startDate;
        }
        
        // If end date is provided, add filter condition
        if (endDate) {
            query += ` AND p.CREATED_AT <= TO_TIMESTAMP(:endDate, 'YYYY-MM-DD') + INTERVAL '1' DAY - INTERVAL '1' SECOND`;
            params.endDate = endDate;
        }
        
        query += ` ORDER BY p.CREATED_AT DESC`;
        
        console.log("Executing query:", query);
        console.log("Parameters:", params);
        
        const result = await connection.execute(
            query,
            params,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        console.log(`Found ${result.rows.length} payment records`);
        
        // Process data, mask middle digits of credit card numbers
        const payments = result.rows.map(row => {
            // If there's a credit card number, only show the last 4 digits
            if (row.CARDNUMBER) {
                const length = row.CARDNUMBER.length;
                if (length > 4) {
                    row.CARDNUMBER = '****' + row.CARDNUMBER.substring(length - 4);
                }
            }
            
            return {
                payId: row.PAYID,
                amount: row.AMOUNT,
                paymentMethod: row.PAYMENTMETHOD,
                cardNumber: row.CARDNUMBER,
                lotId: row.LOTID,
                ticketId: row.TICKETID,
                status: row.STATUS,
                createdAt: row.CREATEDAT,
                userName: row.USERNAME,
                userId: row.USERID
            };
        });
        
        return {
            success: true,
            payments: payments
        };
    } catch (error) {
        console.error('Error getting payments:', error);
        return {
            success: false,
            message: 'Database error while getting payments: ' + error.message
        };
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully in getAllPayments');
            } catch (err) {
                console.error('Error closing database connection in getAllPayments:', err);
            }
        }
    }
}

// Update violation record status
async function updateViolationStatus(ticketId, newStatus) {
    let connection;
    try {
        // Validate status value
        const validStatuses = ['pending', 'paid', 'appealed'];
        if (!validStatuses.includes(newStatus)) {
            return {
                success: false,
                message: 'Invalid status value'
            };
        }

        connection = await oracledb.getConnection(dbConfig);
        
        const query = `
            UPDATE Violations
            SET STATUS = :status
            WHERE TICKET_ID = :id
        `;

        const result = await connection.execute(
            query,
            {
                status: newStatus,
                id: parseInt(ticketId, 10)
            },
            { autoCommit: true }
        );

        if (result.rowsAffected > 0) {
            return {
                success: true,
                message: `Status updated to ${newStatus}`
            };
        } else {
            return {
                success: false,
                message: 'Violation record not found'
            };
        }
    } catch (error) {
        console.error('Error updating violation status:', error);
        return {
            success: false,
            message: 'Database error while updating violation status: ' + error.message
        };
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully in updateViolationStatus');
            } catch (err) {
                console.error('Error closing database connection in updateViolationStatus:', err);
            }
        }
    }
}

// Find violations by license plate and region
async function findViolationsByPlate(licensePlate, province) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        const query = `
            SELECT 
                v.TICKET_ID as TICKETID,
                v.REASON,
                v.TIME,
                v.LOT_ID as LOTID,
                v.PROVINCE,
                v.LICENSE_PLATE as LICENSEPLATE,
                v.STATUS
            FROM Violations v
            WHERE v.LICENSE_PLATE = :licensePlate 
            AND v.PROVINCE = :province
            ORDER BY v.TIME DESC
        `;
        
        const result = await connection.execute(
            query,
            {
                licensePlate: licensePlate,
                province: province
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        
        // Format response
        return {
            success: true,
            violations: result.rows
        };
    } catch (error) {
        console.error('Error finding violations by plate:', error);
        return {
            success: false,
            message: 'Database error while finding violations: ' + error.message
        };
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully in findViolationsByPlate');
            } catch (err) {
                console.error('Error closing database connection in findViolationsByPlate:', err);
            }
        }
    }
}

// Find single violation record by ID
async function getViolationById(ticketId) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);
        
        const query = `
            SELECT 
                v.TICKET_ID as TICKETID,
                v.REASON,
                v.TIME,
                v.LOT_ID as LOTID,
                v.PROVINCE,
                v.LICENSE_PLATE as LICENSEPLATE,
                v.STATUS
            FROM Violations v
            WHERE v.TICKET_ID = :ticketId
        `;

        const result = await connection.execute(
            query,
            {
                ticketId: parseInt(ticketId, 10)
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        if (result.rows.length === 0) {
            return {
                success: false,
                message: `No violation found with ID ${ticketId}`
            };
        }

        // Format response
        return {
            success: true,
            violation: result.rows[0]
        };
    } catch (error) {
        console.error('Error finding violation by ID:', error);
        return {
            success: false,
            message: 'Database error while finding violation: ' + error.message
        };
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Database connection closed successfully in getViolationById');
            } catch (err) {
                console.error('Error closing database connection in getViolationById:', err);
            }
        }
    }
}

// Query active vehicles (vehicles within valid period) for a specific parking lot
async function getActiveVehiclesByLotId(lotId) {
    const query = `
        SELECT 
            v.VEHICLE_ID,
            v.PROVINCE,
            v.LICENSE_PLATE,
            v.PARKING_UNTIL,
            v.CURRENT_LOT_ID,
            u.ID as USER_ID,
            u.NAME as USER_NAME,
            u.UNIT_NUMBER,
            u.USER_TYPE
        FROM 
            Vehicles v
        JOIN
            Users u ON v.USER_ID = u.ID
        WHERE 
            v.CURRENT_LOT_ID = :lotId 
            AND v.PARKING_UNTIL > SYSTIMESTAMP
        ORDER BY 
            v.PARKING_UNTIL ASC
    `;
    
    return await withOracleDB(async (connection) => {
        try {
            console.log(`Fetching active vehicles for lot ID: ${lotId}`);
            const result = await connection.execute(
                query, 
                { lotId: parseInt(lotId, 10) },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            
            if (result.rows.length === 0) {
                console.log(`No active vehicles found for lot ID: ${lotId}`);
                return {
                    success: true,
                    message: 'No active vehicles found',
                    vehicles: []
                };
            }
            
            const vehicles = result.rows.map(row => ({
                vehicleId: row.VEHICLE_ID,
                province: row.PROVINCE,
                licensePlate: row.LICENSE_PLATE,
                parkingUntil: row.PARKING_UNTIL,
                lotId: row.CURRENT_LOT_ID,
                userId: row.USER_ID,
                userName: row.USER_NAME,
                unitNumber: row.UNIT_NUMBER,
                userType: row.USER_TYPE
            }));
            
            console.log(`Found ${vehicles.length} active vehicles for lot ID: ${lotId}`);
            
            return {
                success: true,
                vehicles: vehicles
            };
        } catch (error) {
            console.error(`Error fetching active vehicles for lot ID ${lotId}:`, error);
            return {
                success: false,
                message: `Database error: ${error.message || 'Unknown error'}`,
                errorDetails: error.toString()
            };
        }
    });
}

// Get all vehicles
async function getAllVehicles() {
    return await withOracleDB(async (connection) => {
        try {
            const query = `
                SELECT 
                    v.VEHICLE_ID,
                    v.PROVINCE,
                    v.LICENSE_PLATE,
                    v.PARKING_UNTIL,
                    v.CURRENT_LOT_ID,
                    v.USER_ID,
                    u.NAME as USER_NAME,
                    u.UNIT_NUMBER
                FROM 
                    Vehicles v
                JOIN
                    Users u ON v.USER_ID = u.ID
                ORDER BY 
                    v.VEHICLE_ID
            `;

            const result = await connection.execute(
                query,
                {},
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );

            const vehicles = result.rows.map(row => ({
                vehicleId: row.VEHICLE_ID,
                province: row.PROVINCE,
                licensePlate: row.LICENSE_PLATE,
                parkingUntil: row.PARKING_UNTIL.toISOString().replace('T', ' ').substring(0, 19),
                currentLotId: row.CURRENT_LOT_ID,
                userId: row.USER_ID,
                userName: row.USER_NAME,
                unitNumber: row.UNIT_NUMBER
            }));

            return {
                success: true,
                vehicles: vehicles
            };
        } catch (error) {
            console.error('Error fetching all vehicles:', error);
            return {
                success: false,
                message: error.message || 'Failed to fetch vehicles'
            };
        }
    });
}

async function startApp() {
    try {
        await initializeConnectionPool(); // 等待连接池启动
        console.log('✅ OracleDB connection pool initialized');

        const dbInitSuccess = await initializeDatabase(); // 再初始化数据库
        if (dbInitSuccess) {
            console.log('✅ Database initialized using init.sql');
        } else {
            console.error('❌ Database initialization failed');
        }

    } catch (err) {
        console.error('❌ Error during startup:', err);
    }
}

startApp();


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
    verifyVehicle,
    getAllViolations,
    updateViolationStatus,
    findViolationsByPlate,
    getViolationById,
    getActiveVehiclesByLotId,
    getAllPayments,
    deleteVehicle,
    getAllVehicles,
    initializeDatabase
};