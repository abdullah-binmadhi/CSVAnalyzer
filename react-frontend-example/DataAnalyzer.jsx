/**
 * React Component for Senior Data Analyst AI
 * Provides a complete UI for CSV upload and analysis
 */

import React, { useState, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Scatter } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const DataAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Handle file upload
  const handleFileUpload = useCallback((event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && uploadedFile.type === 'text/csv') {
      setFile(uploadedFile);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  }, []);

  // Parse CSV file
  const parseCSV = useCallback((text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const sampleData = lines.slice(1, 6).map(line => 
      line.split(',').map(cell => {
        cell = cell.trim().replace(/"/g, '');
        const num = parseFloat(cell);
        return !isNaN(num) ? num : cell;
      })
    );
    return { headers, sampleData };
  }, []);

  // Analyze data
  const analyzeData = useCallback(async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Read file
      const text = await file.text();
      const csvData = parseCSV(text);

      // Call API (replace with your actual API endpoint)
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(csvData),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const result = await response.json();
      setResults(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [file, parseCSV]);

  // Generate chart data for visualization
  const generateChartData = useCallback((chartConfig) => {
    // Generate sample data based on chart type
    if (chartConfig.type === 'bar') {
      return {
        labels: ['Category A', 'Category B', 'Category C', 'Category D'],
        datasets: [{
          label: chartConfig.yAxis,
          data: [65, 59, 80, 81],
          backgroundColor: [
            'rgba(79, 172, 254, 0.8)',
            'rgba(0, 242, 254, 0.8)',
            'rgba(67, 233, 123, 0.8)',
            'rgba(56, 249, 215, 0.8)'
          ],
          borderColor: [
            'rgba(79, 172, 254, 1)',
            'rgba(0, 242, 254, 1)',
            'rgba(67, 233, 123, 1)',
            'rgba(56, 249, 215, 1)'
          ],
          borderWidth: 1
        }]
      };
    } else if (chartConfig.type === 'line') {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: chartConfig.yAxis,
          data: [65, 59, 80, 81, 56, 55],
          borderColor: 'rgba(79, 172, 254, 1)',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.4
        }]
      };
    } else if (chartConfig.type === 'scatter') {
      return {
        datasets: [{
          label: `${chartConfig.yAxis} vs ${chartConfig.xAxis}`,
          data: [
            {x: 10, y: 20}, {x: 15, y: 25}, {x: 20, y: 30},
            {x: 25, y: 35}, {x: 30, y: 40}, {x: 35, y: 45}
          ],
          backgroundColor: 'rgba(79, 172, 254, 0.8)',
          borderColor: 'rgba(79, 172, 254, 1)'
        }]
      };
    }
  }, []);

  // Render chart component
  const renderChart = useCallback((chartConfig, index) => {
    const chartData = generateChartData(chartConfig);
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: chartConfig.title,
        },
      },
      scales: chartConfig.type !== 'scatter' ? {
        y: {
          beginAtZero: true,
        },
      } : {},
    };

    const ChartComponent = {
      bar: Bar,
      line: Line,
      scatter: Scatter
    }[chartConfig.type];

    return (
      <div key={index} className="chart-container">
        <div style={{ height: '300px' }}>
          <ChartComponent data={chartData} options={options} />
        </div>
        <div className="chart-info">
          <p><strong>Type:</strong> {chartConfig.type.toUpperCase()}</p>
          <p><strong>X-Axis:</strong> {chartConfig.xAxis}</p>
          <p><strong>Y-Axis:</strong> {chartConfig.yAxis}</p>
        </div>
      </div>
    );
  }, [generateChartData]);

  return (
    <div className="data-analyzer">
      <style jsx>{`
        .data-analyzer {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 30px;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border-radius: 15px;
        }
        
        .upload-section {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
        }
        
        .file-input {
          margin: 20px 0;
        }
        
        .btn {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-2px);
        }
        
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
        }
        
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4facfe;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error {
          background: #fee;
          color: #c33;
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          border: 1px solid #fcc;
        }
        
        .results {
          margin-top: 30px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin: 30px 0;
        }
        
        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.1);
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #4facfe;
        }
        
        .stat-label {
          color: #666;
          margin-top: 5px;
        }
        
        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin: 30px 0;
        }
        
        .chart-container {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .chart-info {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          font-size: 0.9rem;
          color: #666;
        }
        
        .report-section {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 30px;
          margin-top: 30px;
        }
        
        .report-content {
          max-height: 500px;
          overflow-y: auto;
          line-height: 1.6;
        }
      `}</style>

      <div className="header">
        <h1>🤖 Senior Data Analyst AI</h1>
        <p>Upload your CSV file and get instant data insights, visualizations, and business intelligence</p>
      </div>

      <div className="upload-section">
        <h2>Upload Your CSV File</h2>
        <div className="file-input">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            style={{ margin: '20px 0' }}
          />
        </div>
        {file && (
          <p>✅ <strong>{file.name}</strong> ready for analysis</p>
        )}
        <button
          className="btn"
          onClick={analyzeData}
          disabled={!file || isAnalyzing}
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🚀 Analyze Data'}
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isAnalyzing && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Analyzing your data... This may take a few seconds.</p>
        </div>
      )}

      {results && (
        <div className="results">
          <h2>📊 Analysis Results</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{results.data.charts_to_generate.length}</div>
              <div className="stat-label">Charts Generated</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results.metadata.processingTime}ms</div>
              <div className="stat-label">Processing Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{results.metadata.columnsAnalyzed}</div>
              <div className="stat-label">Columns Analyzed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{new Set(results.data.charts_to_generate.map(c => c.type)).size}</div>
              <div className="stat-label">Chart Types</div>
            </div>
          </div>

          <h3>📈 Recommended Visualizations</h3>
          <div className="charts-grid">
            {results.data.charts_to_generate.map((chart, index) => 
              renderChart(chart, index)
            )}
          </div>

          <div className="report-section">
            <h3>📋 Detailed Analysis Report</h3>
            <div className="report-content">
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                {results.data.full_analysis_report_markdown}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataAnalyzer;