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
  
  const report = `# Comprehensive Data Analysis Report

## Executive Summary
This dataset contains **${headers.length} columns** with **${sampleData.length} sample rows**, offering rich analytical opportunities across multiple dimensions.

**Data Composition:**
- **Numerical Columns**: ${numericalCols.length} (${numericalCols.map(c => c.name).join(', ')})
- **Categorical Columns**: ${categoricalCols.length} (${categoricalCols.map(c => c.name).join(', ')})
- **DateTime Columns**: ${datetimeCols.length} (${datetimeCols.map(c => c.name).join(', ')})
- **Boolean Columns**: ${booleanCols.length} (${booleanCols.map(c => c.name).join(', ')})

## Column Analysis
${columns.map(col => `- **${col.name}**: ${col.type} (${col.uniqueValues} unique values)`).join('\n')}

## Visualization Strategy
Generated **${charts.length} diverse visualizations** across ${chartTypes.length} chart types:
- **📊 Bar Charts**: ${chartsByType.bar} (distributions, comparisons, business analysis)
- **📈 Line Charts**: ${chartsByType.line} (trends, time-series, performance tracking)
- **🔍 Scatter Plots**: ${chartsByType.scatter} (correlations, relationships, multi-dimensional analysis)

## Key Analytical Insights
${numericalCols.length > 0 ? `- **Quantitative Analysis**: ${numericalCols.length} numerical variables enable statistical modeling and correlation analysis` : ''}
${categoricalCols.length > 0 ? `- **Segmentation Opportunities**: ${categoricalCols.length} categorical variables support customer/product segmentation` : ''}
${datetimeCols.length > 0 ? `- **Temporal Analysis**: ${datetimeCols.length} time-based variables enable trend forecasting and seasonality detection` : ''}
${businessCols.length > 0 ? `- **Business Intelligence**: ${businessCols.length} business metrics detected for performance monitoring` : ''}

## Recommended Analysis Approaches

### 1. Distribution Analysis
${categoricalCols.length > 0 ? `Examine the distribution patterns in categorical variables to understand data balance and identify dominant categories.` : 'Limited categorical data available for distribution analysis.'}

### 2. Correlation Analysis  
${numericalCols.length >= 2 ? `Investigate relationships between ${numericalCols.length} numerical variables to identify key drivers and dependencies.` : 'Insufficient numerical data for correlation analysis.'}

### 3. Trend Analysis
${datetimeCols.length > 0 ? `Analyze temporal patterns to identify trends, seasonality, and forecasting opportunities.` : 'Consider adding temporal dimensions for trend analysis.'}

### 4. Performance Monitoring
${performanceCols.length > 0 ? `Track performance metrics across different segments to identify optimization opportunities.` : 'Consider defining performance KPIs for ongoing monitoring.'}

## Strategic Business Questions

1. **What are the primary drivers of variation in your key metrics?**
   - Focus on the relationships between ${numericalCols.slice(0, 3).map(c => c.name).join(', ')}
   - Examine how ${categoricalCols.slice(0, 2).map(c => c.name).join(' and ')} influence outcomes

2. **Which segments or categories show the highest potential?**
   - Analyze performance across ${categoricalCols.length > 0 ? categoricalCols[0].name : 'available segments'}
   - Identify top-performing categories for resource allocation

3. **What trends should inform future strategy?**
   ${datetimeCols.length > 0 ? `- Monitor temporal patterns in ${datetimeCols[0].name} data` : '- Consider collecting time-series data for trend analysis'}
   - Track leading indicators for predictive insights

4. **How can data quality and collection be improved?**
   - Enhance data granularity in areas with limited variation
   - Consider additional variables that could explain performance differences

## Next Steps for Analysis

### Immediate Actions
1. **Deploy Recommended Visualizations**: Implement the ${charts.length} generated charts in your dashboard
2. **Statistical Analysis**: Conduct correlation analysis on numerical variables
3. **Segmentation Study**: Deep-dive into categorical breakdowns

### Advanced Analytics
1. **Predictive Modeling**: Build forecasting models using identified relationships
2. **Anomaly Detection**: Monitor for unusual patterns in key metrics  
3. **Optimization**: Use insights to improve business processes and outcomes

## Technical Notes
- **Processing Time**: Optimized for real-time analysis
- **Chart Diversity**: ${((chartTypes.length / 3) * 100).toFixed(0)}% coverage of available chart types
- **Data Coverage**: ${((columns.filter(c => c.uniqueValues > 1).length / columns.length) * 100).toFixed(0)}% of columns have analytical value

*Analysis generated by Senior Data Analyst AI - Enhanced Visualization Engine*`;

  return {
    charts_to_generate: charts.slice(0, 25), // Increased limit to 25 charts for more diversity
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