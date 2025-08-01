-- testing using production data, limit 10 is used to maintain readability (so each table is a reasonable size when using prod data)
-- Use the database
USE cs348;

-- queries tested with prod data (this will output result of the queries using prod data)
-- the creation of indexes (for performance tuning) is roughly at line 600
-- indexes are dropped at line 300 (code is in comments you must uncomment if indexes have previously been created)

-- R6a: Filter by source = user
SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
ORDER BY ur.occurence_date DESC
LIMIT 10;

-- R6b: Filter by source = police
SELECT
  pr.r_id AS report_id,
  pr.occurence_date AS occurred_at,
  pl.neighborhood AS neighborhood,
  pl.location_type AS location_name,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY pr.occurence_date DESC
LIMIT 10;

-- R7a/R7b: Filter by time descending (mix both user and police)
SELECT ur.r_id AS report_id, ur.occurence_date AS occurred_at, ul.neighborhood AS location_name, 'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occurred_at, pl.neighborhood AS location_name, 'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY occurred_at DESC
LIMIT 10;

-- R8a/R8b: Keyword search in assault_type or neighborhood
SELECT 
  pr.r_id AS report_id,
  pr.occurence_date AS occured_at,
  pl.neighborhood AS location_name,
  pr.assault_type AS type_id,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE LOWER(pr.assault_type) LIKE LOWER('%weapon%')
   OR LOWER(pl.neighborhood) LIKE LOWER('%kensington%')

UNION ALL

SELECT 
  ur.r_id AS report_id,
  ur.occurence_date AS occured_at,
  ul.neighborhood AS location_name,
  ur.assault_type AS type_id,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE LOWER(ur.assault_type) LIKE LOWER('%weapon%')
   OR LOWER(ul.neighborhood) LIKE LOWER('%kensington%')
LIMIT 10;

-- R9a/R9b: Sort by assault type
SELECT ur.r_id AS report_id, ur.occurence_date AS occured_at, ul.neighborhood AS location_name, ur.assault_type AS type_id
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occured_at, pl.neighborhood AS location_name, pr.assault_type AS type_id
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY type_id ASC
LIMIT 10;

-- R10a: Sort by worst neighbouhood
SELECT neighborhood AS worstNbhd
FROM (
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM policeLocation
    GROUP BY neighborhood
    UNION ALL
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM userLocation
    GROUP BY neighborhood
) AS combinedNeighborhoods
GROUP BY neighborhood
ORDER BY SUM(total_reports) DESC
LIMIT 10;

-- R12a: Make bins for coordinates
WITH policeAndUser AS (
  SELECT 
    pl.longitude,
    pl.latitude,
    pr.occurence_date
  FROM policeReports  AS pr
  JOIN policeLocation AS pl ON pr.r_id = pl.r_id

  UNION ALL

  SELECT 
    ul.longitude,
    ul.latitude,
    ur.occurence_date
  FROM userReports    AS ur
  JOIN userLocation   AS ul ON ur.r_id = ul.r_id
)
SELECT
  FLOOR(latitude  * 100) / 100 AS lat_bin,
  FLOOR(longitude * 100) / 100 AS long_bin,
  COUNT(*)                       AS occurrences
FROM policeAndUser
-- interval changed from 60 days to 120 days since sample prod data doesn't include any assaults from past 60 days
WHERE occurence_date >= DATE_SUB(CURDATE(), INTERVAL 120 DAY)
GROUP BY lat_bin, long_bin
LIMIT 10; 

