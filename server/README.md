# Quiz Battle Backend Server

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   - Copy `.env.example` to `.env`
   - Update `MONGO_URI` with your MongoDB connection string
   - Example: `mongodb://localhost:27017/quizbattle`

3. **Start MongoDB** (if not already running)
   - Make sure MongoDB is installed and running on your system

4. **Start the Server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Or production mode
   npm start
   ```

5. **Verify Server is Running**
   - You should see: `Server running on port 5000`
   - And: `MongoDB Connected: ...`

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/signup` - Sign up new user (same as register)
- `POST /api/auth/login` - Login user
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `GET /api/leaderboard` - Get leaderboard

## Troubleshooting

- **404 Errors**: Make sure the server is running on port 5000
- **Database Connection Errors**: Check your MongoDB is running and MONGO_URI is correct
- **Port Already in Use**: Change PORT in `.env` or kill the process using port 5000

