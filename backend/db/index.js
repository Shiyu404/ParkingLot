const oracledb = require('oracledb');
const loadEnvFile = require('../utils/envUtil');
const envVariables = loadEnvFile('../.env');

// Database configuration
const dbConfig = {
    user: envVariables.DB_USER,
    password: envVariables.DB_PASSWORD,
    connectString: envVariables.DB_CONNECTION_STRING
};

// Create connection pool
const pool = oracledb.createPool({
    ...dbConfig,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
});

module.exports = { pool }; 