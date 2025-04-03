-- Drop existing tables if they exist
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ParkingRecord CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;

/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ParkingLot CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Vehicles CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE VisitorPasses CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Violations CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Payments CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Staff CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ParkingLotInfo CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

-- Create Users table
CREATE TABLE Users (
    ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PHONE VARCHAR2(20) UNIQUE NOT NULL,
    PASSWORD VARCHAR2(100) NOT NULL,
    NAME VARCHAR2(100) NOT NULL,
    ROLE VARCHAR2(20) NOT NULL,
    USER_TYPE VARCHAR2(20) NOT NULL,
    UNIT_NUMBER NUMBER,
    HOST_INFORMATION VARCHAR2(200),
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_role CHECK (ROLE IN ('admin', 'user')),
    CONSTRAINT chk_user_type CHECK (USER_TYPE IN ('resident', 'visitor'))
);

-- Insert test users
INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE) VALUES
('1234567890', 'password', 'Admin User', 'admin', 'resident');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE) VALUES
('8881112222', 'password', 'Admin Alice', 'admin', 'resident');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE) VALUES
('9992223333', 'password', 'Admin Bob', 'admin', 'resident');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE) VALUES
('7773334444', 'password', 'Admin Charlie', 'admin', 'resident');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE) VALUES
('6664445555', 'password', 'Admin Diana', 'admin', 'resident');

-- Resident Users
INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, UNIT_NUMBER) VALUES
('9876543210', 'password', 'Resident User', 'user', 'resident', 101);

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, UNIT_NUMBER) VALUES
('1112223333', 'password', 'John Smith', 'user', 'resident', 102);

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, UNIT_NUMBER) VALUES
('2223334444', 'password', 'Emily Johnson', 'user', 'resident', 103);

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, UNIT_NUMBER) VALUES
('3334445555', 'password', 'Michael Brown', 'user', 'resident', 104);

-- Visitor Users
INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, HOST_INFORMATION) VALUES
('4445556666', 'password', 'Sarah Wilson', 'user', 'visitor', 'Visiting Unit 101');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, HOST_INFORMATION) VALUES
('5556667777', 'password', 'David Lee', 'user', 'visitor', 'Visiting Unit 102');

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, HOST_INFORMATION) VALUES
('6667778888', 'password', 'Jessica Garcia', 'user', 'visitor', 'Visiting Unit 103');

-- Create ParkingLot table
CREATE TABLE ParkingLot (
    LOT_ID NUMBER PRIMARY KEY,
    TOTAL_SPACES NUMBER NOT NULL,
    AVAILABLE_SPACES NUMBER NOT NULL,
    ADDRESS VARCHAR2(200) NOT NULL,
    LOT_NAME VARCHAR2(100) NOT NULL
);

-- Insert test parking lots one by one
INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (1, 100, 100, '123 Main St, Vancouver, BC', 'Maple Grove Estates');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (2, 80, 80, '456 Oak Ave, Vancouver, BC', 'Oakwood Heights');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (3, 120, 120, '789 Pine St, Vancouver, BC', 'Pine Ridge Gardens');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (4, 90, 90, '321 Maple Dr, Vancouver, BC', 'Maplewood Village');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (5, 150, 150, '654 Park Rd, Vancouver, BC', 'Parkview Meadows');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (6, 110, 110, '987 Waterfront Blvd, Vancouver, BC', 'Harbourview Residences');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (7, 95, 95, '147 Mountain View Dr, Vancouver, BC', 'Mountainview Heights');

INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES, ADDRESS, LOT_NAME) 
VALUES (8, 130, 130, '258 Ocean Park Ave, Vancouver, BC', 'Oceanview Estates');


-- Create Vehicles table
CREATE TABLE Vehicles (
    VEHICLE_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID NUMBER NOT NULL,
    PROVINCE VARCHAR2(10) NOT NULL,
    LICENSE_PLATE VARCHAR2(20) NOT NULL,
    PARKING_UNTIL TIMESTAMP NOT NULL,
    CURRENT_LOT_ID NUMBER,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vehicles_user_id FOREIGN KEY (USER_ID) REFERENCES Users(ID) ON DELETE CASCADE,
    CONSTRAINT fk_vehicles_lot_id FOREIGN KEY (CURRENT_LOT_ID) REFERENCES ParkingLot(LOT_ID),
    CONSTRAINT unique_license_plate UNIQUE (PROVINCE, LICENSE_PLATE)
);

-- Add test vehicle data
-- Vehicles with valid passes (not expired)
INSERT INTO Vehicles (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL, CURRENT_LOT_ID)
VALUES (2, 'CA', 'TEST123', SYSTIMESTAMP + INTERVAL '1' DAY, 1);

INSERT INTO Vehicles (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL, CURRENT_LOT_ID)
VALUES (3, 'NY', 'ABC123', SYSTIMESTAMP + INTERVAL '2' DAY, 1);

INSERT INTO Vehicles (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL, CURRENT_LOT_ID)
VALUES (4, 'TX', 'XYZ789', SYSTIMESTAMP + INTERVAL '3' DAY, 2);

