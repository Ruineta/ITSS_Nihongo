# 🚀 Quick Start Guide - Backend Setup

This guide will help you set up and run the Teacher Support Hub backend API.

## Prerequisites Checklist

- [ ] Node.js v16+ installed
- [ ] PostgreSQL v12+ installed and running
- [ ] Database created (`teacher_support_hub`)
- [ ] Git repository cloned

## Step-by-Step Setup

### 1️⃣ Create Database

Open PostgreSQL command line:
```bash
psql -U postgres
```

Create the database:
```sql
CREATE DATABASE teacher_support_hub;
\q
```

### 2️⃣ Initialize Database Schema

Navigate to the project root and run the init script:
```bash
cd /Users/caoducanh/Coding/ITSS_Nihongo
psql -U postgres -d teacher_support_hub -f itss_nihongo/PostgreSQL_init.sql
```

You should see output confirming table creation.

### 3️⃣ Insert Sample Data (Optional but Recommended)

Insert test data for development:
```bash
psql -U postgres -d teacher_support_hub -f backend/sample_data.sql
```

This will create:
- 4 sample teachers
- 5 subjects
- 10 slides with varying difficulty scores
- Analysis points for difficult slides

### 4️⃣ Configure Environment Variables

Navigate to backend directory:
```bash
cd backend
```

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teacher_support_hub
DB_USER=postgres
DB_PASSWORD=your_actual_password

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 5️⃣ Install Dependencies

The dependencies should already be installed, but if not:
```bash
npm install
```

### 6️⃣ Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

You should see:
```
=================================
🚀 Server running on port 5000
📝 Environment: development
🌐 API Base URL: http://localhost:5000/api
=================================
✓ Connected to PostgreSQL database
```

### 7️⃣ Test the API

**Option A: Using curl**
```bash
# Health check
curl http://localhost:5000/health

# Get difficult slides ranking
curl http://localhost:5000/api/slides/ranking/difficult

# Get statistics
curl http://localhost:5000/api/slides/ranking/difficult/stats
```

**Option B: Using the test script**
```bash
node test_api.js
```

**Option C: Using a browser**
Open: http://localhost:5000/api/slides/ranking/difficult

## 🎯 Testing with Frontend

To test with the React frontend:

1. Make sure backend is running on port 5000
2. Update frontend API calls to point to `http://localhost:5000`
3. Start the frontend:
   ```bash
   cd ../itss_nihongo
   npm start
   ```
4. Navigate to the "難解ランキング" page

## 🔍 Verify Database Setup

Check if data was inserted correctly:
```bash
psql -U postgres -d teacher_support_hub
```

Run this query:
```sql
SELECT 
  s.title,
  s.difficulty_score,
  u.full_name,
  sub.name as subject
FROM slides s
JOIN users u ON s.user_id = u.id
LEFT JOIN subjects sub ON s.subject_id = sub.id
ORDER BY s.difficulty_score DESC
LIMIT 5;
```

You should see the top 5 most difficult slides.

## 📝 API Examples

### Get Top 10 Difficult Slides
```bash
curl http://localhost:5000/api/slides/ranking/difficult
```

### Get Top 5 with Pagination
```bash
curl "http://localhost:5000/api/slides/ranking/difficult?limit=5&offset=0"
```

### Filter by Minimum Score
```bash
curl "http://localhost:5000/api/slides/ranking/difficult?minScore=80"
```

### Get Statistics
```bash
curl http://localhost:5000/api/slides/ranking/difficult/stats
```

## 🐛 Troubleshooting

### Database Connection Failed
- ✅ Check if PostgreSQL is running: `pg_isready`
- ✅ Verify credentials in `.env` file
- ✅ Ensure database exists: `psql -U postgres -l | grep teacher_support_hub`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process: `lsof -ti:5000 | xargs kill`

### No Data Returned
- Run the sample data script: `psql -U postgres -d teacher_support_hub -f sample_data.sql`
- Check if slides exist: `psql -U postgres -d teacher_support_hub -c "SELECT COUNT(*) FROM slides;"`

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Restart the backend server

## 🔐 Security Notes

For production deployment:
- Use strong database passwords
- Enable SSL for PostgreSQL connections
- Add authentication middleware
- Use environment-specific configurations
- Enable rate limiting
- Validate and sanitize all inputs

## 📚 Next Steps

1. ✅ Backend is running
2. Test with frontend integration
3. Add more features (authentication, upload, etc.)
4. Deploy to production server

## 🆘 Need Help?

Check the main README.md for detailed API documentation and project structure.
