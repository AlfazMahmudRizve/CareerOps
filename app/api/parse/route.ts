/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdf = require('pdf-parse');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`Parsing PDF: ${file.name}, Size: ${buffer.length} bytes`);
        const data = await pdf(buffer);
        console.log("PDF parsed successfully. Text length:", data.text.length);

        return NextResponse.json({ text: data.text });
    } catch (error) {
        console.error('PDF Parse Error:', error);
        return NextResponse.json({ error: 'Failed to parse PDF' }, { status: 500 });
    }
}
