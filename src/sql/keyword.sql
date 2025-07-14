-- R8a/R8b: Keyword search in assault_type or neighborhood
SELECT 
  pr.r_id AS report_id,
  pr.occurence_date AS occured_at,
  pl.neighborhood AS location_name,
  pr.assault_type AS type_id,
  'police' AS source
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE LOWER(pr.assault_type) LIKE LOWER(:keyword)
   OR LOWER(pl.neighborhood) LIKE LOWER(:keyword)
   OR LOWER(pr.r_id) LIKE LOWER(:keyword)
   OR LOWER(pl.location_type) LIKE LOWER(:keyword)
   OR LOWER(pl.premise_type) LIKE LOWER(:keyword)

UNION ALL

SELECT 
  ur.r_id AS report_id,
  ur.occurence_date AS occured_at,
  ul.neighborhood AS location_name,
  ur.assault_type AS type_id,
  'user' AS source
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE LOWER(ur.assault_type) LIKE LOWER(:keyword)
OR LOWER(ur.r_id) LIKE LOWER(:keyword)
   OR LOWER(ul.neighborhood) LIKE LOWER(:keyword)
  OR LOWER(ul.location_type) LIKE LOWER(:keyword)
   OR LOWER(ul.premise_type) LIKE LOWER(:keyword);
