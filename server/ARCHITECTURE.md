# Habit Tracker API - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│                  (Web/Mobile Applications)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS Requests
                         │ JSON Payload
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     API Gateway Layer                           │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   CORS       │  │  Body Parser │  │     Auth     │         │
│  │  Middleware  │  │   Middleware │  │  Middleware  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      Route Layer                                │
│                                                                  │
│  /api/auth     /api/categories    /api/habits                  │
│  /api/logs     /api/streaks       /api/health                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Controller Layer                              │
│                                                                  │
│  ┌─────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │    Auth     │ │  Categories  │ │    Habits    │            │
│  │ Controller  │ │  Controller  │ │  Controller  │            │
│  └─────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ┌─────────────┐ ┌──────────────┐                              │
│  │ HabitLogs   │ │   Streaks    │                              │
│  │ Controller  │ │  Controller  │                              │
│  └─────────────┘ └──────────────┘                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Business Logic Layer                          │
│                                                                  │
│  • Authentication & Authorization (JWT)                         │
│  • Habit CRUD Operations                                        │
│  • Streak Calculation Logic                                     │
│  • Data Validation                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Data Access Layer (TypeORM)                   │
│                                                                  │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │   User     │ │ Category   │ │   Habit    │ │ HabitLog   │  │
│  │  Entity    │ │  Entity    │ │  Entity    │ │  Entity    │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                  │
│  ┌────────────┐                                                 │
│  │UserStreak  │                                                 │
│  │  Entity    │                                                 │
│  └────────────┘                                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   Database Layer (PostgreSQL)                   │
│                                                                  │
│  [users] [categories] [habits] [habit_logs] [user_streaks]    │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema & Relationships

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ user_id (PK)        │◄─────┐
│ username            │      │
│ email               │      │ One-to-Many
│ password_hash       │      │
│ created_at          │      │
└─────────────────────┘      │
                              │
┌─────────────────────┐      │      ┌─────────────────────┐
│    categories       │      │      │      habits         │
├─────────────────────┤      │      ├─────────────────────┤
│ category_id (PK)    │◄─────┼──────┤ habit_id (PK)       │
│ name                │      │      │ user_id (FK)        │───┐
│ icon_url            │      │      │ name                │   │
└─────────────────────┘      │      │ description         │   │
        │                    │      │ category_id (FK)    │   │
        │                    └──────┤ frequency           │   │
        │ One-to-Many               │ target_value        │   │
        │                           │ is_active           │   │
        │                           │ created_at          │   │
        │                           └─────────────────────┘   │
        │                                     │                │
        │                                     │ One-to-Many    │
        │                                     │                │
        │                           ┌─────────▼───────────┐   │
        │                           │    habit_logs       │   │
        │                           ├─────────────────────┤   │
        │                           │ log_id (PK)         │   │
        │                           │ habit_id (FK)       │   │
        │                           │ completion_date     │   │
        │                           │ status              │   │
        │                           │ actual_value        │   │
        │                           └─────────────────────┘   │
        │                                                      │
        │                           ┌─────────────────────┐   │
        │                           │   user_streaks      │   │
        │                           ├─────────────────────┤   │
        └───────────────────────────┤ streak_id (PK)      │   │
                                    │ user_id (FK)        │───┘
                                    │ habit_id (FK)       │───┘
                                    │ current_streak      │
                                    │ longest_streak      │
                                    │ last_updated        │
                                    └─────────────────────┘
```

## API Endpoints Overview

### Authentication Flow
```
1. User Registration
   POST /api/auth/register
   ↓
   Password Hashing (bcrypt)
   ↓
   Save User to Database
   ↓
   Generate JWT Token
   ↓
   Return Token + User Info

2. User Login
   POST /api/auth/login
   ↓
   Verify Email Exists
   ↓
   Verify Password (bcrypt.compare)
   ↓
   Generate JWT Token
   ↓
   Return Token + User Info

