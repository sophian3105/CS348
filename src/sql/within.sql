SELECT
  pl.r_id,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type,
  'police' AS reporter_type
FROM policeLocation pl
JOIN policeReports pr ON pr.r_id = pl.r_id
WHERE
  (6371 * acos(
    cos(radians(?)) * cos(radians(pl.latitude)) *
    cos(radians(pl.longitude) - radians(?)) +
    sin(radians(?)) * sin(radians(pl.latitude))
  )) <= ?

UNION ALL

SELECT
  ul.r_id,
  ur.occurence_date,
  ul.latitude,
  ul.longitude,
  ul.neighborhood,
  ul.location_type,
  'user' AS reporter_type
FROM userLocation ul
JOIN userReports ur ON ur.r_id = ul.r_id
WHERE
  (6371 * acos(
    cos(radians(?)) * cos(radians(ul.latitude)) *
    cos(radians(ul.longitude) - radians(?)) +
    sin(radians(?)) * sin(radians(ul.latitude))
  )) <= ?;
