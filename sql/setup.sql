-- R14: Views and Indexes to simplify finding shortest distance between user report and closest police report
USE cs348;

DROP VIEW IF EXISTS policeReportLocation;

DROP INDEX idx_police_lat_lon ON policeLocation;
DROP INDEX idx_police_rid ON policeReports;
DROP INDEX idx_user_lat_lon ON userLocation;
DROP INDEX idx_user_rid ON userReports;

CREATE VIEW policeReportLocation AS
SELECT
  pr.r_id AS police_rid,
  pr.occurence_date,
  pl.latitude,
  pl.longitude,
  pl.neighborhood,
  pl.location_type
FROM policeReports pr
JOIN policeLocation pl ON pr.r_id = pl.r_id
WHERE pl.latitude IS NOT NULL AND pl.longitude IS NOT NULL;

CREATE INDEX idx_police_lat_lon ON policeLocation(latitude, longitude);
CREATE INDEX idx_police_rid ON policeReports(r_id);
CREATE INDEX idx_user_lat_lon ON userLocation(latitude, longitude);
CREATE INDEX idx_user_rid ON userReports(r_id);