3. Protected Routes
   Request with Authorization Header
   ↓
   Extract Bearer Token
   ↓
   Verify JWT Token
   ↓
   Extract User ID
   ↓
   Attach to Request Object
   ↓
   Proceed to Controller
```

### Habit Logging & Streak Calculation Flow
```
1. User Logs a Habit
   POST /api/logs
   ↓
   Verify Habit Belongs to User
   ↓
   Check for Duplicate Log (same date)
   ↓
   Save Habit Log
   ↓
   Trigger Streak Update
   ↓
   Calculate Current Streak
   │ ├─ Get all completed logs (sorted by date DESC)
   │ ├─ Check if most recent log is today or yesterday
   │ ├─ Count consecutive days from most recent
   │ └─ Set current_streak value
   ↓
   Calculate Longest Streak
   │ ├─ Iterate through all logs
   │ ├─ Find all consecutive sequences
   │ └─ Track maximum sequence length
   ↓
   Update UserStreak Record
   ↓
   Return Success
```

## Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (10 salt rounds)
   - Never stored or transmitted in plain text
   - One-way hashing (cannot be reversed)

2. **JWT Authentication**
   - Stateless authentication
   - Token includes user ID payload
   - Configurable expiration (default: 7 days)
   - Secret key from environment variables

3. **Route Protection**
   - All routes except register/login require authentication
   - Middleware validates token on each request
   - User ID extracted from token ensures data isolation

4. **Data Access Control**
   - Users can only access their own habits/logs
   - Foreign key constraints prevent orphaned records
   - Cascade deletes maintain data integrity

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js | JavaScript runtime |
| Framework | Express.js | Web application framework |
| Language | TypeScript | Type safety and better DX |
| ORM | TypeORM | Database abstraction |
| Database | PostgreSQL | Relational data storage |
| Auth | JWT | Stateless authentication |
| Encryption | bcryptjs | Password hashing |
| Validation | express-validator | Request validation |
| Dev Tools | nodemon, ts-node | Hot reloading in dev |

## Environment Configuration

Required environment variables:

```env
# Server
PORT=5000
NODE_ENV=development|production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=habit_tracker

# Security
JWT_SECRET=random_secret_key
JWT_EXPIRES_IN=7d
```

## Development vs Production

### Development Mode
- `synchronize: true` - Auto-creates database tables
- `logging: true` - Logs all SQL queries
- Hot reload with nodemon
- Detailed error messages

### Production Mode
- `synchronize: false` - Use migrations
- `logging: false` - No SQL logging
- Compiled TypeScript (dist folder)
- Environment-based error handling

## Performance Considerations

1. **Database Indexing**
   - Primary keys (UUIDs) automatically indexed
   - Foreign keys should be indexed
   - Consider indexing: user_id, habit_id, completion_date

2. **Query Optimization**
   - Use `leftJoinAndSelect` for eager loading
   - Avoid N+1 queries with proper relations
   - Date range queries use indexed columns

3. **Caching Opportunities**
   - User sessions could be cached (Redis)
   - Frequent streak calculations could be cached
   - Category lookups rarely change

## Error Handling Strategy

```
Controller Level
↓
Try-Catch Blocks
├─ Database Errors → 500 Internal Server Error
├─ Validation Errors → 400 Bad Request
├─ Not Found → 404 Not Found
├─ Unauthorized → 401 Unauthorized
└─ Forbidden → 403 Forbidden
↓
Consistent JSON Response Format
{
  "message": "Error description",
  "error": "Optional error details (dev mode)"
}
```

## Future Enhancements

1. **Advanced Features**
   - Habit reminders/notifications
   - Social features (share progress)
   - Analytics and insights
   - Goal setting with milestones

2. **Technical Improvements**
   - Rate limiting (express-rate-limit)
   - Request logging (morgan)
   - API documentation (Swagger)
   - Testing (Jest, Supertest)
   - Migrations (TypeORM migrations)
   - Docker containerization

3. **Scalability**
   - Redis for session management
   - Database read replicas
   - Horizontal scaling with load balancer
   - CDN for static assets
