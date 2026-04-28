# Quick Start Guide - Smart Library Platform

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database

Edit `.env.local` with your MySQL database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=smart_library
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

### 3. Create Database
```bash
# On Windows
mysql -u root -p -e "CREATE DATABASE smart_library;"

# Or if using GUI, create the database manually
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Initialize Database & Seed Data
Open your browser and go to:
```
http://localhost:3000/api/init
http://localhost:3000/api/seed
```

You should see success messages. If you see database errors, check your `.env.local` credentials.

### 6. Test Login with Seeded Users

**Student Account:**
- Username: `student1`
- Password: `password123`

**Teacher Account:**
- Username: `teacher1`
- Password: `password123`

**Librarian Account:**
- Username: `librarian1`
- Password: `password123`

Go to: `http://localhost:3000/login`

---

## 🐛 Troubleshooting

### "Login failed" Error
1. Check database is running: `mysql -u root -p -e "USE smart_library; SHOW TABLES;"`
2. Check `.env.local` has correct `DB_PASSWORD`
3. Run `/api/seed` to create test users
4. Check browser console for detailed error message

### Database Connection Error
1. Verify MySQL is running
2. Check credentials in `.env.local`
3. Ensure `smart_library` database exists

### Documents Not Uploading
- File size limit: Check server configuration
- Supported formats: PDF, DOCX, TXT
- Ensure user is logged in and has upload permissions

---

## 📚 Key Features

✅ User Authentication (Student/Teacher/Librarian roles)
✅ Book Management & Borrowing
✅ AI-Powered Q&A on Documents
✅ Document Upload & Processing
✅ Past Papers Database (44+ papers included)
✅ Book Summaries with Google Gemini
✅ Peer Messaging & Discussions

---

## 🚀 Deploying to Vercel

1. Push code to GitHub
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - `DB_HOST` (your database host)
   - `DB_USER` (database user)
   - `DB_PASSWORD` (database password)
   - `DB_NAME` (database name)
   - `NEXT_PUBLIC_GEMINI_API_KEY` (Gemini API key)
   - `NEXT_PUBLIC_APP_URL` (your Vercel app URL)

4. Deploy! Vercel will auto-run `npm run build` and `npm start`

---

## 📖 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Initialization
- `GET/POST /api/init` - Initialize database tables
- `POST /api/seed` - Seed test data and past papers

### Documents
- `POST /api/documents/upload` - Upload document/book

### Books
- `GET /api/books` - List all books
- `GET /api/books/[id]` - Get book details
- `POST /api/books/search` - Search books

### Q&A
- `POST /api/questions` - Ask question about a book
- `GET /api/questions/[id]` - Get question and answer

---

## 🔑 Get Your Free API Keys

1. **Google Gemini API** (for AI features)
   - Go to: https://aistudio.google.com/
   - Click "Get API Key"
   - Copy and paste into `.env.local`

2. **Database** (MySQL)
   - Download: https://dev.mysql.com/downloads/
   - Or use cloud services like:
     - PlanetScale (MySQL compatible)
     - Vercel Postgres
     - Railway

---

## 📝 Notes

- Default password hashing: SHA-256 (use bcrypt for production)
- Session tokens stored in localStorage
- Past papers are seeded automatically
- Database auto-initializes on first request

Questions? Check the full [SETUP_GUIDE.md](SETUP_GUIDE.md)
