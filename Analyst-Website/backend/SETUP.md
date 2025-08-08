# 🚀 Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Firebase Configuration

### 2.1 Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file

### 2.2 Update Environment Variables

1. Open `config.env` file
2. Replace the placeholder values with your actual Firebase credentials from the downloaded JSON file:

```env
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY_ID=your-actual-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Actual Private Key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-actual-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-actual-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-actual-service-account%40your-project.iam.gserviceaccount.com
```

## Step 3: Seed Sample Data

```bash
npm run seed
```

This will populate your Firebase database with sample users, transactions, and flagged transactions.

## Step 4: Start the Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Step 5: Test the API

### Health Check

```bash
curl http://localhost:5000/health
```

### Get All Users

```bash
curl http://localhost:5000/api/users
```

### Get Analytics Data

```bash
curl http://localhost:5000/api/analytics/dashboard-summary
```

## 🔧 Useful Commands

- `npm run dev` - Start development server
- `npm run seed` - Seed sample data to Firebase
- `npm run clear` - Clear all data from Firebase
- `npm run count` - Show current data count

## 📊 API Endpoints

Once running, you can access these endpoints:

- **Health**: `GET /health`
- **Users**: `GET /api/users`
- **Transactions**: `GET /api/transactions`
- **Flagged Transactions**: `GET /api/flagged-transactions`
- **Analytics**: `GET /api/analytics/dashboard-summary`

## 🎯 Next Steps

1. ✅ Backend is ready
2. 🔄 Update frontend to use real API endpoints
3. 🚀 Connect frontend and backend

## 🐛 Troubleshooting

### Firebase Connection Issues

- Double-check your credentials in `config.env`
- Ensure your Firebase project has Realtime Database enabled
- Verify database rules allow read access

### Port Issues

- Change `PORT=5000` in `config.env` if port 5000 is in use

### CORS Issues

- Update `FRONTEND_URL` in `config.env` to match your frontend URL


