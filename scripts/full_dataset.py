import pandas as pd
import argparse
from sqlalchemy import create_engine

def load_data(csv_path, user, password, host='127.0.0.1', db='cs348'):
    df = pd.read_csv(csv_path)

    trimmed = df[[
    'EVENT_UNIQUE_ID', 'OCC_DATE', 'REPORT_DATE', 'DIVISION',
    'OFFENCE'
    ]]

    trimmed.columns = [
        'r_id', 'occurence_date', 'reported_date', 'division',
        'assault_type'
    ]
    
    engine = create_engine(f'mysql+pymysql://{user}@{host}/{db}')

    trimmed = trimmed.drop_duplicates(subset='r_id')

    trimmed['occurence_date'] = pd.to_datetime(trimmed['occurence_date']).dt.strftime('%Y-%m-%d %H:%M:%S')
    trimmed['reported_date'] = pd.to_datetime(trimmed['reported_date']).dt.strftime('%Y-%m-%d %H:%M:%S')

    trimmed.to_sql('policeReports', con=engine, if_exists='append', index=False)

    if 'neighborhood' in df.columns:
        loc_df = df[['EVENT_UNIQUE_ID', 'neighborhood']].copy()
        loc_df.columns = ['r_id', 'neighborhood']
    else:
        loc_df = trimmed[['r_id']].copy()
        loc_df['neighborhood'] = 'Unknown'

        loc_df = loc_df.drop_duplicates(subset='r_id')
        loc_df.to_sql('policeLocation', con=engine, if_exists='append', index=False)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Load full dataset into MySQL.")
    parser.add_argument('--file', required=True, help='Path to CSV file')
    parser.add_argument('--user', required=True, help='MySQL username')
    parser.add_argument('--password', required=False, help='MySQL password')
    args = parser.parse_args()

    load_data(args.file, args.user, args.password)