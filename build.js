/**
 * Simple build script for Vercel deployment
 */

const fs = require('fs');

console.log('🚀 Preparing for Vercel deployment...');

try {
  // Ensure public directory exists
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }

  // Ensure API directory exists
  if (!fs.existsSync('api')) {
    fs.mkdirSync('api');
  }

  console.log('✅ Build preparation completed!');
  console.log('📊 Ready for Vercel deployment');

} catch (error) {
  console.error('❌ Build preparation failed:', error.message);
  process.exit(1);
}