-- Vehicles with expired passes
INSERT INTO Vehicles (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL, CURRENT_LOT_ID)
VALUES (2, 'ON', 'EXPIRED', SYSTIMESTAMP - INTERVAL '1' DAY, 1);

INSERT INTO Vehicles (USER_ID, PROVINCE, LICENSE_PLATE, PARKING_UNTIL, CURRENT_LOT_ID)
VALUES (3, 'BC', 'OLD123', SYSTIMESTAMP - INTERVAL '2' DAY, 2);

-- Create VisitorPasses table
CREATE TABLE VisitorPasses (
    PASS_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID NUMBER NOT NULL,
    VALID_TIME NUMBER NOT NULL, -- Stores duration in hours (8, 24, 48)
    STATUS VARCHAR2(20) DEFAULT 'active',
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    VISITOR_PLATE VARCHAR2(30),
    CONSTRAINT fk_visitor_passes_user_id FOREIGN KEY (USER_ID) REFERENCES Users(ID),
    CONSTRAINT chk_visitor_pass_status CHECK (STATUS IN ('active', 'expired'))
);

-- Insert visitor passes for the first resident user (User ID 2)
-- 8 hour pass - active
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, VISITOR_PLATE) 
VALUES (2, 8, 'BC-AB123CD');

-- 24 hour pass - active
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, VISITOR_PLATE) 
VALUES (2, 24, 'WA-KDA1233');

-- Weekend pass (48 hours) - active
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, VISITOR_PLATE) 
VALUES (2, 48, 'CA-FSD1234');

-- 8 hour pass - expired
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, STATUS, VISITOR_PLATE) 
VALUES (2, 0, 'expired', 'ON-OFN2312');

-- Insert visitor passes for the second resident user (User ID 3)
-- 8 hour pass - active
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, VISITOR_PLATE) 
VALUES (3, 8, 'NY-FAB7680');

-- 24 hour pass - active
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, VISITOR_PLATE) 
VALUES (3, 24, 'AB-CD123AD');

-- Insert visitor passes for the third resident user (User ID 4)
-- Weekend pass (48 hours) - active
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, VISITOR_PLATE) 
VALUES (4, 48, 'SK-FA123DF');

-- 8 hour pass - expired
INSERT INTO VisitorPasses (USER_ID, VALID_TIME, STATUS, VISITOR_PLATE) 
VALUES (4, 0, 'expired', 'MO-1A3489');

-- Create Violations table
CREATE TABLE Violations (
    TICKET_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    LOT_ID NUMBER NOT NULL,
    PROVINCE VARCHAR2(10) NOT NULL,
    LICENSE_PLATE VARCHAR2(20) NOT NULL,
    REASON VARCHAR2(200) NOT NULL,
    TIME TIMESTAMP NOT NULL,
    STATUS VARCHAR2(20) DEFAULT 'pending',
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_violations_lot_id FOREIGN KEY (LOT_ID) REFERENCES ParkingLot(LOT_ID),
    CONSTRAINT chk_violation_status CHECK (STATUS IN ('pending', 'paid', 'appealed'))
);

