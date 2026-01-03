# Backend Module Specification - Streak Heat App

## Overview
This document outlines the backend API requirements for the Streak Heat application - a habit tracking and streak management system with GitHub-style contribution heatmaps.

## Tech Stack Recommendations
- **Framework**: Node.js with Express.js or Fastify
- **Database**: MongoDB Atlas with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt
- **Validation**: Zod schemas
- **Date Handling**: date-fns or dayjs
- **Architecture**: Modular structure with controllers, services, and repositories

---

## Module 1: Authentication Module

### 1.1 User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.2 API Endpoints

#### POST /api/auth/register
- **Purpose**: Create new user account
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string; // min 6 characters
    name: string;
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    user: Omit<User, 'passwordHash'>;
    token: string;
  }
  ```

#### POST /api/auth/login
- **Purpose**: Authenticate existing user
- **Request Body**:
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    user: Omit<User, 'passwordHash'>;
    token: string;
  }
  ```

#### POST /api/auth/logout
- **Purpose**: Invalidate user token
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

#### GET /api/auth/me
- **Purpose**: Get current user info
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```typescript
  {
    success: boolean;
    user: Omit<User, 'passwordHash'>;
  }
  ```

### 1.3 Middleware Requirements
- JWT authentication middleware
- Request validation using Zod schemas
- Rate limiting for auth endpoints
- Password strength validation

---

## Module 2: Task Management Module

### 2.1 Task Model
```typescript
interface Task {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  date: string; // yyyy-MM-dd format
}
```

### 2.2 API Endpoints

#### GET /api/tasks
- **Purpose**: Get tasks for a specific date
- **Headers**: Authorization: Bearer <token>
- **Query Parameters**:
  - `date`: string (yyyy-MM-dd, defaults to today)
- **Response**:
  ```typescript
  {
    success: boolean;
    tasks: Task[];
  }
  ```

#### POST /api/tasks
- **Purpose**: Create new task
- **Headers**: Authorization: Bearer <token>
- **Request Body**:
  ```typescript
  {
    title: string;
    date?: string; // optional, defaults to today
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    task: Task;
  }
  ```

#### PUT /api/tasks/:taskId
- **Purpose**: Update task (toggle completion)
- **Headers**: Authorization: Bearer <token>
- **Request Body**:
  ```typescript
  {
    completed: boolean;
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    task: Task;
  }
  ```

#### DELETE /api/tasks/:taskId
- **Purpose**: Delete task
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```typescript
  {
    success: boolean;
    message: string;
  }
  ```

### 2.3 Validation Rules
- Task title: max 100 characters, required
- Date format: yyyy-MM-dd
- Users can only access their own tasks

---

## Module 3: Day Records Module

### 3.1 DayRecord Model
```typescript
interface DayRecord {
  id: string;
  userId: string;
  date: string; // yyyy-MM-dd
  tasks: Task[];
  isSuccessful: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 API Endpoints

#### GET /api/records
- **Purpose**: Get day records for heatmap
- **Headers**: Authorization: Bearer <token>
- **Query Parameters**:
  - `startDate`: string (yyyy-MM-dd)
  - `endDate`: string (yyyy-MM-dd)
- **Response**:
  ```typescript
  {
    success: boolean;
    records: DayRecord[];
  }
  ```

#### GET /api/records/today
- **Purpose**: Get today's record
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```typescript
  {
    success: boolean;
    record: DayRecord | null;
  }
  ```

#### GET /api/records/yesterday
- **Purpose**: Get yesterday's record
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```typescript
  {
    success: boolean;
    record: DayRecord | null;
  }
  ```

### 3.3 Business Logic
- Automatically create/update day records when tasks are modified
- Mark day as successful if at least one task is completed
- Handle timezone considerations properly

---

## Module 4: Statistics Module

### 4.1 StreakStats Model
```typescript
interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysDisciplined: number;
  completionRate: number;
}
```

### 4.2 API Endpoints

#### GET /api/stats
- **Purpose**: Get user's streak statistics
- **Headers**: Authorization: Bearer <token>
- **Response**:
  ```typescript
  {
    success: boolean;
    stats: StreakStats;
  }
  ```

#### GET /api/stats/calendar
- **Purpose**: Get calendar data for heatmap visualization
- **Headers**: Authorization: Bearer <token>
- **Query Parameters**:
  - `days`: number (default 365)
- **Response**:
  ```typescript
  {
    success: boolean;
    data: Array<{
      date: string;
      level: number; // 0-5 for intensity
      count: number; // tasks completed
    }>;
  }
  ```

### 4.3 Calculation Logic
- **Current Streak**: Consecutive successful days ending before today
- **Longest Streak**: Maximum consecutive successful days in history
- **Total Days**: Count of all successful days
- **Completion Rate**: (Successful days / Total days with activity) * 100

---

## Module 5: Database Schema

### 5.1 MongoDB Schema (Mongoose Models)

#### User Model
```javascript
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 60 // bcrypt hash length
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

// Indexes for performance
userSchema.index({ email: 1 });
```

#### Task Model
```javascript
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/, // yyyy-MM-dd format
    index: true
  }
}, {
  timestamps: true
});

// Compound index for user tasks by date
taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, completed: 1 });
```

#### DayRecord Model
```javascript
const dayRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  },
  isSuccessful: {
    type: Boolean,
    default: false
  },
  taskCount: {
    type: Number,
    default: 0,
    min: 0
  },
  completedTaskCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Unique index for user-date combination
