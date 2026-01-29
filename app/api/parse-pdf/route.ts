import { NextRequest, NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

// Force Node.js runtime (required for file system access)
export const runtime = 'nodejs';

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

        // 2. Parse using pdf2json (Wrapped in a Promise)
        const text = await new Promise<string>((resolve, reject) => {
            const parser = new PDFParser(null, 1); // 1 = text content only

            parser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF Parser Error:", errData.parserError);
                reject(errData.parserError);
            });

            parser.on("pdfParser_dataReady", (pdfData: any) => {
                // The library returns URL-encoded text sometimes, so we decode it
                // Note: The user provided code uses parser.getRawTextContent(). 
                // We need to ensure we cast correctly or use the raw text if available from the event, 
                // but the prompt explicitly asked for: (parser as any).getRawTextContent();
                const rawText = (parser as any).getRawTextContent();
                resolve(rawText);
            });

            parser.parseBuffer(buffer);
        });

        return NextResponse.json({ text });

    } catch (error: any) {
        console.error('PDF Processing Error:', error);
        return NextResponse.json(
            { error: 'Failed to parse PDF', details: error.message },
            { status: 500 }
        );
    }
}
