// Mock AI service - replace with real OpenAI if you have an API key
// To use real OpenAI: set NEXT_PUBLIC_OPENAI_API_KEY in .env.local

export async function generateAnswer(question: string): Promise<string> {
  // Mock implementation - returns AI-like answers
  const mockAnswers: Record<string, string> = {
    'what is nodejs':
      'Node.js is a JavaScript runtime built on Chrome\'s V8 JavaScript engine. It allows you to run JavaScript outside the browser, making it perfect for server-side development. Key features include non-blocking I/O, event-driven architecture, and npm package ecosystem.',
    'how to learn javascript':
      'To learn JavaScript effectively: 1) Master basics (variables, functions, objects) 2) Understand DOM manipulation 3) Learn async/await and Promises 4) Practice with projects 5) Study design patterns. Start with fundamentals before moving to frameworks like React or Vue.',
    'what is machine learning':
      'Machine Learning is a subset of AI where systems learn from data without being explicitly programmed. It involves training algorithms on large datasets to recognize patterns. Types include supervised learning (labeled data), unsupervised learning (unlabeled data), and reinforcement learning (learning through rewards).',
  };

  // Check for mock answer
  const key = question.toLowerCase().trim();
  for (const [mockKey, answer] of Object.entries(mockAnswers)) {
    if (key.includes(mockKey) || mockKey.includes(key.split(' ')[0])) {
      return answer;
    }
  }

  // Generic AI-like response
  return `Based on the question "${question}", here's a comprehensive answer:\n\nThis is an important topic in modern education and learning. The answer depends on several factors including context, level of detail required, and specific use case.\n\nKey points to consider:\n1. Understanding fundamentals is crucial\n2. Practice and experimentation build expertise\n3. Resources and community support accelerate learning\n4. Consistency and dedication lead to mastery\n\nFor more detailed information, please consult specialized resources or ask a domain expert.`;
}

export async function generateSummary(bookContent: string): Promise<string> {
  // Mock implementation - creates a summary from content
  const lines = bookContent.split('\n').filter((line) => line.trim());
  const words = bookContent.split(/\s+/).length;

  if (words < 100) {
    return 'Content too short for summary. Please provide more text.';
  }

  // Create a simple summary by taking first sentences from paragraphs
  const paragraphs = bookContent.split('\n\n');
  const summaryPoints = paragraphs.slice(0, 3).map((p) => {
    const firstSentence = p.split('.')[0];
    return firstSentence.length > 0 ? firstSentence + '.' : null;
  });

  const summary = summaryPoints
    .filter((p) => p !== null)
    .join('\n\n');

  return summary.length > 0
    ? `Summary (approx ${Math.ceil(words / 10)}% of original):\n\n${summary}\n\n[This is a generated summary. For complete understanding, please read the full text.]`
    : 'Unable to generate summary. Please try with different content.';
}

// Real OpenAI integration (optional - requires API key)
export async function generateAnswerWithAI(question: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    // Fall back to mock if no API key
    return generateAnswer(question);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: question,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return generateAnswer(question);
  }
}

export async function generateSummaryWithAI(bookContent: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    return generateSummary(bookContent);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Please provide a concise summary of the following text:\n\n${bookContent}`,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return generateSummary(bookContent);
  }
}
