import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Thumbnail Generator Service
 * Generates thumbnail images from PDF and PPTX files
 */

/**
 * Configuration
 */
const THUMBNAIL_DIR = process.env.THUMBNAIL_DIR || path.join(__dirname, '../../uploads/thumbnails');
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

// Ensure thumbnail directory exists
if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
}

/**
 * Generate thumbnail from PDF using pdf-poppler or GraphicsMagick
 * @param {string} pdfPath - Path to PDF file
 * @param {string} outputPath - Output path for thumbnail
 * @returns {Promise<string>} Path to generated thumbnail
 */
export async function generatePdfThumbnail(pdfPath, outputPath) {
  try {
    // Method 1: Using GraphicsMagick (if installed)
    // Install: choco install graphicsmagick (Windows) or brew install graphicsmagick (Mac)
    const command = `gm convert -density 150 "${pdfPath}[0]" -resize ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT} -quality 85 "${outputPath}"`;
    
    await execPromise(command);
    return outputPath;
  } catch (error) {
    console.error('GraphicsMagick thumbnail generation failed:', error.message);
    
    try {
      // Method 2: Fallback to ImageMagick
      const command = `convert -density 150 "${pdfPath}[0]" -resize ${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT} -quality 85 "${outputPath}"`;
      
      await execPromise(command);
      return outputPath;
    } catch (fallbackError) {
      console.error('ImageMagick thumbnail generation also failed:', fallbackError.message);
      throw new Error('Thumbnail generation failed. Please install GraphicsMagick or ImageMagick.');
    }
  }
}

/**
 * Generate thumbnail from PPTX using LibreOffice
 * @param {string} pptxPath - Path to PPTX file
 * @param {string} outputPath - Output path for thumbnail
 * @returns {Promise<string>} Path to generated thumbnail
 */
export async function generatePptxThumbnail(pptxPath, outputPath) {
  try {
    const tempDir = path.dirname(outputPath);
    
    // Convert first page to PDF using LibreOffice
    // Install: choco install libreoffice (Windows) or brew install libreoffice (Mac)
    const convertCommand = `soffice --headless --convert-to pdf --outdir "${tempDir}" "${pptxPath}"`;
    await execPromise(convertCommand);
    
    // Get the generated PDF path
    const pdfPath = outputPath.replace(/\.\w+$/, '.pdf');
    
    // Convert PDF to image
    await generatePdfThumbnail(pdfPath, outputPath);
    
    // Clean up temporary PDF
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    
    return outputPath;
  } catch (error) {
    console.error('PPTX thumbnail generation failed:', error.message);
    throw new Error('PPTX thumbnail generation failed. Please install LibreOffice.');
  }
}

/**
 * Generate thumbnail for a slide file
 * @param {string} filePath - Path to the slide file (PDF or PPTX)
 * @param {string} fileType - File type (pdf, pptx, ppt)
 * @param {string} slideId - Slide ID for naming
 * @returns {Promise<Object>} Object containing thumbnail path and URL
 */
export async function generateSlideThumbnail(filePath, fileType, slideId) {
  const filename = `slide_${slideId}_thumbnail.jpg`;
  const outputPath = path.join(THUMBNAIL_DIR, filename);
  
  try {
    let thumbnailPath;
    
    switch (fileType.toLowerCase()) {
      case 'pdf':
        thumbnailPath = await generatePdfThumbnail(filePath, outputPath);
        break;
      
      case 'pptx':
      case 'ppt':
        thumbnailPath = await generatePptxThumbnail(filePath, outputPath);
        break;
      
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
    
    // Generate URL (adjust based on your server configuration)
    const thumbnailUrl = `/uploads/thumbnails/${filename}`;
    
    return {
      path: thumbnailPath,
      url: thumbnailUrl,
      filename: filename
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    
    // Return placeholder as fallback
    const placeholderUrl = generatePlaceholderUrl(fileType);
    return {
      path: null,
      url: placeholderUrl,
      filename: null,
      isPlaceholder: true
    };
  }
}

/**
 * Generate placeholder URL for file type
 * @param {string} fileType - File type
 * @returns {string} Placeholder URL
 */
function generatePlaceholderUrl(fileType) {
  const colors = {
    pdf: '4A90E2',
    pptx: '50C878',
    ppt: 'FF6B6B'
  };
  
  const color = colors[fileType] || '9B59B6';
  return `https://via.placeholder.com/${THUMBNAIL_WIDTH}x${THUMBNAIL_HEIGHT}/${color}/ffffff?text=${fileType.toUpperCase()}+Slide`;
}

/**
 * Delete thumbnail file
 * @param {string} filename - Thumbnail filename
 */
export function deleteThumbnail(filename) {
  if (!filename) return;
  
  const filePath = path.join(THUMBNAIL_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Check if required tools are installed
 * @returns {Promise<Object>} Status of required tools
 */
export async function checkThumbnailTools() {
  const tools = {
    graphicsMagick: false,
    imageMagick: false,
    libreOffice: false
  };
  
  try {
    await execPromise('gm version');
    tools.graphicsMagick = true;
  } catch (e) {
    // Not installed
  }
  
  try {
    await execPromise('convert -version');
    tools.imageMagick = true;
  } catch (e) {
    // Not installed
  }
  
  try {
    await execPromise('soffice --version');
    tools.libreOffice = true;
  } catch (e) {
    // Not installed
  }
  
  return tools;
}

export default {
  generateSlideThumbnail,
  generatePdfThumbnail,
  generatePptxThumbnail,
  deleteThumbnail,
  checkThumbnailTools
};
