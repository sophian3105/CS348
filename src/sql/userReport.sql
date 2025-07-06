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
