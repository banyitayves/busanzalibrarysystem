declare module 'pdf-parse' {
  function pdfParse(dataBuffer: Buffer): Promise<{
    version: string;
    numpages: number;
    info: unknown;
    metadata: unknown;
    text: string;
    [key: string]: unknown;
  }>;

  export default pdfParse;
}