-- R11a: determine incidents near a location and calculate risk score
WITH all_incidents AS (
  SELECT pr.assault_type, pl.latitude as lat, pl.longitude as lng, pl.neighborhood, pl.premise_type, 'police' as source
  FROM policeReports pr
  JOIN policeLocation pl ON pr.r_id = pl.r_id
  WHERE pr.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  UNION ALL
  SELECT ur.assault_type, ul.latitude as lat, ul.longitude as lng, ul.neighborhood, ul.premise_type, 'user' as source
  FROM userReports ur
  JOIN userLocation ul ON ur.r_id = ul.r_id
  WHERE ur.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
),
nearby_incidents AS (
  SELECT *, (6371 * acos(cos(radians(43.6532)) * cos(radians(lat)) * cos(radians(lng) - radians(-79.3832)) + sin(radians(43.6532)) * sin(radians(lat)))) AS distance_km
  FROM all_incidents
),
filtered_incidents AS (
  SELECT * FROM nearby_incidents WHERE distance_km <= 0.5
),
risk_metrics AS (
  SELECT COUNT(*) as incident_count, AVG(distance_km) as avg_distance_km, 
    GROUP_CONCAT(DISTINCT assault_type) as assault_types, 
    GROUP_CONCAT(DISTINCT neighborhood) as neighborhoods, 
    GROUP_CONCAT(DISTINCT premise_type) as premise_types, 
    SUM(CASE WHEN source = 'police' THEN 1 ELSE 0 END) as police_reports, 
    SUM(CASE WHEN source = 'user' THEN 1 ELSE 0 END) as user_reports
  FROM filtered_incidents
),
distance_multiplier AS (
  SELECT *, CASE WHEN avg_distance_km < 0.3 THEN 1.3 
                  WHEN avg_distance_km < 0.5 THEN 1.1 
                  ELSE 1.0 END as distance_factor
  FROM risk_metrics
),
final_calculation AS (
  SELECT *, LEAST(10, incident_count * 1.5 * distance_factor) as calculated_risk_score
  FROM distance_multiplier
)
SELECT incident_count as total_incidents, avg_distance_km as avg_distance, 
        assault_types, neighborhoods, premise_types, police_reports, user_reports, 
        calculated_risk_score as risk_score, CASE WHEN calculated_risk_score >= 7 THEN 'HIGH' WHEN calculated_risk_score >= 3 THEN 'MEDIUM' ELSE 'LOW' END as risk_level
FROM final_calculation
LIMIT 10;

-- R13a: User reported submissions with triggers to validate data
DROP TRIGGER IF EXISTS validate_coordinates_before_insert;
DROP TRIGGER IF EXISTS validate_incident_date;

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

SHOW TRIGGERS WHERE `Table` IN ('userLocation', 'userReports'); 

/* don't run in tests because you get duplicates"
INSERT INTO users(user_id, email, full_name, created_at, birth_date) VALUES ('123123232', 'testing123@gmail.com', 'Jane Smith', '2003-07-21 09:15:00', NULL);

INSERT INTO userReports(r_id, assault_type, occurence_date, reported_date, user_id) VALUES ('123345', 'Physical', '2025-07-20 14:30:00', '2025-07-21 09:15:00', '123123232');

INSERT INTO userLocation(r_id, longitude, latitude, neighborhood, location_type, premise_type) VALUES ('123345', -79.3832, 43.6532, 'Downtown', 'Street', '123123232');
*/

-- R14a: find the closest police report to a user report
-- (Assume that 3d21354e-6364-11f0-bf74-d41b08d61b02 (police report) is at latitude 43.65 and longitude -79.38 which is 0.30km away from 050c31fc-f2d2-455e-837c-b627b3db1278 (user report) which is at latitude 43.65 and longitude -79.3763)
DROP VIEW IF EXISTS policeReportLocation;

CREATE VIEW policeReportLocation AS
SELECT
  pr.r_id AS police_rid,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE pl.latitude IS NOT NULL AND pl.longitude IS NOT NULL;

SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source,
  (
    SELECT prl.police_rid
    FROM policeReportLocation prl
    ORDER BY 6371 * ACOS(COS(RADIANS(ul.latitude)) * 
      COS(RADIANS(prl.latitude)) * COS(RADIANS(prl.longitude) - 
      RADIANS(ul.longitude)) + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(prl.latitude))
    )
    LIMIT 1
  ) AS closest_police,
  (
    SELECT MIN(6371 * ACOS(COS(RADIANS(ul.latitude)) * 
      COS(RADIANS(prl.latitude)) * COS(RADIANS(prl.longitude) - 
      RADIANS(ul.longitude)) + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(prl.latitude))))
    FROM policeReportLocation prl
  ) AS distance
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE ul.latitude IS NOT NULL AND ul.longitude IS NOT NULL
ORDER BY ur.occurence_date DESC;

-- R15a: find all assaults that occured within a circular radius

SELECT
  pl.r_id,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type,
  'police' AS reporter_type
