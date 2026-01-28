import { NextRequest, NextResponse } from 'next/server';

// 1. FORCE Node.js Runtime (Crucial for pdf-parse)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    console.log("🔹 API /parse-pdf hit");

    try {
        // 2. Parse Form Data
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error("❌ No file found in FormData");
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        console.log(`🔹 File received: ${file.name} (${file.size} bytes)`);

        // 3. Convert to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        console.log("🔹 Buffer created successfully");

        // 4. Load Parser Safe-Mode
        // We use a try-require pattern to handle different build environments
        let pdfParse;
        try {
            // @ts-ignore
            pdfParse = require('pdf-parse');
        } catch (e) {
            console.error("❌ Failed to require('pdf-parse')");
            throw new Error("Server configuration error: pdf-parse missing");
        }

        // 5. Execute Parse
        console.log("🔹 Starting PDF extraction...");
        const data = await pdfParse(buffer);
        console.log("✅ Success! Extracted chars:", data.text.length);

        return NextResponse.json({ text: data.text });

    } catch (error: any) {
        console.error('🔥 CRITICAL PARSE ERROR:', error);
        return NextResponse.json(
            { error: 'Failed to parse PDF', details: error.message },
            { status: 500 }
        );
    }
}
