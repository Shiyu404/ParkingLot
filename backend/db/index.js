const oracledb = require('oracledb');
const loadEnvFile = require('../utils/envUtil');
const envVariables = loadEnvFile('.env');

// Database configuration
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`
};

// Create connection pool
const pool = oracledb.createPool({
    ...dbConfig,
    poolMin: 10,
    poolMax: 10,
    poolIncrement: 0
});

module.exports = { pool }; 