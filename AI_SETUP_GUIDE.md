# AI Question Answering - How It Works

## Overview
The Smart Library platform uses AI to provide intelligent answers to student questions. The system can work in two modes:

### 1. **Production Mode (with Gemini API)**
When configured with a valid Google Gemini API key, the system uses real AI to generate intelligent answers based on book content in the library.

### 2. **Fallback Mode (Smart Mock Answers)**
If the API key is invalid or unavailable, the system uses intelligent mock answers that:
- Match question keywords (Newton's Laws, JSX, React Hooks, etc.)
- Extract and use relevant book content when available
- Provide contextual, educational responses

## Getting Started with Gemini AI

### Step 1: Get Your API Key
1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API key in new project"
4. Copy your API key

### Step 2: Add API Key to .env.local
Update your `.env.local` file:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
```

### Step 3: Restart Development Server
```bash
npm run dev
```

Test by asking a question in the dashboard - you should get real AI-powered answers!

## How AI Answers Work

### Question Processing
1. Student asks a question
2. System searches library for relevant books
3. Books are ranked by keyword relevance
4. Top 3 books' content is sent as context

### Answer Generation

**With Gemini API:**
- Uses the full Google Gemini model
- Analyzes question + book context
- Generates accurate, detailed answers
- Cites source materials

**With Fallback Mode:**
- Matches question keywords
- Extracts relevant sentences from books
- Provides educated mock answers for unknown topics
- Always encourages consultation of full materials

## Improving Answer Quality

### 1. Upload Relevant Books
- Upload textbooks matching your curriculum
- Add course-specific materials
- Include past exam papers
- Higher-quality content = better answers

### 2. Ensure Books Have Content
- OCR/extract text from PDFs
- Include full text, not just summaries
- Books without content won't help with context

### 3. Use Specific Questions
- "What is photosynthesis?" → Good
- "How does stuff work?" → Poor
- More specific questions get better answers

## Troubleshooting

### API Returns "Invalid Key" Error
- **Check**: API key is correct in `.env.local`
- **Check**: API key is not expired
- **Solution**: Regenerate key from [aistudio.google.com](https://aistudio.google.com/)
- **Note**: API key may have usage limits

### Answers Are Generic
- **Reason**: Gemini API disabled or key invalid
- **Solution**: Check API key configuration
- **Fallback**: System uses smart mock answers automatically

### Questions Not Being Saved
- **Reason**: MongoDB/MySQL not running
- **Solution**: Answers are saved in-memory during session
- **Production**: Configure database in Vercel dashboard

## For Production (Vercel Deployment)

1. Add `NEXT_PUBLIC_GEMINI_API_KEY` to Vercel Environment Variables
2. Configure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` for MySQL
3. Or use `MONGODB_URI` for MongoDB Atlas
4. Redeploy your application

## API Costs

- **Gemini API**: Free tier available, check [pricing](https://ai.google.dev/pricing)
- **MongoDB Atlas**: Free tier supports learning projects
- **PlanetScale MySQL**: Free tier available

## Future Enhancements

Planned improvements for AI:
- [ ] Fine-tuning on curriculum materials
- [ ] Caching of frequently asked questions
- [ ] Student feedback loop to improve answers
- [ ] Multi-language support
- [ ] Answer citations with page numbers
- [ ] AI-generated quiz questions from books
