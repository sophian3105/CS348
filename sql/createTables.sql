DROP TABLE IF EXISTS assaultComments;
DROP TABLE IF EXISTS userLocation;
DROP TABLE IF EXISTS policeLocation;
DROP TABLE IF EXISTS userReports;
DROP TABLE IF EXISTS policeReports;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    user_id CHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(256),
    full_name VARCHAR(256),
    created_at DATE,
    birth_date DATE
);

CREATE TABLE policeReports (
    r_id CHAR(36) NOT NULL PRIMARY KEY,
    assault_type VARCHAR(256),
    occurence_date DATE,
    reported_date DATE,
    division VARCHAR(256)
);

CREATE TABLE userReports (
    r_id CHAR(36) NOT NULL PRIMARY KEY,
    assault_type VARCHAR(256),
    occurence_date DATE,
    reported_date DATE,
    user_id CHAR(36),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
CREATE TABLE policeLocation (
    r_id CHAR(36) PRIMARY KEY,
    longitude FLOAT,
    latitude FLOAT,
    neighborhood VARCHAR(256),
    location_type VARCHAR(256),
    premise_type VARCHAR(256),
    FOREIGN KEY (r_id) REFERENCES policeReports(r_id)
);

CREATE TABLE userLocation (
    r_id CHAR(36) PRIMARY KEY,
    longitude FLOAT,
    latitude FLOAT,
    neighborhood VARCHAR(256),
    location_type VARCHAR(256),
    premise_type VARCHAR(256),
    FOREIGN KEY (r_id) REFERENCES userReports(r_id)
);

CREATE TABLE assaultComments (
    user_id CHAR(36) NOT NULL,
    r_id CHAR(36) NOT NULL,
    created_at DATE,
    comments TEXT,
    PRIMARY KEY (r_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (r_id) REFERENCES userReports(r_id)
);
