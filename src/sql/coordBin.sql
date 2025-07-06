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
  FLOOR(latitude  * :scale) / :scale AS lat_bin,
  FLOOR(longitude * :scale) / :scale AS long_bin,
  COUNT(*)                       AS occurrences
FROM policeAndUser
WHERE occurence_date >= DATE_SUB(CURDATE(), INTERVAL :numdays DAY)
GROUP BY lat_bin, long_bin; 