FROM policeLocation  pl
JOIN policeReports   pr ON pr.r_id = pl.r_id
WHERE ( 6371 * ACOS(
          COS(RADIANS(43.654)) *
          COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(-79.380)) +
          SIN(RADIANS(43.654)) *
          SIN(RADIANS(pl.latitude))
       )
     ) <= 0.75

UNION ALL

SELECT
  ul.r_id,
  ur.occurence_date,
  ul.latitude,
  ul.longitude,
  ul.neighborhood,
  ul.location_type,
  'user' AS reporter_type
FROM userLocation   ul
JOIN userReports    ur ON ur.r_id = ul.r_id
WHERE ( 6371 * ACOS(
          COS(RADIANS(43.654)) *
          COS(RADIANS(ul.latitude)) *
          COS(RADIANS(ul.longitude) - RADIANS(-79.380)) +
          SIN(RADIANS(43.654)) *
          SIN(RADIANS(ul.latitude))
       )
     ) <= 0.75;


-- the following section is for performance tuning, we can use EXPLAIN to see query details before and after 
-- we add performance tuning to help handle large amounts of production data
/*
DROP INDEX idx_ur_occurence_date ON userReports;
DROP INDEX idx_pr_occurence_date ON policeReports;
DROP INDEX idx_ul_rid ON userLocation;
DROP INDEX idx_pl_rid ON policeLocation;
DROP INDEX idx_pr_assault_type ON policeReports;
DROP INDEX idx_ur_assault_type ON userReports;
DROP INDEX idx_pl_neighborhood ON policeLocation;
DROP INDEX idx_ul_neighborhood ON userLocation;
*/ 
-- R6a: Filter by source = user
EXPLAIN SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
ORDER BY ur.occurence_date DESC
LIMIT 10;

-- R6b: Filter by source = police
EXPLAIN SELECT
  pr.r_id AS report_id,
  pr.occurence_date AS occurred_at,
  pl.neighborhood AS neighborhood,
  pl.location_type AS location_name,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY pr.occurence_date DESC
LIMIT 10;

-- R7a/R7b: Filter by time descending (mix both user and police)
EXPLAIN SELECT ur.r_id AS report_id, ur.occurence_date AS occurred_at, ul.neighborhood AS location_name, 'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occurred_at, pl.neighborhood AS location_name, 'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY occurred_at DESC
LIMIT 10;

-- R8a/R8b: Keyword search in assault_type or neighborhood
EXPLAIN SELECT 
  pr.r_id AS report_id,
  pr.occurence_date AS occured_at,
  pl.neighborhood AS location_name,
  pr.assault_type AS type_id,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE LOWER(pr.assault_type) LIKE LOWER('%weapon%')
   OR LOWER(pl.neighborhood) LIKE LOWER('%kensington%')

UNION ALL

SELECT 
  ur.r_id AS report_id,
  ur.occurence_date AS occured_at,
  ul.neighborhood AS location_name,
  ur.assault_type AS type_id,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE LOWER(ur.assault_type) LIKE LOWER('%weapon%')
   OR LOWER(ul.neighborhood) LIKE LOWER('%kensington%')
LIMIT 10;

-- R9a/R9b: Sort by assault type
EXPLAIN SELECT ur.r_id AS report_id, ur.occurence_date AS occured_at, ul.neighborhood AS location_name, ur.assault_type AS type_id
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occured_at, pl.neighborhood AS location_name, pr.assault_type AS type_id
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY type_id ASC
LIMIT 10;

-- R10a: Sort by worst neighbouhood
EXPLAIN SELECT neighborhood AS worstNbhd
FROM (
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM policeLocation
    GROUP BY neighborhood
    UNION ALL
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM userLocation
    GROUP BY neighborhood
) AS combinedNeighborhoods
GROUP BY neighborhood
ORDER BY SUM(total_reports) DESC
LIMIT 10;

-- R12a: Make bins for coordinates
EXPLAIN WITH policeAndUser AS (
  SELECT 
    pl.longitude,
    pl.latitude,
    pr.occurence_date
  FROM policeReports  AS pr
  JOIN policeLocation AS pl ON pr.r_id = pl.r_id

  UNION ALL

  SELECT 
    ul.longitude,
    ul.latitude,
    ur.occurence_date
  FROM userReports    AS ur
  JOIN userLocation   AS ul ON ur.r_id = ul.r_id
)
SELECT
  FLOOR(latitude  * 100) / 100 AS lat_bin,
  FLOOR(longitude * 100) / 100 AS long_bin,
  COUNT(*)                       AS occurrences
