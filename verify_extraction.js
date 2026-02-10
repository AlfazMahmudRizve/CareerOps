// verify_extraction.js
// Simulating the extraction logic to verify correctness

const mockPdfData = {
    Pages: [
        {
            Texts: [
                { R: [{ T: "Hello%20World" }] },
                { R: [{ T: "This%20is%20a%20test" }] },
                { R: [{ T: "With%20special%20chars%3A%20%26%20more" }] }
            ]
        },
        {
            Texts: [
                { R: [{ T: "Page%202" }] }
            ]
        }
    ]
};

function extractText(pdfData) {
    let extractedText = '';

    // pdfData.Pages is an array of pages
    if (pdfData && pdfData.Pages) {
        pdfData.Pages.forEach((page) => {
            // page.Texts is an array of text objects
            if (page.Texts) {
                page.Texts.forEach((textObj) => {
                    // textObj.R is an array of text runs
                    if (textObj.R) {
                        textObj.R.forEach((run) => {
                            // run.T is the actual text, URI encoded
                            if (run.T) {
                                try {
                                    const decoded = decodeURIComponent(run.T);
                                    extractedText += decoded + ' ';
                                } catch (e) {
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
    return extractedText.trim();
}

console.log("--- Mock Data ---");
console.log(JSON.stringify(mockPdfData, null, 2));

console.log("\n--- Extracted Text ---");
const result = extractText(mockPdfData);
console.log(result);

const expected = "Hello World This is a test With special chars: & more \nPage 2";
if (result === expected.trim()) {
    console.log("\nSUCCESS: Extraction matched expected output.");
} else {
    console.log("\nFAILURE: Output did not match expectation.");
    console.log("Expected:\n" + expected);
    console.log("Got:\n" + result);
}
