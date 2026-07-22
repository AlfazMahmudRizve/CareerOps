import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Fast synchronous PDF text extractor.
 * Parses PDF streams, text blocks (BT...ET), strings inside (text) Tj / [(text)] TJ,
 * and hex-encoded text <hex> Tj. Runs in < 20ms with 0 external dependencies.
 */
function extractRawPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString('latin1');
    const textPieces: string[] = [];

    // 1. Parenthetical strings inside Tj or TJ operators: (Hello World) Tj
    const tjMatches = content.match(/\(([^()]*)\)\s*(?:Tj|'|")/g) || [];
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
    const arrayTjMatches = content.match(/\[\s*(?:\([^()]*\)|[^\%\)\]]+)*\]\s*TJ/gi) || [];
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
    const hexMatches = content.match(/<([0-9a-fA-F]+)>\s*(?:Tj|'|")/g) || [];
    for (const match of hexMatches) {
      const m = match.match(/<([0-9a-fA-F]+)>/);
      if (m && m[1] && m[1].length % 2 === 0) {
        try {
          const decoded = Buffer.from(m[1], 'hex').toString('utf8').trim();
          if (decoded.length > 0 && /^[\x20-\x7E\s]+$/.test(decoded)) {
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
    console.error('Raw PDF fallback extraction failed:', err);
    return '';
  }
}

/**
 * Execute pdf-parse with a strict 3-second timeout to prevent serverless hanging (504 Gateway Timeout).
 */
async function parsePdfWithTimeout(buffer: Buffer, timeoutMs = 3000): Promise<string> {
  return new Promise((resolve) => {
    let completed = false;

    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        console.warn(`[parse-pdf] pdf-parse exceeded ${timeoutMs}ms limit, cancelling.`);
        resolve('');
      }
    }, timeoutMs);

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      pdfParse(buffer)
        .then((data: { text?: string }) => {
          if (!completed) {
            completed = true;
            clearTimeout(timer);
            resolve(data?.text || '');
          }
        })
        .catch((err: unknown) => {
          if (!completed) {
            completed = true;
            clearTimeout(timer);
            console.warn('[parse-pdf] pdf-parse thrown:', err);
            resolve('');
          }
        });
    } catch (err) {
      if (!completed) {
        completed = true;
        clearTimeout(timer);
        console.warn('[parse-pdf] require(pdf-parse) failed:', err);
        resolve('');
      }
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Primary Strategy: pdf-parse bounded by a 3-second timeout
    let extractedText = await parsePdfWithTimeout(buffer, 3000);

    // 3. Secondary Strategy: Instant raw stream text extraction fallback
    if (!extractedText || extractedText.trim().length < 15) {
      console.log('[parse-pdf] Trying fast raw stream PDF text extraction fallback...');
      const fallbackText = extractRawPdfText(buffer);
      if (fallbackText && fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Failed to extract text from PDF. The file may be an image-only scan or encrypted.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText.trim() });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF Processing Error:', errorMessage);
    return NextResponse.json(
      { error: `PDF extraction error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
