USE cs348;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS validate_coordinates_before_insert;
DROP TRIGGER IF EXISTS validate_incident_date;

-- 1. Coordinate Validation Trigger
-- Validates that coordinates are within Toronto bounds before inserting into userLocation
DELIMITER //
CREATE TRIGGER validate_coordinates_before_insert
BEFORE INSERT ON userLocation
FOR EACH ROW
BEGIN
    -- Validate latitude is within Toronto bounds
    IF NEW.latitude < 43 OR NEW.latitude > 44 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Latitude must be within Toronto bounds';
    END IF;
    
    -- Validate longitude is within Toronto bounds
    IF NEW.longitude < -80 OR NEW.longitude > -79 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Longitude must be within Toronto bounds';
    END IF;
END//
DELIMITER ;

-- 2. Date Validation Trigger
-- Validates incident dates are reasonable before inserting into userReports
DELIMITER //
CREATE TRIGGER validate_incident_date
BEFORE INSERT ON userReports
FOR EACH ROW
BEGIN
    -- Ensure incident date is not in the future
    IF NEW.occurence_date > CURDATE() THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Incident date cannot be in the future';
    END IF;
END//
DELIMITER ;

-- Show created triggers
SHOW TRIGGERS WHERE `Table` IN ('userLocation', 'userReports'); 