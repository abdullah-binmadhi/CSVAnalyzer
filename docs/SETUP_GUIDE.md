# 🚀 Senior Data Analyst AI - Setup Guide

## Overview

The Senior Data Analyst AI is a powerful backend system that can be used in multiple ways. Choose the option that best fits your needs:

## 📊 **Option 1: Web Application (Recommended for Beginners)**

### What you get:
- Beautiful drag-and-drop interface
- Real-time chart visualization
- Interactive analysis reports
- No coding required

### Setup:
1. **Open the HTML file**:
   ```bash
   # Simply open in your browser
   open web-frontend-example/index.html
   ```

2. **Or serve with a simple HTTP server**:
   ```bash
   # Using Python
   cd web-frontend-example
   python -m http.server 8000
   # Visit: http://localhost:8000
   
   # Using Node.js
   npx serve web-frontend-example
   ```

### Usage:
1. Drag and drop your CSV file
2. Click "Analyze Data"
3. View charts and reports instantly

---

## 🌐 **Option 2: REST API Server (Recommended for Developers)**

### What you get:
- RESTful API endpoints
- JSON input/output
- File upload support
- Batch processing
- Easy integration with any frontend

### Setup:
1. **Install dependencies**:
   ```bash
   npm install express cors multer csv-parser
   ```

2. **Start the server**:
   ```bash
   node api-server-example/server.js
   ```

3. **Server runs on**: `http://localhost:3000`

### API Endpoints:

#### Health Check
```bash
GET /health
```

#### Analyze JSON Data
```bash
POST /api/analyze
Content-Type: application/json

{
  "headers": ["product", "price", "sales"],
  "sampleData": [
    ["iPhone", 999, 1500],
    ["Samsung", 899, 1200]
  ]
}
```

#### Upload CSV File
```bash
POST /api/analyze-csv
Content-Type: multipart/form-data

# Upload CSV file with key "csvFile"
```

#### Get Capabilities
```bash
GET /api/capabilities
```

### Example Usage:
```javascript
// Analyze data via API
const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    headers: ['product', 'price', 'sales'],
    sampleData: [['iPhone', 999, 1500], ['Samsung', 899, 1200]]
  })
});

const results = await response.json();
console.log(results.data.charts_to_generate);
```

---

## ⚛️ **Option 3: React Component (For React Apps)**

### What you get:
- Ready-to-use React component
- Chart.js integration
- Modern UI/UX
- TypeScript support

### Setup:
1. **Install dependencies**:
   ```bash
   npm install react react-dom chart.js react-chartjs-2
   ```

2. **Import and use**:
   ```jsx
   import DataAnalyzer from './react-frontend-example/DataAnalyzer';
   
   function App() {
     return (
       <div className="App">
         <DataAnalyzer />
       </div>
     );
   }
   ```

### Features:
- File upload with validation
- Real-time chart rendering
- Responsive design
- Error handling

---

## 🖥️ **Option 4: Command Line Interface (For Automation)**

### What you get:
- Terminal-based analysis
- Batch processing
- Scriptable automation
- CI/CD integration

### Setup:
1. **Make executable**:
   ```bash
   chmod +x cli-example/analyzer-cli.js
   ```

2. **Create symlink (optional)**:
   ```bash
   ln -s $(pwd)/cli-example/analyzer-cli.js /usr/local/bin/analyze-csv
   ```

### Usage Examples:

#### Basic Analysis
```bash
node cli-example/analyzer-cli.js data.csv
```

#### Save Results
```bash
node cli-example/analyzer-cli.js data.csv --output results.json --report analysis.md
```

#### Charts Only
```bash
node cli-example/analyzer-cli.js data.csv --charts
```

#### Verbose Mode
```bash
node cli-example/analyzer-cli.js data.csv --verbose
```

#### Batch Processing Script
```bash
#!/bin/bash
for file in *.csv; do
  node cli-example/analyzer-cli.js "$file" --output "${file%.csv}_results.json"
done
```

---

## 🔧 **Integration Examples**

### With Express.js
```javascript
const { analyzeDataset } = require('./dist/index.js');

app.post('/analyze', async (req, res) => {
  const result = await analyzeDataset(req.body);
  res.json(result);
});
```

### With Next.js API Route
```javascript
// pages/api/analyze.js
import { analyzeDataset } from '../../dist/index.js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const result = await analyzeDataset(req.body);
    res.status(200).json(result);
  }
}
```

### With Python (via subprocess)
```python
import subprocess
import json

def analyze_csv(csv_file):
    result = subprocess.run([
        'node', 'cli-example/analyzer-cli.js', 
        csv_file, '--output', 'temp_results.json'
    ], capture_output=True)
    
    with open('temp_results.json') as f:
        return json.load(f)
```

---

## 📈 **Performance Tips**

### For Large Files:
- Use the API server with streaming
- Process in chunks for files > 10MB
- Consider data sampling for initial analysis

### For Production:
- Add rate limiting to API endpoints
- Implement caching for repeated analyses
- Use a queue system for batch processing
- Monitor memory usage

### For Development:
- Use the web interface for quick testing
- CLI for automated testing
- API for integration testing

---

## 🎯 **Which Option Should You Choose?**

| Use Case | Recommended Option | Why |
|----------|-------------------|-----|
| **Quick Testing** | Web Application | No setup, drag & drop |
| **Business Users** | Web Application | User-friendly interface |
| **Web Development** | REST API Server | Easy integration |
| **React Apps** | React Component | Native React integration |
| **Data Scientists** | Command Line | Scriptable, automation |
| **Enterprise** | REST API Server | Scalable, secure |
| **Prototyping** | Web Application | Fast iteration |
| **Production** | REST API Server | Robust, monitored |

---

## 🆘 **Troubleshooting**

### Common Issues:

#### "Module not found" error
```bash
# Make sure you've built the TypeScript
npm run build
```

#### CORS errors in browser
```bash
# Use the API server or serve files via HTTP
npx serve web-frontend-example
```

#### Large file processing
```bash
# Increase Node.js memory limit
node --max-old-space-size=4096 analyzer-cli.js large-file.csv
```

#### Permission denied (CLI)
```bash
chmod +x cli-example/analyzer-cli.js
```

---

## 📞 **Support**

- **Documentation**: See `SYSTEM_DOCUMENTATION.md`
- **Examples**: Check the example directories
- **Testing**: Run `npm test` for validation
- **Performance**: See `src/__tests__/Performance.test.ts`

---

## 🎉 **You're Ready!**

Choose your preferred option and start analyzing data in minutes. The system is production-ready with comprehensive error handling, performance optimization, and extensive testing.

Happy analyzing! 🚀📊