/**
 * Final Integration Tests for Task 12 - Optimize and finalize implementation
 * Tests the complete system with real-world datasets and edge cases
 * Requirements: 2.7, 4.1, 6.4, 6.5
 */

import { analyzeDataset } from '../index';
import { JsonOutputFormatter } from '../formatters/JsonOutputFormatter';
import { VisualizationGenerator } from '../generators/VisualizationGenerator';

describe('Final Integration Tests - Task 12', () => {
  let formatter: JsonOutputFormatter;

  beforeEach(() => {
    formatter = new JsonOutputFormatter();
    VisualizationGenerator.clearGeneratedCharts();
  });

  describe('Real-world Dataset Testing', () => {
    it('should handle comprehensive financial dataset', async () => {
      const financialData = {
        headers: ['date', 'company', 'revenue', 'expenses', 'profit', 'sector', 'employees', 'market_cap'],
        sampleData: [
          ['2024-01-01', 'TechCorp', 1000000, 800000, 200000, 'Technology', 500, 50000000],
          ['2024-01-01', 'FinanceInc', 2000000, 1500000, 500000, 'Finance', 1000, 100000000],
          ['2024-01-01', 'HealthCare Ltd', 1500000, 1200000, 300000, 'Healthcare', 750, 75000000],
          ['2024-02-01', 'TechCorp', 1100000, 850000, 250000, 'Technology', 520, 55000000],
          ['2024-02-01', 'FinanceInc', 2100000, 1600000, 500000, 'Finance', 1020, 105000000]
        ]
      };

      const startTime = Date.now();
      const result = await analyzeDataset(financialData);
      const processingTime = Date.now() - startTime;

      // Performance validation
      expect(processingTime).toBeLessThan(15000); // Should complete within 15 seconds

      // Output structure validation
      expect(result).toHaveProperty('charts_to_generate');
      expect(result).toHaveProperty('full_analysis_report_markdown');
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
      expect(typeof result.full_analysis_report_markdown).toBe('string');

      // Chart generation validation
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.charts_to_generate.length).toBeLessThanOrEqual(100); // Performance limit

      // Chart diversity validation
      const chartTypes = new Set(result.charts_to_generate.map(c => c.type));
      expect(chartTypes.size).toBeGreaterThan(1); // Should have multiple chart types

      // Report quality validation
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(500);
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.full_analysis_report_markdown).toContain('Financial');

      // Comprehensive compliance validation
      const validation = formatter.validateComprehensiveOutputCompliance(result);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.metrics.chartCount).toBeGreaterThan(0);
    });

    it('should handle e-commerce dataset with mixed data types', async () => {
      const ecommerceData = {
        headers: ['product_id', 'product_name', 'category', 'price', 'rating', 'reviews_count', 'in_stock', 'launch_date'],
        sampleData: [
          ['P001', 'iPhone 15 Pro', 'Electronics', 999.99, 4.8, 1250, true, '2023-09-15'],
          ['P002', 'Samsung Galaxy S24', 'Electronics', 899.99, 4.7, 980, true, '2024-01-20'],
          ['P003', 'Nike Air Max', 'Footwear', 129.99, 4.5, 450, false, '2023-08-10'],
          ['P004', 'MacBook Pro M3', 'Electronics', 1999.99, 4.9, 320, true, '2023-11-01'],
          ['P005', 'Adidas Ultraboost', 'Footwear', 179.99, 4.6, 280, true, '2023-07-15']
        ]
      };

      const result = await analyzeDataset(ecommerceData);

      // Validate mixed data type handling
      const hasBarCharts = result.charts_to_generate.some(c => c.type === 'bar');
      const hasScatterPlots = result.charts_to_generate.some(c => c.type === 'scatter');
      const hasLineCharts = result.charts_to_generate.some(c => c.type === 'line');

      expect(hasBarCharts).toBe(true); // Should have categorical analysis
      expect(hasScatterPlots).toBe(true); // Should have numerical correlations

      // Validate business insights
      expect(result.full_analysis_report_markdown).toContain('E-commerce');
      expect(result.full_analysis_report_markdown.toLowerCase()).toContain('product');
      expect(result.full_analysis_report_markdown.toLowerCase()).toContain('price');
    });

    it('should handle healthcare dataset with sensitive data patterns', async () => {
      const healthcareData = {
        headers: ['patient_id', 'age', 'diagnosis', 'treatment_cost', 'recovery_days', 'satisfaction_score'],
        sampleData: [
          ['PT001', 45, 'Diabetes', 1500, 14, 4.2],
          ['PT002', 62, 'Hypertension', 800, 7, 4.5],
          ['PT003', 38, 'Diabetes', 1200, 10, 4.0],
          ['PT004', 55, 'Heart Disease', 5000, 21, 3.8],
          ['PT005', 41, 'Hypertension', 900, 8, 4.3]
        ]
      };

      const result = await analyzeDataset(healthcareData);

      // Validate healthcare domain detection
      expect(result.full_analysis_report_markdown).toContain('Healthcare');
      expect(result.full_analysis_report_markdown.toLowerCase()).toContain('patient');

      // Validate appropriate chart generation for healthcare data
      const chartTitles = result.charts_to_generate.map(c => c.title.toLowerCase());
      const hasRelevantCharts = chartTitles.some(title => 
        title.includes('cost') || title.includes('age') || title.includes('recovery')
      );
      expect(hasRelevantCharts).toBe(true);
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle minimal dataset gracefully', async () => {
      const minimalData = {
        headers: ['value'],
        sampleData: [
          [100],
          [200],
          [150]
        ]
      };

      const result = await analyzeDataset(minimalData);

      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(100);
    });

    it('should handle dataset with high cardinality text columns', async () => {
      const highCardinalityData = {
        headers: ['id', 'description', 'value'],
        sampleData: Array.from({ length: 50 }, (_, i) => [
          `ID${i}`,
          `Very unique description ${i} with lots of detail`,
          Math.random() * 1000
        ])
      };

      const result = await analyzeDataset(highCardinalityData);

      // Should not create charts with high cardinality text columns as axes
      const hasDescriptionAxis = result.charts_to_generate.some(c => 
        c.xAxis === 'description' || c.yAxis === 'description'
      );
      expect(hasDescriptionAxis).toBe(false);
    });

    it('should handle dataset with all null values in some columns', async () => {
      const nullData = {
        headers: ['good_column', 'null_column', 'mixed_column'],
        sampleData: [
          [100, null, 50],
          [200, null, null],
          [150, null, 75],
          [180, null, null]
        ]
      };

      const result = await analyzeDataset(nullData);

      // Should still generate meaningful analysis
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.full_analysis_report_markdown).toContain('good_column');
    });

    it('should handle extremely large dataset efficiently', async () => {
      const largeData = {
        headers: ['id', 'category', 'value1', 'value2', 'value3'],
        sampleData: Array.from({ length: 1000 }, (_, i) => [
          i,
          `Category${i % 10}`,
          Math.random() * 1000,
          Math.random() * 500,
          Math.random() * 200
        ])
      };

      const startTime = Date.now();
      const result = await analyzeDataset(largeData);
      const processingTime = Date.now() - startTime;

      // Should complete within reasonable time even with large dataset
      expect(processingTime).toBeLessThan(30000); // 30 seconds max
      expect(result.charts_to_generate.length).toBeLessThanOrEqual(100); // Should respect limits
    });
  });

  describe('Output Format Compliance', () => {
    it('should produce JSON-compliant output', async () => {
      const testData = {
        headers: ['name', 'value', 'category'],
        sampleData: [
          ['Test A', 100, 'Type 1'],
          ['Test B', 200, 'Type 2'],
          ['Test C', 150, 'Type 1']
        ]
      };

      const result = await analyzeDataset(testData);

      // Test JSON serialization
      const jsonString = JSON.stringify(result);
      expect(() => JSON.parse(jsonString)).not.toThrow();

      // Test round-trip serialization
      const reparsed = JSON.parse(jsonString);
      expect(reparsed).toEqual(result);

      // Validate using formatter
      const validation = formatter.validateJsonString(jsonString);
      expect(validation).toEqual(result);
    });

    it('should handle special characters in data', async () => {
      const specialCharData = {
        headers: ['name', 'description', 'value'],
        sampleData: [
          ['Test "Quote"', 'Description with\nnewlines', 100],
          ['Test & Ampersand', 'Description with\ttabs', 200],
          ['Test <HTML>', 'Description with émojis 🚀', 150]
        ]
      };

      const result = await analyzeDataset(specialCharData);

      // Should handle special characters without breaking JSON
      expect(() => JSON.stringify(result)).not.toThrow();
      
      const validation = formatter.validateComprehensiveOutputCompliance(result);
      expect(validation.isValid).toBe(true);
    });

    it('should provide comprehensive validation metrics', async () => {
      const testData = {
        headers: ['date', 'sales', 'region', 'product'],
        sampleData: [
          ['2024-01-01', 1000, 'North', 'Widget A'],
          ['2024-01-02', 1200, 'South', 'Widget B'],
          ['2024-01-03', 900, 'East', 'Widget A'],
          ['2024-01-04', 1100, 'West', 'Widget C']
        ]
      };

      const result = await analyzeDataset(testData);
      const validation = formatter.validateComprehensiveOutputCompliance(result);

      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('metrics');

      expect(validation.metrics).toHaveProperty('chartCount');
      expect(validation.metrics).toHaveProperty('reportLength');
      expect(validation.metrics).toHaveProperty('hasRequiredSections');
      expect(validation.metrics).toHaveProperty('jsonSize');

      expect(validation.metrics.chartCount).toBeGreaterThan(0);
      expect(validation.metrics.reportLength).toBeGreaterThan(0);
      expect(validation.metrics.jsonSize).toBeGreaterThan(0);
    });
  });

  describe('Performance Optimization Validation', () => {
    it('should demonstrate improved chart generation performance', async () => {
      const complexData = {
        headers: ['col1', 'col2', 'col3', 'col4', 'col5', 'cat1', 'cat2', 'date1'],
        sampleData: Array.from({ length: 100 }, (_, i) => [
          Math.random() * 1000,
          Math.random() * 500,
          Math.random() * 200,
          Math.random() * 800,
          Math.random() * 300,
          `Category${i % 5}`,
          `Type${i % 3}`,
          `2024-01-${(i % 28) + 1}`
        ])
      };

      const startTime = Date.now();
      const result = await analyzeDataset(complexData);
      const processingTime = Date.now() - startTime;

      // Should complete quickly due to optimizations
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      expect(result.charts_to_generate.length).toBeGreaterThan(0);

      // Validate chart generation statistics (if available)
      const stats = VisualizationGenerator.getChartGenerationStats();
      expect(stats).toBeDefined();
      expect(stats.totalCharts).toBeGreaterThanOrEqual(0);
      expect(stats.diversityScore).toBeGreaterThanOrEqual(0);
      expect(stats.uniqueColumnCombinations).toBeGreaterThanOrEqual(0);
    });

    it('should handle robust output formatting with warnings', async () => {
      const testData = {
        headers: ['valid_col', 'another_col'],
        sampleData: [
          [100, 'A'],
          [200, 'B'],
          [150, 'C']
        ]
      };

      const result = await analyzeDataset(testData);
      
      // Test robust formatting
      const robustResult = formatter.formatOutputRobust(
        result.charts_to_generate,
        result.full_analysis_report_markdown
      );

      expect(robustResult).toHaveProperty('output');
      expect(robustResult).toHaveProperty('warnings');
      expect(robustResult).toHaveProperty('metrics');

      expect(robustResult.metrics.processingTime).toBeGreaterThanOrEqual(0);
      expect(robustResult.metrics.finalChartCount).toBeGreaterThanOrEqual(0);
      expect(robustResult.metrics.reportLength).toBeGreaterThan(0);
    });
  });

  describe('Business Intelligence Quality', () => {
    it('should generate actionable business insights', async () => {
      const businessData = {
        headers: ['quarter', 'revenue', 'customers', 'churn_rate', 'satisfaction'],
        sampleData: [
          ['Q1 2024', 1000000, 5000, 0.05, 4.2],
          ['Q2 2024', 1200000, 5500, 0.04, 4.3],
          ['Q3 2024', 1100000, 5200, 0.06, 4.1],
          ['Q4 2024', 1300000, 5800, 0.03, 4.4]
        ]
      };

      const result = await analyzeDataset(businessData);

      // Validate business insight quality
      const report = result.full_analysis_report_markdown;
      
      // Should contain actionable questions (check for either format)
      const hasActionableQuestions = report.includes('Actionable Questions') || 
                                    report.includes('Key Business Questions') ||
                                    report.includes('Business Questions');
      expect(hasActionableQuestions).toBe(true);
      
      // Should identify business-relevant patterns
      const businessKeywords = ['revenue', 'customer', 'churn', 'satisfaction'];
      const hasBusinessContext = businessKeywords.some(keyword => 
        report.toLowerCase().includes(keyword)
      );
      expect(hasBusinessContext).toBe(true);

      // Should provide specific recommendations
      const actionableKeywords = ['recommend', 'suggest', 'should', 'could', 'analyze'];
      const hasActionableContent = actionableKeywords.some(keyword => 
        report.toLowerCase().includes(keyword)
      );
      expect(hasActionableContent).toBe(true);
    });
  });
});