FROM policeAndUser
-- interval changed from 60 days to 120 days since sample prod data doesn't include any assaults from past 60 days
WHERE occurence_date >= DATE_SUB(CURDATE(), INTERVAL 120 DAY)
GROUP BY lat_bin, long_bin
LIMIT 10; 

-- R11a: determine incidents near a location and calculate risk score
EXPLAIN WITH all_incidents AS (
  SELECT pr.assault_type, pl.latitude as lat, pl.longitude as lng, pl.neighborhood, pl.premise_type, 'police' as source
  FROM policeReports pr
  JOIN policeLocation pl ON pr.r_id = pl.r_id
  WHERE pr.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  UNION ALL
  SELECT ur.assault_type, ul.latitude as lat, ul.longitude as lng, ul.neighborhood, ul.premise_type, 'user' as source
  FROM userReports ur
  JOIN userLocation ul ON ur.r_id = ul.r_id
  WHERE ur.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
),
nearby_incidents AS (
  SELECT *, (6371 * acos(cos(radians(43.6532)) * cos(radians(lat)) * cos(radians(lng) - radians(-79.3832)) + sin(radians(43.6532)) * sin(radians(lat)))) AS distance_km
  FROM all_incidents
),
filtered_incidents AS (
  SELECT * FROM nearby_incidents WHERE distance_km <= 0.5
),
risk_metrics AS (
  SELECT COUNT(*) as incident_count, AVG(distance_km) as avg_distance_km, 
    GROUP_CONCAT(DISTINCT assault_type) as assault_types, 
    GROUP_CONCAT(DISTINCT neighborhood) as neighborhoods, 
    GROUP_CONCAT(DISTINCT premise_type) as premise_types, 
    SUM(CASE WHEN source = 'police' THEN 1 ELSE 0 END) as police_reports, 
    SUM(CASE WHEN source = 'user' THEN 1 ELSE 0 END) as user_reports
  FROM filtered_incidents
),
distance_multiplier AS (
  SELECT *, CASE WHEN avg_distance_km < 0.3 THEN 1.3 
                  WHEN avg_distance_km < 0.5 THEN 1.1 
                  ELSE 1.0 END as distance_factor
  FROM risk_metrics
),
final_calculation AS (
  SELECT *, LEAST(10, incident_count * 1.5 * distance_factor) as calculated_risk_score
  FROM distance_multiplier
)
SELECT incident_count as total_incidents, avg_distance_km as avg_distance, 
        assault_types, neighborhoods, premise_types, police_reports, user_reports, 
        calculated_risk_score as risk_score, CASE WHEN calculated_risk_score >= 7 THEN 'HIGH' WHEN calculated_risk_score >= 3 THEN 'MEDIUM' ELSE 'LOW' END as risk_level
FROM final_calculation
LIMIT 10;

-- R13a: User reported submissions with triggers to validate data
DROP TRIGGER IF EXISTS validate_coordinates_before_insert;
DROP TRIGGER IF EXISTS validate_incident_date;

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

SHOW TRIGGERS WHERE `Table` IN ('userLocation', 'userReports'); 

/* don't run in tests because you get duplicates"
INSERT INTO users(user_id, email, full_name, created_at, birth_date) VALUES ('123123232', 'testing123@gmail.com', 'Jane Smith', '2003-07-21 09:15:00', NULL);

INSERT INTO userReports(r_id, assault_type, occurence_date, reported_date, user_id) VALUES ('123345', 'Physical', '2025-07-20 14:30:00', '2025-07-21 09:15:00', '123123232');

INSERT INTO userLocation(r_id, longitude, latitude, neighborhood, location_type, premise_type) VALUES ('123345', -79.3832, 43.6532, 'Downtown', 'Street', '123123232');
*/

-- R14a: find the closest police report to a user report
-- (Assume that 3d21354e-6364-11f0-bf74-d41b08d61b02 (police report) is at latitude 43.65 and longitude -79.38 which is 0.30km away from 050c31fc-f2d2-455e-837c-b627b3db1278 (user report) which is at latitude 43.65 and longitude -79.3763)
DROP VIEW IF EXISTS policeReportLocation;

