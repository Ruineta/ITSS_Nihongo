import express from 'express';
import { checkThumbnailTools } from '../services/thumbnailService.js';

const router = express.Router();

/**
 * @route   GET /api/system/thumbnail-tools
 * @desc    Check if required thumbnail generation tools are installed
 * @access  Public (for development/testing)
 */
router.get('/thumbnail-tools', async (req, res) => {
  try {
    const tools = await checkThumbnailTools();
    
    const allToolsInstalled = tools.graphicsMagick || tools.imageMagick;
    const pptxSupport = tools.libreOffice;
    
    return res.status(200).json({
      success: true,
      tools: {
        graphicsMagick: {
          installed: tools.graphicsMagick,
          purpose: 'PDF thumbnail generation (recommended)'
        },
        imageMagick: {
          installed: tools.imageMagick,
          purpose: 'PDF thumbnail generation (alternative)'
        },
        libreOffice: {
          installed: tools.libreOffice,
          purpose: 'PPTX thumbnail generation'
        }
      },
      capabilities: {
        pdfThumbnails: allToolsInstalled,
        pptxThumbnails: pptxSupport,
        ready: allToolsInstalled
      },
      recommendations: generateRecommendations(tools)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to check tools',
      error: error.message
    });
  }
});

/**
 * Generate installation recommendations based on missing tools
 */
function generateRecommendations(tools) {
  const recommendations = [];
  
  if (!tools.graphicsMagick && !tools.imageMagick) {
    recommendations.push({
      priority: 'HIGH',
      tool: 'GraphicsMagick or ImageMagick',
      reason: 'Required for PDF thumbnail generation',
      install: {
        windows: 'choco install graphicsmagick',
        mac: 'brew install graphicsmagick',
        linux: 'sudo apt-get install graphicsmagick'
      }
    });
  }
  
  if (!tools.libreOffice) {
    recommendations.push({
      priority: 'MEDIUM',
      tool: 'LibreOffice',
      reason: 'Required for PPTX thumbnail generation',
      install: {
        windows: 'choco install libreoffice',
        mac: 'brew install libreoffice',
        linux: 'sudo apt-get install libreoffice'
      }
    });
  }
  
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'INFO',
      message: 'All required tools are installed! You can upload slides and generate thumbnails.'
    });
  }
  
  return recommendations;
}

export default router;
