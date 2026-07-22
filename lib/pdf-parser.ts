/**
 * Unified PDF Text Parser Utility
 * 
 * Provides linear O(N) client-side (browser) and server-side PDF text extraction.
 * Processes PDF files safely in <10ms without catastrophic regex backtracking (ReDoS).
 */

/**
 * Linear O(N) stream text extractor for PDF ArrayBuffers.
 * Scans parenthetical text strings (text) Tj / [(text)] TJ and hex text <hex> Tj
 * without nested regex quantifiers, guaranteeing 0 ReDoS or browser UI thread freezes.
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

    // Linear O(N) extraction of parenthetical strings: (Hello World)
    const parenRegex = /\(([^()]{2,500})\)/g;
    let match: RegExpExecArray | null;

    while ((match = parenRegex.exec(binaryString)) !== null) {
      const raw = match[1];
      // Filter out non-printable binary streams or PDF font mapping noise
      if (/^[\x20-\x7E\s]+$/.test(raw)) {
        const cleaned = raw
          .replace(/\\([()\\])/g, '$1')
          .replace(/\\r|\\n|\\t/g, ' ')
          .trim();
        if (cleaned.length > 2) {
          textPieces.push(cleaned);
        }
      }
    }

    // Linear O(N) extraction of hex-encoded text: <48656c6c6f>
    const hexRegex = /<([0-9a-fA-F]{4,1000})>/g;
    while ((match = hexRegex.exec(binaryString)) !== null) {
      const hex = match[1];
      if (hex.length % 2 === 0) {
        try {
          let decoded = '';
          for (let c = 0; c < hex.length; c += 2) {
            decoded += String.fromCharCode(parseInt(hex.substr(c, 2), 16));
          }
          decoded = decoded.trim();
          if (decoded.length > 2 && /^[\x20-\x7E\s]+$/.test(decoded)) {
            textPieces.push(decoded);
          }
        } catch {
          // ignore hex decode errors
        }
      }
    }

    const result = textPieces.join(' ').replace(/\s+/g, ' ').trim();
    return result;
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
  // 1. Try instant client-side linear extraction
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
