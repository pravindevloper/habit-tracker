# 🔥 Streak Heat

> Consistency over motivation - Build daily habits and maintain your streak!

## 📋 Overview

Streak Heat is a powerful task management application designed to help you build and maintain daily habits through consistent task completion. Track your progress, visualize your streaks, and stay motivated with comprehensive analytics.

## ✨ Features

### 🎯 Core Functionality
- **Task Management**: Create, complete, and delete daily tasks
- **Smart Streaks**: Streaks only count when ALL tasks are completed
- **Real-time Progress**: Live updates as you complete tasks
- **Day Records**: Automatic tracking of daily performance

### 📊 Analytics Dashboard
- **Streak Overview**: Current, longest, and total disciplined days
- **Performance Analytics**: Weekly, monthly, and yearly completion rates
- **Task Statistics**: Overall task completion metrics
- **Monthly Insights**: Best and worst performing months
- **Calendar Heatmap**: Visual representation of your consistency

### 🔐 Authentication
- **Secure Login/Registration**: JWT-based authentication
- **Protected Routes**: All data is secured behind authentication
- **Token Management**: Automatic token refresh and validation

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Zod** - Input validation
- **date-fns** - Date utilities

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **date-fns** - Date utilities

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/streak-heat.git
   cd streak-heat
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/streak-heat?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
   PORT=3000
   FRONTEND_URL=http://localhost:5173
   ```

4. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the Application**
   
   **Backend** (in `backend/` directory):
   ```bash
   npm run dev
   ```
   
   **Frontend** (in `frontend/` directory):
   ```bash
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks?date=yyyy-MM-dd` - Get tasks for specific date
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:taskId` - Update task completion
- `DELETE /api/tasks/:taskId` - Delete task

### Statistics
- `GET /api/stats` - Get basic streak statistics
- `GET /api/stats/detailed` - Get detailed analytics
- `GET /api/records` - Get day records for date range
- `GET /api/records/today` - Get today's record
- `GET /api/records/calendar` - Get calendar heatmap data

## 🎯 How It Works

### Streak Logic
- ✅ **Day is successful** when ALL tasks for that day are completed
- ✅ **Streak increases** only for previous successful days (not today)
- ✅ **Today's progress** affects tomorrow's streak calculation

### Task Management
1. Create tasks for the current day
2. Complete tasks by checking them off
3. All tasks must be completed to maintain streak
4. View progress in real-time with visual indicators

### Analytics
- Track performance across different time periods
- Identify patterns in your consistency
- Monitor task completion rates
- Compare monthly performance

## 🗂 Project Structure

```
streak-heat/
├── backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── taskController.js    # Task management
│   │   ├── statsController.js   # Statistics & analytics
│   │   └── dayRecordController.js # Day records
│   ├── middleware/
│   │   └── auth.js              # JWT authentication
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Task.js              # Task schema
│   │   └── DayRecord.js         # Day record schema
│   ├── routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── tasks.js             # Task routes
│   │   ├── stats.js             # Stats routes
│   │   └── dayRecords.js        # Day record routes
│   ├── utils/
│   │   ├── jwt.js               # JWT utilities
│   │   └── validation.js        # Input validation schemas
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Express server
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # React context
│   │   ├── lib/                 # Utilities & API client
│   │   └── types/               # TypeScript types
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Frontend build
cd frontend
npm run build

# Backend production
cd backend
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB Atlas** for providing the database infrastructure
- **Vite** for the fast development experience
- **TailwindCSS** for the utility-first CSS framework
- **Lucide Icons** for the beautiful icon set

## 📞 Support

If you have any questions or need support, please:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

---

**Built with ❤️ for habit enthusiasts and productivity hackers**
