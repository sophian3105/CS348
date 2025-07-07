## Current Features
- Loaded a production dataset, file found in src/dataprod.sql
- Filter by Source (R6a/R6b): View only user-submitted or police-reported assaults.
- Unified Timeline (R7): All reports ordered by occurrence date.
- Keyword Search (R8): Search across assault types and neighborhoods
- Assault type (R9): Sort by assault type
- Worst Neighborhoods (R10): Top 3 neighborhoods by combined police/user reports.
- User interface allowing users to perform the 5 features above
- Fancy feature 1 (R11):
- Fancy feature 2 (R12): Interactive map that shows the police and user reports in Toronto with heatmaps of areas with a lot of crimes. Underlying sql puts crimes in bins based on coordinates.

## Getting Started
First, make sure to download all the node modules and start the development server
```bash
npm install
npm run dev
cp env.example .env.local
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=""
MYSQL_DATABASE=cs348

## Running Database
In a separate terminal, run the following commands to create SQL tables and populate with data.

Option 1: Using Sample Data (For Testing Only)
```bash
mysql -u root -p -h 127.0.0.1 < sql/createTables.sql
mysql -u root -p -h 127.0.0.1 < sql/test-sample.sql
```

Option 2: Using provided production data (small subset)
```bash
mysql -u root -p -h 127.0.0.1 < sql/createTables.sql
mysql -u root -p -h 127.0.0.1 < sql/prod-data.sql
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

<img width="1512" alt="Screenshot 2025-07-06 at 7 12 18 PM" src="https://github.com/user-attachments/assets/d27831f5-aa6b-432e-a671-621b475d6701" />
<img width="1501" alt="Screenshot 2025-07-06 at 8 54 16 PM" src="https://github.com/user-attachments/assets/33878c15-c580-49fd-a77a-c290c4f1a22c" />
<img width="1512" alt="Screenshot 2025-07-06 at 8 54 35 PM" src="https://github.com/user-attachments/assets/34d00a01-3612-404c-bf92-4c6d961b4573" />

Video Demo:
[https://drive.google.com/file/d/1hFFNzDAC22F8YC53K_b5FugYyKVV5JJO/view?usp=sharing](url)




