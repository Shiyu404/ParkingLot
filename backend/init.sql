-- Drop existing tables if they exist
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ParkingRecord';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;

/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE ParkingLot';
EXCEPTION
   WHEN OTHERS THEN
      IF SQLCODE != -942 THEN
         RAISE;
      END IF;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Users';
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

INSERT INTO Users (PHONE, PASSWORD, NAME, ROLE, USER_TYPE, UNIT_NUMBER) VALUES
('9876543210', 'password', 'Resident User', 'user', 'resident', 101);

-- INSERT INTO Users(NAME,PHONE,PASSWORD,USER_TYPE,UNIT_NUMBER,HOST_INFORMATION,ROLE)
--              VALUES('hello','1111111111','password','resident',100,'s','user');

-- Create ParkingLot table
CREATE TABLE ParkingLot (
    LOT_ID VARCHAR2(1) PRIMARY KEY,
    TOTAL_SPACES NUMBER NOT NULL,
    AVAILABLE_SPACES NUMBER NOT NULL
);

-- Insert test parking lot
INSERT INTO ParkingLot (LOT_ID, TOTAL_SPACES, AVAILABLE_SPACES) VALUES
('A', 100, 100);

-- Create ParkingRecord table
CREATE TABLE ParkingRecord (
    RECORD_ID NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    VEHICLE_PLATE VARCHAR2(20) NOT NULL,
    LOT_ID VARCHAR2(1),
    ENTRY_TIME TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    EXIT_TIME TIMESTAMP,
    STATUS VARCHAR2(20) DEFAULT 'active',
    CONSTRAINT fk_lot_id FOREIGN KEY (LOT_ID) REFERENCES ParkingLot(LOT_ID),
    CONSTRAINT chk_status CHECK (STATUS IN ('active', 'completed', 'violation'))
);

-- Commit the changes
COMMIT; 