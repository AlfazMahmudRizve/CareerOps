const PDFParser = require("pdf2json");

console.log("Checking pdf2json API...");

try {
    const parser = new PDFParser(null, 1);
    console.log("Parser instantiated.");

    if (typeof parser.getRawTextContent === 'function') {
        console.log("SUCCESS: parser.getRawTextContent is a function.");
    } else {
        console.log("FAILURE: parser.getRawTextContent is NOT a function.");
        console.log("Available properties on parser:", Object.keys(parser));
        console.log("Available prototype properties:", Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
    }

} catch (error) {
    console.error("Error instantiating parser:", error);
}
