# 🎓 Smart Library & Learning Platform

AI-powered platform for student learning with intelligent book management, AI-generated summaries, and smart question-answering system.

## ✨ Key Features

### 📚 Smart Library Management
- **Upload Books**: Support for PDF, DOCX, and TXT files
- **Automatic Summaries**: AI-generated summaries using GPT-3.5
- **Book Borrowing**: Students can borrow books with 14-day loan periods
- **Track History**: Complete borrowing and interaction history

### 🤖 Intelligent Q&A System
- **Ask Questions**: Ask questions about any book in the system
- **Semantic Search**: AI searches through all books using embeddings
- **Context-Aware Answers**: GPT-3.5 generates answers based on book content
- **Multi-Book Search**: Get answers from multiple books at once

### 👥 Collaborative Learning
- **Peer Learning**: Discussions and peer messaging
- **Course Management**: Organize content by courses
- **Recommendations**: AI-powered content recommendations
- **Role-Based Access**: Student, Teacher, and Librarian roles

### 💾 Robust Backend
- **MySQL Database**: Scalable data storage
- **OpenAI Integration**: GPT-3.5 for intelligent features
- **File Processing**: Automatic extraction from PDFs, DOCX, TXT
- **Embeddings**: Semantic search using text embeddings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- OpenAI API Key
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd vvvvvvv
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. **Create MySQL database**
```bash
mysql -u root -p < database_schema.sql
```

5. **Create uploads directory**
```bash
mkdir -p public/uploads
```

6. **Start development server**
```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📋 Environment Variables

```env
# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_library

# OpenAI API
OPENAI_API_KEY=sk-...

# Gemini API (Optional)
NEXT_PUBLIC_GEMINI_API_KEY=...
```

## 🏗️ Project Structure

```
app/
├── api/
│   ├── books/
│   │   ├── route.ts              # Book upload & listing
│   │   ├── [id]/
│   │   │   └── route.ts          # Book details, borrow, Q&A
│   │   └── search/
│   │       └── route.ts          # Multi-book search
│   ├── courses/route.ts
│   ├── discussions/route.ts
│   └── ...
├── components/
│   ├── features/
│   │   ├── BookUploadSection.tsx
│   │   ├── BorrowBooksSection.tsx
│   │   ├── AskQuestionSection.tsx
│   │   ├── BookDetailsSection.tsx
│   │   └── ...
│   ├── dashboards/
│   │   ├── StudentDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   └── LibrarianDashboard.tsx
│   └── StudentLibraryHub.tsx
├── context/
│   └── AuthContext.tsx
├── dashboard/
│   └── page.tsx
└── ...
lib/
├── db.ts                    # MySQL connection pool
├── db-init.ts              # Database initialization
├── file-processor.ts       # PDF/DOCX/TXT extraction
└── openai-service.ts       # OpenAI integration
```

## 📚 API Endpoints

### Books
```bash
# Upload book
POST /api/books
Content-Type: multipart/form-data
{ file, title, author, description, userId }

# Get all books
GET /api/books

# Get book details/summary
GET /api/books/[id]
GET /api/books/[id]?action=summary

# Borrow book
POST /api/books/[id]
{ action: "borrow", studentId, dueDate }

# Return book
POST /api/books/[id]
{ action: "return", studentId }

# Ask question about book
POST /api/books/[id]
{ action: "ask_question", studentId, question, bookTitle }
```

### Search
```bash
# Search books by title/author
GET /api/books/search?q=keyword

# Ask question across all books
POST /api/books/search
{ question, studentId }
```

## 🗄️ Database Schema

### Core Tables
- **books**: Book metadata and content
- **book_borrowing**: Borrowing records and history
- **book_questions**: Questions and AI-generated answers
- **book_summaries**: AI-generated summaries
- **book_embeddings**: Vector embeddings for semantic search
- **ai_interactions**: API call tracking

See `database_schema.sql` for complete schema.

## 🔧 Configuration

### Next.js Config
- API body size limit: 50MB
- ISR cache size: 52MB
- Image optimization disabled for compatibility

### File Processing
- Chunk size: 2000 characters
- Overlap between chunks: 200 characters
- Supported formats: PDF, DOCX, DOC, TXT

### OpenAI
- Model: gpt-3.5-turbo
- Embeddings model: text-embedding-3-small
- Max tokens for answers: 1000
- Temperature: 0.7 (answers), 0.5 (summaries)

## 📈 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run start
```

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Deploy on Vercel**
   - Import repository on [vercel.com](https://vercel.com)
   - Set environment variables
   - Deploy

3. **Auto-Deployment**
   - Every push to `main` automatically deploys
   - GitHub Actions workflow included (`.github/workflows/deploy.yml`)

### Environment Variables for Vercel
- `OPENAI_API_KEY`
- `DB_HOST` (e.g., remote MySQL host)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### Database for Production
For Vercel deployment, use a managed database service:
- AWS RDS
- DigitalOcean Managed Database
- Google Cloud SQL
- PlanetScale
- Heroku JawsDB

## 🐛 Troubleshooting

### MySQL Connection Error
```
Error: connect ECONNREFUSED
```
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `.env.local`
- Ensure database exists: `SHOW DATABASES;`

### OpenAI API Error
```
Error: Invalid API key
```
- Verify API key at [platform.openai.com](https://platform.openai.com)
- Check rate limits and credits
- Ensure key has proper permissions

### File Upload Error
```
Error: ENOENT: no such file or directory
```
- Create uploads directory: `mkdir -p public/uploads`
- Check permissions: `chmod 755 public/uploads`

### Build Error
```
Error: Cannot find module '@/lib/db'
```
- Clear cache: `npm run build -- --no-cache`
- Reinstall dependencies: `npm install`

## 📝 Development Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## 🔐 Security Considerations

1. **API Keys**: Never commit `.env.local` to version control
2. **Database**: Use strong passwords for MySQL
3. **OpenAI**: Monitor API usage to prevent unauthorized charges
4. **File Upload**: Validate file types and sizes
5. **CORS**: Configure CORS headers appropriately

## 📞 Support

For issues or questions:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review API documentation in comments
3. Check Vercel logs: `vercel logs`
4. Contact: YVES +250791756160

## 📜 License

This project is part of the Smart Library initiative.

## 🎯 Roadmap

- [ ] Add Stripe integration for paid features
- [ ] Implement advanced analytics
- [ ] Add mobile app support
- [ ] Enhance recommendation algorithm
- [ ] Multi-language support
- [ ] Real-time collaboration features

---

**Happy Learning! 📚✨**
