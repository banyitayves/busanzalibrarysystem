# Smart Library & Learning Platform - Setup Guide

## New Features Added

### 1. **Book Management with AI-Powered Q&A**
- Upload and manage PDF, DOCX, and TXT files
- Automatic text extraction and processing
- AI-generated summaries using OpenAI GPT-3.5

### 2. **Student Book Borrowing System**
- Borrow and return books with due dates
- Track borrowing history
- Manage borrowed books

### 3. **Intelligent Question-Answering System**
- Ask questions about any book in the system
- AI searches through all books to find relevant answers
- Uses OpenAI embeddings for semantic search
- Returns context-aware answers from book content

### 4. **MySQL Database Integration**
- Complete book management
- Borrowing records
- Question and answer history
- User interaction tracking

## Prerequisites

1. **Node.js** (v18+)
2. **MySQL Server** (v8.0+)
3. **OpenAI API Key** - Get from https://platform.openai.com/api-keys
4. **Vercel Account** (optional, for deployment)

## Local Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Set Up MySQL Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE smart_library;"

# Or if using MySQL with password
mysql -u root -p'your_password' -e "CREATE DATABASE smart_library;"
```

### Step 3: Configure Environment Variables

Update `.env.local` with your credentials:

```
# MySQL Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=smart_library

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-key-here

# Gemini API (optional)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

### Step 4: Initialize Database Tables

Run the application, and the database tables will be created automatically on first run. Or manually run:

```bash
# Create the tables using the SQL from lib/db-init.ts
mysql -u root -p smart_library < database_schema.sql
```

### Step 5: Create Upload Directory

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

### Step 6: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## API Endpoints

### Books Management

#### Upload a Book
```bash
POST /api/books
Content-Type: multipart/form-data

- file: PDF/DOCX/TXT file
- title: Book title (required)
- author: Author name
- description: Book description
- userId: User ID
```

#### Get All Books
```bash
GET /api/books
```

#### Get Book Details
```bash
GET /api/books/[id]
GET /api/books/[id]?action=summary
```

#### Borrow a Book
```bash
POST /api/books/[id]
{
  "action": "borrow",
  "studentId": "1",
  "dueDate": "2024-05-28"
}
```

#### Return a Book
```bash
POST /api/books/[id]
{
  "action": "return",
  "studentId": "1"
}
```

#### Ask Question About Book
```bash
POST /api/books/[id]
{
  "action": "ask_question",
  "studentId": "1",
  "question": "What is the main theme?",
  "bookTitle": "The Great Gatsby"
}
```

### Search & Questions

#### Search Books
```bash
GET /api/books/search?q=javascript
```

#### Ask Question (Search All Books)
```bash
POST /api/books/search
{
  "question": "How to learn programming?",
  "studentId": "1"
}
```

## Components

### BookUploadSection
- Upload new books with metadata
- Automatic summary generation
- File type validation

### BorrowBooksSection
- Browse available books
- Borrow books with due dates
- View book details

### AskQuestionSection
- Ask questions about books
- Get AI-generated answers
- Semantic search across all books

### BookDetailsSection
- View book information
- Read AI-generated summaries
- Preview book content

## Database Schema

### books
- `id`: Primary key
- `title`: Book title
- `author`: Author name
- `description`: Book description
- `file_path`: Path to uploaded file
- `file_type`: pdf, docx, txt
- `file_content`: Full extracted text
- `uploaded_by`: User ID
- `created_at`: Timestamp

### book_borrowing
- `id`: Primary key
- `student_id`: Student borrowing
- `book_id`: Book being borrowed
- `borrowed_date`: When borrowed
- `due_date`: Return due date
- `returned_date`: When returned
- `status`: borrowed, returned, overdue

### book_questions
- `id`: Primary key
- `book_id`: Related book
- `student_id`: Student asking
- `question`: Question text
- `answer`: AI-generated answer
- `is_answered`: Boolean flag

### book_summaries
- `id`: Primary key
- `book_id`: Related book
- `summary`: AI-generated summary

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add MySQL and OpenAI integration"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your repository
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `DB_HOST` (your MySQL host)
   - `DB_USER` (MySQL username)
   - `DB_PASSWORD` (MySQL password)
   - `DB_NAME` (MySQL database name)
4. Deploy

### Step 3: Auto-Deployment

Every push to `main` branch will automatically deploy to Vercel.

## Performance Optimization Tips

1. **Increase MySQL Connection Pool**: Adjust in `lib/db.ts`
2. **Add Caching**: Implement Redis for frequently accessed data
3. **Chunk Processing**: Large files are automatically split into 2000-char chunks
4. **Rate Limiting**: Add rate limiting for API endpoints in production

## Troubleshooting

### MySQL Connection Error
- Ensure MySQL is running: `mysql -u root -p`
- Check credentials in `.env.local`
- Verify database exists: `SHOW DATABASES;`

### OpenAI API Errors
- Verify API key is correct and has credits
- Check rate limits
- Ensure API key has proper permissions

### File Upload Issues
- Ensure `public/uploads` directory exists and is writable
- Check file size limits (50MB max)
- Verify file type is supported (PDF, DOCX, TXT)

### Deployment Issues
- Check Vercel logs: `vercel logs`
- Ensure all environment variables are set
- Verify MySQL is accessible from Vercel

## Support & Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Vercel Documentation](https://vercel.com/docs)