dayRecordSchema.index({ userId: 1, date: 1 }, { unique: true });
dayRecordSchema.index({ userId: 1, isSuccessful: 1 });
```

### 5.2 MongoDB Connection Setup

#### Mongoose Connection
```javascript
// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = connectDB;
```

#### Model Exports
```javascript
// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 60
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      return ret;
    }
  }
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
```

```javascript
// models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  completed: {
    type: Boolean,
    default: false
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  }
}, {
  timestamps: true
});

taskSchema.index({ userId: 1, date: 1 });
taskSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model('Task', taskSchema);
```

```javascript
// models/DayRecord.js
const mongoose = require('mongoose');

const dayRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: String,
    required: true,
    match: /^\d{4}-\d{2}-\d{2}$/,
    index: true
  },
  isSuccessful: {
    type: Boolean,
    default: false
  },
  taskCount: {
    type: Number,
    default: 0,
    min: 0
  },
  completedTaskCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

dayRecordSchema.index({ userId: 1, date: 1 }, { unique: true });
dayRecordSchema.index({ userId: 1, isSuccessful: 1 });

module.exports = mongoose.model('DayRecord', dayRecordSchema);
```

---

## Module 6: Middleware & Utilities

### 6.1 Authentication Middleware
```typescript
interface AuthMiddleware {
  verifyToken(token: string): Promise<User | null>;
  attachUser(req: Request, res: Response, next: NextFunction): void;
}
```

### 6.2 Validation Middleware
```typescript
// Zod schemas for request validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(255)
});

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});
```

### 6.3 Error Handling
```typescript
interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

// Standard error responses
const errorResponses = {
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Invalid token', statusCode: 401 },
  FORBIDDEN: { code: 'FORBIDDEN', message: 'Access denied', statusCode: 403 },
  NOT_FOUND: { code: 'NOT_FOUND', message: 'Resource not found', statusCode: 404 },
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Invalid input', statusCode: 400 }
};
```

---

## Module 7: Background Jobs & Cron Tasks

### 7.1 Daily Streak Check
- **Purpose**: Check if yesterday's tasks were completed
- **Schedule**: Run daily at 00:01 UTC
- **Logic**: 
  - Find all users who didn't complete tasks yesterday
  - Reset their current streak to 0
  - Send notifications (optional)

### 7.2 Data Cleanup
- **Purpose**: Clean up old data and optimize database
- **Schedule**: Weekly cleanup
- **Tasks**:
  - Archive old day records (older than 2 years)
  - Update database statistics
  - Clear expired tokens

---

## Module 8: API Response Format

### 8.1 Standard Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

### 8.2 Standard Error Response
```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 8.3 Pagination Response
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## Module 9: Security Considerations

### 9.1 Authentication Security
- Use bcrypt for password hashing (cost factor 12+)
- JWT tokens with reasonable expiration (7-30 days)
- Refresh token mechanism for long sessions
- Rate limiting on auth endpoints

### 9.2 Data Security
- Input validation on all endpoints
- NoSQL injection prevention (use Mongoose validation)
- XSS protection in responses
- CORS configuration for frontend domain
- MongoDB Atlas network access controls (IP whitelisting)

### 9.3 Privacy & GDPR
- User data deletion endpoints
- Data export functionality
- Clear data retention policies
- Secure password reset flow

---

## Module 10: Deployment & Environment

### 10.1 Environment Variables
```bash
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/streak_heat?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Email (optional for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 10.2 Docker Configuration
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## Module 11: MongoDB Atlas Specific Considerations

### 11.1 Atlas Configuration
- **Cluster Tier**: M10 or higher for production
- **Region**: Choose region closest to your users
- **Backup**: Enable automatic backups
- **Monitoring**: Set up performance monitoring alerts

### 11.2 Connection Best Practices
```javascript
// Production connection string with options
const MONGODB_URI = `mongodb+srv://${username}:${password}@${cluster}.mongodb.net/${database}?retryWrites=true&w=majority&appName=StreakHeat`;

// Connection options for Atlas
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
};
```

### 11.3 Atlas Security Setup
- Enable IP whitelisting for your server IPs
- Use database users with least privilege access
- Enable encryption at rest (default in Atlas)
- Set up VPC peering if using cloud providers

### 11.4 Performance Optimization
- Create compound indexes for common queries
- Use Atlas Performance Advisor for query optimization
- Monitor slow queries using Atlas logs
- Consider read replicas for read-heavy operations

### 11.5 Data Migration & Seeding
```javascript
// scripts/seedDatabase.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const DayRecord = require('../models/DayRecord');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    await DayRecord.deleteMany({});
    
    // Create sample data
    // ... seeding logic
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
```

---

## Implementation Priority

### Phase 1: Core Functionality
1. Authentication Module
2. Task Management Module
3. Basic Database Schema

### Phase 2: Statistics & Visualization
4. Day Records Module
5. Statistics Module
6. Background Jobs

### Phase 3: Production Ready
7. Security Hardening
8. Error Handling & Logging
9. Performance Optimization
10. Deployment Configuration

---

## Testing Strategy

### Unit Tests
- All service functions
- Validation schemas
- Utility functions

### Integration Tests
- API endpoints with database
- Authentication flow
- Task CRUD operations

### E2E Tests
- Complete user journey
- Streak calculations
- Data consistency

---

This specification provides a comprehensive foundation for building the backend API that supports your Streak Heat frontend application. The modular structure allows for incremental development and easy maintenance.
