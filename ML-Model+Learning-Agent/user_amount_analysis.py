import pandas as pd
import numpy as np
import pickle

class UserAmountAnalyzer:
    """
    Analyzes user-specific transaction amounts and implements fraud detection
    based on amount thresholds relative to user's historical average.
    """
    
    def __init__(self):
        self.user_averages = {}
        self.user_amounts = {}
        
    def calculate_user_averages(self, dataset_path):
        """
        Calculate average transaction amount for each user from historical data.
        """
        df = pd.read_csv(dataset_path)
        
        # Group by user and calculate statistics
        user_stats = df.groupby('User')['Amount'].agg(['mean', 'std', 'count']).reset_index()
        
        # Store user averages and amounts
        for _, row in user_stats.iterrows():
            user_id = row['User']
            self.user_averages[user_id] = {
                'mean': row['mean'],
                'std': row['std'],
                'count': row['count']
            }
            
        # Store all amounts for each user for detailed analysis
        for user_id in df['User'].unique():
            user_amounts = df[df['User'] == user_id]['Amount'].tolist()
            self.user_amounts[user_id] = user_amounts
            
        print(f"Calculated averages for {len(self.user_averages)} users")
        return self.user_averages
    
    def check_amount_fraud(self, user_id, amount):
        """
        Check if amount is suspicious based on user's historical average.
        Returns True if amount is more than 3x the user's average.
        """
        if user_id not in self.user_averages:
            # New user - no historical data
            return False
            
        user_avg = self.user_averages[user_id]['mean']
        threshold = 3 * user_avg
        
        # Check if amount exceeds 3x average
        is_suspicious = abs(amount) > threshold
        
        if is_suspicious:
            print(f"Amount {amount:,.2f} exceeds 3x user {user_id}'s average ({user_avg:,.2f})")
            print(f"Threshold: {threshold:,.2f}")
            
        return is_suspicious
    
    def get_user_stats(self, user_id):
        """
        Get statistics for a specific user.
        """
        if user_id in self.user_averages:
            return self.user_averages[user_id]
        return None
    
    def save_analyzer(self, filename):
        """
        Save the analyzer state to a file.
        """
        with open(filename, 'wb') as f:
            pickle.dump({
                'user_averages': self.user_averages,
                'user_amounts': self.user_amounts
            }, f)
    
    def load_analyzer(self, filename):
        """
        Load the analyzer state from a file.
        """
        with open(filename, 'rb') as f:
            data = pickle.load(f)
            self.user_averages = data['user_averages']
            self.user_amounts = data['user_amounts']
