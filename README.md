## Current Features
- Loaded a test sample dataset
- Filter by Source (R6a/R6b): View only user-submitted or police-reported assaults.
- Unified Timeline (R7): All reports ordered by occurrence date.
- Keyword Search (R8): Search across assault types and neighborhoods
- Assault type (R9): Sort by assault type
- Worst Neighborhoods (R10): Top 3 neighborhoods by combined police/user reports.
- User interface allowing users to perform the 5 features above
- Fancy feature 1 (R11):
- Fancy feature 2 (R12): Interactive map that shows the police and user reports in Toronto, underlying SQL does ...

## Getting Started
First, make sure to download all the node modules and start the development server
```bash
npm install
npm run dev
```

## Environment file
Create a .env.local file with the following certifications. Change the password if you have one set.

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=""
MYSQL_DATABASE=cs348

## Run SQL

In a separate terminal, run
```bash
mysql -u root -p -h 127.0.0.1 < sql/createTables.sql
mysql -u root -p -h 127.0.0.1 < sql/seed.sql
mysql -u root -p -h 127.0.0.1 < sql/test-sample.sql
```

Launch the following url: http://localhost:3000

The sql in the root folder is for marking. It has the aggregated test-sample files and sql files. The sql in the src folder is seperated (but has the same code), and is used for our api routes.