import express from 'express';
import appController from './appController.js';

// Load environment variables from .env file
// Ensure your .env file has the required database credentials.
import loadEnvFile from './utils/envUtil.js';
const envVariables = loadEnvFile('./.env');

// Debug: Print environment variables
console.log('Environment variables loaded:', envVariables);

const app = express();
const PORT = envVariables.PORT || 50047;

// Middleware setup
app.use(express.static('public'));  // Serve static files from the 'public' directory
app.use(express.json());             // Parse incoming JSON payloads

// If you prefer some other file as default page other than 'index.html',
//      you can adjust and use the bellow line of code to
//      route to send 'DEFAULT_FILE_NAME.html' as default for root URL
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/DEFAULT_FILE_NAME.html');
// });


// mount the router
app.use('/', appController);


// ----------------------------------------------------------
// Starting the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
