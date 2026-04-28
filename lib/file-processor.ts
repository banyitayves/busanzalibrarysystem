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
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    
    if (fileSize > 50 * 1024 * 1024) {
      console.warn(`Large file detected: ${fileName} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
    }

    const dataBuffer = fs.readFileSync(filePath);
    
    // Validate PDF header
    if (!dataBuffer.toString('utf8', 0, 4).startsWith('%PDF')) {
      console.warn(`File ${fileName} may not be a valid PDF (missing header)`);
    }

    const data = await pdfParse(dataBuffer);
    
    let text = data.text || '';
    
    // If PDF parsing failed or returned empty/corrupted text, provide fallback
    if (!text || text.length < 10 || text.includes('\x00\x00\x00')) {
      console.warn(`PDF ${fileName} returned corrupted or empty text, using fallback`);
      // Return placeholder with file info
      text = `Document: ${fileName}\n\nThis PDF file was uploaded but the text extraction encountered issues. The document is stored and can be referenced, but detailed content analysis may require manual review.\n\nFile size: ${fileSize} bytes`;
    }
    
    return {
      text: text.trim(),
      fileName,
      fileType: 'pdf',
    };
  } catch (error) {
    console.error(`Error extracting PDF ${fileName}:`, error);
    // Return placeholder text instead of throwing
    return {
      text: `Document: ${fileName}\n\nThe PDF could not be fully processed. The document is saved in the library and can still be referenced or borrowed.`,
      fileName,
      fileType: 'pdf',
    };
  }
}

async function extractFromTxt(filePath: string, fileName: string): Promise<FileContent> {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    
    return {
      text: text.trim(),
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

  return chunks.length > 0 ? chunks : [text];
}

// Sanitize and clean text
export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\n+/g, '\n')
    .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}
