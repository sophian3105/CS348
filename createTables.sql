CREATE TABLE policeReports (
    r_id UUID NOT NULL PRIMARY KEY,
    assault_type VARCHAR(256),
    occurence_date DATE,
    reported_date DATE,
    division VARCHAR(256)
);

CREATE TABLE userReports (
    r_id UUID NOT NULL PRIMARY KEY,
    assault_type VARCHAR(256),
    occurence_date DATE,
    reported_date DATE,
    user_id UUID,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    CHECK (DATEDIFF(reported_date, occurence_date) <= 365)
);

CREATE TABLE policeLocation (
    r_id UUID PRIMARY KEY,
    longitude FLOAT,
    latitude FLOAT,
    neighborhood VARCHAR(256),
    location_type VARCHAR(256),
    premise_type VARCHAR(256),
    FOREIGN KEY (r_id) REFERENCES policeReports(r_id)
);

CREATE TABLE userLocation (
    r_id UUID PRIMARY KEY,
    longitude FLOAT,
    latitude FLOAT,
    neighborhood VARCHAR(256),
    location_type VARCHAR(256),
    premise_type VARCHAR(256),
    FOREIGN KEY (r_id) REFERENCES userReports(r_id)
);

CREATE TABLE users (
    user_id UUID NOT NULL PRIMARY KEY,
    email VARCHAR(256),
    full_name VARCHAR(256),
    created_at DATE,
    birth_date DATE
);

CREATE TABLE assaultComments (
    user_id UUID NOT NULL,
    r_id UUID NOT NULL,
    created_at DATE,
    comments TEXT,
    PRIMARY KEY (r_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (r_id) REFERENCES userReports(r_id)
);