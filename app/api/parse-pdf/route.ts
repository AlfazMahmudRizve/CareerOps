import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Linear O(N) stream text extractor for PDF Buffers.
 * Scans parenthetical text strings (text) Tj / [(text)] TJ and hex text <hex> Tj
 * without nested regex quantifiers, guaranteeing 0 ReDoS.
 */
function extractRawPdfText(buffer: Buffer): string {
  try {
    const binaryString = buffer.toString('latin1');
    const textPieces: string[] = [];

    // Linear O(N) extraction of parenthetical strings: (Hello World)
    const parenRegex = /\(([^()]{2,500})\)/g;
    let match: RegExpExecArray | null;

    while ((match = parenRegex.exec(binaryString)) !== null) {
      const raw = match[1];
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
          const decoded = Buffer.from(hex, 'hex').toString('utf8').trim();
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
    console.error('Raw PDF fallback extraction failed:', err);
    return '';
  }
}

/**
 * Execute pdf-parse with a strict 3-second timeout to prevent serverless hanging.
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
