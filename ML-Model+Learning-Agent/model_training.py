import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
from utils import save_model, calculate_metrics

def train_and_evaluate_models(df, scaler, city_freq):
    """
    Sorts data chronologically, splits into train/test, trains ensemble, evaluates, saves model and artifacts.
    """
    # Sort chronologically
    df_sorted = df.sort_values(['Year', 'Month', 'Day', 'Hour', 'Minute'])
    # Split 80/20 chronologically
    split_idx = int(0.8 * len(df_sorted))
    train_df = df_sorted.iloc[:split_idx]
    test_df = df_sorted.iloc[split_idx:]
    X_train = train_df.drop('Is_Fraud', axis=1)
    y_train = train_df['Is_Fraud']
    X_test = test_df.drop('Is_Fraud', axis=1)
    y_test = test_df['Is_Fraud']

    # Define base models
    rf = RandomForestClassifier(warm_start=True, n_jobs=-1, random_state=42)
    gb = GradientBoostingClassifier(warm_start=True, random_state=42)
    xgb = XGBClassifier(use_label_encoder=False, eval_metric='logloss', n_jobs=-1, random_state=42)
    lgbm = LGBMClassifier(n_jobs=-1, random_state=42)

    # Stacking ensemble
    estimators = [
        ('rf', rf),
        ('gb', gb),
        ('xgb', xgb),
        ('lgbm', lgbm)
    ]
    stack = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(max_iter=1000, random_state=42),
        n_jobs=-1
    )
    stack.fit(X_train, y_train)

    # Predict and evaluate
    y_pred = stack.predict(X_test)
    y_prob = stack.predict_proba(X_test)[:, 1]
    metrics = calculate_metrics(y_test, y_pred, y_prob)
    print("Model Evaluation Metrics:")
    for k, v in metrics.items():
        print(f"{k}: {v:.4f}")

    # Save model, scaler, city_freq
    save_model(stack, 'fraud_detection_model.pkl')
    save_model(scaler, 'scaler.pkl')
    city_freq.to_pickle('city_freq.pkl')

    return stack, scaler, city_freq 