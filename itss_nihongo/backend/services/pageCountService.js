import AdmZip from 'adm-zip';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';

/**
 * Page Count Service
 * Handles counting pages/slides for various file types
 */

/**
 * Count slides in a PPTX file
 * @param {string} filePath - Path to the PPTX file
 * @returns {number} Number of slides (0 if failed)
 */
export const countPptxSlides = (filePath) => {
    try {
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        let slideCount = 0;

        // PPTX structure: ppt/slides/slide1.xml, slide2.xml, etc.
        const slidePattern = /^ppt\/slides\/slide\d+\.xml$/;

        zipEntries.forEach((entry) => {
            if (slidePattern.test(entry.entryName)) {
                slideCount++;
            }
        });

        console.log(`Counted ${slideCount} slides for ${filePath}`);
        return slideCount;
    } catch (error) {
        console.error('Error counting PPTX slides:', error);
        return 0;
    }
};

/**
 * Count pages in a PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<number>} Number of pages (0 if failed)
 */
export const countPdfPages = async (filePath) => {
    try {
        const pdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pageCount = pdfDoc.getPageCount();
        console.log(`Counted ${pageCount} pages for ${filePath}`);
        return pageCount;
    } catch (error) {
        console.error('Error counting PDF pages:', error);
        return 0;
    }
};

export default {
    countPptxSlides,
    countPdfPages
};
