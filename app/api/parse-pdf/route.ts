import { NextRequest, NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * Safely load @firecrawl/pdf-inspector without Webpack binary build errors.
 */
function getPdfInspector() {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require');
    return req('@firecrawl/pdf-inspector');
  } catch {
    return null;
  }
}

/**
 * Linear O(N) stream text extractor for PDF Buffers fallback.
 */
function extractRawPdfText(buffer: Buffer): string {
  try {
    const binaryString = buffer.toString('latin1');
    const textPieces: string[] = [];

    const parenRegex = /\(([^()]{2,500})\)/g;
    let match: RegExpExecArray | null;

    while ((match = parenRegex.exec(binaryString)) !== null) {
      const raw = match[1];
      if (/^[\x20-\x7E\s]+$/.test(raw)) {
        const cleaned = raw
          .replace(/\\([()\\])/g, '$1')
          .replace(/\\r|\\n|\\t/g, ' ')
          .trim();
        if (
          cleaned.length > 2 &&
          !/opensource|anonymous|producer|creator|metadata|xml|font|subsystem|adobe/i.test(cleaned)
        ) {
          textPieces.push(cleaned);
        }
      }
    }

    return textPieces.join(' ').replace(/\s+/g, ' ').trim();
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let extractedText = '';

    // 1. Primary Strategy: Guaranteed pdf-parse parser (bundled by Webpack for Vercel Serverless)
    try {
      const data = await pdfParse(buffer);
      if (data && data.text && data.text.trim().length >= 15) {
        extractedText = data.text.trim();
      }
    } catch (err) {
      console.warn('[parse-pdf] pdf-parse call failed:', err);
    }

    // 2. Secondary Strategy: Rust-powered @firecrawl/pdf-inspector if loaded
    if (!extractedText || extractedText.length < 15) {
      const pdfInspector = getPdfInspector();
      if (pdfInspector) {
        try {
          const inspectRes = pdfInspector.processPdf(buffer);
          if (inspectRes && inspectRes.markdown && inspectRes.markdown.trim().length >= 10) {
            extractedText = inspectRes.markdown.trim();
          } else if (typeof pdfInspector.extractText === 'function') {
            extractedText = pdfInspector.extractText(buffer).trim();
          }
        } catch (err) {
          console.warn('[parse-pdf] @firecrawl/pdf-inspector execution failed:', err);
        }
      }
    }

    // 3. Tertiary Strategy: Raw stream text extraction fallback
    if (!extractedText || extractedText.length < 15) {
      console.log('[parse-pdf] Trying raw stream text extraction fallback...');
      extractedText = extractRawPdfText(buffer);
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
