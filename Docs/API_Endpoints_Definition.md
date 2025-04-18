1. User Module (/users)
1.1 User Login
Endpoint: POST /users/login

Request Body:
{
  "phone": "string",     // User phone number
  "password": "string"   // User password
}

Response:
{
  "success": true/false,
  "user": {
    "userId": "string",
    "name": "string",
    "phone": "string",
    "userType": "resident" | "visitor",
    "role": "string",
    "unitNumber": number,  // Resident users only
    "hostInformation": "string" // Visitor users only
  }
}

1.2 User Registration
Endpoint: POST /users/register
Request Body:

{
  "name": "string",
  "phone": "string",
  "password": "string",
  "userType": "resident" | "visitor",
  "unitNumber": number,  // Required for residents
  "hostInformation": "string" // Required for visitors
}

Response:

{
  "success": true/false,
  "user": {
    "userId": number,
    "name": "string",
    "userType": "string"
  }
}

1.3 Get User Information
Endpoint: GET /users/:userId
Response:

{
  "success": true/false,
  "userInfo": {
    "id": number,
    "name": "string",
    "phone": "string",
    "userType": "resident" | "visitor",
    "unitNumber": number,
    "hostInformation": "string",
    // Pay attention that a user may have many vehicles
    "vehicles": {
        "province": "string",
        "licensePlate": "string",
        "parkingUntil": "string" // ISO 8601 date
  }
  }
}

2. Vehicle Module (/vehicles)
2.1 Get User's Vehicle List
Endpoint: GET /vehicles/user/:userId
Response :

{
  "success": true/false,
  "vehicles": [
      {
        "province": "string",
        "licensePlate": "string",
        "parkingUntil": "string", // ISO 8601 date
        "currentLotId": number
      }
    ]
}

2.2 Register New Vehicle
Endpoint: POST /vehicles
Request Body:

{
  "userId": number,
  "province": "string",
  "licensePlate": "string",
  "lotId": "string,
  "parkingUntil": "string" // ISO 8601 date
}

Response :

{
  "success": true/false,
  "vehicle": {
    "province": "string",
    "licensePlate": "string",
    "parkingUntil": "string" // ISO 8601 date
  }
}


3. Visitor Pass Module (/visitorPasses)
3.1 Get Visitor Pass List
Endpoint: GET /visitorPasses/user/:userId
Response:

{
  "success": true/false,
  "visitorPasses": [
      {
        "visitorPassId": number,
        "validTime": "string", // ISO 8601 date
        "status": "active" | "expired"
      }
    ]
}

3.2 Apply for Visitor Pass
Endpoint: POST /visitorPasses
Request Body:

{
  "userId": number,
  "validTime": "string" // ISO 8601 date
}

Response :

{
  "success": true/false,
  "visitorPass": {
    "visitorPassId": number,
    "validTime": "string", // ISO 8601 date
    "status": "active"
  }
}



4. Parking Lot Module (/parkingLots)
4.1 Get All Parking Lots
Endpoint: GET /parkingLots
Response :
{
  "success": true/false,
  "parkingLots": [
      {
        "lotId": number,
        "address": "string",
        "capacity": number,
        "currentOccupancy": number,
        "currentRemain": number
      }
    ]
}

4.2 Get Specific Parking Lot
Endpoint: GET /parkingLots/:lotId
Response (200 OK):

{
  "success": true/false,
  "parkingLots": {
    "lotId": number,
    "address": "string",
    "capacity": number,
    "currentOccupancy": number,
    "currentRemain": number,
    "vehicles": [
      {
        "province": "string",
        "licensePlate": "string",
        "parkingUntil": "string" // ISO 8601 date
      }
    ]
  }
}



5. Violation Module (/violations)
5.1 Get User Violations
Endpoint: GET /violations/user/:userId
Query Parameters:
startDate (optional)
endDate (optional)
Response (200 OK):

{
  "success": true/false,
  "data": {
    "violations": [
      {
        "ticketId": number,
        "reason": "string",
        "time": "string", // ISO 8601 date
        "lotId": number,
        "province": "string",
        "licensePlate": "string",
        "status": "pending" | "paid" | "appealed"
      }
    ]
  }
}

5.2 Create Violation (Admin Only)
Endpoint: POST /violations
Request Body:

{
  "lotId": number,
  "province": "string",
  "licensePlate": "string",
  "reason": "string",
  "time": "string" // ISO 8601 date
}

Response (201 Created):
{
  "success": true/false,
  "data": {
    "ticketId": number
  }
}

6. Payment Module (/payments)
6.1 Create Payment
Endpoint: POST /payments
Request Body:
{
  "amount": number,
  "paymentMethod": "string",
  "cardNumber": "string",
  "userId": number,
  "lotId": number,
  "ticketId": number // For violation payments
}
Response (201 Created):
{
  "success": true/false,
  "data": {
    "payId": number,
    "amount": number,
    "status": "completed" | "pending" | "failed"
  }
}

6.2 Get Payment History
Endpoint: GET /payments/user/:userId
Query Parameters:
startDate (optional)
endDate (optional)
Response (200 OK):
{
  "success": true/false,
  "data": {
    "payments": [
      {
        "payId": number,
        "amount": number,
        "paymentMethod": "string",
        "cardNumber": "string",
        "lotId": number,
        "createdAt": "string", // ISO 8601 date
        "status": "completed" | "pending" | "failed"
      }
    ]
  }
}

. Admin Module (/admin)
7.1 Admin Login
Endpoint: POST /admin/login
Request Body:

{
  "staffId": number,
  "password": "string"
}
Response :

{
  "success": true/false,
  "data": {
    "staffId": number,
    "name": "string",
    "lotId": number,
    "token": "string"
  }
}

7.2 Generate Report
Endpoint: POST /admin/reports
Request Body:

{
  "lotId": number,
  "description": "string",
  "type": "monthly" | "quarterly" | "incident"
}
Response (201 Created):

{
  "success": true/false,
  "data": {
    "reportId": number,
    "dateGenerated": "string" // ISO 8601 date
  }
}

Error Response Format
In case of errors, the API will return the following structure:
{
  "success": true/false,
  "error": {
    "code": "string",      // Error code
    "message": "string",   // Error description
    "details": any         // Optional detailed error information
  }
}