CREATE VIEW policeReportLocation AS
SELECT
  pr.r_id AS police_rid,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE pl.latitude IS NOT NULL AND pl.longitude IS NOT NULL;

EXPLAIN SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source,
  (
    SELECT prl.police_rid
    FROM policeReportLocation prl
    ORDER BY 6371 * ACOS(COS(RADIANS(ul.latitude)) * 
      COS(RADIANS(prl.latitude)) * COS(RADIANS(prl.longitude) - 
      RADIANS(ul.longitude)) + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(prl.latitude))
    )
    LIMIT 1
  ) AS closest_police,
  (
    SELECT MIN(6371 * ACOS(COS(RADIANS(ul.latitude)) * 
      COS(RADIANS(prl.latitude)) * COS(RADIANS(prl.longitude) - 
      RADIANS(ul.longitude)) + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(prl.latitude))))
    FROM policeReportLocation prl
  ) AS distance
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE ul.latitude IS NOT NULL AND ul.longitude IS NOT NULL
ORDER BY ur.occurence_date DESC;

-- R15a: find all assaults that occured within a circular radius

EXPLAIN SELECT
  pl.r_id,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type,
  'police' AS reporter_type
FROM policeLocation  pl
JOIN policeReports   pr ON pr.r_id = pl.r_id
WHERE ( 6371 * ACOS(
          COS(RADIANS(43.654)) *
          COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(-79.380)) +
          SIN(RADIANS(43.654)) *
          SIN(RADIANS(pl.latitude))
       )
     ) <= 0.75

UNION ALL

SELECT
  ul.r_id,
  ur.occurence_date,
  ul.latitude,
  ul.longitude,
  ul.neighborhood,
  ul.location_type,
  'user' AS reporter_type
FROM userLocation   ul
JOIN userReports    ur ON ur.r_id = ul.r_id
WHERE ( 6371 * ACOS(
          COS(RADIANS(43.654)) *
          COS(RADIANS(ul.latitude)) *
          COS(RADIANS(ul.longitude) - RADIANS(-79.380)) +
          SIN(RADIANS(43.654)) *
          SIN(RADIANS(ul.latitude))
       )
     ) <= 0.75;


-- performance tuning (create indexes to improve performance)

-- create index for occurence date 
-- this eliminates full table scans and improves speed for all queries, since order by occurence_date is used (and filtering by date interval)
CREATE INDEX idx_ur_occurence_date ON userReports(occurence_date);
CREATE INDEX idx_pr_occurence_date ON policeReports(occurence_date);

-- foreign key indexes to speed up JOINs used
CREATE INDEX idx_ul_rid ON userLocation(r_id);
CREATE INDEX idx_pl_rid ON policeLocation(r_id);

-- indexes for attributes that are used in key word search 
CREATE INDEX idx_pr_assault_type ON policeReports(assault_type);
CREATE INDEX idx_ur_assault_type ON userReports(assault_type);
CREATE INDEX idx_pl_neighborhood ON policeLocation(neighborhood);
CREATE INDEX idx_ul_neighborhood ON userLocation(neighborhood);

-- the following below allow us to compare performance before and after adding indexes 
-- example of effect of performance tuning:
-- R6a/R6b: Using filesort -> Backward index scan; Using index (file sort reads all, while with the index, the already sorted date index is used)

-- R6a: Filter by source = user
EXPLAIN SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
ORDER BY ur.occurence_date DESC
LIMIT 10;

-- R6b: Filter by source = police
EXPLAIN SELECT
  pr.r_id AS report_id,
  pr.occurence_date AS occurred_at,
  pl.neighborhood AS neighborhood,
  pl.location_type AS location_name,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY pr.occurence_date DESC
LIMIT 10;

-- R7a/R7b: Filter by time descending (mix both user and police)
EXPLAIN SELECT ur.r_id AS report_id, ur.occurence_date AS occurred_at, ul.neighborhood AS location_name, 'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occurred_at, pl.neighborhood AS location_name, 'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY occurred_at DESC
LIMIT 10;

