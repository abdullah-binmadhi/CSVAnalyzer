/**
 * Vercel API Route for Senior Data Analyst AI
 * Endpoint: /api/analyze
 */

const { analyzeDataset } = require('../dist/index.js');

// Enable CORS for all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { headers, sampleData } = req.body;
    
    // Validate input
    if (!headers || !Array.isArray(headers) || headers.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: headers must be a non-empty array'
      });
    }
    
    if (!sampleData || !Array.isArray(sampleData) || sampleData.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: sampleData must be a non-empty array'
      });
    }
    
    const startTime = Date.now();
    
    // Perform analysis
    const result = await analyzeDataset({ headers, sampleData });
    
    const processingTime = Date.now() - startTime;
    
    // Return results with metadata
    res.status(200).json({
      success: true,
      data: result,
      metadata: {
        processingTime,
        chartCount: result.charts_to_generate.length,
        reportLength: result.full_analysis_report_markdown.length,
        columnsAnalyzed: headers.length,
        rowsProcessed: sampleData.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};