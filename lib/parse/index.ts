import { parseDocx } from "./parseDocx";
import { parsePdf } from "./parsePdf";
import { parseEpub } from "./parseEpub";

/**
 * Parse a file and extract plain text.
 * Supports TXT, DOCX, PDF, and EPUB formats.
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

    case "epub":
      return await parseEpub(file);

    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
}

export { parseDocx } from "./parseDocx";
export { parsePdf } from "./parsePdf";
export { parseEpub, getEpubMetadata } from "./parseEpub";
