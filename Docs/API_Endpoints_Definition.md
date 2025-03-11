API Endpoints Definition
1. Authentication & User Management
   1.1 User Registration
   Endpoint: POST /auth/register
   Description: Registers a new user (Resident, Visitor, or Admin).
   Request Body:
   {
   "username": "john_doe",
   "password": "secure_password",
   "role": "resident"
   }

Response:
{
"success": true,
"message": "User registered successfully."
}


1.2 User Login
Endpoint: POST /auth/login
Description: Authenticates a user and returns a JWT token.
Request Body:
{
"username": "john_doe",
"password": "secure_password"
}

Response:
{
"success": true,
"token": "jwt_token_string"
}


1.3 Get User Profile
Endpoint: GET /auth/profile
Description: Retrieves user profile details.
Headers:
Authorization: Bearer jwt_token

Response:
{
"username": "john_doe",
"role": "resident"
}


2. Visitor Pass Management
   2.1 Request a Visitor Pass
   Endpoint: POST /visitor-pass/request
   Description: Allows a resident to request a visitor pass.
   Request Body:
   {
   "residentId": 123,
   "vehiclePlate": "ABC-123",
   "validFrom": "2025-03-10T08:00:00Z",
   "validTo": "2025-03-10T20:00:00Z"
   }

Response:
{
"success": true,
"passId": 456
}


2.2 Approve Visitor Pass (Admin)
Endpoint: POST /visitor-pass/approve
Description: Allows an admin to approve a visitor pass request.
Request Body:
{
"passId": 456,
"approvedBy": 1
}

Response:
{
"success": true,
"message": "Visitor pass approved."
}


2.3 Get Active Visitor Passes
Endpoint: GET /visitor-pass/active
Description: Retrieves all active visitor passes.
Response:
[
{
"passId": 456,
"residentId": 123,
"vehiclePlate": "ABC-123",
"validFrom": "2025-03-10T08:00:00Z",
"validTo": "2025-03-10T20:00:00Z"
}
]


3. Parking Violation & Ticketing
   3.1 Report Unauthorized Parking
   Endpoint: POST /violations/report
   Description: Logs a new parking violation.
   Request Body:
   {
   "vehiclePlate": "XYZ-789",
   "violationType": "Overstay",
   "location": "Lot A - Spot 12",
   "reportedBy": 2
   }

Response:
{
"success": true,
"violationId": 789
}


3.2 Issue a Parking Ticket
Endpoint: POST /violations/ticket
Description: Issues a ticket for a parking violation.
Request Body:
{
"violationId": 789,
"fineAmount": 50.00
}

Response:
{
"success": true,
"ticketId": 101
}


3.3 Get Violation History
Endpoint: GET /violations/history/:vehiclePlate
Description: Retrieves the violation history for a specific vehicle.
Response:
[
{
"violationId": 789,
"vehiclePlate": "XYZ-789",
"violationType": "Overstay",
"location": "Lot A - Spot 12",
"ticketIssued": true,
"fineAmount": 50.00
}
]


4. Payment Processing
   4.1 Pay Ticket Fine
   Endpoint: POST /payments/pay-fine
   Description: Processes a fine payment.
   Request Body:
   {
   "ticketId": 101,
   "paymentMethod": "Credit Card",
   "amount": 50.00
   }

Response:
{
"success": true,
"transactionId": "TXN12345"
}


4.2 Get Outstanding Fines
Endpoint: GET /payments/outstanding/:vehiclePlate
Description: Retrieves all unpaid fines for a vehicle.
Response:
[
{
"ticketId": 101,
"fineAmount": 50.00,
"status": "Unpaid"
}
]


5. Parking Lot Management & Monitoring
   5.1 Get Current Parking Lot Status
   Endpoint: GET /parking-lot/status
   Description: Retrieves the real-time status of the parking lot.
   Response:
   {
   "totalSpaces": 100,
   "occupiedSpaces": 75,
   "availableSpaces": 25
   }


5.2 Get Vehicle Parking History
Endpoint: GET /parking-lot/history/:vehiclePlate
Description: Retrieves parking history for a vehicle.
Response:
[
{
"vehiclePlate": "XYZ-789",
"entryTime": "2025-03-10T08:15:00Z",
"exitTime": "2025-03-10T12:30:00Z"
}
]


6. Administrative Controls
   6.1 Modify Parking Rules
   Endpoint: POST /admin/update-parking-rules
   Description: Allows an admin to update parking rules and policies.
   Request Body:
   {
   "maxVisitorPassesPerResident": 5,
   "overstayFineAmount": 75.00
   }

Response:
{
"success": true,
"message": "Parking rules updated."
}


6.2 Generate Parking & Violation Reports
Endpoint: GET /admin/reports
Description: Retrieves parking and violation reports for administrators.
Response:
{
"totalTicketsIssued": 20,
"totalFinesCollected": 1000.00,
"repeatOffenders": 5
}


7. System Health & Debugging
   7.1 Check Database Connection
   Endpoint: GET /system/check-db
   Description: Checks if the database connection is active.
   Response:
   {
   "success": true,
   "message": "Database connected."
   }


8. Frontend-Backend Integration
   8.1 Test API Calls
   Use Postman to verify all API responses.
   Ensure CORS policies allow frontend communication.
   Implement frontend API service in React/Next.js using Axios.
   8.2 Test User Flow
   Register a resident and request a visitor pass.
   Check parking lot status updates in real-time.
   Issue a violation and process a fine payment.
