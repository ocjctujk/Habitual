# Habit Tracker API - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Option 1: Automated Setup (Recommended)

```bash
cd server
./setup.sh
```

This will:
- Create PostgreSQL database
- Generate secure .env file
- Install npm dependencies

### Option 2: Manual Setup

1. **Install dependencies:**
```bash
cd server
npm install
```

2. **Create PostgreSQL database:**
```bash
psql -U postgres
CREATE DATABASE habit_tracker;
\q
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Start development server:**
```bash
npm run dev
```

## 📚 API Endpoints Quick Reference

### Authentication (Public)
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get current user profile (requires auth)

### Categories (Protected)
- `POST /api/categories` - Create category
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get specific category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Habits (Protected)
- `POST /api/habits` - Create new habit
- `GET /api/habits` - Get user's habits (supports ?is_active=true filter)
- `GET /api/habits/:id` - Get specific habit with logs
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Habit Logs (Protected)
- `POST /api/logs` - Log habit completion
- `GET /api/logs/habit/:habit_id` - Get logs for habit (supports date filtering)
- `PUT /api/logs/:id` - Update log entry
- `DELETE /api/logs/:id` - Delete log entry

### Streaks (Protected)
- `GET /api/streaks` - Get all user streaks
- `GET /api/streaks/habit/:habit_id` - Get streak for specific habit

### Health Check (Public)
- `GET /api/health` - Check API status

## 🧪 Testing with Postman

1. Import `Habit_Tracker_API.postman_collection.json` into Postman
2. Register a new user
3. Copy the JWT token from response
4. Set the `token` variable in Postman
5. Test protected endpoints

## 📦 Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.ts          # TypeORM configuration
│   ├── controllers/
│   │   ├── authController.ts    # Authentication logic
│   │   ├── categoryController.ts
│   │   ├── habitController.ts
│   │   ├── habitLogController.ts
│   │   └── streakController.ts
│   ├── entities/
│   │   ├── User.ts              # User model
│   │   ├── Category.ts
│   │   ├── Habit.ts
│   │   ├── HabitLog.ts
│   │   └── UserStreak.ts
│   ├── middleware/
│   │   └── auth.ts              # JWT middleware
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── categoryRoutes.ts
│   │   ├── habitRoutes.ts
│   │   ├── habitLogRoutes.ts
│   │   └── streakRoutes.ts
│   └── app.ts                   # Express app setup
├── dist/                        # Compiled JavaScript (after build)
├── .env                         # Environment variables (not in git)
├── .env.example                 # Template for .env
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── README.md                    # Full documentation
├── ARCHITECTURE.md              # Technical architecture
└── setup.sh                     # Automated setup script
```

## 🔐 Authentication Flow

1. **Register:** `POST /api/auth/register` with username, email, password
2. **Login:** `POST /api/auth/login` with email, password
3. **Get Token:** Response includes JWT token
4. **Use Token:** Add `Authorization: Bearer <token>` header to all protected requests

## 💡 Example Usage

### Create a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@test.com","password":"pass123"}'
```

### Create a Habit
```bash
curl -X POST http://localhost:5000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Drink Water","frequency":"daily","target_value":8}'
```

### Log Habit Completion
```bash
curl -X POST http://localhost:5000/api/logs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"habit_id":"HABIT_ID","completion_date":"2025-12-29","status":"completed","actual_value":8}'
```

## 🔧 NPM Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests (not configured yet)

## 🗄️ Database Schema

**Users** → Has many **Habits** → Has many **Habit Logs**
**Users** → Has many **User Streaks**
**Categories** → Has many **Habits**
**Habits** → Has one **User Streak**

## 🎯 Key Features

✅ **JWT Authentication** - Secure, stateless authentication
✅ **Password Hashing** - bcrypt with 10 salt rounds
✅ **Auto Streak Calculation** - Automatically tracks current & longest streaks
✅ **TypeScript** - Full type safety
✅ **PostgreSQL** - Relational database with foreign keys
✅ **RESTful API** - Standard HTTP methods and status codes
✅ **CORS Enabled** - Ready for frontend integration
✅ **Environment Variables** - Secure configuration

## 🐛 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in `.env` file
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use
- Change PORT in `.env` file
- Or kill process: `lsof -ti:5000 | xargs kill -9`

### TypeScript Errors
- Rebuild: `npm run build`
- Check `tsconfig.json` settings

## 📖 Additional Documentation

- **README.md** - Full API documentation with examples
- **ARCHITECTURE.md** - Technical architecture and design decisions
- **Postman Collection** - Import for API testing

## 🚦 Development vs Production

### Development Mode (`npm run dev`)
- Hot reload enabled
- SQL query logging
- Auto table creation
- Detailed error messages

### Production Mode (`npm start`)
- Compiled code
- No auto-sync
- Minimal logging
- Environment-based errors

## 🔒 Security Notes

- Never commit `.env` file
- Change `JWT_SECRET` in production
- Use strong database passwords
- Enable HTTPS in production
- Implement rate limiting for production

## 📝 Next Steps

1. Set up your database
2. Configure `.env` file
3. Run `npm run dev`
4. Import Postman collection
5. Test API endpoints
6. Build your frontend!

---

**Need help?** Check the full README.md for detailed documentation.
