# Quick Start Guide

## The 404 Error Means Your Backend Server Is Not Running!

You need to start the backend server before the frontend can connect to it.

### Step 1: Open a New Terminal Window

Open a **new terminal/command prompt window** (keep your frontend dev server running in the other window).

### Step 2: Navigate to Server Directory

```bash
cd server
```

### Step 3: Install Dependencies (if not already done)

```bash
npm install
```

### Step 4: Make Sure MongoDB is Running

- **Windows**: Make sure MongoDB service is running
- **Mac/Linux**: Run `mongod` in a separate terminal if not running as a service

If you don't have MongoDB installed, you can use MongoDB Atlas (free cloud database):
- Sign up at https://www.mongodb.com/cloud/atlas
- Get your connection string
- Update `server/.env` with your MongoDB Atlas connection string

### Step 5: Create .env File (if it doesn't exist)

Create a file named `.env` in the `server` folder with:

```env
MONGO_URI=mongodb://localhost:27017/quizbattle
PORT=5000
JWT_SECRET=quiz-battle-secret-key-12345
```

### Step 6: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

### Step 7: Verify It's Working

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Troubleshooting

**Port 5000 already in use?**
- Change `PORT=5000` to `PORT=5001` in `.env`
- Update `clint/utils/api.js` baseURL to `http://localhost:5001/api`

**MongoDB connection error?**
- Check MongoDB is running
- Verify MONGO_URI in `.env` is correct
- For MongoDB Atlas: Make sure your IP is whitelisted

**Still getting 404?**
- Make sure the server shows "Server running on port 5000"
- Check browser console - the request should go to `http://localhost:5000/api/auth/signup`
- Verify the server terminal shows the request being received

