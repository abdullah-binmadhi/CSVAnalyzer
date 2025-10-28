/**
 * Generate Additional Charts API for Vercel
 * Generates extended chart recommendations with experimental visualizations
 */

// Enable CORS for all origins
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Generate additional experimental charts
function generateMoreCharts(data) {
  const { headers, sampleData } = data;
  
  // Enhanced data type detection
  const columns = headers.map((header, index) => {
    const values = sampleData.map(row => row[index]).filter(v => v != null);
    const uniqueValues = new Set(values).size;
    const nonEmptyValues = values.filter(v => v !== '' && v !== null && v !== undefined);
    
    let type = 'text';
    const numericValues = nonEmptyValues.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
    if (numericValues.length > nonEmptyValues.length * 0.8) {
      type = 'numerical';
    } else if (nonEmptyValues.some(v => 
      /\d{4}-\d{2}-\d{2}/.test(v) || /\d{2}\/\d{2}\/\d{4}/.test(v)
    )) {
      type = 'datetime';
    } else if (uniqueValues <= Math.min(10, nonEmptyValues.length * 0.5)) {
      type = 'categorical';
    } else if (uniqueValues <= 2) {
      type = 'boolean';
    }
    
    return { name: header, type, uniqueValues, sampleValues: nonEmptyValues.slice(0, 5) };
  });
  
  const numericalCols = columns.filter(c => c.type === 'numerical');
  const categoricalCols = columns.filter(c => c.type === 'categorical');
  const datetimeCols = columns.filter(c => c.type === 'datetime');
  const booleanCols = columns.filter(c => c.type === 'boolean');
  
  const additionalCharts = [];
  
  // 1. ADVANCED DISTRIBUTION CHARTS
  // Box plot representations (as bar charts with quartile info)
  numericalCols.forEach(col => {
    additionalCharts.push({
      title: `${col.name} Box Plot Analysis`,
      type: 'bar',
      xAxis: 'Quartiles',
      yAxis: col.name,
      description: 'Shows distribution quartiles and outliers'
    });
  });
  
  // 2. COMPARATIVE ANALYSIS CHARTS
  // Cross-categorical analysis
  for (let i = 0; i < categoricalCols.length; i++) {
    for (let j = i + 1; j < categoricalCols.length; j++) {
      additionalCharts.push({
        title: `${categoricalCols[i].name} vs ${categoricalCols[j].name} Cross-Analysis`,
        type: 'bar',
        xAxis: categoricalCols[i].name,
        yAxis: `${categoricalCols[j].name} Distribution`,
        description: 'Cross-tabulation analysis'
      });
    }
  }
  
  // 3. ADVANCED TIME SERIES
  if (datetimeCols.length > 0) {
    const dateCol = datetimeCols[0];
    
    // Moving averages
    numericalCols.forEach(numCol => {
      additionalCharts.push({
        title: `${numCol.name} Moving Average Trend`,
        type: 'line',
        xAxis: dateCol.name,
        yAxis: `${numCol.name} (Moving Avg)`,
        description: 'Smoothed trend analysis'
      });
    });
    
    // Year-over-year comparison
    numericalCols.forEach(numCol => {
      additionalCharts.push({
        title: `${numCol.name} Year-over-Year Growth`,
        type: 'line',
        xAxis: dateCol.name,
        yAxis: `${numCol.name} Growth %`,
        description: 'Growth rate analysis'
      });
    });
    
    // Seasonal patterns
    numericalCols.forEach(numCol => {
      additionalCharts.push({
        title: `${numCol.name} Seasonal Pattern`,
        type: 'line',
        xAxis: 'Month/Quarter',
        yAxis: numCol.name,
        description: 'Seasonal trend identification'
      });
    });
  }
  
  // 4. ADVANCED CORRELATION ANALYSIS
  // Correlation matrix visualization
  if (numericalCols.length >= 3) {
    additionalCharts.push({
      title: 'Correlation Matrix Heatmap',
      type: 'scatter',
      xAxis: 'Variables',
      yAxis: 'Correlation Strength',
      description: 'Shows relationships between all numerical variables'
    });
  }
  
  // Bubble charts (3D scatter plots)
  if (numericalCols.length >= 3) {
    for (let i = 0; i < Math.min(3, numericalCols.length); i++) {
      for (let j = i + 1; j < Math.min(4, numericalCols.length); j++) {
        for (let k = j + 1; k < Math.min(5, numericalCols.length); k++) {
          additionalCharts.push({
            title: `${numericalCols[j].name} vs ${numericalCols[i].name} (Bubble: ${numericalCols[k].name})`,
            type: 'scatter',
            xAxis: numericalCols[i].name,
            yAxis: numericalCols[j].name,
            description: `Bubble size represents ${numericalCols[k].name}`
          });
        }
      }
    }
  }
  
  // 5. BUSINESS INTELLIGENCE CHARTS
  // Performance dashboards
  const performanceKeywords = ['performance', 'score', 'rating', 'efficiency', 'success', 'conversion', 'satisfaction'];
  const performanceCols = numericalCols.filter(col => 
    performanceKeywords.some(keyword => col.name.toLowerCase().includes(keyword))
  );
  
  performanceCols.forEach(perfCol => {
    // Performance benchmarking
    additionalCharts.push({
      title: `${perfCol.name} Benchmark Analysis`,
      type: 'bar',
      xAxis: 'Benchmark Categories',
      yAxis: perfCol.name,
      description: 'Performance against industry benchmarks'
    });
    
    // Performance trends
    if (datetimeCols.length > 0) {
      additionalCharts.push({
        title: `${perfCol.name} Performance Trend`,
        type: 'line',
        xAxis: datetimeCols[0].name,
        yAxis: perfCol.name,
        description: 'Performance tracking over time'
      });
    }
  });
  
  // 6. FINANCIAL ANALYSIS CHARTS
  const financialKeywords = ['revenue', 'sales', 'profit', 'cost', 'price', 'income', 'expense', 'margin'];
  const financialCols = numericalCols.filter(col => 
    financialKeywords.some(keyword => col.name.toLowerCase().includes(keyword))
  );
  
  financialCols.forEach(finCol => {
    // Financial ratios
    numericalCols.filter(c => c !== finCol).forEach(otherCol => {
      additionalCharts.push({
        title: `${finCol.name} to ${otherCol.name} Efficiency Ratio`,
        type: 'bar',
        xAxis: 'Time Periods',
        yAxis: `${finCol.name}/${otherCol.name} Ratio`,
        description: 'Financial efficiency analysis'
      });
    });
    
    // Waterfall analysis (represented as bar chart)
    additionalCharts.push({
      title: `${finCol.name} Waterfall Analysis`,
      type: 'bar',
      xAxis: 'Components',
      yAxis: finCol.name,
      description: 'Breakdown of contributing factors'
    });
  });
  
  // 7. SEGMENTATION ANALYSIS
  // Customer/Product segmentation
  const segmentKeywords = ['customer', 'product', 'user', 'client', 'segment', 'group'];
  const segmentCols = [...categoricalCols, ...columns.filter(c => 
    segmentKeywords.some(keyword => c.name.toLowerCase().includes(keyword))
  )];
  
  segmentCols.forEach(segCol => {
    numericalCols.forEach(numCol => {
      additionalCharts.push({
        title: `${numCol.name} Segmentation by ${segCol.name}`,
        type: 'bar',
        xAxis: segCol.name,
        yAxis: `Avg ${numCol.name}`,
        description: 'Segment performance analysis'
      });
    });
  });
  
  return {
    additional_charts: additionalCharts,
    total_additional: additionalCharts.length,
    categories: {
      distribution: additionalCharts.filter(c => c.description?.includes('distribution')).length,
      trend: additionalCharts.filter(c => c.description?.includes('trend')).length,
      correlation: additionalCharts.filter(c => c.description?.includes('correlation')).length,
      business: additionalCharts.filter(c => c.description?.includes('business') || c.description?.includes('financial')).length,
      performance: additionalCharts.filter(c => c.description?.includes('performance')).length,
      segmentation: additionalCharts.filter(c => c.description?.includes('segment')).length
    }
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
    
    // Generate additional charts
    const result = generateMoreCharts({ headers, sampleData });
    
    const processingTime = Date.now() - startTime;
    
    // Return results with metadata
    res.status(200).json({
      success: true,
      data: result,
      metadata: {
        processingTime,
        totalAdditionalCharts: result.total_additional,
        categories: result.categories,
        timestamp: new Date().toISOString(),
        version: 'extended'
      }
    });
    
  } catch (error) {
    console.error('Additional chart generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Additional chart generation failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};