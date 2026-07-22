import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Fallback raw text extractor for PDF buffers if pdf-parse fails or is missing dependencies in Vercel serverless environment.
 */
function extractRawPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString('latin1');
    const textPieces: string[] = [];

    // Match text within parenthesis inside TJ / Tj operators: (text) Tj or [(text)] TJ
    const tjMatches = content.match(/\(([^()]*)\)\s*(?:Tj|'|")/g) || [];
    for (const match of tjMatches) {
      const m = match.match(/\(([^()]*)\)/);
      if (m && m[1]) {
        const cleaned = m[1]
          .replace(/\\([()\\])/g, '$1') // unescape \( \) \\
          .replace(/\\r|\\n/g, ' ')
          .trim();
        if (cleaned.length > 0) {
          textPieces.push(cleaned);
        }
      }
    }

    // Match array text items inside TJ arrays: [(item1) -10 (item2)] TJ
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

    const result = textPieces.join(' ').replace(/\s+/g, ' ').trim();
    return result;
  } catch (err) {
    console.error('Raw PDF fallback extraction failed:', err);
    return '';
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // 2. Primary Strategy: Try pdf-parse
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length > 0) {
        extractedText = data.text.trim();
      }
    } catch (parseErr) {
      console.warn('Primary pdf-parse failed, trying internal lib:', parseErr);
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParseInternal = require('pdf-parse/lib/pdf-parse');
        const data = await pdfParseInternal(buffer);
        if (data && data.text && data.text.trim().length > 0) {
          extractedText = data.text.trim();
        }
      } catch (internalErr) {
        console.warn('Internal pdf-parse lib failed:', internalErr);
      }
    }

    // 3. Secondary Strategy: Fallback raw stream text extraction
    if (!extractedText || extractedText.length < 10) {
      console.log('Attempting raw stream PDF extraction fallback...');
      const fallbackText = extractRawPdfText(buffer);
      if (fallbackText && fallbackText.length > extractedText.length) {
        extractedText = fallbackText;
      }
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Failed to extract text from PDF. The PDF may be scanned as an image or empty.' },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: extractedText });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('PDF Processing Error:', errorMessage);
    return NextResponse.json(
      { error: `PDF extraction error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
