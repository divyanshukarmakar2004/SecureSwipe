import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler

# --- Data Preprocessing Functions ---
def load_and_preprocess_data(file_path):
    """
    Loads the dataset, handles missing values, encodes 'City' with frequency encoding,
    extracts 'Hour' and 'Minute' from 'Time', scales 'Amount', converts 'Is Fraud?' to binary,
    and returns the preprocessed DataFrame, fitted scaler, and city frequency mapping.
    """
    df = pd.read_csv(file_path)
    # Drop rows with missing values
    df = df.dropna()
    # Frequency encoding for 'City'
    city_freq = df['City'].value_counts() / len(df)
    df['City_encoded'] = df['City'].map(city_freq)
    # Extract 'Hour' and 'Minute' from 'Time' (format: HH:MM)
    df['Hour'] = df['Time'].str.split(':').str[0].astype(int)
    df['Minute'] = df['Time'].str.split(':').str[1].astype(int)
    # Scale 'Amount' - ensure proper column names
    scaler = StandardScaler()
    amount_df = df[['Amount']].copy()
    df['Amount_scaled'] = scaler.fit_transform(amount_df)
    # Convert 'Is Fraud?' to binary
    df['Is_Fraud'] = df['Is Fraud?'].map({'Yes': 1, 'No': 0})
    # Drop original columns
    df = df.drop(['City', 'Time', 'Amount', 'Is Fraud?'], axis=1)
    # Reorder columns for clarity
    columns = ['User', 'Year', 'Month', 'Day', 'Hour', 'Minute', 'City_encoded', 'Amount_scaled', 'Is_Fraud']
    df = df[columns]
    return df, scaler, city_freq

def preprocess_single_transaction(transaction, scaler, city_freq):
    """
    Preprocess a single transaction dict using the same transformations as training data.
    Returns a DataFrame with features ready for prediction.
    """
    # Copy to avoid mutation
    tx = transaction.copy()
    # Frequency encode 'City'
    tx['City_encoded'] = city_freq.get(tx['City'], 0)  # unseen cities get 0
    # Extract 'Hour' and 'Minute' from 'Time'
    time_split = tx['Time'].split(':')
    tx['Hour'] = int(time_split[0])
    tx['Minute'] = int(time_split[1])
    # Scale 'Amount' - ensure proper column names
    amount_array = np.array([[tx['Amount']]])
    tx['Amount_scaled'] = scaler.transform(amount_array)[0, 0]
    # Remove original columns
    for col in ['City', 'Time', 'Amount']:
        tx.pop(col, None)
    # Reorder for model
    feature_order = ['User', 'Year', 'Month', 'Day', 'Hour', 'Minute', 'City_encoded', 'Amount_scaled']
    tx_df = pd.DataFrame([tx])[feature_order]
    return tx_df 