-- R8a/R8b: Keyword search in assault_type or neighborhood
EXPLAIN SELECT 
  pr.r_id AS report_id,
  pr.occurence_date AS occured_at,
  pl.neighborhood AS location_name,
  pr.assault_type AS type_id,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE LOWER(pr.assault_type) LIKE LOWER('%weapon%')
   OR LOWER(pl.neighborhood) LIKE LOWER('%kensington%')

UNION ALL

SELECT 
  ur.r_id AS report_id,
  ur.occurence_date AS occured_at,
  ul.neighborhood AS location_name,
  ur.assault_type AS type_id,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE LOWER(ur.assault_type) LIKE LOWER('%weapon%')
   OR LOWER(ul.neighborhood) LIKE LOWER('%kensington%')
LIMIT 10;

-- R9a/R9b: Sort by assault type
EXPLAIN SELECT ur.r_id AS report_id, ur.occurence_date AS occured_at, ul.neighborhood AS location_name, ur.assault_type AS type_id
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occured_at, pl.neighborhood AS location_name, pr.assault_type AS type_id
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY type_id ASC
LIMIT 10;

-- R10a: Sort by worst neighbouhood
EXPLAIN SELECT neighborhood AS worstNbhd
FROM (
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM policeLocation
    GROUP BY neighborhood
    UNION ALL
    SELECT neighborhood, COUNT(*) AS total_reports
    FROM userLocation
    GROUP BY neighborhood
) AS combinedNeighborhoods
GROUP BY neighborhood
ORDER BY SUM(total_reports) DESC
LIMIT 10;

-- R12a: Make bins for coordinates
EXPLAIN WITH policeAndUser AS (
  SELECT 
    pl.longitude,
    pl.latitude,
    pr.occurence_date
  FROM policeReports  AS pr
  JOIN policeLocation AS pl ON pr.r_id = pl.r_id

  UNION ALL

  SELECT 
    ul.longitude,
    ul.latitude,
    ur.occurence_date
  FROM userReports    AS ur
  JOIN userLocation   AS ul ON ur.r_id = ul.r_id
)
SELECT
  FLOOR(latitude  * 100) / 100 AS lat_bin,
  FLOOR(longitude * 100) / 100 AS long_bin,
  COUNT(*)                       AS occurrences
FROM policeAndUser
-- interval changed from 60 days to 120 days since sample prod data doesn't include any assaults from past 60 days
WHERE occurence_date >= DATE_SUB(CURDATE(), INTERVAL 120 DAY)
GROUP BY lat_bin, long_bin
LIMIT 10; 

-- R11a: determine incidents near a location and calculate risk score
EXPLAIN WITH all_incidents AS (
  SELECT pr.assault_type, pl.latitude as lat, pl.longitude as lng, pl.neighborhood, pl.premise_type, 'police' as source
  FROM policeReports pr
  JOIN policeLocation pl ON pr.r_id = pl.r_id
  WHERE pr.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  UNION ALL
  SELECT ur.assault_type, ul.latitude as lat, ul.longitude as lng, ul.neighborhood, ul.premise_type, 'user' as source
  FROM userReports ur
  JOIN userLocation ul ON ur.r_id = ul.r_id
  WHERE ur.occurence_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
),
nearby_incidents AS (
  SELECT *, (6371 * acos(cos(radians(43.6532)) * cos(radians(lat)) * cos(radians(lng) - radians(-79.3832)) + sin(radians(43.6532)) * sin(radians(lat)))) AS distance_km
  FROM all_incidents
),
filtered_incidents AS (
  SELECT * FROM nearby_incidents WHERE distance_km <= 0.5
),
risk_metrics AS (
  SELECT COUNT(*) as incident_count, AVG(distance_km) as avg_distance_km, 
    GROUP_CONCAT(DISTINCT assault_type) as assault_types, 
    GROUP_CONCAT(DISTINCT neighborhood) as neighborhoods, 
    GROUP_CONCAT(DISTINCT premise_type) as premise_types, 
    SUM(CASE WHEN source = 'police' THEN 1 ELSE 0 END) as police_reports, 
    SUM(CASE WHEN source = 'user' THEN 1 ELSE 0 END) as user_reports
  FROM filtered_incidents
),
distance_multiplier AS (
  SELECT *, CASE WHEN avg_distance_km < 0.3 THEN 1.3 
                  WHEN avg_distance_km < 0.5 THEN 1.1 
                  ELSE 1.0 END as distance_factor
  FROM risk_metrics
),
final_calculation AS (
  SELECT *, LEAST(10, incident_count * 1.5 * distance_factor) as calculated_risk_score
  FROM distance_multiplier
)
SELECT incident_count as total_incidents, avg_distance_km as avg_distance, 
        assault_types, neighborhoods, premise_types, police_reports, user_reports, 
        calculated_risk_score as risk_score, CASE WHEN calculated_risk_score >= 7 THEN 'HIGH' WHEN calculated_risk_score >= 3 THEN 'MEDIUM' ELSE 'LOW' END as risk_level
