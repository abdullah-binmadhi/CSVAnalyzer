/**
 * Standalone Vercel API Route for Senior Data Analyst AI
 * This version includes the core analysis logic directly
 */

// Enable CORS for all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Enhanced analysis function with diverse chart generation
function analyzeDatasetSimple(data) {
  const { headers, sampleData } = data;
  
  // Enhanced data type detection
  const columns = headers.map((header, index) => {
    const values = sampleData.map(row => row[index]).filter(v => v != null);
    const uniqueValues = new Set(values).size;
    const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    
    let type = 'text';
    
    // Check for numerical data
    const numericValues = nonEmptyValues.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
    if (numericValues.length > nonEmptyValues.length * 0.8) {
      type = 'numerical';
    }
    // Check for datetime patterns
    else if (nonEmptyValues.some(v => 
      /\d{4}-\d{2}-\d{2}/.test(v) || 
      /\d{2}\/\d{2}\/\d{4}/.test(v) ||
      /\d{4}\/\d{2}\/\d{2}/.test(v) ||
      /\w{3}\s+\d{1,2},?\s+\d{4}/.test(v)
    )) {
      type = 'datetime';
    }
    // Check for categorical data (limited unique values)
    else if (uniqueValues <= Math.min(10, nonEmptyValues.length * 0.5)) {
      type = 'categorical';
    }
    // Check for boolean-like data
    else if (uniqueValues <= 2 && nonEmptyValues.every(v => 
      ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n'].includes(String(v).toLowerCase())
    )) {
      type = 'boolean';
    }
    
    return { 
      name: header, 
      type, 
      uniqueValues,
      sampleValues: nonEmptyValues.slice(0, 5)
    };
  });
  
  // Separate columns by type for diverse chart generation
  const numericalCols = columns.filter(c => c.type === 'numerical');
  const categoricalCols = columns.filter(c => c.type === 'categorical');
  const datetimeCols = columns.filter(c => c.type === 'datetime');
  const booleanCols = columns.filter(c => c.type === 'boolean');
  const textCols = columns.filter(c => c.type === 'text' && c.uniqueValues <= 20);
  
  const charts = [];
  const chartTracker = new Set(); // Prevent duplicates
  
  // 1. DISTRIBUTION CHARTS (Bar Charts)
  // Categorical distributions
  [...categoricalCols, ...booleanCols, ...textCols].forEach(col => {
    const chartKey = `bar-dist-${col.name}`;
    if (!chartTracker.has(chartKey)) {
      charts.push({
        title: `Distribution of ${col.name}`,
        type: 'bar',
        xAxis: col.name,
        yAxis: 'Count'
      });
      chartTracker.add(chartKey);
    }
  });
  
  // Numerical histograms (represented as bar charts)
  numericalCols.forEach(col => {
    const chartKey = `bar-hist-${col.name}`;
    if (!chartTracker.has(chartKey)) {
      charts.push({
        title: `${col.name} Distribution`,
        type: 'bar',
        xAxis: `${col.name} Ranges`,
        yAxis: 'Frequency'
      });
      chartTracker.add(chartKey);
    }
  });
  
  // 2. COMPARISON CHARTS (Bar Charts)
  // Categorical vs Numerical
  categoricalCols.forEach(catCol => {
    numericalCols.forEach(numCol => {
      const chartKey = `bar-comp-${catCol.name}-${numCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${numCol.name} by ${catCol.name}`,
          type: 'bar',
          xAxis: catCol.name,
          yAxis: numCol.name
        });
        chartTracker.add(chartKey);
      }
    });
  });
  
  // Boolean vs Numerical
  booleanCols.forEach(boolCol => {
    numericalCols.forEach(numCol => {
      const chartKey = `bar-bool-${boolCol.name}-${numCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${numCol.name} by ${boolCol.name}`,
          type: 'bar',
          xAxis: boolCol.name,
          yAxis: numCol.name
        });
        chartTracker.add(chartKey);
      }
    });
  });
  
  // 3. TREND ANALYSIS (Line Charts)
  // Time series analysis
  datetimeCols.forEach(dateCol => {
    numericalCols.forEach(numCol => {
      const chartKey = `line-trend-${dateCol.name}-${numCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${numCol.name} over ${dateCol.name}`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: numCol.name
        });
        chartTracker.add(chartKey);
      }
    });
  });
  
  // Sequential trend analysis (if no datetime, use first numerical as sequence)
  if (datetimeCols.length === 0 && numericalCols.length >= 2) {
    const sequenceCol = numericalCols[0];
    numericalCols.slice(1).forEach(numCol => {
      const chartKey = `line-seq-${sequenceCol.name}-${numCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${numCol.name} trend over ${sequenceCol.name}`,
          type: 'line',
          xAxis: sequenceCol.name,
          yAxis: numCol.name
        });
        chartTracker.add(chartKey);
      }
    });
  }
  
  // Cumulative analysis
  if (datetimeCols.length > 0) {
    const dateCol = datetimeCols[0];
    numericalCols.forEach(numCol => {
      const chartKey = `line-cum-${dateCol.name}-${numCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `Cumulative ${numCol.name} over ${dateCol.name}`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: `Cumulative ${numCol.name}`
        });
        chartTracker.add(chartKey);
      }
    });
  }
  
  // 4. CORRELATION ANALYSIS (Scatter Plots)
  // Basic numerical correlations
  for (let i = 0; i < numericalCols.length; i++) {
    for (let j = i + 1; j < numericalCols.length; j++) {
      const chartKey = `scatter-${numericalCols[i].name}-${numericalCols[j].name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${numericalCols[j].name} vs ${numericalCols[i].name}`,
          type: 'scatter',
          xAxis: numericalCols[i].name,
          yAxis: numericalCols[j].name
        });
        chartTracker.add(chartKey);
      }
    }
  }
  
  // Enhanced scatter plots with categorical grouping
  if (numericalCols.length >= 2 && categoricalCols.length > 0) {
    const catCol = categoricalCols[0];
    for (let i = 0; i < Math.min(2, numericalCols.length); i++) {
      for (let j = i + 1; j < Math.min(3, numericalCols.length); j++) {
        const chartKey = `scatter-cat-${numericalCols[i].name}-${numericalCols[j].name}-${catCol.name}`;
        if (!chartTracker.has(chartKey)) {
          charts.push({
            title: `${numericalCols[j].name} vs ${numericalCols[i].name} by ${catCol.name}`,
            type: 'scatter',
            xAxis: numericalCols[i].name,
            yAxis: numericalCols[j].name
          });
          chartTracker.add(chartKey);
        }
      }
    }
  }
  
  // Multi-dimensional scatter plots
  if (numericalCols.length >= 3) {
    for (let i = 0; i < Math.min(2, numericalCols.length); i++) {
      for (let j = i + 1; j < Math.min(3, numericalCols.length); j++) {
        for (let k = j + 1; k < Math.min(4, numericalCols.length); k++) {
          const chartKey = `scatter-3d-${numericalCols[i].name}-${numericalCols[j].name}-${numericalCols[k].name}`;
          if (!chartTracker.has(chartKey)) {
            charts.push({
              title: `${numericalCols[j].name} vs ${numericalCols[i].name} (sized by ${numericalCols[k].name})`,
              type: 'scatter',
              xAxis: numericalCols[i].name,
              yAxis: numericalCols[j].name
            });
            chartTracker.add(chartKey);
          }
        }
      }
    }
  }
  
  // 5. SPECIALIZED CHARTS
  // Ratio analysis
  if (numericalCols.length >= 2) {
    for (let i = 0; i < Math.min(2, numericalCols.length); i++) {
      for (let j = i + 1; j < Math.min(3, numericalCols.length); j++) {
        const chartKey = `bar-ratio-${numericalCols[i].name}-${numericalCols[j].name}`;
        if (!chartTracker.has(chartKey)) {
          charts.push({
            title: `${numericalCols[i].name} to ${numericalCols[j].name} Ratio`,
            type: 'bar',
            xAxis: 'Categories',
            yAxis: `${numericalCols[i].name}/${numericalCols[j].name} Ratio`
          });
          chartTracker.add(chartKey);
        }
      }
    }
  }
  
  // Performance analysis (if we detect performance-related columns)
  const performanceKeywords = ['performance', 'score', 'rating', 'efficiency', 'success', 'conversion'];
  const performanceCols = numericalCols.filter(col => 
    performanceKeywords.some(keyword => col.name.toLowerCase().includes(keyword))
  );
  
  performanceCols.forEach(perfCol => {
    categoricalCols.forEach(catCol => {
      const chartKey = `line-perf-${perfCol.name}-${catCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${perfCol.name} Performance by ${catCol.name}`,
          type: 'line',
          xAxis: catCol.name,
          yAxis: perfCol.name
        });
        chartTracker.add(chartKey);
      }
    });
  });
  
  // Chart generation complete - report will be generated later

  // 6. BUSINESS INTELLIGENCE CHARTS
  // Revenue/Sales analysis (if detected)
  const businessKeywords = ['revenue', 'sales', 'profit', 'cost', 'price', 'income'];
  const businessCols = numericalCols.filter(col => 
    businessKeywords.some(keyword => col.name.toLowerCase().includes(keyword))
  );
  
  businessCols.forEach(bizCol => {
    // Business trends over time
    datetimeCols.forEach(dateCol => {
      const chartKey = `line-biz-${bizCol.name}-${dateCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${bizCol.name} Trend Analysis`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: bizCol.name
        });
        chartTracker.add(chartKey);
      }
    });
    
    // Business performance by categories
    categoricalCols.forEach(catCol => {
      const chartKey = `bar-biz-${bizCol.name}-${catCol.name}`;
      if (!chartTracker.has(chartKey)) {
        charts.push({
          title: `${bizCol.name} Analysis by ${catCol.name}`,
          type: 'bar',
          xAxis: catCol.name,
          yAxis: bizCol.name
        });
        chartTracker.add(chartKey);
      }
    });
  });
  
  // Generate enhanced report with chart diversity info
  const chartTypes = [...new Set(charts.map(c => c.type))];
  const chartsByType = {
    bar: charts.filter(c => c.type === 'bar').length,
    line: charts.filter(c => c.type === 'line').length,
    scatter: charts.filter(c => c.type === 'scatter').length
  };
  
  // Helper function to format column type with emoji
  const getTypeEmoji = (type) => {
    switch(type) {
      case 'numerical': return '🔢';
      case 'categorical': return '🏷️';
      case 'datetime': return '📅';
      case 'boolean': return '✓';
      case 'text': return '📝';
      default: return '•';
    }
  };

  const report = `# 📊 Comprehensive Data Analysis Report

---

## 📋 Executive Summary

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; margin: 20px 0;">

### Dataset Overview
Your dataset contains **${headers.length} columns** with **${sampleData.length} sample rows**, providing comprehensive analytical opportunities.

### Data Composition at a Glance

| Category | Count | Columns |
|----------|-------|---------|
| 🔢 **Numerical** | ${numericalCols.length} | ${numericalCols.length > 0 ? numericalCols.map(c => c.name).join(', ') : 'None'} |
| 🏷️ **Categorical** | ${categoricalCols.length} | ${categoricalCols.length > 0 ? categoricalCols.map(c => c.name).join(', ') : 'None'} |
| 📅 **DateTime** | ${datetimeCols.length} | ${datetimeCols.length > 0 ? datetimeCols.map(c => c.name).join(', ') : 'None'} |
| ✓ **Boolean** | ${booleanCols.length} | ${booleanCols.length > 0 ? booleanCols.map(c => c.name).join(', ') : 'None'} |

</div>

---

## 🔍 Column Analysis

<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
<thead style="background: #f8f9fa;">
<tr>
<th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Column Name</th>
<th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Type</th>
<th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Unique Values</th>
<th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Sample Data</th>
</tr>
</thead>
<tbody>
${columns.map((col, idx) => `<tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
<td style="padding: 10px; border-bottom: 1px solid #dee2e6;"><strong>${col.name}</strong></td>
<td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">${getTypeEmoji(col.type)} ${col.type}</td>
<td style="padding: 10px; text-align: center; border-bottom: 1px solid #dee2e6;">${col.uniqueValues}</td>
<td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-size: 0.9em; color: #666;">${col.sampleValues.slice(0, 3).join(', ')}${col.sampleValues.length > 3 ? '...' : ''}</td>
</tr>`).join('\n')}
</tbody>
</table>

---

## 📈 Visualization Strategy

<div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #4facfe; margin: 20px 0;">

### Generated Visualizations Summary

We've created **${charts.length} comprehensive visualizations** across **${chartTypes.length} chart types** to explore your data from multiple analytical perspectives.

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0;">

<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<div style="font-size: 2em;">📊</div>
<div style="font-size: 1.5em; font-weight: bold; color: #4facfe; margin: 10px 0;">${chartsByType.bar}</div>
<div style="color: #666; font-size: 0.9em;">Bar Charts</div>
<div style="color: #999; font-size: 0.8em; margin-top: 5px;">Distributions & Comparisons</div>
</div>

<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<div style="font-size: 2em;">📈</div>
<div style="font-size: 1.5em; font-weight: bold; color: #43e97b; margin: 10px 0;">${chartsByType.line}</div>
<div style="color: #666; font-size: 0.9em;">Line Charts</div>
<div style="color: #999; font-size: 0.8em; margin-top: 5px;">Trends & Time-Series</div>
</div>

<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
<div style="font-size: 2em;">🔍</div>
<div style="font-size: 1.5em; font-weight: bold; color: #667eea; margin: 10px 0;">${chartsByType.scatter}</div>
<div style="color: #666; font-size: 0.9em;">Scatter Plots</div>
<div style="color: #999; font-size: 0.8em; margin-top: 5px;">Correlations & Relationships</div>
</div>

</div>

### Chart Categories Breakdown

| Chart Type | Purpose | Count |
|------------|---------|-------|
| 📊 **Bar Charts** | Distribution analysis, categorical comparisons, business metrics | **${chartsByType.bar}** |
| 📈 **Line Charts** | Trend analysis, time-series patterns, performance tracking | **${chartsByType.line}** |
| 🔍 **Scatter Plots** | Correlation discovery, relationship mapping, multi-dimensional analysis | **${chartsByType.scatter}** |

</div>

---

*Analysis powered by Senior Data Analyst AI • Enhanced Visualization Engine v2.0*`;

  return {
    charts_to_generate: charts, // Return ALL generated charts (no limit)
    total_charts_available: charts.length,
    chart_diversity: {
      bar_charts: chartsByType.bar,
      line_charts: chartsByType.line,
      scatter_plots: chartsByType.scatter,
      total_types: chartTypes.length
    },
    full_analysis_report_markdown: report
  };
}

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
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
    
    // Perform simplified analysis
    const result = analyzeDatasetSimple({ headers, sampleData });
    
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
        timestamp: new Date().toISOString(),
        version: 'standalone'
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