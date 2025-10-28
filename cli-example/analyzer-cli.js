#!/usr/bin/env node

/**
 * Command Line Interface for Senior Data Analyst AI
 * Usage: node analyzer-cli.js <csv-file> [options]
 */

const fs = require('fs');
const path = require('path');
const { analyzeDataset } = require('../dist/index.js');

// CLI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.log(colorize('\n🤖 Senior Data Analyst AI - CLI Tool', 'cyan'));
  console.log(colorize('=====================================', 'cyan'));
}

function printUsage() {
  console.log(colorize('\nUsage:', 'yellow'));
  console.log('  node analyzer-cli.js <csv-file> [options]\n');
  console.log(colorize('Options:', 'yellow'));
  console.log('  --output, -o <file>    Save results to JSON file');
  console.log('  --report, -r <file>    Save markdown report to file');
  console.log('  --charts, -c           Show chart recommendations only');
  console.log('  --stats, -s            Show statistics only');
  console.log('  --verbose, -v          Verbose output');
  console.log('  --help, -h             Show this help message\n');
  console.log(colorize('Examples:', 'yellow'));
  console.log('  node analyzer-cli.js data.csv');
  console.log('  node analyzer-cli.js data.csv --output results.json');
  console.log('  node analyzer-cli.js data.csv --report analysis.md --verbose');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    file: null,
    output: null,
    report: null,
    chartsOnly: false,
    statsOnly: false,
    verbose: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--report' || arg === '-r') {
      options.report = args[++i];
    } else if (arg === '--charts' || arg === '-c') {
      options.chartsOnly = true;
    } else if (arg === '--stats' || arg === '-s') {
      options.statsOnly = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (!options.file && !arg.startsWith('-')) {
      options.file = arg;
    }
  }

  return options;
}

function parseCSV(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const sampleData = lines.slice(1, 101).map(line => // Take up to 100 rows
      line.split(',').map(cell => {
        cell = cell.trim().replace(/"/g, '');
        const num = parseFloat(cell);
        return !isNaN(num) ? num : cell;
      })
    );

    return { headers, sampleData };
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${error.message}`);
  }
}

function printStats(results, processingTime, options) {
  console.log(colorize('\n📊 Analysis Statistics', 'green'));
  console.log('='.repeat(50));
  console.log(`${colorize('Processing Time:', 'yellow')} ${processingTime}ms`);
  console.log(`${colorize('Charts Generated:', 'yellow')} ${results.charts_to_generate.length}`);
  console.log(`${colorize('Report Length:', 'yellow')} ${results.full_analysis_report_markdown.length} characters`);
  console.log(`${colorize('Chart Types:', 'yellow')} ${[...new Set(results.charts_to_generate.map(c => c.type))].join(', ')}`);
  
  if (options.verbose) {
    console.log(`${colorize('Memory Usage:', 'yellow')} ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
    console.log(`${colorize('Node Version:', 'yellow')} ${process.version}`);
  }
}

function printCharts(results) {
  console.log(colorize('\n📈 Chart Recommendations', 'green'));
  console.log('='.repeat(50));
  
  results.charts_to_generate.forEach((chart, index) => {
    console.log(`\n${colorize(`${index + 1}. ${chart.title}`, 'bright')}`);
    console.log(`   ${colorize('Type:', 'yellow')} ${chart.type.toUpperCase()}`);
    console.log(`   ${colorize('X-Axis:', 'yellow')} ${chart.xAxis}`);
    console.log(`   ${colorize('Y-Axis:', 'yellow')} ${chart.yAxis}`);
  });
}

function printReport(results, options) {
  if (options.chartsOnly || options.statsOnly) return;
  
  console.log(colorize('\n📋 Analysis Report Preview', 'green'));
  console.log('='.repeat(50));
  
  const lines = results.full_analysis_report_markdown.split('\n');
  const preview = lines.slice(0, 20).join('\n');
  console.log(preview);
  
  if (lines.length > 20) {
    console.log(colorize('\n... (truncated, use --report option to save full report)', 'yellow'));
  }
}

function saveResults(results, outputFile, processingTime) {
  const output = {
    timestamp: new Date().toISOString(),
    processingTime,
    analysis: results,
    metadata: {
      chartCount: results.charts_to_generate.length,
      reportLength: results.full_analysis_report_markdown.length,
      chartTypes: [...new Set(results.charts_to_generate.map(c => c.type))],
      version: '1.0.0'
    }
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  console.log(colorize(`\n💾 Results saved to: ${outputFile}`, 'green'));
}

function saveReport(results, reportFile) {
  const report = `# Data Analysis Report
Generated: ${new Date().toISOString()}

${results.full_analysis_report_markdown}

---
*Generated by Senior Data Analyst AI v1.0.0*
`;

  fs.writeFileSync(reportFile, report);
  console.log(colorize(`📄 Report saved to: ${reportFile}`, 'green'));
}

async function main() {
  const options = parseArgs();

  printHeader();

  if (options.help || !options.file) {
    printUsage();
    process.exit(options.help ? 0 : 1);
  }

  // Validate file exists
  if (!fs.existsSync(options.file)) {
    console.error(colorize(`❌ Error: File '${options.file}' not found`, 'red'));
    process.exit(1);
  }

  // Validate file extension
  if (!options.file.toLowerCase().endsWith('.csv')) {
    console.error(colorize('❌ Error: File must be a CSV file', 'red'));
    process.exit(1);
  }

  try {
    console.log(colorize(`\n📂 Processing file: ${options.file}`, 'blue'));
    
    // Parse CSV
    if (options.verbose) {
      console.log(colorize('📊 Parsing CSV data...', 'blue'));
    }
    const csvData = parseCSV(options.file);
    
    if (options.verbose) {
      console.log(colorize(`   Headers: ${csvData.headers.join(', ')}`, 'blue'));
      console.log(colorize(`   Rows: ${csvData.sampleData.length}`, 'blue'));
    }

    // Perform analysis
    console.log(colorize('🔍 Analyzing data...', 'blue'));
    const startTime = Date.now();
    const results = await analyzeDataset(csvData);
    const processingTime = Date.now() - startTime;

    console.log(colorize('✅ Analysis completed!', 'green'));

    // Display results based on options
    if (!options.chartsOnly && !options.report) {
      printStats(results, processingTime, options);
    }

    if (!options.statsOnly && !options.report) {
      printCharts(results);
    }

    if (!options.chartsOnly && !options.statsOnly) {
      printReport(results, options);
    }

    // Save outputs if requested
    if (options.output) {
      saveResults(results, options.output, processingTime);
    }

    if (options.report) {
      saveReport(results, options.report);
    }

    console.log(colorize('\n🎉 Analysis complete!', 'green'));

  } catch (error) {
    console.error(colorize(`\n❌ Analysis failed: ${error.message}`, 'red'));
    
    if (options.verbose) {
      console.error(colorize('\nStack trace:', 'red'));
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(colorize(`\n💥 Unexpected error: ${error.message}`, 'red'));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(colorize(`\n💥 Unhandled promise rejection: ${reason}`, 'red'));
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main();
}

module.exports = { main, parseCSV, parseArgs };