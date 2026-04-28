import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization - only create when needed
let genAI: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
  }
  return genAI;
}

// Generate embeddings for text chunks using Gemini
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent(text);
    const embedding = result.embedding;
    
    if (embedding && embedding.values) {
      return embedding.values;
    }
    // Return a dummy embedding if not available
    return new Array(768).fill(0);
  } catch (error) {
    console.error('Error generating embedding:', error);
    // Return dummy embedding on error
    return new Array(768).fill(0);
  }
}

// Generate answer using Gemini based on context
export async function generateAnswerFromContext(
  question: string,
  context: string,
  bookTitle: string
): Promise<string> {
  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    
    const response = await model.generateContent(
      `You are a helpful educational assistant. You have access to book content and should answer questions based on it. 
      Always cite the book "${bookTitle}" when relevant. Be accurate and only use information from the provided context.

      Book Context:
      ${context}

      Question: ${question}

      Please provide a detailed answer based on the book content.`
    );

    const responseText = response.response.text();
    return responseText || 'Unable to generate answer.';
  } catch (error) {
    console.error('Error generating answer:', error);
    throw error;
  }
}

// Generate summary of book content using Gemini
export async function generateBookSummary(content: string, bookTitle: string): Promise<string> {
  try {
    // Split into chunks if content is too long
    const maxChars = 10000;
    const contentToSummarize = content.substring(0, maxChars);

    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-pro' });
    
    const response = await model.generateContent(
      `You are an expert at summarizing book content. Create a clear, concise summary that captures the main ideas and key points.
      Format the summary in a readable way with paragraphs.

      Book: "${bookTitle}"

      Content:
      ${contentToSummarize}`
    );

    const responseText = response.response.text();
    return responseText || 'Unable to generate summary.';
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