-- Insert test violation data for 2025 Q1 (January - April)
INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (1, 'BC', 'ABC123', 'No Valid Visitor Pass', TO_TIMESTAMP('2025-01-05 10:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (1, 'ON', 'DEF456', 'Expired Pass', TO_TIMESTAMP('2025-01-12 14:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'paid');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (2, 'AB', 'GHI789', 'Unauthorized Parking Area', TO_TIMESTAMP('2025-01-18 09:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (1, 'QC', 'JKL012', 'Blocked Access', TO_TIMESTAMP('2025-01-23 16:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'appealed');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (3, 'BC', 'MNO345', 'No Valid Visitor Pass', TO_TIMESTAMP('2025-02-02 11:10:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (2, 'AB', 'PQR678', 'Expired Pass', TO_TIMESTAMP('2025-02-08 13:25:00', 'YYYY-MM-DD HH24:MI:SS'), 'paid');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (1, 'ON', 'STU901', 'Unauthorized Parking Area', TO_TIMESTAMP('2025-02-15 08:40:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (3, 'BC', 'VWX234', 'Blocked Access', TO_TIMESTAMP('2025-02-21 17:55:00', 'YYYY-MM-DD HH24:MI:SS'), 'paid');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (2, 'QC', 'YZA567', 'Other', TO_TIMESTAMP('2025-03-03 10:05:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (1, 'BC', 'BCD890', 'No Valid Visitor Pass', TO_TIMESTAMP('2025-03-09 15:30:00', 'YYYY-MM-DD HH24:MI:SS'), 'paid');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (3, 'ON', 'EFG123', 'Expired Pass', TO_TIMESTAMP('2025-03-14 09:45:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (2, 'AB', 'HIJ456', 'Unauthorized Parking Area', TO_TIMESTAMP('2025-03-20 12:15:00', 'YYYY-MM-DD HH24:MI:SS'), 'appealed');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (1, 'QC', 'KLM789', 'Blocked Access', TO_TIMESTAMP('2025-03-25 16:40:00', 'YYYY-MM-DD HH24:MI:SS'), 'pending');

INSERT INTO Violations (LOT_ID, PROVINCE, LICENSE_PLATE, REASON, TIME, STATUS)
VALUES (3, 'BC', 'NOP012', 'No Valid Visitor Pass', TO_TIMESTAMP('2025-03-30 11:20:00', 'YYYY-MM-DD HH24:MI:SS'), 'paid');

-- Create Payments table
CREATE TABLE Payments (
    PAY_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID NUMBER NOT NULL,
    AMOUNT NUMBER(10,2) NOT NULL,
    PAYMENT_METHOD VARCHAR2(50) NOT NULL,
    CARD_NUMBER VARCHAR2(20) NOT NULL,
    LOT_ID NUMBER,
    TICKET_ID NUMBER,
    STATUS VARCHAR2(20) DEFAULT 'pending',
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user_id FOREIGN KEY (USER_ID) REFERENCES Users(ID),
    CONSTRAINT fk_payments_lot_id FOREIGN KEY (LOT_ID) REFERENCES ParkingLot(LOT_ID),
    CONSTRAINT fk_payments_ticket_id FOREIGN KEY (TICKET_ID) REFERENCES Violations(TICKET_ID),
    CONSTRAINT chk_payment_status CHECK (STATUS IN ('completed', 'pending', 'failed'))
);

-- Insert test payment data for 2025 Q1 (January - April)
-- For Lot 1
INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (2, 50.00, 'Credit Card', '4111111111111111', 1, 2, 'completed', TO_TIMESTAMP('2025-01-14 09:30:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (3, 75.00, 'Debit Card', '5555555555554444', 1, 4, 'completed', TO_TIMESTAMP('2025-01-25 14:15:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (4, 40.00, 'Credit Card', '3782822463100005', 1, 10, 'completed', TO_TIMESTAMP('2025-03-10 11:45:00', 'YYYY-MM-DD HH24:MI:SS'));

-- For Lot 2
INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (2, 60.00, 'PayPal', '4111111111111111', 2, 6, 'completed', TO_TIMESTAMP('2025-02-10 10:20:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (3, 45.00, 'Apple Pay', '5555555555554444', 2, 12, 'failed', TO_TIMESTAMP('2025-03-22 16:30:00', 'YYYY-MM-DD HH24:MI:SS'));

-- For Lot 3
INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (4, 80.00, 'Credit Card', '6011111111111117', 3, 8, 'completed', TO_TIMESTAMP('2025-02-23 13:10:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, TICKET_ID, STATUS, CREATED_AT)
VALUES (2, 55.00, 'Debit Card', '4242424242424242', 3, 14, 'completed', TO_TIMESTAMP('2025-04-01 09:45:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Additional payments for various dates
INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, STATUS, CREATED_AT)
VALUES (3, 25.00, 'Credit Card', '4111111111111111', 1, 'completed', TO_TIMESTAMP('2025-01-18 11:25:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, STATUS, CREATED_AT)
VALUES (4, 30.00, 'PayPal', '5555555555554444', 2, 'completed', TO_TIMESTAMP('2025-02-05 15:40:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, STATUS, CREATED_AT)
VALUES (2, 35.00, 'Apple Pay', '3782822463100005', 3, 'completed', TO_TIMESTAMP('2025-02-28 10:15:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, STATUS, CREATED_AT)
VALUES (3, 40.00, 'Credit Card', '4242424242424242', 1, 'completed', TO_TIMESTAMP('2025-03-15 13:50:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO Payments (USER_ID, AMOUNT, PAYMENT_METHOD, CARD_NUMBER, LOT_ID, STATUS, CREATED_AT)
VALUES (4, 45.00, 'Debit Card', '6011111111111117', 2, 'pending', TO_TIMESTAMP('2025-03-27 16:30:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Create Staff table
CREATE TABLE Staff (
    STAFF_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    USER_ID NUMBER NOT NULL,
    LOT_ID NUMBER NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_user_id FOREIGN KEY (USER_ID) REFERENCES Users(ID),
    CONSTRAINT fk_staff_lot_id FOREIGN KEY (LOT_ID) REFERENCES ParkingLot(LOT_ID)
);

-- Insert test staff
INSERT INTO Staff (USER_ID, LOT_ID) 
SELECT ID, 1 FROM Users WHERE PHONE = '1234567890';

INSERT INTO Staff (USER_ID, LOT_ID) 
SELECT ID, 2 FROM Users WHERE PHONE = '8881112222';

INSERT INTO Staff (USER_ID, LOT_ID) 
SELECT ID, 3 FROM Users WHERE PHONE = '9992223333';

INSERT INTO Staff (USER_ID, LOT_ID) 
SELECT ID, 4 FROM Users WHERE PHONE = '7773334444';

INSERT INTO Staff (USER_ID, LOT_ID) 
SELECT ID, 5 FROM Users WHERE PHONE = '6664445555';

-- Commit the changes
COMMIT; 