import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Generate embeddings for text chunks
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Generate answer using GPT based on context
export async function generateAnswerFromContext(
  question: string,
  context: string,
  bookTitle: string
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful educational assistant. You have access to book content and should answer questions based on it. 
          Always cite the book "${bookTitle}" when relevant. Be accurate and only use information from the provided context.`,
        },
        {
          role: 'user',
          content: `Book Context:\n\n${context}\n\nQuestion: ${question}\n\nPlease provide a detailed answer based on the book content.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    return response.choices[0].message.content || 'Unable to generate answer.';
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

// Generate summary of book content
export async function generateBookSummary(content: string, bookTitle: string): Promise<string> {
  try {
    // Split into chunks if content is too long
    const maxChars = 10000;
    const contentToSummarize = content.substring(0, maxChars);

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at summarizing book content. Create a clear, concise summary that captures the main ideas and key points.
          Format the summary in a readable way with paragraphs.`,
        },
        {
          role: 'user',
          content: `Please summarize this book content:\n\nBook: "${bookTitle}"\n\nContent:\n${contentToSummarize}`,
        },
      ],
      max_tokens: 1500,
      temperature: 0.5,
    });

    return response.choices[0].message.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error;
  }
}

// Calculate similarity between two embeddings (cosine similarity)
export function calculateSimilarity(embedding1: number[], embedding2: number[]): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

// Find most relevant context chunks for a question
export async function findRelevantContext(
  question: string,
  bookChunks: string[],
  topK: number = 3
): Promise<string> {
  try {
    // Generate embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    // Generate embeddings for all chunks
    const chunkEmbeddings = await Promise.all(
      bookChunks.map(chunk => generateEmbedding(chunk))
    );

    // Calculate similarities
    const similarities = chunkEmbeddings.map((embedding, index) => ({
      index,
      similarity: calculateSimilarity(questionEmbedding, embedding),
      chunk: bookChunks[index],
    }));

    // Sort by similarity and get top K
    const topChunks = similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map(item => item.chunk)
      .join('\n\n');

    return topChunks;
  } catch (error) {
    console.error('Error finding relevant context:', error);
    // Fallback: return first chunks if embedding fails
    return bookChunks.slice(0, topK).join('\n\n');
  }
}
