SELECT r_id, latitude, longitude, neighborhood, location_type
FROM policeLocation
UNION ALL
SELECT r_id, latitude, longitude, neighborhood, location_type
FROM userLocation;