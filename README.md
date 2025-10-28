# 🤖 Senior Data Analyst AI

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Jest](https://img.shields.io/badge/Jest-323330?style=for-the-badge&logo=Jest&logoColor=white)](https://jestjs.io/)
[![Chart.js](https://img.shields.io/badge/chart.js-F5788D.svg?style=for-the-badge&logo=chart.js&logoColor=white)](https://www.chartjs.org/)

A comprehensive **automated exploratory data analysis (EDA) system** that transforms raw CSV data into actionable business insights, visualization recommendations, and detailed analysis reports.

## ✨ Features

- 🔍 **Automatic Data Type Detection** - Intelligently identifies numerical, categorical, datetime, and text columns
- 📊 **Smart Chart Recommendations** - Generates bar, line, and scatter plot suggestions with diversity algorithms
- 🧠 **Business Intelligence Analysis** - Industry domain detection and actionable business questions
- 📋 **Comprehensive Reports** - Detailed Markdown reports with statistical analysis and insights
- ⚡ **High Performance** - Optimized algorithms with sub-second processing for typical datasets
- 🛡️ **Robust Error Handling** - Graceful degradation and comprehensive edge case coverage
- 🎯 **Multiple Interfaces** - Web UI, REST API, React component, and CLI options

## 🚀 Quick Start

### 1. Try Live Demo (Easiest)

**🌐 Live on Vercel**: [your-app.vercel.app](https://your-app.vercel.app)

Just visit the link and drag & drop your CSV file for instant analysis!

### 2. Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/senior-data-analyst-ai.git
cd senior-data-analyst-ai

# Install dependencies
npm install

# Build the project
npm run build
```

### 3. Deploy Your Own

```bash
# Deploy to Vercel
npm run deploy
```

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed instructions.

### 3. Use as a Library

```javascript
import { analyzeDataset } from './dist/index.js';

const result = await analyzeDataset({
  headers: ['product', 'price', 'sales'],
  sampleData: [
    ['iPhone', 999, 1500],
    ['Samsung', 899, 1200]
  ]
});

console.log(result.charts_to_generate);
console.log(result.full_analysis_report_markdown);
```

## 📊 Usage Options

### 🌐 Web Interface
Perfect for business users and quick analysis
- **Location**: `web-frontend-example/index.html`
- **Features**: Drag & drop, real-time charts, interactive reports

### 🚀 REST API Server
Ideal for web applications and integrations
```bash
node api-server-example/server.js
# Access: http://localhost:3000/api/analyze
```

### ⚛️ React Component
For React/Next.js applications
```jsx
import DataAnalyzer from './react-frontend-example/DataAnalyzer';
<DataAnalyzer />
```

### 🖥️ Command Line Interface
Perfect for automation and scripting
```bash
node cli-example/analyzer-cli.js data.csv --output results.json
```

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   Input Data    │───▶│  Input Processor │───▶│  Data Type Analyzer │
│ Headers + Sample│    │   Validation     │    │   Column Analysis   │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                           │
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ JSON Formatter  │◀───│ Report Generator │◀───│ Business Intelligence│
│ Output Creation │    │ Markdown Report  │    │     Analyzer        │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                                                           │
                       ┌──────────────────┐    ┌─────────────────────┐
                       │ Visualization    │◀───│                     │
                       │   Generator      │    │                     │
                       └──────────────────┘    └─────────────────────┘
```

## 📈 Example Output

### Chart Recommendations
```json
{
  "charts_to_generate": [
    {
      "title": "Sales by Category",
      "type": "bar",
      "xAxis": "Category",
      "yAxis": "Sales"
    },
    {
      "title": "Revenue over Time",
      "type": "line", 
      "xAxis": "Date",
      "yAxis": "Revenue"
    }
  ]
}
```

### Analysis Report
```markdown
# Executive Summary
This dataset appears to be from the **E-commerce/Retail** domain...

## Statistical Analysis
- **Total Columns**: 6
- **Data Completeness**: 95.2%
- **Primary Value Columns**: Revenue, Sales, Price

## Key Business Questions
1. How can we optimize revenue to improve overall performance?
2. What are the seasonal trends in sales data?
3. Which product categories drive the highest margins?
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern="Performance"
npm test -- --testPathPattern="Integration"

# Run with coverage
npm test -- --coverage
```

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions for all usage options
- **[System Documentation](SYSTEM_DOCUMENTATION.md)** - Complete technical documentation
- **[API Reference](api-server-example/server.js)** - REST API endpoints and examples

## 🎯 Key Features

### Smart Chart Generation
- **Diversity Algorithm**: Ensures analytical variety across different aspects
- **Performance Optimized**: Pre-categorized processing and early exit conditions
- **Edge Case Handling**: Robust fallback mechanisms for unusual data

### Business Intelligence
- **Industry Detection**: Automatic domain identification (Finance, E-commerce, Healthcare, etc.)
- **Value Column Identification**: Finds primary business drivers
- **Actionable Questions**: Generates 4 specific, business-relevant questions

### Output Compliance
- **JSON Validation**: Guaranteed structure compliance
- **Markdown Reports**: Professional, formatted analysis reports
- **Error Recovery**: Comprehensive fallback systems

## 🔧 Configuration

### Environment Variables
```bash
PORT=3000                    # API server port
NODE_ENV=production         # Environment mode
MAX_FILE_SIZE=10485760      # 10MB file upload limit
ANALYSIS_TIMEOUT=60000      # 60 second timeout
```

### Performance Limits
- **Maximum Charts**: 100 per analysis
- **Text Column Threshold**: 20 unique values for chart generation
- **Processing Timeout**: 60 seconds for complete analysis
- **File Size Limit**: 10MB for CSV uploads

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript for type safety and developer experience
- Chart.js for beautiful, responsive visualizations
- Jest for comprehensive testing framework
- Express.js for robust API server capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/senior-data-analyst-ai/issues)
- **Documentation**: See the `docs/` directory
- **Examples**: Check the `*-example/` directories

---

**Made with ❤️ for data analysts and developers who want to turn CSV files into actionable insights instantly.**