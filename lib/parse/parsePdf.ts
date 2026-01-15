import * as pdfjsLib from "pdfjs-dist";

// Configure the worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

/**
 * Parse a PDF file and extract plain text from all pages.
 *
 * @param file - The PDF file to parse
 * @returns Promise resolving to the extracted text
 */
export async function parsePdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    const textParts: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => {
          if ("str" in item) {
            return item.str;
          }
          return "";
        })
        .join(" ");
      textParts.push(pageText);
    }

    const fullText = textParts.join("\n\n");

    // Check if we got any meaningful text
    if (fullText.trim().length === 0) {
      throw new Error("No readable text found. The PDF may be scanned or image-based.");
    }

    return fullText;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("Failed to parse PDF:", error);
    throw new Error("Failed to parse PDF file. The file may be corrupted.");
  }
}
