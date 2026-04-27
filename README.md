# 📚 Smart Library & Learning Platform

An AI-powered library management system with peer learning, online courses, and collaborative education features. Built with Next.js and React.

## ✨ Features

### 🔐 Role-Based Access Control
- **Students**: Learn and ask questions
- **Teachers**: Create courses and manage students  
- **Librarians**: Manage library collection and system analytics

### 🤖 AI-Powered Learning
- **Question Answering**: Students ask questions → AI generates answers
- **Book Summarization**: Upload book excerpts → AI generates summaries
- **Community Q&A**: Share questions and answers with peers

### 📚 Online Courses
- Browse and enroll in courses
- Course management for teachers
- Sample questions with each course
- Video content support
- Pre-populated demo courses

### 💬 Peer Learning & Collaboration
- **Asynchronous Discussions**: Forum-style discussions on topics
- **Synchronous Chat**: Live discussions during classes
- **Peer Teaching**: Students teach each other in distance learning

### 📖 Library Management
- Add/Edit/Delete books
- Track book status (Available, Borrowed, Reserved)
- ISBN and publication details
- Search and analytics

### 📊 Dashboard Analytics
- Track questions and summaries
- Enrollment statistics
- Library usage analytics

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. The project is already set up. Start the server:
```bash
npm run dev
```

2. Open in browser:
```
http://localhost:3000
```

## 🔑 Demo Login

Use any email and select a role:
- **Student**: Ask questions, generate summaries, browse courses, join discussions
- **Teacher**: Create courses, manage content, monitor discussions
- **Librarian**: Manage books, view analytics, manage users

## 📱 Application Structure

```
app/
├── api/
│   ├── books/              # Library API
│   ├── questions/          # Q&A API
│   ├── summaries/          # Summary API
│   ├── courses/            # Course API
│   └── discussions/        # Discussion API
├── components/
│   ├── dashboards/         # Role dashboards
│   └── features/           # Feature components
├── context/
│   └── AuthContext.tsx     # Auth & roles
├── lib/
│   └── ai-service.ts       # AI service
└── dashboard/page.tsx      # Main dashboard
```

## 🎯 Key Features

### Students
- Ask questions → AI generates answers
- Upload books → AI generates summaries
- Browse courses with sample questions
- Join peer learning discussions

### Teachers
- Create and manage courses
- Add sample questions and videos
- Lead class discussions
- Monitor student progress

### Librarians
- Manage book collection
- Track book status and inventory
- View system analytics
- Manage user accounts

## 🤖 AI Features

- **Mock AI**: Works out of the box with intelligent responses
- **Real OpenAI**: Optional - add `NEXT_PUBLIC_OPENAI_API_KEY` to `.env.local`

## 📚 Sample Data Included

- 3 sample books in library
- 2 sample questions with AI answers
- 3 online courses (React, Python, Design)
- Sample discussions and peer learning threads

## 🛠 Tech Stack

- React.js + TypeScript
- Next.js (Frontend + API Routes)
- Tailwind CSS
- OpenAI API (optional)

## 🔄 API Endpoints

**Books**: `/api/books` (GET, POST, PUT, DELETE)
**Questions**: `/api/questions` (GET, POST, PUT)
**Summaries**: `/api/summaries` (GET, POST, DELETE)
**Courses**: `/api/courses` (GET, POST, PUT, DELETE)
**Discussions**: `/api/discussions` (GET, POST, PUT, DELETE)

## 📝 Next Steps

1. **Add Real Database**: Connect PostgreSQL to replace in-memory storage
2. **Enable Real OpenAI**: Add API key for real AI features
3. **User Authentication**: Implement JWT/NextAuth for production
4. **Upload Features**: Add file uploads for books and documents
5. **Real-time Chat**: Use WebSockets for live discussions
6. **Payment Integration**: Add Stripe for premium courses

---

**Enjoy your Smart Library! 📚✨**
