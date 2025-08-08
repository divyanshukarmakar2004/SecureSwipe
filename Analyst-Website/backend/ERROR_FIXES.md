# 🚨 Terminal Error Fixes

## Common Errors & Solutions

### 1. **Firebase Configuration Error**

```
Error: Firebase connection failed
Error: Invalid service account credentials
```

**Solution:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `fraud-transaction-6a728`
3. Go to **Project Settings** → **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file
6. Update `config.env` with real values:

```env
FIREBASE_PROJECT_ID=fraud-transaction-6a728
FIREBASE_PRIVATE_KEY_ID=actual-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nActual Private Key From JSON\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=actual-service-account@fraud-transaction-6a728.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=actual-client-id-from-json
```

### 2. **Port Already in Use Error**

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**

```bash
# Option 1: Kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Option 2: Change port in config.env
PORT=5001
```

### 3. **Module Not Found Error**

```
Error: Cannot find module 'express'
Error: Cannot find module 'firebase-admin'
```

**Solution:**

```bash
cd backend
npm install
```

### 4. **Permission Denied Error**

```
Error: EACCES: permission denied
```

**Solution:**

```bash
# Run as administrator or fix permissions
# On Windows: Right-click PowerShell → Run as Administrator
# On Mac/Linux: sudo npm install
```

### 5. **Node Version Error**

```
Error: Node.js version not supported
```

**Solution:**

```bash
# Check Node version
node --version

# Install Node.js 14+ if needed
# Download from: https://nodejs.org/
```

### 6. **Firebase Database Rules Error**

```
Error: Permission denied at /User
```

**Solution:**

1. Go to Firebase Console → Realtime Database
2. Go to **Rules** tab
3. Update rules to allow read access:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 7. **CORS Error (Frontend Connection)**

```
Error: CORS policy blocked request
```

**Solution:**

1. Check `FRONTEND_URL` in `config.env`
2. Make sure frontend is running on correct port
3. Update CORS configuration if needed

### 8. **Environment File Not Found**

```
Error: Cannot find module './config.env'
```

**Solution:**

```bash
# Make sure config.env exists in backend folder
ls backend/config.env

# If missing, create it with your Firebase credentials
```

## 🔧 Quick Fix Commands

### Install Dependencies

```bash
cd backend
npm install
```

### Start Server

```bash
npm run dev
```

### Test API

```bash
# Health check
curl http://localhost:5000/health

# Test users endpoint
curl http://localhost:5000/api/users
```

### Seed Data

```bash
npm run seed
```

### Clear Data

```bash
npm run clear
```

## 🚀 Step-by-Step Setup

1. **Fix Firebase Configuration:**

   ```bash
   # Update config.env with real Firebase credentials
   # Download service account JSON from Firebase Console
   ```

2. **Install Dependencies:**

   ```bash
   cd backend
   npm install
   ```

3. **Seed Sample Data:**

   ```bash
   npm run seed
   ```

4. **Start Server:**

   ```bash
   npm run dev
   ```

5. **Test API:**
   ```bash
   curl http://localhost:5000/health
   ```

## 📞 Still Having Issues?

If you're still getting errors, please share the exact error message and I'll help you fix it!

Common error patterns:

- `Error: Firebase...` → Fix Firebase credentials
- `Error: listen EADDRINUSE` → Change port or kill process
- `Error: Cannot find module` → Run `npm install`
- `Error: Permission denied` → Run as administrator


