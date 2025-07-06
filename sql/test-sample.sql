
-- Use the database
USE cs348;

-- R6a: Filter by source = user
SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
ORDER BY ur.occurence_date DESC;

-- R6b: Filter by source = police
SELECT
  pr.r_id AS report_id,
  pr.occurence_date AS occurred_at,
  pl.neighborhood AS neighborhood,
  pl.location_type AS location_name,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY pr.occurence_date DESC;

-- R7a/R7b: Filter by time descending (mix both user and police)
SELECT ur.r_id AS report_id, ur.occurence_date AS occurred_at, ul.neighborhood AS location_name, 'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occurred_at, pl.neighborhood AS location_name, 'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY occurred_at DESC;

-- R8a/R8b: Keyword search in assault_type or neighborhood
SELECT 
  pr.r_id AS report_id,
  pr.occurence_date AS occured_at,
  pl.neighborhood AS location_name,
  pr.assault_type AS type_id,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE LOWER(pr.assault_type) LIKE LOWER('%brampton%')
   OR LOWER(pl.neighborhood) LIKE LOWER('%brampton%')

UNION ALL

SELECT 
  ur.r_id AS report_id,
  ur.occurence_date AS occured_at,
  ul.neighborhood AS location_name,
  ur.assault_type AS type_id,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE LOWER(ur.assault_type) LIKE LOWER('%brampton%')
   OR LOWER(ul.neighborhood) LIKE LOWER('%brampton%');

-- R9a/R9b: Sort by assault type
SELECT ur.r_id AS report_id, ur.occurence_date AS occured_at, ul.neighborhood AS location_name, ur.assault_type AS type_id
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
UNION ALL
SELECT pr.r_id AS report_id, pr.occurence_date AS occured_at, pl.neighborhood AS location_name, pr.assault_type AS type_id
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
ORDER BY type_id ASC;

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
LIMIT 3;

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
WHERE occurence_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
GROUP BY lat_bin, long_bin; 


