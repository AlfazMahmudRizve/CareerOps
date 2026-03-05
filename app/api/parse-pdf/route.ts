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
                try {
                    let extractedText = '';

                    if (pdfData && pdfData.Pages) {
                        pdfData.Pages.forEach((page: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                            if (page.Texts) {
                                // Sort text items by Y position first, then X position
                                // This preserves the visual layout of the PDF
                                const sortedTexts = [...page.Texts].sort((a: any, b: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    const yDiff = (a.y || 0) - (b.y || 0);
                                    if (Math.abs(yDiff) > 0.3) return yDiff; // Different line (threshold)
                                    return (a.x || 0) - (b.x || 0); // Same line, sort by X
                                });

                                let lastY = -1;

                                sortedTexts.forEach((textObj: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    if (textObj.R) {
                                        const currentY = textObj.y || 0;

                                        // If Y position changed significantly, insert a newline
                                        if (lastY >= 0 && Math.abs(currentY - lastY) > 0.3) {
                                            extractedText += '\n';
                                        }
                                        lastY = currentY;

                                        textObj.R.forEach((run: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                                            if (run.T) {
                                                try {
                                                    const decoded = decodeURIComponent(run.T);
                                                    extractedText += decoded + ' ';
                                                } catch {
                                                    extractedText += run.T + ' ';
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                            // Add a page break
                            extractedText += '\n\n';
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
