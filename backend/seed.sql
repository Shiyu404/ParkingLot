-- Insert test users
INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE) VALUES
('1234567890', 'password', 'Admin User', 'admin', 'resident');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, UNIT_NUMBER) VALUES
('9876543210', 'password', 'Resident User', 'user', 'resident', 101);

-- Insert test parking lot
INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES) VALUES
('A', 100, 100);

-- Insert test staff
INSERT INTO Staff (USER_ID, LOT_ID) 
SELECT ID, 'A' FROM Users WHERE ROLE = 'admin';

-- Insert test parking records
INSERT INTO ParkingRecord (VEHICLE_PLATE, LOT_ID, ENTRY_TIME, STATUS) VALUES
('ABC123', 'A', CURRENT_TIMESTAMP, 'active'),
('DEF456', 'A', CURRENT_TIMESTAMP - INTERVAL '2' HOUR, 'active');

-- Insert test vehicles
INSERT INTO Vehicles (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL, CURRENT_LOT_ID) VALUES
(2, 'CA', 'ABC123', CURRENT_TIMESTAMP + INTERVAL '24' HOUR, 'A'),
(2, 'NY', 'DEF456', CURRENT_TIMESTAMP + INTERVAL '48' HOUR, 'A');

-- Insert test visitor passes
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, STATUS) VALUES
(2, CURRENT_TIMESTAMP + INTERVAL '8' HOUR, 'active'),
(2, CURRENT_TIMESTAMP + INTERVAL '24' HOUR, 'active');

-- Insert test violations
INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS) VALUES
('A', 'CA', 'ABC123', 'Unauthorized parking', CURRENT_TIMESTAMP, 'pending'),
('A', 'NY', 'DEF456', 'Expired pass', CURRENT_TIMESTAMP - INTERVAL '1' HOUR, 'pending');

-- Insert test payments
INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, STATUS) VALUES
(2, 25.00, 'credit_card', '****1234', 'A', 'completed'),
(2, 50.00, 'credit_card', '****5678', 'A', 'pending');

COMMIT; 