USE cs348;

-- 1. USERS
INSERT INTO users (user_id, email, full_name, created_at, birth_date)
VALUES 
('u1-uuid', 'elsie@example.com', 'Elsie Li', '2025-06-01', '2000-01-01'),
('u2-uuid', 'jeff@example.com', 'Jeff Liu', '2025-06-02', '1999-12-31');

-- 2. POLICE REPORTS
INSERT INTO policeReports (r_id, assault_type, occurence_date, reported_date, division)
VALUES 
('p1-uuid', 'Physical Assault', '2025-05-10', '2025-05-11', 'Downtown'),
('p2-uuid', 'Theft in Brampton', '2025-04-20', '2025-04-22', 'Peel');

-- 3. USER REPORTS
INSERT INTO userReports (r_id, assault_type, occurence_date, reported_date, user_id)
VALUES 
('u1-report', 'Verbal Harassment', '2025-06-05', '2025-06-06', 'u1-uuid'),
('u2-report', 'Brampton Robbery', '2025-06-03', '2025-06-04', 'u2-uuid');

-- 4. POLICE LOCATION
INSERT INTO policeLocation (r_id, longitude, latitude, neighborhood, location_type, premise_type)
VALUES
('p1-uuid', -79.38, 43.65, 'Entertainment District', 'Street', 'Public'),
('p2-uuid', -79.76, 43.68, 'Brampton', 'Transit Station', 'Public');

-- 5. USER LOCATION
INSERT INTO userLocation (r_id, longitude, latitude, neighborhood, location_type, premise_type)
VALUES
('u1-report', -79.40, 43.66, 'Kensington Market', 'Sidewalk', 'Public'),
('u2-report', -79.75, 43.70, 'Brampton', 'Park', 'Public');

-- 6. ASSAULT COMMENTS
INSERT INTO assaultComments (user_id, r_id, created_at, comments)
VALUES
('u1-uuid', 'u2-report', '2025-06-10', 'Sorry this happened to you!'),
('u2-uuid', 'u1-report', '2025-06-11', 'I was nearby that day too.');