-- R6a: Filter by source = user
-- R14: Find closest police report using Haversine distance

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