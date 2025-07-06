USE cs348;

-- 1. USERS
SET @uuid_u1 = UUID();
SET @uuid_u2 = UUID();

INSERT INTO users (user_id, email, full_name, created_at, birth_date)
VALUES 
(@uuid_u1, 'elsie@example.com', 'Elsie Li', '2025-06-01', '2000-01-01'),
(@uuid_u2, 'jeff@example.com', 'Jeff Liu', '2025-06-02', '1999-12-31');

-- 2. POLICE REPORTS
SET @uuid_p1 = UUID();
SET @uuid_p2 = UUID();

INSERT INTO policeReports (r_id, assault_type, occurence_date, reported_date, division)
VALUES 
(@uuid_p1, 'Physical Assault', '2025-05-10', '2025-05-11', 'Downtown'),
(@uuid_p2, 'Theft in Brampton', '2025-04-20', '2025-04-22', 'Peel');

-- 3. USER REPORTS
SET @uuid_ur1 = UUID();
SET @uuid_ur2 = UUID();
SET @uuid_ur3 = UUID();
SET @uuid_ur4 = UUID();

INSERT INTO userReports (r_id, assault_type, occurence_date, reported_date, user_id)
VALUES 
(@uuid_ur1, 'Verbal Harassment', '2025-06-05', '2025-06-06', @uuid_u1),
(@uuid_ur2, 'Brampton Robbery', '2025-06-03', '2025-06-04', @uuid_u2),
(@uuid_ur3, 'Physical Assault',    '2025-06-07', '2025-06-08', @uuid_u1),
(@uuid_ur4, 'Verbal Harassment',   '2025-06-08', '2025-06-09', @uuid_u2);

-- 4. POLICE LOCATION
INSERT INTO policeLocation (r_id, longitude, latitude, neighborhood, location_type, premise_type)
VALUES
(@uuid_p1, -79.38, 43.65, 'Entertainment District', 'Street', 'Public'),
(@uuid_p2, -79.76, 43.68, 'Brampton', 'Transit Station', 'Public');

-- 5. USER LOCATION
INSERT INTO userLocation (r_id, longitude, latitude, neighborhood, location_type, premise_type)
VALUES
(@uuid_ur1, -79.40, 43.66, 'Kensington Market', 'Sidewalk', 'Public'),
(@uuid_ur2, -79.75, 43.70, 'Brampton', 'Park', 'Public'),
(@uuid_ur3, -79.405, 43.6605, 'Kensington Market', 'Sidewalk', 'Public'),
(@uuid_ur4, -79.406, 43.6604, 'Kensington Market', 'Sidewalk', 'Public');

-- 6. ASSAULT COMMENTS
INSERT INTO assaultComments (user_id, r_id, created_at, comments)
VALUES
(@uuid_u1, @uuid_ur2, '2025-06-10', 'Sorry this happened to you!'),
(@uuid_u2, @uuid_ur1, '2025-06-11', 'I was nearby that day too.');