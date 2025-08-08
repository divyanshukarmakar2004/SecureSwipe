import sys
import pandas as pd
import argparse
from data_preprocessing import load_and_preprocess_data
from model_training import train_and_evaluate_models
from predict import predict_transaction
from utils import load_model, save_model
from user_amount_analysis import UserAmountAnalyzer
import joblib

def load_city_freq(filename):
    return pd.read_pickle(filename)

def process_new_transactions(new_file, output_file, model, scaler, city_freq, amount_analyzer):
    """
    Loads new transactions, predicts fraud, saves flagged transactions to output_file.
    """
    try:
        new_df = pd.read_csv(new_file)
        flagged = []
        
        for _, row in new_df.iterrows():
            tx = row.to_dict()
            pred, analysis = predict_transaction(tx, model, scaler, city_freq, amount_analyzer)
            if pred == 1:
                tx['Prediction'] = pred
                tx['Pattern'] = analysis.get('pattern_explanation', 'No pattern explanation')
                flagged.append(tx)
        
        if flagged:
            flagged_df = pd.DataFrame(flagged)
            flagged_df.to_csv(output_file, index=False)
            print(f"Flagged {len(flagged)} transactions as fraud. Saved to {output_file}.")
        else:
            print("No transactions flagged as fraud.")
            
    except FileNotFoundError:
        print(f"Error: {new_file} not found.")
    except Exception as e:
        print(f"Error processing transactions: {e}")

def main():
    parser = argparse.ArgumentParser(description='AI-powered Fraud Detection System')
    parser.add_argument('--process', nargs=2, metavar=('NEW_FILE', 'OUTPUT_FILE'),
                        help='Process new transactions and flag frauds')
    args = parser.parse_args()

    if args.process:
        try:
            model = load_model('fraud_detection_model.pkl')
            scaler = load_model('scaler.pkl')
            city_freq = load_city_freq('city_freq.pkl')
            
            # Load amount analyzer
            amount_analyzer = UserAmountAnalyzer()
            amount_analyzer.load_analyzer('user_amount_analyzer.pkl')
            
            process_new_transactions(args.process[0], args.process[1], model, scaler, city_freq, amount_analyzer)
        except FileNotFoundError:
            print("Error: Model files not found. Please run without --process first to train the model.")
        return

    # Train and evaluate model
    print('Loading and preprocessing data...')
    try:
        df, scaler, city_freq = load_and_preprocess_data('CodeZilla_dataset.csv')
        print('Training and evaluating models...')
        model, scaler, city_freq = train_and_evaluate_models(df, scaler, city_freq)
        
        # Initialize and train amount analyzer
        print('Training user amount analyzer...')
        amount_analyzer = UserAmountAnalyzer()
        amount_analyzer.calculate_user_averages('CodeZilla_dataset.csv')
        
        # Save model artifacts
        save_model(model, 'fraud_detection_model.pkl')
        save_model(scaler, 'scaler.pkl')
        city_freq.to_pickle('city_freq.pkl')
        amount_analyzer.save_analyzer('user_amount_analyzer.pkl')
        print("Model training completed successfully.")
        
        # Test prediction with amount analysis
        sample_tx = {
            'User': 1,
            'City': 'Farrukhabad',
            'Year': 2025,
            'Month': 9,
            'Day': 1,
            'Time': '6:21',
            'Amount': 1033678.356
        }
        pred, analysis = predict_transaction(sample_tx, model, scaler, city_freq, amount_analyzer)
        print(f"Sample prediction: {'FRAUD' if pred == 1 else 'NOT FRAUD'}")
        
    except FileNotFoundError:
        print("Error: CodeZilla_dataset.csv not found in current directory.")
    except Exception as e:
        print(f"Error during training: {e}")

if __name__ == '__main__':
    main()