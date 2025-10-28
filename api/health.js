/**
 * Health check endpoint for Vercel deployment
 * Endpoint: /api/health
 */

module.exports = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Senior Data Analyst AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
    uptime: process.uptime()
  });
};