import { NextRequest, NextResponse } from 'next/server';

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

        // 2. Parse PDF using pdf-parse v1.1.1
        //    Import the internal lib directly to avoid the index.js test-file bug
        //    that tries to read ./test/data/05-versions-space.pdf on startup
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse/lib/pdf-parse');
        const data = await pdfParse(buffer);

        if (!data || !data.text) {
            return NextResponse.json(
                { error: 'Failed to extract text from PDF.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ text: data.text });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('PDF Processing Error:', errorMessage);
        return NextResponse.json(
            { error: 'Failed to parse PDF', details: errorMessage },
            { status: 500 }
        );
    }
}
