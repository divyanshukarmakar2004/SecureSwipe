import argparse
import os
import csv
import pandas as pd
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from predict import predict_transaction
from utils import load_model, save_model
from user_amount_analysis import UserAmountAnalyzer
from data_preprocessing import preprocess_single_transaction
from model_training import train_and_evaluate_models
import joblib
from dotenv import load_dotenv;

load_dotenv()

# --- Constants ---
HF_API_URL = "https://api-inference.huggingface.co/models/distilgpt2"
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
MITIGATION_FEEDBACK_FILE = "mitigation_feedback.csv"
FEEDBACK_FILE = "feedback_data.csv"
DATASET_FILE = "CodeZilla_dataset.csv"

# --- FastAPI App ---
app = FastAPI(
    title="Fraud Mitigation Advisor Agent",
    description="Detects fraud, suggests mitigation, and adapts based on feedback.",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class Transaction(BaseModel):
    User: int
    City: str
    Year: int
    Month: int
    Day: int
    Time: str
    Amount: float

class Feedback(Transaction):
    Is_Fraud: str = Field(..., pattern="^(Yes|No)$")

class MitigationFeedback(Transaction):
    Mitigation: str
    Outcome: str = Field(..., pattern="^(Success|Failure)$")

# --- Utility Functions ---
def load_artifacts():
    try:
        model = load_model('fraud_detection_model.pkl')
        scaler = load_model('scaler.pkl')
        city_freq = pd.read_pickle('city_freq.pkl')
        amount_analyzer = UserAmountAnalyzer()
        amount_analyzer.load_analyzer('user_amount_analyzer.pkl')
        return model, scaler, city_freq, amount_analyzer
    except Exception as e:
        print(f"[ERROR] Failed to load model artifacts: {e}")
        raise

def get_user_avg(user_id, amount_analyzer):
    stats = amount_analyzer.get_user_stats(user_id)
    if stats and stats.get("mean") is not None:
        return stats["mean"]
    return None

def calculate_time_risk(time_str):
    try:
        hour = int(time_str.split(":")[0])
        return 1 if hour >= 20 or hour < 6 else 0
    except Exception:
        return 0

def calculate_risk_score(pred_prob, amount, user_avg, time_str):
    # pred_prob: model's probability of fraud (0-1)
    # amount: transaction amount
    # user_avg: user's average amount
    # time_str: transaction time (HH:MM)
    try:
        amount_deviation = abs(amount / user_avg) if user_avg and user_avg > 0 else 1
    except Exception:
        amount_deviation = 1
    time_risk = calculate_time_risk(time_str)
    risk_score = (pred_prob * 100 * 0.7) + (amount_deviation * 100 * 0.2) + (time_risk * 10)
    risk_score = min(100, max(0, int(round(risk_score))))
    return risk_score

def get_mitigation_suggestion(risk_score, amount, time, city):
    prompt = (
        f"Suggest a mitigation for a transaction with risk score {risk_score}, "
        f"amount {amount:,.0f}, at {time} in {city}. "
        "Be concise and actionable."
    )
    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {"inputs": prompt, "options": {"wait_for_model": True}}
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
                suggestion = result[0]["generated_text"].split("\n")[0].strip()
                return suggestion
            elif isinstance(result, dict) and "generated_text" in result:
                return result["generated_text"].split("\n")[0].strip()
            elif isinstance(result, list) and len(result) > 0 and "text" in result[0]:
                return result[0]["text"].split("\n")[0].strip()
        print(f"[WARN] HuggingFace API fallback, status: {response.status_code}, body: {response.text}")
    except Exception as e:
        print(f"[ERROR] HuggingFace API call failed: {e}")
    # Fallback
    if risk_score >= 80:
        return "Freeze account for 24 hours and review manually."
    elif risk_score >= 60:
        return "Monitor account activity and notify user."
    elif risk_score >= 40:
        return "Send alert to user and flag for review."
    else:
        return "No immediate action required. Monitor for unusual activity."

def append_csv(filename, row, header):
    file_exists = os.path.isfile(filename)
    try:
        with open(filename, "a", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=header)
            if not file_exists:
                writer.writeheader()
            writer.writerow(row)
    except Exception as e:
        print(f"[ERROR] Failed to write to {filename}: {e}")
        raise

# --- FastAPI Endpoints ---
@app.post("/predict")
def predict(transaction: Transaction):
    try:
        model, scaler, city_freq, amount_analyzer = load_artifacts()
        # Get model prediction and probability
        tx_dict = transaction.dict()
        tx_df = preprocess_single_transaction(tx_dict, scaler, city_freq)
        pred_prob = 0.0
        try:
            # For sklearn-like models
            pred_prob = float(model.predict_proba(tx_df)[0][1])
        except Exception:
            # For models without predict_proba, fallback to binary prediction
            pred_prob = float(model.predict(tx_df)[0])
        pred_label, analysis = predict_transaction(
            tx_dict, model, scaler, city_freq, amount_analyzer
        )
        user_avg = get_user_avg(transaction.User, amount_analyzer)
        risk_score = calculate_risk_score(pred_prob, transaction.Amount, user_avg, transaction.Time)
        mitigation = get_mitigation_suggestion(risk_score, transaction.Amount, transaction.Time, transaction.City)
        return {
            "prediction": "FRAUD" if pred_label == 1 else "NOT FRAUD",
            "risk_score": risk_score,
            "mitigation": mitigation,
            "pattern": analysis.get("pattern_explanation", ""),
        }
    except Exception as e:
        print(f"[ERROR] /predict failed: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed.")

@app.post("/feedback")
def feedback(feedback: Feedback):
    row = feedback.dict()
    header = ["User", "City", "Year", "Month", "Day", "Time", "Amount", "Is_Fraud"]
    try:
        append_csv(FEEDBACK_FILE, row, header)
        return {"message": "Feedback recorded successfully."}
    except Exception as e:
        print(f"[ERROR] /feedback failed: {e}")
        raise HTTPException(status_code=500, detail="Feedback recording failed.")

@app.post("/mitigation_feedback")
def mitigation_feedback(mitigation_feedback: MitigationFeedback):
    row = mitigation_feedback.dict()
    header = [
        "User", "City", "Year", "Month", "Day", "Time", "Amount",
        "Mitigation", "Outcome"
    ]
    try:
        append_csv(MITIGATION_FEEDBACK_FILE, row, header)
        return {"message": "Mitigation feedback recorded successfully."}
    except Exception as e:
        print(f"[ERROR] /mitigation_feedback failed: {e}")
        raise HTTPException(status_code=500, detail="Mitigation feedback recording failed.")

# --- Retraining Logic ---
def retrain():
    print("[INFO] Starting retraining process...")
    try:
        # Load main dataset
        df_main = pd.read_csv(DATASET_FILE)
        # Load feedback data
        df_feedback = pd.read_csv(FEEDBACK_FILE) if os.path.isfile(FEEDBACK_FILE) else pd.DataFrame()
        # Load mitigation feedback
        df_mitigation = pd.read_csv(MITIGATION_FEEDBACK_FILE) if os.path.isfile(MITIGATION_FEEDBACK_FILE) else pd.DataFrame()
        # Prepare mitigation weights
        if not df_mitigation.empty:
            df_mitigation["weight"] = df_mitigation["Outcome"].map(lambda x: 2 if x == "Success" else 1)
        # Combine all data
        dfs = [df_main]
        if not df_feedback.empty:
            # Map Is_Fraud to binary for consistency
            df_feedback = df_feedback.rename(columns={"Is_Fraud": "Is Fraud?"})
            dfs.append(df_feedback)
        if not df_mitigation.empty:
            # Map Mitigation/Outcome to Is Fraud? for retraining
            df_mitigation = df_mitigation.rename(columns={"Mitigation": "Mitigation", "Outcome": "Outcome"})
            # For retraining, treat all mitigation feedback as fraud (since mitigation was applied)
            df_mitigation["Is Fraud?"] = "Yes"
            dfs.append(df_mitigation)
        df_all = pd.concat(dfs, ignore_index=True)
        # Apply weights for mitigation feedback
        if not df_mitigation.empty:
            weights = np.ones(len(df_all))
            start_idx = len(df_all) - len(df_mitigation)
            weights[start_idx:] = df_mitigation["weight"].values
            # Sample with weights (oversample successful mitigations)
            df_all = df_all.sample(n=len(df_all), replace=True, weights=weights, random_state=42)
        # Preprocess and retrain
        from data_preprocessing import load_and_preprocess_data
        df_all.to_csv("retrain_combined.csv", index=False)
        df_pre, scaler, city_freq = load_and_preprocess_data("retrain_combined.csv")
        model, scaler, city_freq = train_and_evaluate_models(df_pre, scaler, city_freq)
        # Save new artifacts
        save_model(model, "fraud_detection_model_new.pkl")
        save_model(scaler, "scaler_new.pkl")
        city_freq.to_pickle("city_freq_new.pkl")
        # Update user amount analyzer
        amount_analyzer = UserAmountAnalyzer()
        amount_analyzer.calculate_user_averages("retrain_combined.csv")
        amount_analyzer.save_analyzer("user_amount_analyzer_new.pkl")
        print("[INFO] Retraining completed. New model artifacts saved with _new suffix.")
    except Exception as e:
        print(f"[ERROR] Retraining failed: {e}")

# --- Main Entrypoint ---
def main():
    parser = argparse.ArgumentParser(description="Fraud Mitigation Advisor Agent")
    parser.add_argument("--retrain", action="store_true", help="Retrain the model with feedback and mitigation data")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind the server to")
    parser.add_argument("--port", default=8000, type=int, help="Port to bind the server to")
    args = parser.parse_args()
    
    if args.retrain:
        
        retrain()
    else:
        
        import uvicorn
        print(f"[INFO] Starting FastAPI server at http://{args.host}:{args.port}")
        print(f"[INFO] API Documentation: http://{args.host}:{args.port}/docs")
        print(f"[INFO] Make sure your Android app can reach this IP address")
        uvicorn.run("fraud_detection_system:app", host=args.host, port=args.port, reload=False)

if __name__ == "__main__":
    main()
