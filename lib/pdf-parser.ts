/**
 * Unified PDF Text Parser Utility
 * 
 * Provides client-side (browser) and server-side PDF text extraction.
 * Client-side extraction processes PDF files directly in the user's browser (<50ms),
 * avoiding network binary uploads, Vercel payload limits, and serverless 504 timeouts.
 */

/**
 * Fast synchronous stream text extractor for PDF ArrayBuffers.
 * Parses PDF streams, text blocks (BT...ET), parenthetical strings (text) Tj / [(text)] TJ,
 * and hex-encoded text <hex> Tj directly from the binary buffer in <20ms.
 */
export function extractRawTextFromArrayBuffer(arrayBuffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binaryString += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }

    const textPieces: string[] = [];

    // 1. Parenthetical strings inside Tj or TJ operators: (Hello World) Tj
    const tjMatches = binaryString.match(/\(([^()]*)\)\s*(?:Tj|'|")/g) || [];
    for (const match of tjMatches) {
      const m = match.match(/\(([^()]*)\)/);
      if (m && m[1]) {
        const cleaned = m[1]
          .replace(/\\([()\\])/g, '$1')
          .replace(/\\r|\\n|\\t/g, ' ')
          .trim();
        if (cleaned.length > 0) {
          textPieces.push(cleaned);
        }
      }
    }

    // 2. Array text items inside TJ operators: [(Hello) -10 (World)] TJ
    const arrayTjMatches = binaryString.match(/\[\s*(?:\([^()]*\)|[^\%\)\]]+)*\]\s*TJ/gi) || [];
    for (const match of arrayTjMatches) {
      const strings = match.match(/\(([^()]*)\)/g) || [];
      const line = strings
        .map(s => s.slice(1, -1).replace(/\\([()\\])/g, '$1'))
        .join('');
      if (line.trim().length > 0) {
        textPieces.push(line.trim());
      }
    }

    // 3. Hex-encoded strings inside Tj: <48656c6c6f> Tj
    const hexMatches = binaryString.match(/<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g) || [];
    for (const match of hexMatches) {
      const m = match.match(/<([0-9a-fA-F]+)>/);
      if (m && m[1] && m[1].length % 2 === 0) {
        try {
          const hex = m[1];
          let decoded = '';
          for (let c = 0; c < hex.length; c += 2) {
            decoded += String.fromCharCode(parseInt(hex.substr(c, 2), 16));
          }
          decoded = decoded.trim();
          if (decoded.length > 0 && /^[\x20-\x7E\s]+$/.test(decoded)) {
            textPieces.push(decoded);
          }
        } catch {
          // ignore hex decode errors
        }
      }
    }

    return textPieces.join(' ').replace(/\s+/g, ' ').trim();
  } catch (err) {
    console.error('Client PDF text extraction error:', err);
    return '';
  }
}

/**
 * Extract text from a File object in the browser or Node.
 * Tries instant client-side extraction first, falling back to /api/parse-pdf if needed.
 */
export async function parsePdfFile(file: File): Promise<string> {
  // 1. Try instant client-side extraction
  try {
    const arrayBuffer = await file.arrayBuffer();
    const clientText = extractRawTextFromArrayBuffer(arrayBuffer);
    if (clientText && clientText.length >= 20) {
      return clientText;
    }
  } catch (err) {
    console.warn('Client-side PDF extraction skipped or returned short text:', err);
  }

  // 2. Fallback to API endpoint if client extraction returned insufficient text
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    let msg = 'Failed to parse PDF file';
    if (contentType && contentType.includes('application/json')) {
      const json = await response.json();
      msg = json.error || msg;
    }
    throw new Error(msg);
  }

  const data = await response.json();
  return data.text;
}
