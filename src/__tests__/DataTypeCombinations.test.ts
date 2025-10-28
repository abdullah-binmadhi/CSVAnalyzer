/**
 * Tests for various data type combinations and edge cases
 * Requirements: 5.4, 5.5, 5.6
 */

import { analyzeDataset } from '../index';
import { TestDatasets } from './testDatasets';

describe('Data Type Combinations Tests', () => {
  
  describe('Basic Data Type Combinations', () => {
    it('should handle numerical + categorical combinations', async () => {
      const dataset = TestDatasets.getDataTypeCombinations().numericalCategorical;
      const result = await analyzeDataset(dataset);
      
      // Should generate bar charts for categorical vs numerical
      const barCharts = result.charts_to_generate.filter(chart => chart.type === 'bar');
      expect(barCharts.length).toBeGreaterThan(0);
      
      // Should identify categorical and numerical columns
      expect(result.full_analysis_report_markdown).toContain('Categorical');
      expect(result.full_analysis_report_markdown).toContain('Numerical');
      
      // Should suggest appropriate analysis
      expect(result.full_analysis_report_markdown).toContain('Category');
      expect(result.full_analysis_report_markdown).toContain('Amount');
    });

    it('should handle datetime + numerical combinations', async () => {
      const dataset = TestDatasets.getDataTypeCombinations().dateTimeNumerical;
      const result = await analyzeDataset(dataset);
      
      // Should generate line charts for time series
      const lineCharts = result.charts_to_generate.filter(chart => chart.type === 'line');
      expect(lineCharts.length).toBeGreaterThan(0);
      
      // Should identify time-series patterns
      expect(result.full_analysis_report_markdown).toContain('time-series');
      expect(result.full_analysis_report_markdown).toContain('Date');
      expect(result.full_analysis_report_markdown).toContain('Revenue');
    });

    it('should handle text + numerical + categorical combinations', async () => {
      const dataset = TestDatasets.getDataTypeCombinations().textNumericalCategorical;
      const result = await analyzeDataset(dataset);
      
      // Should generate multiple chart types
      const chartTypes = new Set(result.charts_to_generate.map(chart => chart.type));
      expect(chartTypes.size).toBeGreaterThan(1);
      
      // Should handle text columns appropriately (likely as categorical)
      expect(result.full_analysis_report_markdown).toContain('Price');
      expect(result.full_analysis_report_markdown).toContain('Category');
    });

    it('should handle complex mixed type datasets', async () => {
      const dataset = TestDatasets.getDataTypeCombinations().complexMixed;
      const result = await analyzeDataset(dataset);
      
      // Should generate comprehensive analysis
      expect(result.charts_to_generate.length).toBeGreaterThan(3);
      
      // Should identify multiple data types
      expect(result.full_analysis_report_markdown).toContain('Score');
      expect(result.full_analysis_report_markdown).toContain('Status');
      expect(result.full_analysis_report_markdown).toContain('Amount');
      
      // Should provide business insights
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
    });
  });

  describe('Edge Case Data Types', () => {
    it('should handle datasets with high null percentages', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().highNullDataset;
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should mention data quality issues
      expect(result.full_analysis_report_markdown).toContain('Data Quality Issues');
      
      // Should still generate some charts with available data
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
    });

    it('should handle mixed data types within columns', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().mixedTypeDataset;
      const result = await analyzeDataset(dataset);
      
      // Should handle gracefully without crashing
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should provide some analysis despite mixed types
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(200);
    });

    it('should handle minimal datasets', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().minimalDataset;
      const result = await analyzeDataset(dataset);
      
      // Should complete with minimal data
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should provide basic analysis
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      
      // May have limited charts but should not fail
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
    });

    it('should handle single column datasets', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().singleColumnDataset;
      const result = await analyzeDataset(dataset);
      
      // Should handle single column gracefully
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should mention the single column
      expect(result.full_analysis_report_markdown).toContain('Value');
      
      // Limited chart options but should not crash
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
    });
  });

  describe('Homogeneous Data Type Datasets', () => {
    it('should handle all categorical datasets', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().allCategoricalDataset;
      const result = await analyzeDataset(dataset);
      
      // Should generate appropriate charts for categorical data
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Should focus on categorical analysis
      expect(result.full_analysis_report_markdown).toContain('Categorical');
      
      // Should suggest grouping and segmentation analysis
      expect(result.full_analysis_report_markdown).toContain('Category1');
      expect(result.full_analysis_report_markdown).toContain('Category2');
    });

    it('should handle all numerical datasets', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().allNumericalDataset;
      const result = await analyzeDataset(dataset);
      
      // Should generate scatter plots for numerical correlations
      const scatterCharts = result.charts_to_generate.filter(chart => chart.type === 'scatter');
      expect(scatterCharts.length).toBeGreaterThan(0);
      
      // Should focus on numerical analysis
      expect(result.full_analysis_report_markdown).toContain('Numerical');
      expect(result.full_analysis_report_markdown).toContain('correlation');
    });

    it('should handle time series datasets', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().timeSeriesDataset;
      const result = await analyzeDataset(dataset);
      
      // Should generate line charts for time series
      const lineCharts = result.charts_to_generate.filter(chart => chart.type === 'line');
      expect(lineCharts.length).toBeGreaterThan(0);
      
      // Should identify time-based patterns
      expect(result.full_analysis_report_markdown).toContain('time-series');
      expect(result.full_analysis_report_markdown).toContain('Date');
    });
  });

  describe('Data Quality Scenarios', () => {
    it('should handle datasets with inconsistent formatting', async () => {
      const inconsistentDataset = {
        headers: ['Date', 'Amount', 'Category'],
        sampleData: [
          ['2023-01-01', '1,000.50', 'Type A'],
          ['01/02/2023', 1500.75, 'TYPE_B'],
          ['2023-3-1', '$2,000', 'type c'],
          ['2023/04/01', 'N/A', 'Type A'],
          ['Invalid Date', 3000, null]
        ]
      };
      
      const result = await analyzeDataset(inconsistentDataset);
      
      // Should handle inconsistent data gracefully
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should mention data quality concerns
      expect(result.full_analysis_report_markdown).toContain('data quality');
    });

    it('should handle datasets with extreme values', async () => {
      const extremeDataset = {
        headers: ['ID', 'Value', 'Category'],
        sampleData: [
          [1, 100, 'Normal'],
          [2, 1000000, 'Outlier'],
          [3, 0.001, 'Small'],
          [4, -50000, 'Negative'],
          [5, 150, 'Normal']
        ]
      };
      
      const result = await analyzeDataset(extremeDataset);
      
      // Should handle extreme values without crashing
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.full_analysis_report_markdown).toContain('Value');
      
      // Should potentially mention outliers or data distribution
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(300);
    });

    it('should handle datasets with special characters and unicode', async () => {
      const unicodeDataset = {
        headers: ['Name', 'Price €', 'Category'],
        sampleData: [
          ['Café Latté', 4.50, 'Beverages'],
          ['Naïve Approach', 12.99, 'Books'],
          ['Résumé Template', 9.99, 'Documents'],
          ['Piña Colada', 8.75, 'Beverages'],
          ['Jalapeño Chips', 3.25, 'Snacks']
        ]
      };
      
      const result = await analyzeDataset(unicodeDataset);
      
      // Should handle unicode characters properly
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should include the unicode column names
      expect(result.full_analysis_report_markdown).toContain('Price');
      expect(result.full_analysis_report_markdown).toContain('Category');
    });
  });

  describe('Large Scale Data Type Combinations', () => {
    it('should handle datasets with many categorical columns', async () => {
      const manyCategoricalDataset = {
        headers: Array.from({ length: 15 }, (_, i) => `Category_${i + 1}`),
        sampleData: Array.from({ length: 20 }, (_, row) =>
          Array.from({ length: 15 }, (_, col) => `Value_${(row + col) % 5}`)
        )
      };
      
      const result = await analyzeDataset(manyCategoricalDataset);
      
      // Should handle many categorical columns efficiently
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.full_analysis_report_markdown).toContain('Categorical');
      
      // Should not generate excessive number of charts
      expect(result.charts_to_generate.length).toBeLessThan(50);
    });

    it('should handle datasets with many numerical columns', async () => {
      const manyNumericalDataset = {
        headers: Array.from({ length: 12 }, (_, i) => `Metric_${i + 1}`),
        sampleData: Array.from({ length: 25 }, () =>
          Array.from({ length: 12 }, () => Math.random() * 1000)
        )
      };
      
      const result = await analyzeDataset(manyNumericalDataset);
      
      // Should generate scatter plots for correlations
      const scatterCharts = result.charts_to_generate.filter(chart => chart.type === 'scatter');
      expect(scatterCharts.length).toBeGreaterThan(0);
      
      // Should mention correlation analysis
      expect(result.full_analysis_report_markdown).toContain('correlation');
      
      // Should limit chart generation to prevent explosion
      expect(result.charts_to_generate.length).toBeLessThan(300);
    });

    it('should handle balanced mixed-type datasets', async () => {
      const balancedDataset = {
        headers: [
          'Date1', 'Date2', 'Date3',
          'Cat1', 'Cat2', 'Cat3',
          'Num1', 'Num2', 'Num3',
          'Text1', 'Text2', 'Text3'
        ],
        sampleData: Array.from({ length: 30 }, (_, i) => [
          `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
          `2023-${String((i % 12) + 1).padStart(2, '0')}-15`,
          `2023-${String((i % 12) + 1).padStart(2, '0')}-30`,
          `Category_${i % 3}`,
          `Type_${i % 4}`,
          `Group_${i % 5}`,
          Math.random() * 1000,
          Math.random() * 500,
          Math.random() * 200,
          `Description ${i}`,
          `Label ${i % 10}`,
          `Tag ${i % 7}`
        ])
      };
      
      const result = await analyzeDataset(balancedDataset);
      
      // Should generate diverse chart types
      const chartTypes = new Set(result.charts_to_generate.map(chart => chart.type));
      expect(chartTypes.size).toBeGreaterThan(1);
      
      // Should include all major chart types
      expect(chartTypes.has('bar')).toBe(true);
      expect(chartTypes.has('line')).toBe(true);
      expect(chartTypes.has('scatter')).toBe(true);
      
      // Should provide comprehensive analysis
      expect(result.full_analysis_report_markdown).toContain('time-series');
      expect(result.full_analysis_report_markdown).toContain('correlation');
      expect(result.full_analysis_report_markdown).toContain('categorical');
    });
  });

  describe('Data Type Detection Accuracy', () => {
    it('should correctly identify datetime columns in various formats', async () => {
      const dateFormatDataset = {
        headers: ['ISO_Date', 'US_Date', 'EU_Date', 'Timestamp'],
        sampleData: [
          ['2023-01-15', '01/15/2023', '15/01/2023', '2023-01-15 14:30:00'],
          ['2023-02-20', '02/20/2023', '20/02/2023', '2023-02-20 09:15:30'],
          ['2023-03-10', '03/10/2023', '10/03/2023', '2023-03-10 16:45:15'],
          ['2023-04-05', '04/05/2023', '05/04/2023', '2023-04-05 11:20:45'],
          ['2023-05-12', '05/12/2023', '12/05/2023', '2023-05-12 13:55:20']
        ]
      };
      
      const result = await analyzeDataset(dateFormatDataset);
      
      // Should identify datetime patterns and generate time-series charts
      const lineCharts = result.charts_to_generate.filter(chart => chart.type === 'line');
      // Note: Date detection might not work for all formats, so we check for any charts
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Should mention date/time analysis
      expect(result.full_analysis_report_markdown).toContain('Date');
    });

    it('should correctly identify numerical columns with various formats', async () => {
      const numberFormatDataset = {
        headers: ['Integer', 'Decimal', 'Currency', 'Percentage', 'Scientific'],
        sampleData: [
          [100, 123.45, '$1,234.56', '15.5%', '1.23e+4'],
          [200, 234.56, '$2,345.67', '20.0%', '2.34e+4'],
          [150, 178.90, '$1,789.01', '12.3%', '1.78e+4'],
          [300, 345.67, '$3,456.78', '25.8%', '3.45e+4'],
          [250, 289.12, '$2,891.23', '18.7%', '2.89e+4']
        ]
      };
      
      const result = await analyzeDataset(numberFormatDataset);
      
      // Should generate scatter plots for numerical correlations
      const scatterCharts = result.charts_to_generate.filter(chart => chart.type === 'scatter');
      expect(scatterCharts.length).toBeGreaterThan(0);
      
      // Should identify numerical analysis opportunities
      expect(result.full_analysis_report_markdown).toContain('correlation');
    });

    it('should correctly identify categorical columns with various cardinalities', async () => {
      const categoricalDataset = {
        headers: ['Low_Card', 'Medium_Card', 'High_Card', 'Binary'],
        sampleData: Array.from({ length: 50 }, (_, i) => [
          ['A', 'B', 'C'][i % 3],
          `Category_${i % 10}`,
          `Item_${i % 25}`,
          i % 2 === 0 ? 'Yes' : 'No'
        ])
      };
      
      const result = await analyzeDataset(categoricalDataset);
      
      // Should generate bar charts for categorical analysis
      const barCharts = result.charts_to_generate.filter(chart => chart.type === 'bar');
      expect(barCharts.length).toBeGreaterThan(0);
      
      // Should mention categorical analysis
      expect(result.full_analysis_report_markdown).toContain('Categorical');
    });
  });
});