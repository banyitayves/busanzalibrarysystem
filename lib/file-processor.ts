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
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  
  return {
    text: data.text || '',
    fileName,
    fileType: 'pdf',
  };
}

async function extractFromTxt(filePath: string, fileName: string): Promise<FileContent> {
  const text = fs.readFileSync(filePath, 'utf-8');
  
  return {
    text,
    fileName,
    fileType: path.extname(fileName).replace('.', '') || 'txt',
  };
}

// Split text into chunks for processing
export function splitTextIntoChunks(text: string, chunkSize: number = 2000, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.substring(start, end));
    start = end - overlap;
  }

  return chunks;
}

// Sanitize and clean text
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();
}
