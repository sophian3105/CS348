-- Filter by source = user, find nearest report
SELECT
  ur.r_id AS report_id,
  ur.occurence_date AS occurred_at,
  ul.neighborhood AS neighborhood,
  ul.location_type AS location_name,
  'user' AS source,
  (
    SELECT pr.r_id
    FROM policeReports pr 
    JOIN policeLocation pl ON pr.r_id = pl.r_id
    WHERE pl.latitude  IS NOT NULL AND pl.longitude IS NOT NULL
    ORDER BY 6371 * ACOS(COS(RADIANS(ul.latitude)) * COS(RADIANS(pl.latitude)) 
      * COS(RADIANS(pl.longitude) - RADIANS(ul.longitude)) 
      + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(pl.latitude)))
    LIMIT 1
  ) AS closest_police,
  (
    SELECT MIN(6371 * ACOS(COS(RADIANS(ul.latitude)) * COS(RADIANS(pl.latitude)) 
      * COS(RADIANS(pl.longitude) - RADIANS(ul.longitude)) 
      + SIN(RADIANS(ul.latitude)) * SIN(RADIANS(pl.latitude))))
    FROM policeReports pr
    JOIN policeLocation pl ON pr.r_id = pl.r_id
    WHERE pl.latitude  IS NOT NULL AND pl.longitude IS NOT NULL
  ) AS distance
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE ul.latitude  IS NOT NULL AND ul.longitude IS NOT NULL 
ORDER BY ur.occurence_date DESC;
