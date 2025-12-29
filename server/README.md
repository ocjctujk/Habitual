# Habit Tracker API

A RESTful API backend for a Habit Tracker application built with Node.js, Express, TypeORM, and PostgreSQL.

## Features

- ✅ **User Authentication** - JWT-based authentication with bcrypt password hashing
- ✅ **Habit Management** - Create, read, update, and delete habits
- ✅ **Habit Categories** - Organize habits into categories
- ✅ **Habit Logging** - Track daily habit completions
- ✅ **Streak Tracking** - Automatic calculation of current and longest streaks
- ✅ **TypeScript** - Full TypeScript support for type safety
- ✅ **PostgreSQL** - Robust relational database with TypeORM

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Clone the repository** (or navigate to the server directory)

```bash
cd server
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update the following variables in `.env`:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=habit_tracker

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

4. **Create PostgreSQL database**

```bash
psql -U postgres
CREATE DATABASE habit_tracker;
\q
```

5. **Run the server**

Development mode (with hot reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-12-29T06:19:59.000Z"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

---

### Category Endpoints

All category endpoints require authentication.

#### Create Category
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Health",
  "icon_url": "https://example.com/health-icon.png"
}
```

#### Get All Categories
```http
GET /api/categories
Authorization: Bearer <token>
```

#### Get Category by ID
```http
GET /api/categories/:id
Authorization: Bearer <token>
```

#### Update Category
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Fitness",
  "icon_url": "https://example.com/fitness-icon.png"
}
```

#### Delete Category
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

---

### Habit Endpoints

All habit endpoints require authentication.

#### Create Habit
```http
POST /api/habits
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Drink Water",
  "description": "Drink 8 glasses of water daily",
  "category_id": "uuid",
  "frequency": "daily",
  "target_value": 8
}
```

**Frequency options:** `daily`, `weekly`, `monthly`

#### Get User Habits
```http
GET /api/habits
Authorization: Bearer <token>

# Optional query params:
GET /api/habits?is_active=true
```

#### Get Habit by ID
```http
GET /api/habits/:id
Authorization: Bearer <token>
```

#### Update Habit
```http
PUT /api/habits/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Drink More Water",
  "target_value": 10,
  "is_active": true
}
```

#### Delete Habit
```http
DELETE /api/habits/:id
Authorization: Bearer <token>
```

---

### Habit Log Endpoints

All log endpoints require authentication.

#### Log Habit Completion
```http
POST /api/logs
Authorization: Bearer <token>
Content-Type: application/json

{
  "habit_id": "uuid",
  "completion_date": "2025-12-29",
  "status": "completed",
  "actual_value": 8
}
```

**Status options:** `completed`, `partial`, `skipped`

#### Get Habit Logs
```http
GET /api/logs/habit/:habit_id
Authorization: Bearer <token>

# Optional query params for date filtering:
GET /api/logs/habit/:habit_id?start_date=2025-12-01&end_date=2025-12-31
```

#### Update Habit Log
```http
PUT /api/logs/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed",
  "actual_value": 10
}
```

#### Delete Habit Log
```http
DELETE /api/logs/:id
Authorization: Bearer <token>
```

---

### Streak Endpoints

All streak endpoints require authentication. Streaks are automatically calculated when habits are logged.

#### Get User Streaks
```http
GET /api/streaks
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "streak_id": "uuid",
    "user_id": "uuid",
    "habit_id": "uuid",
    "current_streak": 7,
    "longest_streak": 15,
    "last_updated": "2025-12-29T06:19:59.000Z",
    "habit": {
      "habit_id": "uuid",
      "name": "Drink Water",
      ...
    }
  }
]
```

#### Get Habit Streak
```http
GET /api/streaks/habit/:habit_id
Authorization: Bearer <token>
```

---

### Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "OK",
  "message": "Habit Tracker API is running",
  "timestamp": "2025-12-29T06:19:59.000Z"
}
```

## Database Schema

### Tables

1. **users**
   - `user_id` (UUID, PK)
   - `username` (VARCHAR, UNIQUE)
   - `email` (VARCHAR, UNIQUE)
   - `password_hash` (VARCHAR)
   - `created_at` (TIMESTAMP)

2. **categories**
   - `category_id` (UUID, PK)
   - `name` (VARCHAR)
   - `icon_url` (VARCHAR, nullable)

3. **habits**
   - `habit_id` (UUID, PK)
   - `user_id` (UUID, FK → users)
   - `name` (VARCHAR)
   - `description` (TEXT, nullable)
   - `category_id` (UUID, FK → categories, nullable)
   - `frequency` (ENUM: daily, weekly, monthly)
   - `target_value` (DECIMAL, nullable)
   - `is_active` (BOOLEAN)
   - `created_at` (TIMESTAMP)

4. **habit_logs**
   - `log_id` (UUID, PK)
   - `habit_id` (UUID, FK → habits)
   - `completion_date` (DATE)
   - `status` (ENUM: completed, partial, skipped)
   - `actual_value` (DECIMAL, nullable)

5. **user_streaks**
   - `streak_id` (UUID, PK)
   - `user_id` (UUID, FK → users)
   - `habit_id` (UUID, FK → habits)
   - `current_streak` (INTEGER)
   - `longest_streak` (INTEGER)
   - `last_updated` (TIMESTAMP)

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **TypeORM** - ORM for database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts        # TypeORM configuration
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── categoryController.ts
│   │   ├── habitController.ts
│   │   ├── habitLogController.ts
│   │   └── streakController.ts
│   ├── entities/
│   │   ├── Category.ts
│   │   ├── Habit.ts
│   │   ├── HabitLog.ts
│   │   ├── User.ts
│   │   └── UserStreak.ts
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── habitRoutes.ts
│   │   ├── habitLogRoutes.ts
│   │   └── streakRoutes.ts
│   └── app.ts                 # Main application
├── .env.example
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Development Notes

- The database tables are automatically created in development mode (`synchronize: true`)
- For production, disable synchronization and use migrations
- Streaks are automatically calculated when habit logs are created, updated, or deleted
- All routes except `/api/auth/register` and `/api/auth/login` require JWT authentication

## License

ISC
