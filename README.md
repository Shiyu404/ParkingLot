# Parking Management System

A comprehensive parking management system for residential buildings.

## 🚀 Quick Start

### Backend Setup (On UBC Server)

1. Change .env under backend folder

- *MUST CHANGE TO YOUR ORACLE_USER & ORACLE_PASS*

2. Install Oracle Instant Client https://download.oracle.com/otn_software/mac/instantclient/instantclient-basiclite-macos-arm64.dmg

3. In ParkWatch folder

```bash
sh ./scripts/mac/db-tunnel.sh
``

```bash
sh ./scripts/mac/instantclient-setup.sh
```

```bash
sh local-start.sh
```


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
