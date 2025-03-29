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

module.exports = {
    testOracleConnection,
    fetchCurrentOccupancy,
    fetchFlaggedVehicles,
    loginUser
};