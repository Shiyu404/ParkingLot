const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');

// Helper function to execute SQL file
async function executeSqlFile(connection, filePath) {
    try {
        const sql = fs.readFileSync(filePath, 'utf8');
        const statements = sql
            .split(';')
            .filter(statement => statement.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await connection.execute(statement);
            }
        }
        console.log(`Successfully executed ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`Error executing ${path.basename(filePath)}:`, error);
        throw error;
    }
}

// Initialize database
async function initializeDatabase() {
    let connection;
    try {
        connection = await oracledb.getConnection();
        
        // Execute init.sql first to create tables
        await executeSqlFile(connection, path.join(__dirname, 'init.sql'));
        
        // Execute seed.sql to insert test data
        await executeSqlFile(connection, path.join(__dirname, 'seed.sql'));
        
        await connection.commit();
        console.log('Database initialization completed successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Error closing connection:', error);
            }
        }
    }
}

module.exports = { initializeDatabase }; 