FROM final_calculation
LIMIT 10;

-- R13a: User reported submissions with triggers to validate data
DROP TRIGGER IF EXISTS validate_coordinates_before_insert;
DROP TRIGGER IF EXISTS validate_incident_date;

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

SHOW TRIGGERS WHERE `Table` IN ('userLocation', 'userReports'); 

/* don't run in tests because you get duplicates"
INSERT INTO users(user_id, email, full_name, created_at, birth_date) VALUES ('123123232', 'testing123@gmail.com', 'Jane Smith', '2003-07-21 09:15:00', NULL);

INSERT INTO userReports(r_id, assault_type, occurence_date, reported_date, user_id) VALUES ('123345', 'Physical', '2025-07-20 14:30:00', '2025-07-21 09:15:00', '123123232');

INSERT INTO userLocation(r_id, longitude, latitude, neighborhood, location_type, premise_type) VALUES ('123345', -79.3832, 43.6532, 'Downtown', 'Street', '123123232');
*/

-- R14a: find the closest police report to a user report
-- (Assume that 3d21354e-6364-11f0-bf74-d41b08d61b02 (police report) is at latitude 43.65 and longitude -79.38 which is 0.30km away from 050c31fc-f2d2-455e-837c-b627b3db1278 (user report) which is at latitude 43.65 and longitude -79.3763)
DROP VIEW IF EXISTS policeReportLocation;

CREATE VIEW policeReportLocation AS
SELECT
  pr.r_id AS police_rid,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE pl.latitude IS NOT NULL AND pl.longitude IS NOT NULL;

EXPLAIN SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source,
  (
    SELECT prl.police_rid
    FROM policeReportLocation prl
    ORDER BY 6371 * ACOS(COS(RADIANS(ul.latitude)) * 
      COS(RADIANS(prl.latitude)) * COS(RADIANS(prl.longitude) - 
      RADIANS(ul.longitude)) + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(prl.latitude))
    )
    LIMIT 1
  ) AS closest_police,
  (
    SELECT MIN(6371 * ACOS(COS(RADIANS(ul.latitude)) * 
      COS(RADIANS(prl.latitude)) * COS(RADIANS(prl.longitude) - 
      RADIANS(ul.longitude)) + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(prl.latitude))))
    FROM policeReportLocation prl
  ) AS distance
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE ul.latitude IS NOT NULL AND ul.longitude IS NOT NULL
ORDER BY ur.occurence_date DESC;

-- R15a: find all assaults that occured within a circular radius

EXPLAIN SELECT
  pl.r_id,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type,
  'police' AS reporter_type
FROM policeLocation  pl
JOIN policeReports   pr ON pr.r_id = pl.r_id
WHERE ( 6371 * ACOS(
          COS(RADIANS(43.654)) *
          COS(RADIANS(pl.latitude)) *
          COS(RADIANS(pl.longitude) - RADIANS(-79.380)) +
          SIN(RADIANS(43.654)) *
          SIN(RADIANS(pl.latitude))
       )
     ) <= 0.75

UNION ALL

SELECT
  ul.r_id,
  ur.occurence_date,
  ul.latitude,
  ul.longitude,
  ul.neighborhood,
  ul.location_type,
  'user' AS reporter_type
FROM userLocation   ul
JOIN userReports    ur ON ur.r_id = ul.r_id
WHERE ( 6371 * ACOS(
          COS(RADIANS(43.654)) *
          COS(RADIANS(ul.latitude)) *
          COS(RADIANS(ul.longitude) - RADIANS(-79.380)) +
          SIN(RADIANS(43.654)) *
          SIN(RADIANS(ul.latitude))
       )
     ) <= 0.75;


