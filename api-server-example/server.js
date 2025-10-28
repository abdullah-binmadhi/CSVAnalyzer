/**
 * Express.js API Server for Senior Data Analyst AI
 * Provides REST endpoints for data analysis
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const { analyzeDataset } = require('../dist/index.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Senior Data Analyst AI',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Main analysis endpoint - JSON input
app.post('/api/analyze', async (req, res) => {
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
    res.json({
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
});

// CSV file upload endpoint
app.post('/api/analyze-csv', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No CSV file uploaded'
      });
    }
    
    // Parse CSV file
    const csvData = await parseCSVFile(req.file.path);
    
    // Perform analysis
    const startTime = Date.now();
    const result = await analyzeDataset(csvData);
    const processingTime = Date.now() - startTime;
    
    // Clean up uploaded file
    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    
    res.json({
      success: true,
      data: result,
      metadata: {
        processingTime,
        chartCount: result.charts_to_generate.length,
        reportLength: result.full_analysis_report_markdown.length,
        columnsAnalyzed: csvData.headers.length,
        rowsProcessed: csvData.sampleData.length,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('CSV analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'CSV analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Batch analysis endpoint
app.post('/api/analyze-batch', async (req, res) => {
  try {
    const { datasets } = req.body;
    
    if (!Array.isArray(datasets) || datasets.length === 0) {
      return res.status(400).json({
        error: 'Invalid input: datasets must be a non-empty array'
      });
    }
    
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      try {
        const result = await analyzeDataset(dataset);
        results.push({
          index: i,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      results,
      metadata: {
        totalDatasets: datasets.length,
        successfulAnalyses: results.filter(r => r.success).length,
        failedAnalyses: results.filter(r => !r.success).length,
        totalProcessingTime: processingTime,
        averageProcessingTime: processingTime / datasets.length,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch analysis failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get analysis capabilities
app.get('/api/capabilities', (req, res) => {
  res.json({
    chartTypes: ['bar', 'line', 'scatter'],
    dataTypes: ['numerical', 'categorical', 'datetime', 'text'],
    analysisFeatures: [
      'Automatic data type detection',
      'Business intelligence insights',
      'Chart recommendations',
      'Statistical analysis',
      'Correlation detection',
      'Industry domain identification',
      'Actionable business questions'
    ],
    limits: {
      maxColumns: 100,
      maxRows: 1000,
      maxFileSize: '10MB',
      processingTimeout: '60 seconds'
    },
    supportedFormats: ['CSV', 'JSON'],
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /api/analyze',
      'POST /api/analyze-csv',
      'POST /api/analyze-batch',
      'GET /api/capabilities',
      'GET /health'
    ],
    timestamp: new Date().toISOString()
  });
});

// Helper function to parse CSV file
function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const fs = require('fs');
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        if (results.length === 0) {
          reject(new Error('CSV file is empty'));
          return;
        }
        
        const headers = Object.keys(results[0]);
        const sampleData = results.slice(0, 100).map(row => 
          headers.map(header => {
            const value = row[header];
            const num = parseFloat(value);
            return !isNaN(num) ? num : value;
          })
        );
        
        resolve({ headers, sampleData });
      })
      .on('error', reject);
  });
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Senior Data Analyst AI Server running on port ${port}`);
  console.log(`📊 API Documentation:`);
  console.log(`   Health Check: http://localhost:${port}/health`);
  console.log(`   Analyze Data: POST http://localhost:${port}/api/analyze`);
  console.log(`   Upload CSV:   POST http://localhost:${port}/api/analyze-csv`);
  console.log(`   Capabilities: GET http://localhost:${port}/api/capabilities`);
});

module.exports = app;