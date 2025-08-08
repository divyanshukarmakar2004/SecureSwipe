import pandas as pd
import numpy as np
from data_preprocessing import preprocess_single_transaction
from user_amount_analysis import UserAmountAnalyzer

def predict_transaction(transaction, model, scaler, city_freq, amount_analyzer=None, priority='balanced'):
    """
    Preprocesses a single transaction and predicts fraud (1) or not (0) using configurable priority.
    
    Priority options:
    - 'ml_first': ML model has highest priority
    - 'amount_first': Amount analysis has highest priority  
    - 'city_first': City analysis has highest priority
    - 'balanced': Equal weight to all components
    - 'majority': Majority vote (2 out of 3)
    
    Returns prediction (int) and detailed analysis dict.
    """
    # Get ML model prediction
    tx_df = preprocess_single_transaction(transaction, scaler, city_freq)
    ml_prediction = model.predict(tx_df)[0]
    
    # Check user-specific amount analysis
    amount_fraud = False
    if amount_analyzer:
        user_id = transaction['User']
        amount = transaction['Amount']
        amount_fraud = amount_analyzer.check_amount_fraud(user_id, amount)
    
    # Check city analysis (high-risk cities)
    city_fraud = False
    city = transaction['City']
    if city in city_freq:
        city_risk = city_freq[city]
        # Cities with very low frequency (unusual) are suspicious
        city_fraud = city_risk < 0.001  # Less than 0.1% of transactions
    
    # Detailed analysis breakdown
    analysis = {
        'ml_prediction': int(ml_prediction),
        'amount_fraud': amount_fraud,
        'city_fraud': city_fraud,
        'city_risk_score': city_freq.get(city, 0),
        'user_stats': amount_analyzer.get_user_stats(transaction['User']) if amount_analyzer else None
    }
    
    # Apply priority-based decision logic
    if priority == 'ml_first':
        final_prediction = ml_prediction
        decision_reason = f"ML Model Priority: {'FRAUD' if ml_prediction == 1 else 'NOT FRAUD'}"
        
    elif priority == 'amount_first':
        if amount_analyzer and transaction['User'] in amount_analyzer.user_averages:
            final_prediction = 1 if amount_fraud else 0
            decision_reason = f"Amount Priority: {'FRAUD' if amount_fraud else 'NOT FRAUD'}"
        else:
            final_prediction = ml_prediction
            decision_reason = f"Amount Priority (New User): ML Model {'FRAUD' if ml_prediction == 1 else 'NOT FRAUD'}"
            
    elif priority == 'city_first':
        final_prediction = 1 if city_fraud else 0
        decision_reason = f"City Priority: {'FRAUD' if city_fraud else 'NOT FRAUD'}"
        
    elif priority == 'majority':
        votes = [ml_prediction, int(amount_fraud), int(city_fraud)]
        final_prediction = 1 if sum(votes) >= 2 else 0
        decision_reason = f"Majority Vote: {sum(votes)}/3 flags = {'FRAUD' if final_prediction == 1 else 'NOT FRAUD'}"
        
    else:  # balanced - OR logic (current default)
        final_prediction = 1 if (ml_prediction == 1 or amount_fraud or city_fraud) else 0
        decision_reason = f"Balanced (OR Logic): {'FRAUD' if final_prediction == 1 else 'NOT FRAUD'}"
    
    # Generate simple pattern explanation
    pattern_explanation = generate_pattern_explanation(transaction, ml_prediction, amount_fraud, city_fraud, city_risk, amount_analyzer)
    
    # Print detailed analysis
    print(f"ML Model Prediction: {'FRAUD' if ml_prediction == 1 else 'NOT FRAUD'}")
    print(f"Amount Analysis: {'FRAUD' if amount_fraud else 'NOT FRAUD'}")
    print(f"City Analysis: {'FRAUD' if city_fraud else 'NOT FRAUD'} (Risk: {city_freq.get(city, 0):.4f})")
    print(f"Priority Method: {priority}")
    print(f"Decision: {decision_reason}")
    
    if amount_analyzer and transaction['User'] in amount_analyzer.user_averages:
        user_stats = amount_analyzer.get_user_stats(transaction['User'])
        print(f"User {transaction['User']} average: {user_stats['mean']:,.2f}")
        print(f"User {transaction['User']} threshold (3x avg): {3 * user_stats['mean']:,.2f}")
    
    print(f"Final Decision: {'FRAUD' if final_prediction == 1 else 'NOT FRAUD'}")
    print(f"Pattern: {pattern_explanation}")
    print("-" * 50)
    
    analysis['final_prediction'] = int(final_prediction)
    analysis['decision_reason'] = decision_reason
    analysis['priority_method'] = priority
    analysis['pattern_explanation'] = pattern_explanation
    
    return int(final_prediction), analysis

def generate_pattern_explanation(transaction, ml_prediction, amount_fraud, city_fraud, city_risk, amount_analyzer):
    """
    Generate a simple one-sentence explanation of the pattern that led to the prediction.
    """
    amount = transaction['Amount']
    city = transaction['City']
    user_id = transaction['User']
    
    # Get user stats if available
    user_avg = None
    if amount_analyzer and user_id in amount_analyzer.user_averages:
        user_stats = amount_analyzer.get_user_stats(user_id)
        user_avg = user_stats['mean']
    
    # Determine the main pattern that influenced the decision
    if amount_fraud and user_avg:
        return f"Amount {amount:,.0f} is unusually high (3x above user's average of {user_avg:,.0f})"
    elif city_fraud:
        return f"City '{city}' is rarely used in transactions (risk score: {city_risk:.4f})"
    elif ml_prediction == 1:
        return f"ML model detected suspicious patterns in transaction features"
    elif amount_analyzer and user_id not in amount_analyzer.user_averages:
        return f"New user with no transaction history for amount comparison"
    else:
        return f"Transaction appears normal based on amount, city, and user patterns" 