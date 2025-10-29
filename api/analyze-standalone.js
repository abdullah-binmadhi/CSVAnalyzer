/**
 * Standalone Vercel API Route for Data Bloom
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
  
  // Helper function to get type badge with color
  const getTypeBadge = (type) => {
    const badges = {
      numerical: '<span style="background: #4facfe; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">Numerical</span>',
      categorical: '<span style="background: #43e97b; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">Categorical</span>',
      datetime: '<span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">DateTime</span>',
      boolean: '<span style="background: #f093fb; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">Boolean</span>',
      text: '<span style="background: #feca57; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">Text</span>'
    };
    return badges[type] || `<span style="background: #95a5a6; color: white; padding: 4px 10px; border-radius: 4px; font-size: 0.85em; font-weight: 500;">${type}</span>`;
  };

  const report = `# Comprehensive Data Analysis Report

---

## Executive Summary

<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; color: white; margin: 20px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">

<h3 style="margin-top: 0; font-size: 1.3em; font-weight: 600;">Dataset Overview</h3>
<p style="font-size: 1.05em; line-height: 1.6; margin: 15px 0;">Your dataset contains <strong>${headers.length} columns</strong> with <strong>${sampleData.length} sample rows</strong>, providing comprehensive analytical opportunities.</p>

<h3 style="margin-top: 25px; margin-bottom: 15px; font-size: 1.2em; font-weight: 600;">Data Composition</h3>

<div style="background: rgba(255,255,255,0.15); border-radius: 8px; padding: 15px; backdrop-filter: blur(10px);">
<table style="width: 100%; color: white; border-collapse: collapse;">
<tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
<td style="padding: 10px 0; font-weight: 500;">Numerical</td>
<td style="padding: 10px 0; text-align: right;"><strong>${numericalCols.length}</strong></td>
<td style="padding: 10px 0 10px 15px; font-size: 0.9em; opacity: 0.9;">${numericalCols.length > 0 ? numericalCols.map(c => c.name).join(', ') : 'None'}</td>
</tr>
<tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
<td style="padding: 10px 0; font-weight: 500;">Categorical</td>
<td style="padding: 10px 0; text-align: right;"><strong>${categoricalCols.length}</strong></td>
<td style="padding: 10px 0 10px 15px; font-size: 0.9em; opacity: 0.9;">${categoricalCols.length > 0 ? categoricalCols.map(c => c.name).join(', ') : 'None'}</td>
</tr>
<tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
<td style="padding: 10px 0; font-weight: 500;">DateTime</td>
<td style="padding: 10px 0; text-align: right;"><strong>${datetimeCols.length}</strong></td>
<td style="padding: 10px 0 10px 15px; font-size: 0.9em; opacity: 0.9;">${datetimeCols.length > 0 ? datetimeCols.map(c => c.name).join(', ') : 'None'}</td>
</tr>
<tr>
<td style="padding: 10px 0; font-weight: 500;">Boolean</td>
<td style="padding: 10px 0; text-align: right;"><strong>${booleanCols.length}</strong></td>
<td style="padding: 10px 0 10px 15px; font-size: 0.9em; opacity: 0.9;">${booleanCols.length > 0 ? booleanCols.map(c => c.name).join(', ') : 'None'}</td>
</tr>
</table>
</div>

</div>

---

## Column Analysis

<table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden;">
<thead style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
<tr>
<th style="padding: 14px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Column Name</th>
<th style="padding: 14px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Type</th>
<th style="padding: 14px; text-align: center; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Unique Values</th>
<th style="padding: 14px; text-align: left; border-bottom: 2px solid #dee2e6; font-weight: 600; color: #495057;">Sample Data</th>
</tr>
</thead>
<tbody>
${columns.map((col, idx) => `<tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f8f9fa'}; transition: background 0.2s;">
<td style="padding: 12px 14px; border-bottom: 1px solid #e9ecef;"><strong style="color: #2c3e50;">${col.name}</strong></td>
<td style="padding: 12px 14px; text-align: center; border-bottom: 1px solid #e9ecef;">${getTypeBadge(col.type)}</td>
<td style="padding: 12px 14px; text-align: center; border-bottom: 1px solid #e9ecef; color: #495057; font-weight: 500;">${col.uniqueValues}</td>
<td style="padding: 12px 14px; border-bottom: 1px solid #e9ecef; font-size: 0.9em; color: #6c757d;">${col.sampleValues.slice(0, 3).join(', ')}${col.sampleValues.length > 3 ? '...' : ''}</td>
</tr>`).join('\n')}
</tbody>
</table>

---

## Visualization Strategy

<div style="background: #f8f9fa; padding: 25px; border-radius: 12px; border-left: 4px solid #4facfe; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">

<h3 style="margin-top: 0; color: #2c3e50; font-size: 1.2em; font-weight: 600;">Generated Visualizations Summary</h3>

<p style="color: #495057; line-height: 1.6; margin: 15px 0;">We've created <strong style="color: #4facfe;">${charts.length} comprehensive visualizations</strong> across <strong style="color: #4facfe;">${chartTypes.length} chart types</strong> to explore your data from multiple analytical perspectives.</p>

<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 25px 0;">

<div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 3px 8px rgba(0,0,0,0.08); border-top: 3px solid #4facfe;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
<rect x="3" y="3" width="4" height="18" fill="#4facfe" rx="1"/>
<rect x="10" y="8" width="4" height="13" fill="#4facfe" rx="1"/>
<rect x="17" y="5" width="4" height="16" fill="#4facfe" rx="1"/>
</svg>
<div style="font-size: 2em; font-weight: bold; color: #4facfe; margin: 10px 0;">${chartsByType.bar}</div>
<div style="color: #495057; font-size: 0.95em; font-weight: 600;">Bar Charts</div>
<div style="color: #6c757d; font-size: 0.85em; margin-top: 8px; line-height: 1.4;">Distributions & Comparisons</div>
</div>

<div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 3px 8px rgba(0,0,0,0.08); border-top: 3px solid #43e97b;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
<path d="M3 20L8 12L13 16L21 4" stroke="#43e97b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="3" cy="20" r="2" fill="#43e97b"/>
<circle cx="8" cy="12" r="2" fill="#43e97b"/>
<circle cx="13" cy="16" r="2" fill="#43e97b"/>
<circle cx="21" cy="4" r="2" fill="#43e97b"/>
</svg>
<div style="font-size: 2em; font-weight: bold; color: #43e97b; margin: 10px 0;">${chartsByType.line}</div>
<div style="color: #495057; font-size: 0.95em; font-weight: 600;">Line Charts</div>
<div style="color: #6c757d; font-size: 0.85em; margin-top: 8px; line-height: 1.4;">Trends & Time-Series</div>
</div>

<div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 3px 8px rgba(0,0,0,0.08); border-top: 3px solid #667eea;">
<svg width="48" height="48" viewBox="0 0 24 24" fill="none" style="margin-bottom: 12px;">
<circle cx="6" cy="6" r="2.5" fill="#667eea"/>
<circle cx="18" cy="6" r="2" fill="#667eea"/>
<circle cx="9" cy="12" r="2" fill="#667eea"/>
<circle cx="15" cy="12" r="2.5" fill="#667eea"/>
<circle cx="6" cy="18" r="2" fill="#667eea"/>
<circle cx="18" cy="18" r="2.5" fill="#667eea"/>
<circle cx="12" cy="9" r="1.5" fill="#667eea"/>
<circle cx="12" cy="15" r="1.5" fill="#667eea"/>
</svg>
<div style="font-size: 2em; font-weight: bold; color: #667eea; margin: 10px 0;">${chartsByType.scatter}</div>
<div style="color: #495057; font-size: 0.95em; font-weight: 600;">Scatter Plots</div>
<div style="color: #6c757d; font-size: 0.85em; margin-top: 8px; line-height: 1.4;">Correlations & Relationships</div>
</div>

</div>

<h3 style="color: #2c3e50; font-size: 1.1em; font-weight: 600; margin-top: 25px; margin-bottom: 15px;">Chart Categories Breakdown</h3>

<table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
<thead style="background: #e9ecef;">
<tr>
<th style="padding: 12px; text-align: left; font-weight: 600; color: #495057;">Chart Type</th>
<th style="padding: 12px; text-align: left; font-weight: 600; color: #495057;">Purpose</th>
<th style="padding: 12px; text-align: center; font-weight: 600; color: #495057;">Count</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom: 1px solid #e9ecef;">
<td style="padding: 12px;"><strong style="color: #4facfe;">Bar Charts</strong></td>
<td style="padding: 12px; color: #6c757d;">Distribution analysis, categorical comparisons, business metrics</td>
<td style="padding: 12px; text-align: center;"><strong style="color: #4facfe;">${chartsByType.bar}</strong></td>
</tr>
<tr style="border-bottom: 1px solid #e9ecef;">
<td style="padding: 12px;"><strong style="color: #43e97b;">Line Charts</strong></td>
<td style="padding: 12px; color: #6c757d;">Trend analysis, time-series patterns, performance tracking</td>
<td style="padding: 12px; text-align: center;"><strong style="color: #43e97b;">${chartsByType.line}</strong></td>
</tr>
<tr>
<td style="padding: 12px;"><strong style="color: #667eea;">Scatter Plots</strong></td>
<td style="padding: 12px; color: #6c757d;">Correlation discovery, relationship mapping, multi-dimensional analysis</td>
<td style="padding: 12px; text-align: center;"><strong style="color: #667eea;">${chartsByType.scatter}</strong></td>
</tr>
</tbody>
</table>

</div>

---

<div style="text-align: center; color: #6c757d; font-size: 0.9em; margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
Analysis powered by <strong style="color: #667eea;">Data Bloom</strong> • Enhanced Visualization Engine v2.0
</div>`;

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