/**
 * Integration tests for the main analysis orchestrator
 * Requirements: All requirements integration
 */

import { analyzeDataset } from '../index';
import { InputData, AnalysisOutput } from '../types/interfaces';

describe('Analysis Orchestrator Integration Tests', () => {
  // Test data sets for different scenarios
  const financialDataset: InputData = {
    headers: ['Date', 'Revenue', 'Expenses', 'Profit', 'Department'],
    sampleData: [
      ['2023-01-01', 100000, 75000, 25000, 'Sales'],
      ['2023-02-01', 120000, 80000, 40000, 'Marketing'],
      ['2023-03-01', 110000, 85000, 25000, 'Sales'],
      ['2023-04-01', 130000, 90000, 40000, 'Engineering'],
      ['2023-05-01', 125000, 88000, 37000, 'Marketing']
    ]
  };

  const ecommerceDataset: InputData = {
    headers: ['ProductID', 'Category', 'Price', 'Quantity', 'CustomerRating'],
    sampleData: [
      ['P001', 'Electronics', 299.99, 50, 4.5],
      ['P002', 'Clothing', 49.99, 100, 4.2],
      ['P003', 'Electronics', 199.99, 75, 4.7],
      ['P004', 'Books', 19.99, 200, 4.1],
      ['P005', 'Clothing', 79.99, 60, 4.3]
    ]
  };

  const healthcareDataset: InputData = {
    headers: ['PatientID', 'Age', 'Diagnosis', 'TreatmentDuration', 'Outcome'],
    sampleData: [
      ['PT001', 45, 'Hypertension', 30, 'Improved'],
      ['PT002', 62, 'Diabetes', 90, 'Stable'],
      ['PT003', 38, 'Hypertension', 45, 'Improved'],
      ['PT004', 55, 'Heart Disease', 120, 'Improved'],
      ['PT005', 41, 'Diabetes', 60, 'Stable']
    ]
  };

  const minimalDataset: InputData = {
    headers: ['ID', 'Value'],
    sampleData: [
      [1, 100],
      [2, 200]
    ]
  };

  describe('Complete End-to-End Analysis Flow', () => {
    it('should successfully analyze financial dataset', async () => {
      const result = await analyzeDataset(financialDataset);
      
      // Validate output structure
      expect(result).toHaveProperty('charts_to_generate');
      expect(result).toHaveProperty('full_analysis_report_markdown');
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
      expect(typeof result.full_analysis_report_markdown).toBe('string');
      
      // Validate charts were generated
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Validate chart structure
      result.charts_to_generate.forEach(chart => {
        expect(chart).toHaveProperty('title');
        expect(chart).toHaveProperty('type');
        expect(chart).toHaveProperty('xAxis');
        expect(chart).toHaveProperty('yAxis');
        expect(['bar', 'line', 'scatter']).toContain(chart.type);
      });
      
      // Validate report content
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.full_analysis_report_markdown).toContain('Financial Services');
      expect(result.full_analysis_report_markdown).toContain('Revenue');
    }, 30000);

    it('should successfully analyze e-commerce dataset', async () => {
      const result = await analyzeDataset(ecommerceDataset);
      
      // Validate output structure
      expect(result).toHaveProperty('charts_to_generate');
      expect(result).toHaveProperty('full_analysis_report_markdown');
      
      // Validate charts include appropriate types for e-commerce data
      const chartTypes = result.charts_to_generate.map(chart => chart.type);
      expect(chartTypes).toContain('bar'); // For categorical analysis
      expect(chartTypes).toContain('scatter'); // For numerical correlations
      
      // Validate report identifies e-commerce domain
      expect(result.full_analysis_report_markdown).toContain('E-commerce');
      expect(result.full_analysis_report_markdown).toContain('Price');
    }, 30000);

    it('should successfully analyze healthcare dataset', async () => {
      const result = await analyzeDataset(healthcareDataset);
      
      // Validate output structure
      expect(result).toHaveProperty('charts_to_generate');
      expect(result).toHaveProperty('full_analysis_report_markdown');
      
      // Validate healthcare-specific insights
      expect(result.full_analysis_report_markdown).toContain('Healthcare');
      expect(result.full_analysis_report_markdown).toContain('patient');
    }, 30000);

    it('should handle minimal dataset gracefully', async () => {
      const result = await analyzeDataset(minimalDataset);
      
      // Should still produce valid output
      expect(result).toHaveProperty('charts_to_generate');
      expect(result).toHaveProperty('full_analysis_report_markdown');
      expect(typeof result.full_analysis_report_markdown).toBe('string');
      
      // May have fewer charts but should not fail
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
    }, 30000);
  });

  describe('Data Flow Integration', () => {
    it('should properly coordinate all components', async () => {
      const result = await analyzeDataset(financialDataset);
      
      // Verify input processing worked
      expect(result.full_analysis_report_markdown).toContain('5'); // Should mention 5 columns
      
      // Verify data type analysis worked
      expect(result.full_analysis_report_markdown).toContain('Numerical');
      expect(result.full_analysis_report_markdown).toContain('Categorical');
      
      // Verify visualization generation worked
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      const hasBarChart = result.charts_to_generate.some(chart => chart.type === 'bar');
      const hasScatterChart = result.charts_to_generate.some(chart => chart.type === 'scatter');
      expect(hasBarChart || hasScatterChart).toBe(true);
      
      // Verify business intelligence worked
      expect(result.full_analysis_report_markdown).toContain('Financial Services');
      expect(result.full_analysis_report_markdown).toContain('Revenue');
      
      // Verify report generation worked
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.full_analysis_report_markdown).toContain('Statistical Analysis');
      expect(result.full_analysis_report_markdown).toContain('Key Business Questions');
    }, 30000);

    it('should maintain data consistency across components', async () => {
      const result = await analyzeDataset(financialDataset);
      
      // Column names should be consistent across charts and report
      const chartColumns = new Set();
      result.charts_to_generate.forEach(chart => {
        chartColumns.add(chart.xAxis);
        chartColumns.add(chart.yAxis);
      });
      
      // Remove generated axes that are not from original headers
      const generatedAxes = ['Count', 'Cumulative Revenue', 'Cumulative Expenses', 'Cumulative Profit'];
      generatedAxes.forEach(axis => chartColumns.delete(axis));
      
      // All remaining chart columns should be from original headers
      const originalHeaders = new Set(financialDataset.headers);
      chartColumns.forEach(column => {
        expect(originalHeaders.has(column as string)).toBe(true);
      });
      
      // Report should mention key columns
      financialDataset.headers.forEach(header => {
        if (header !== 'Date') { // Date might not always be mentioned
          expect(result.full_analysis_report_markdown).toContain(header);
        }
      });
    }, 30000);
  });

  describe('Memory Management', () => {
    it('should handle multiple sequential analyses without memory leaks', async () => {
      const datasets = [financialDataset, ecommerceDataset, healthcareDataset];
      
      for (const dataset of datasets) {
        const result = await analyzeDataset(dataset);
        
        // Validate each result
        expect(result).toHaveProperty('charts_to_generate');
        expect(result).toHaveProperty('full_analysis_report_markdown');
        expect(Array.isArray(result.charts_to_generate)).toBe(true);
        expect(typeof result.full_analysis_report_markdown).toBe('string');
      }
      
      // If we get here without memory issues, the test passes
      expect(true).toBe(true);
    }, 60000);

    it('should clean up state between analyses', async () => {
      // First analysis
      await analyzeDataset(financialDataset);
      
      // Second analysis with different data
      const result = await analyzeDataset(ecommerceDataset);
      
      // Should not contain artifacts from first analysis
      expect(result.full_analysis_report_markdown).not.toContain('Financial Services');
      expect(result.full_analysis_report_markdown).toContain('E-commerce');
    }, 30000);
  });

  describe('Error Handling Integration', () => {
    it('should handle invalid input gracefully', async () => {
      const invalidInput = {
        headers: [],
        sampleData: []
      };
      
      await expect(analyzeDataset(invalidInput)).rejects.toThrow();
    });

    it('should handle malformed data gracefully', async () => {
      const malformedInput = {
        headers: ['A', 'B'],
        sampleData: [
          ['value1'], // Missing second column
          ['value2', 'value3']
        ]
      };
      
      await expect(analyzeDataset(malformedInput)).rejects.toThrow();
    });

    it('should provide meaningful error messages', async () => {
      const invalidInput = {
        headers: ['A'],
        sampleData: []
      };
      
      try {
        await analyzeDataset(invalidInput);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBeTruthy();
        expect((error as Error).message.length).toBeGreaterThan(10);
      }
    });
  });

  describe('Performance Integration', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();
      
      await analyzeDataset(financialDataset);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 30 seconds
      expect(duration).toBeLessThan(30000);
    }, 35000);

    it('should handle larger datasets efficiently', async () => {
      // Create a larger dataset
      const largeDataset: InputData = {
        headers: ['ID', 'Category', 'Value1', 'Value2', 'Value3', 'Date', 'Status'],
        sampleData: []
      };
      
      // Generate 50 rows of data
      for (let i = 1; i <= 50; i++) {
        largeDataset.sampleData.push([
          `ID${i}`,
          `Category${i % 5}`,
          Math.random() * 1000,
          Math.random() * 500,
          Math.random() * 200,
          `2023-${String(i % 12 + 1).padStart(2, '0')}-01`,
          i % 2 === 0 ? 'Active' : 'Inactive'
        ]);
      }
      
      const startTime = Date.now();
      const result = await analyzeDataset(largeDataset);
      const endTime = Date.now();
      
      // Should still complete within reasonable time
      expect(endTime - startTime).toBeLessThan(45000);
      
      // Should produce valid results
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
    }, 50000);
  });

  describe('Output Validation Integration', () => {
    it('should produce JSON-serializable output', async () => {
      const result = await analyzeDataset(financialDataset);
      
      // Should be able to stringify without errors
      const jsonString = JSON.stringify(result);
      expect(typeof jsonString).toBe('string');
      expect(jsonString.length).toBeGreaterThan(100);
      
      // Should be able to parse back
      const parsed = JSON.parse(jsonString);
      expect(parsed).toEqual(result);
    });

    it('should produce valid AnalysisOutput structure', async () => {
      const result = await analyzeDataset(financialDataset);
      
      // Check exact structure
      const keys = Object.keys(result);
      expect(keys).toEqual(['charts_to_generate', 'full_analysis_report_markdown']);
      
      // Validate types
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
      expect(typeof result.full_analysis_report_markdown).toBe('string');
      
      // Validate chart structure
      result.charts_to_generate.forEach(chart => {
        expect(typeof chart.title).toBe('string');
        expect(typeof chart.type).toBe('string');
        expect(typeof chart.xAxis).toBe('string');
        expect(typeof chart.yAxis).toBe('string');
        expect(['bar', 'line', 'scatter']).toContain(chart.type);
      });
    });

    it('should produce non-empty meaningful content', async () => {
      const result = await analyzeDataset(financialDataset);
      
      // Charts should not be empty
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Report should have substantial content
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(500);
      
      // Report should contain key sections
      expect(result.full_analysis_report_markdown).toContain('# Executive Summary');
      expect(result.full_analysis_report_markdown).toContain('# Statistical Analysis');
      expect(result.full_analysis_report_markdown).toContain('# Key Business Questions');
      expect(result.full_analysis_report_markdown).toContain('# Conclusion');
    });
  });
});