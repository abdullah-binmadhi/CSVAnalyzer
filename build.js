/**
 * Build script for Vercel deployment
 * Compiles TypeScript and prepares the project
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Senior Data Analyst AI for Vercel...');

try {
  // Install dependencies if needed
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Build TypeScript
  console.log('🔨 Compiling TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verify dist directory exists
  if (!fs.existsSync('dist')) {
    throw new Error('Build failed: dist directory not found');
  }

  // Copy necessary files to API directory
  console.log('📁 Preparing API files...');
  
  // Ensure the main index.js exists in dist
  const mainFile = path.join('dist', 'index.js');
  if (!fs.existsSync(mainFile)) {
    throw new Error('Build failed: dist/index.js not found');
  }

  console.log('✅ Build completed successfully!');
  console.log('📊 Ready for Vercel deployment');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}