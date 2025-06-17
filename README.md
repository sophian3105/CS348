Current Features
- Loaded a test sample dataset
- Query Runner Interface: Run predefined queries (R6a, R6b, R7, R8, R9, R10) via dropdown.
- Filter by Source (R6a/R6b): View only user-submitted or police-reported assaults.
- Unified Timeline (R7): All reports ordered by occurrence date.
- Keyword Search (R8): Search across assault types and neighborhoods
- Assault type (R9): Sort by assault type
- Worst Neighborhoods (R10): Top 3 neighborhoods by combined police/user reports.

## Getting Started
Make sure you have PHP’s mysqli enabled

First, change directory into public and launch
```bash
cd public
php -S 127.0.0.1:8000
```

After your server has started go to
```bash
http://127.0.0.1:8000/queryRunner.php
```

In a separate terminal, run
```bash
mysql -u root -p -h 127.0.0.1 < sql/createTables.s
mysql -u root -p -h 127.0.0.1 < sql/seed.sql
mysql -u root -p -h 127.0.0.1 < sql/test-sample.sql
```


