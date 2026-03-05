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
                                let lastX = -1;
                                let lastWidth = 0;

                                sortedTexts.forEach((textObj: any) => {
                                    if (textObj.R) {
                                        const currentY = textObj.y || 0;
                                        const currentX = textObj.x || 0;

                                        // 1. Line Break Logic
                                        if (lastY >= 0 && Math.abs(currentY - lastY) > 0.3) {
                                            extractedText = extractedText.trim() + '\n';
                                            lastX = -1; // Reset X for new line
                                        }

                                        // 2. Horizontal Spacing Logic
                                        // If we are on the same line, check the gap between last block's end and current block's start
                                        if (lastX >= 0 && Math.abs(currentY - lastY) <= 0.3) {
                                            const gap = currentX - (lastX + lastWidth);
                                            // pdf2json x units are roughly characters.
                                            // A gap > 0.1 usually means a space is intended if not already present.
                                            if (gap > 0.1 && !extractedText.endsWith(' ')) {
                                                extractedText += ' ';
                                            }
                                        }

                                        lastY = currentY;
                                        lastX = currentX;
                                        lastWidth = textObj.w || 0;

                                        textObj.R.forEach((run: any) => {
                                            if (run.T) {
                                                try {
                                                    const decoded = decodeURIComponent(run.T);
                                                    // Only add space if decoded value doesn't already have one and it's not empty
                                                    extractedText += decoded;
                                                } catch {
                                                    extractedText += run.T;
                                                }
                                            }
                                        });
                                        // Add a space after each block's runs to be safe,
                                        // but trim double spaces later
                                        if (!extractedText.endsWith(' ')) {
                                            extractedText += ' ';
                                        }
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
