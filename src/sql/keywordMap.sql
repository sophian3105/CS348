-- R8a/R8b: Keyword search that returns all information for the map
SELECT pl.r_id, pl.latitude, pl.longitude, pl.neighborhood, pl.location_type, 'police' AS reporter_type, pr.occurence_date
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE LOWER(pr.assault_type) LIKE LOWER(:keyword)
   OR LOWER(pl.neighborhood) LIKE LOWER(:keyword)
   OR LOWER(pr.r_id) LIKE LOWER(:keyword)
   OR LOWER(pl.location_type) LIKE LOWER(:keyword)
   OR LOWER(pl.premise_type) LIKE LOWER(:keyword)

UNION ALL

SELECT ul.r_id, ul.latitude, ul.longitude, ul.neighborhood, ul.location_type, 'user' AS reporter_type, ur.occurence_date
FROM userReports ur
JOIN userLocation ul ON ur.r_id = ul.r_id
WHERE LOWER(ur.assault_type) LIKE LOWER(:keyword)
OR LOWER(ur.r_id) LIKE LOWER(:keyword)
   OR LOWER(ul.neighborhood) LIKE LOWER(:keyword)
  OR LOWER(ul.location_type) LIKE LOWER(:keyword)
   OR LOWER(ul.premise_type) LIKE LOWER(:keyword);
