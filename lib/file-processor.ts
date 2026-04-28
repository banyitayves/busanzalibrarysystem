import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export interface FileContent {
  text: string;
  fileName: string;
  fileType: string;
}

export async function extractTextFromFile(filePath: string): Promise<FileContent> {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath).toLowerCase();

  try {
    if (fileExt === '.pdf') {
      return await extractFromPDF(filePath, fileName);
    } else if (fileExt === '.txt') {
      return await extractFromTxt(filePath, fileName);
    } else if (fileExt === '.docx' || fileExt === '.doc') {
      // For now, treat DOCX/DOC files as text (limited support)
      // In production, consider using a proper DOCX parser library
      return await extractFromTxt(filePath, fileName);
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
  } catch (error) {
    console.error(`Error extracting text from ${fileName}:`, error);
    throw error;
  }
}

async function extractFromPDF(filePath: string, fileName: string): Promise<FileContent> {
  try {
    // For large files, read in chunks to avoid memory overflow
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    // If file is larger than 50MB, log a warning but still process
    if (fileSize > 50 * 1024 * 1024) {
      console.warn(`Large file detected: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)}MB). Processing may take longer.`);
    }

    // Read file with a reasonable buffer size
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    return {
      text: data.text || '',
      fileName,
      fileType: 'pdf',
    };
  } catch (error) {
    console.error(`Error extracting PDF ${fileName}:`, error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function extractFromTxt(filePath: string, fileName: string): Promise<FileContent> {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    
    return {
      text,
      fileName,
      fileType: path.extname(fileName).replace('.', '') || 'txt',
    };
  } catch (error) {
    console.error(`Error extracting TXT ${fileName}:`, error);
    throw new Error(`Failed to extract text from file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Split text into chunks for processing
export function splitTextIntoChunks(text: string, chunkSize: number = 3000, overlap: number = 300): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end);
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
    start = end - overlap;
  }

  return chunks.length > 0 ? chunks : [text]; // Return at least the original text
}

// Sanitize and clean text
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\n+/g, '\n') // Replace multiple newlines with single newline
    .replace(/[^\w\s\n.,!?;:\-()]/g, '') // Remove special characters except common punctuation
    .trim();
}
