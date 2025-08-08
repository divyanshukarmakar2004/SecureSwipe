# Fraud Detection Analytics Backend API

A comprehensive Express.js backend API for fraud detection analytics that fetches real-time data from Firebase Realtime Database.

## 🚀 Features

- **Real-time Data Fetching**: Connects to Firebase Realtime Database
- **User Management**: CRUD operations for user data
- **Transaction Analytics**: Comprehensive transaction analysis
- **Fraud Detection**: Flagged transaction monitoring
- **Chart Data**: Analytics data for frontend charts
- **Security**: CORS, Helmet, and proper error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- Firebase project with Realtime Database
- Firebase service account credentials

## 🛠️ Installation

1. **Install Dependencies**

   ```bash
   cd backend
   npm install
   ```

2. **Firebase Setup**

   - Go to your Firebase Console
   - Navigate to Project Settings > Service Accounts
   - Generate a new private key
   - Download the JSON file

3. **Environment Configuration**
   - Copy `config.env.example` to `config.env`
   - Fill in your Firebase credentials from the downloaded JSON file
   - Update the `FRONTEND_URL` if needed

## ⚙️ Configuration

### Firebase Setup

1. **Create Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Enable Realtime Database

2. **Database Structure**
   Your Firebase Realtime Database should have this structure:

   ```json
   {
     "User": {
       "UserID_1": {
         "Name": "Rahul",
         "City": "Mumbai",
         "SendTransaction": {
           "TransactionID_1": {
             "Amount": 1000,
             "Location": "Mumbai",
             "Date": "2025-01-15"
           },
           "TransactionID_2": {
             "Amount": 500,
             "Location": "Delhi",
             "Date": "2025-01-14"
           }
         }
       },
       "UserID_2": {
         "Name": "Priya",
         "City": "Bangalore",
         "SendTransaction": {
           "TransactionID_3": {
             "Amount": 250,
             "Location": "Bangalore",
             "Date": "2025-01-15"
           }
         }
       }
     },
     "FlaggedTransaction": {
       "TransactionID_1": {
         "Amount": 1000,
         "Location": "Mumbai",
         "Date": "2025-01-15",
         "IPAddress": "192.168.1.1"
       },
       "TransactionID_3": {
         "Amount": 250,
         "Location": "Bangalore",
         "Date": "2025-01-15",
         "IPAddress": "192.168.1.2"
       }
     }
   }
   ```

3. **Service Account Setup**
   - In Firebase Console, go to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Copy the values to your `config.env` file

## 🚀 Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### Health Check

- `GET /health` - Server health status

### Users

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/stats` - Get user statistics

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/user/:userId` - Get transactions by user
- `GET /api/transactions/stats/summary` - Get transaction statistics

### Flagged Transactions

- `GET /api/flagged-transactions` - Get all flagged transactions
- `GET /api/flagged-transactions/user/:userId` - Get flagged transactions by user
- `GET /api/flagged-transactions/ip/:ipAddress` - Get flagged transactions by IP
- `GET /api/flagged-transactions/stats/top-ips` - Get top flagged IP addresses
- `GET /api/flagged-transactions/stats/summary` - Get flagged transaction statistics

### Analytics

- `GET /api/analytics/transaction-chart` - Get transaction chart data (last 7 days)
- `GET /api/analytics/ip-chart` - Get IP address chart data
- `GET /api/analytics/dashboard-summary` - Get dashboard summary statistics
- `GET /api/analytics/location-analytics` - Get location-based analytics

## 🔧 Environment Variables

Create a `config.env` file with the following variables:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

## 📁 Project Structure

```
backend/
├── config/
│   └── firebase.js          # Firebase configuration
├── routes/
│   ├── users.js             # User routes
│   ├── transactions.js      # Transaction routes
│   ├── flaggedTransactions.js # Flagged transaction routes
│   └── analytics.js         # Analytics routes
├── utils/
│   └── seedData.js          # Sample data seeder
├── config.env               # Environment variables
├── package.json             # Dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## 🔒 Security Features

- **CORS Protection**: Configured for frontend communication
- **Helmet**: Security headers
- **Input Validation**: Request validation
- **Error Handling**: Comprehensive error handling
- **Logging**: Request logging with Morgan

## 🧪 Testing

Test the API endpoints using tools like:

- Postman
- cURL
- Thunder Client (VS Code extension)

Example cURL commands:

```bash
# Health check
curl http://localhost:5000/health

# Get all users
curl http://localhost:5000/api/users

# Get analytics data
curl http://localhost:5000/api/analytics/dashboard-summary
```

## 🔗 Frontend Integration

The backend is designed to work with the React frontend. Update your frontend API calls to use these endpoints instead of mock data.

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Connection Error**

   - Check your service account credentials
   - Verify the database URL
   - Ensure the database rules allow read access

2. **CORS Error**

   - Verify the `FRONTEND_URL` in config.env
   - Check if the frontend is running on the correct port

3. **Port Already in Use**
   - Change the PORT in config.env
   - Kill the process using the port

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
