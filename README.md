# Parking Management System

A comprehensive parking management system for residential buildings.

## 🚀 Quick Start

### Backend Setup (On UBC Server)

1. Change .env under backend folder
- *MUST CHANGE TO YOUR ORACLE_USER & ORACLE_PASS*
2. Upload the backend folder to the server
3. SSH into the server:

```bash
ssh yourCWL@remote.students.cs.ubc.ca
```

4. Navigate to the project directory:

```bash
cd ~/backend
```
5. Login into SQLPlus

```bash
sqlplus ora_cwl@stu
aYourStudentID
```

6. Initial SQL

```bash
@init.sql
```

7. Create new terminal and goto backend

```bash
cd ~/backend
```

8. Start the backend server:

```bash
sh ./remote-start.sh
```

**Keep this terminal window open to maintain the server connection.**

### Frontend Setup (On Local Machine)

1. Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
yarn install
```
3. Change vite.config.js

```bash
proxy: {
      '/api': {
        target: 'http://localhost:50XXX', // change to your server port#
```
4. Open another terminal window and set up SSH tunnel:

```bash
sh ./scripts/mac/server-tunnel.sh
```

5. Start the frontend development server:

```bash
yarn dev
```

When prompted:

- Enter the remote port number (from step 3 of backend setup, e.g., 50020)
- Enter your CWL username

6. Keep both terminal windows open:

- One for the frontend server
- One for the SSH tunnel

### Access the Application

1. Open your browser and navigate to:

```
http://localhost:8080
```

2. Use the test accounts to log in:

- Administrator: admin@test.com / password
- Resident: resident@test.com / password

## Notes

- Keep the SSH tunnel and backend server running while developing
- The backend server runs on the school server
- The frontend development server runs locally
- All API requests are proxied through the SSH tunnel

## Overview

This project is developed as part of **CPSC 304** at the **UBC**. The system improves residential visitor parking management by tracking parking activities, enforcing regulations, and preventing misuse. It provides administrators with tools to monitor violations, manage payments, and take enforcement actions.

## Features

- **Visitor Pass Management**: Residents can request visitor passes, track usage, and approve or deny requests.
- **Real-Time Parking Monitoring**: Displays live parking lot occupancy, showing available and occupied spaces.
- **Violation Enforcement**: Allows administrators to issue warnings, penalties, or escalate cases to towing services.
- **Payment Processing**: Provides secure online payment options for fines and violations.
- **Admin Dashboard**: Includes tools for managing visitor quotas, enforcement policies, and reviewing logs of issued passes and payments.

## Installation & Setup

1. **Clone the repository**:
   ```sh
   git clone <repository-url>
   cd <project-folder>
   ```
2. **Install dependencies**:
   ```sh
   npm install
   ```
3. **Setup environment variables**:
   - Configure `.env` file with necessary credentials.
4. **Start the application**:
   ```sh
   npm start
   ```

## Team Members

- **Frank Yang**
- **Xingyang Zheng**
- **Shiyu Zhou**

## License

This project is developed for academic purposes and is not intended for commercial use.
