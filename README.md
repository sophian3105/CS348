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

In a separate terminal, run
```bash
cd src
mysql -u root -p -h 127.0.0.1 < sql/createTables.sql
mysql -u root -p -h 127.0.0.1 < sql/seed.sql
mysql -u root -p -h 127.0.0.1 < sql/test-sample.sql
```

Launch the following url: http://localhost:3000

