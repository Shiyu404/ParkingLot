-- 1. Insert Query: User adds a new vehicle and requests a visitor pass
-- Assuming :userId, :province, :licensePlate, :parkingUntil, :vPassId, and :vPassTime are provided by user input.
BEGIN
    INSERT INTO Vehicle (province, licensePlate, parkingUntil)
    VALUES (:province, :licensePlate, TO_DATE(:parkingUntil, 'YYYY-MM-DD HH24:MI:SS'));
    
    INSERT INTO Have (userId, province, licensePlate)
    VALUES (:userId, :province, :licensePlate);
    
    INSERT INTO VisitorPass (visitorPassId, validTime, userId)
    VALUES (:vPassId, TO_DATE(:vPassTime, 'YYYY-MM-DD HH24:MI:SS'), :userId);
EXCEPTION
    WHEN OTHERS THEN
        -- Handle errors such as foreign key not found
        DBMS_OUTPUT.PUT_LINE('Error: ' || SQLERRM);
END;

-- 2. Update Query: Update user's non-primary key attributes (name and phone)
UPDATE User
SET name = :newName, phone = :newPhone
WHERE userId = :targetUserId;

-- 3. Delete Query: Admin revokes a visitor pass, cascade delete related records
DELETE FROM VisitorPass
WHERE visitorPassId = :targetPassId AND userId = :targetUserId;

-- 4. Selection Query: Search for violations within a certain date range and by reason
SELECT ticketId, reason, time, lotId
FROM ViolationTicket1
WHERE time BETWEEN TO_DATE(:startTime, 'YYYY-MM-DD') AND TO_DATE(:endTime, 'YYYY-MM-DD')
AND reason LIKE '%' || :keyword || '%';

-- 5. Projection Query: Allow users to select specific fields from Vehicle table
SELECT province, licensePlate
FROM Vehicle;

-- 6. Join Query: Join Customer and Transaction to find details based on a specific item purchase
SELECT U.userId, V.province, V.licensePlate, VP.validTime
FROM User U
JOIN Have H ON U.userId = H.userId
JOIN Vehicle V ON H.province = V.province AND H.licensePlate = V.licensePlate
JOIN VisitorPass VP ON U.userId = VP.userId
WHERE V.province = :selectedProvince;

-- 7. Aggregation with GROUP BY: Calculate total payments and sum amount for each lot
SELECT lotId, COUNT(*) AS totalPayments, SUM(amount) AS sumAmount
FROM Payment1
GROUP BY lotId;

-- 8. Aggregation with HAVING: Find users with more than 3 violations
SELECT U.userId, U.name, COUNT(*) AS violationCount
FROM User U
JOIN Have H ON U.userId = H.userId
JOIN ViolationTicket1 VT1 ON H.province = VT1.province AND H.licensePlate = VT1.licensePlate
GROUP BY U.userId, U.name
HAVING COUNT(*) > 3;

-- 9. Nested Aggregation with GROUP BY: Average violations per vehicle per lot
SELECT lotId, AVG(violationCount) AS avgViolationsPerVehicle
FROM (
    SELECT lotId, province, licensePlate, COUNT(*) AS violationCount
    FROM ViolationTicket1
    GROUP BY lotId, province, licensePlate
) GROUPED
GROUP BY lotId;

-- 10. Division Query: Find users who have vehicles in every province listed in Vehicle table
SELECT U.userId, U.name
FROM User U
WHERE NOT EXISTS (
    SELECT V.province
    FROM Vehicle V
    WHERE NOT EXISTS (
        SELECT 1
        FROM Have H
        WHERE H.userId = U.userId AND H.province = V.province
    )
);
