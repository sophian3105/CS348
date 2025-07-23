## Demo Video
[https://drive.google.com/file/d/11_AWO_zGcZUnBmwJSbQRVuDbN4383cYa/view?usp=drive_link](url)

## Current Features
- Loaded a production dataset, file found in src/dataprod.sql
- Filter by Source (R6a/R6b): View only user-submitted or police-reported assaults.
- Unified Timeline (R7): All reports ordered by occurrence date.
- Keyword Search (R8): Search across assault/location/premise types, neighbourhood, and report id and display on a table and the map.
- Assault type (R9): Sort by assault type
- Worst Neighborhoods (R10): Top 3 neighborhoods by combined police/user reports.
- User interface allowing users to perform the 5 features above.
- Fancy feature 1 (R11): Location safety analysis that analyzes the any location search in Toronto and determines safety and risk level.
- Fancy feature 2 (R12): Interactive map that shows the police and user reports in Toronto with heatmaps of areas with a lot of crimes. Underlying sql puts crimes in bins based on coordinates.
- Fancy feature 3 (R13): Allow users to submit their own reports.
- Fancy feature 4 (R14): Find the closest police report to each user report.
- Fancy feature 5 (R15): Outline any circular area on the interactive map and see every assault that occured inside it.

## Explore the Assault Database
View our deployed resource at: https://cs348-production-6aa0.up.railway.app/
This app was deployed using Railway. 

## Getting Started
First, make sure to download all the node modules and start the development server. Make sure to populate the env file with google maps APIs and your mySQL credentials.
```bash
npm install
npm run dev
cp env.example .env.local
```

## Running Database
In a separate terminal, run the following commands to create SQL tables and populate with data.

Option 1: Using Sample Data (For Testing Only)
```bash
mysql -u root -p -h 127.0.0.1 < sql/createTables.sql
mysql -u root -p -h 127.0.0.1 < sql/sample-data.sql
mysql -u root -p -h 127.0.0.1 < sql/triggers.sql           
```

Option 2: Using provided production data (small subset)
```bash
mysql -u root -p -h 127.0.0.1 < sql/createTables.sql
mysql -u root -p -h 127.0.0.1 < sql/prod-data.sql
```

To run the sample sql commands, run
```bash
mysql -u root -p -h 127.0.0.1 < sql/test-sample.sql
mysql -u root -p -h 127.0.0.1 < sql/setup.sql
mysql -u root -p -h 127.0.0.1 < sql/triggers.sql           
```

Option 3: Using full Toronto Assault Open Dataset (warning: large dataset)
1. Go to [https://data.torontopolice.on.ca/datasets/b4d0398d37eb4aa184065ed625ddb922_0/explore](url)
2. Click Download > CSV
3. Save the file as assault.csv in project root
4. Then run this script
```bash
python scripts/full_dataset.py --file assault.csv --user root
```

## Running frontend
Once the database is ready, start the frontend by openning
```bash
http://localhost:3000
```

**Note: The sql in the root folder is for marking. It has the aggregated test-sample files and sql files. The sql in the src folder is seperated (but has the same code), and is used for our api routes.

## Dashboard
Navigate the assault database through the dashboard in the main page:

<img width="1512" alt="Screenshot 2025-07-06 at 7 12 18 PM" src="https://github.com/user-attachments/assets/d27831f5-aa6b-432e-a671-621b475d6701" />

## SQL Queries
Use the analytics dropdown to view our SQL features:

<img width="1501" alt="Screenshot 2025-07-06 at 8 54 16 PM" src="https://github.com/user-attachments/assets/33878c15-c580-49fd-a77a-c290c4f1a22c" />

## Interactive map
Explore the interactive map of user and police reports, with an additional heatmap for crime hotspots:

<img width="1512" alt="Screenshot 2025-07-06 at 8 54 35 PM" src="https://github.com/user-attachments/assets/34d00a01-3612-404c-bf92-4c6d961b4573" />

## Running Location Safety Analysis
A google maps API key is needed, one can be found under the 'fancy feature 1' section on the submitted document. 

Video Demo:
[https://drive.google.com/file/d/1hFFNzDAC22F8YC53K_b5FugYyKVV5JJO/view?usp=sharing](url)
[https://drive.google.com/file/d/1mcIjhiMCXMg1qcwzF-4NoYumG-Kk7Ug4/view?usp=sharing](location safety feature)





