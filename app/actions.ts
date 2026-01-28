'use server';
/* eslint-disable */

const pdf = require('pdf-parse');

export async function extractTextFromPDF(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);

        return { success: true, text: data.text };
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        return { success: false, error: 'Failed to extract text from PDF' };
    }
}
