import mammoth from "mammoth";

/**
 * Parse a DOCX file and extract plain text.
 *
 * @param file - The DOCX file to parse
 * @returns Promise resolving to the extracted text
 */
export async function parseDocx(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error("Failed to parse DOCX:", error);
    throw new Error("Failed to parse DOCX file. The file may be corrupted.");
  }
}
