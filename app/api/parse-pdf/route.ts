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
            const parser = new PDFParser(null, true); // true = text content only

            parser.on("pdfParser_dataError", (errData: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                console.error("PDF Parser Error:", errData.parserError);
                reject(errData.parserError);
            });

            parser.on("pdfParser_dataReady", (pdfData: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                // Manual extraction for better control
                try {
                    let extractedText = '';

                    // pdfData.Pages is an array of pages
                    if (pdfData && pdfData.Pages) {
                        pdfData.Pages.forEach((page: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            // page.Texts is an array of text objects
                            if (page.Texts) {
                                page.Texts.forEach((textObj: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    // textObj.R is an array of text runs
                                    if (textObj.R) {
                                        textObj.R.forEach((run: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                            // run.T is the actual text, URI encoded
                                            if (run.T) {
                                                try {
                                                    const decoded = decodeURIComponent(run.T);
                                                    extractedText += decoded + ' ';
                                                } catch {
                                                    // Fallback if decoding fails
                                                    extractedText += run.T + ' ';
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                            // Add a newline after each page
                            extractedText += '\n';
                        });
                    }

                    resolve(extractedText.trim());
                } catch (err) {
                    reject(err);
                }
            });

            parser.parseBuffer(buffer);
        });

        return NextResponse.json({ text });

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error('PDF Processing Error:', error);
        return NextResponse.json(
            { error: 'Failed to parse PDF', details: error.message },
            { status: 500 }
        );
    }
}
