SELECT pl.r_id, pl.latitude, pl.longitude, pl.neighborhood, pl.location_type, 'police' AS reporter_type, pr.occurence_date
FROM policeLocation pl JOIN policeReports pr ON pr.r_id = pl.r_id
UNION ALL
SELECT ul.r_id, ul.latitude, ul.longitude, ul.neighborhood, ul.location_type, 'user' AS reporter_type, ur.occurence_date
FROM userLocation ul JOIN userReports ur ON ul.r_id = ur.r_id;