/**
 * Capabilities endpoint for Vercel deployment
 * Endpoint: /api/capabilities
 */

module.exports = (req, res) => {
  res.status(200).json({
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
      processingTimeout: '30 seconds',
      maxRequestSize: '10MB'
    },
    supportedFormats: ['JSON'],
    version: '1.0.0',
    platform: 'vercel'
  });
};