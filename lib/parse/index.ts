import { parseDocx } from "./parseDocx";
import { parsePdf } from "./parsePdf";

/**
 * Parse a file and extract plain text.
 * Supports TXT, DOCX, and PDF formats.
 *
 * @param file - The file to parse
 * @returns Promise resolving to the extracted text
 */
export async function parseFile(file: File): Promise<string> {
  const extension = file.name.toLowerCase().split(".").pop();

  switch (extension) {
    case "txt":
      return await file.text();

    case "docx":
      return await parseDocx(file);

    case "pdf":
      return await parsePdf(file);

    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
}

export { parseDocx } from "./parseDocx";
export { parsePdf } from "./parsePdf";
