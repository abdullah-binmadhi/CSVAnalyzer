/**
 * Advanced performance tests for comprehensive coverage
 * Requirements: 5.4, 5.5, 5.6
 */

import { analyzeDataset } from '../index';
import { TestDatasets } from './testDatasets';

describe('Advanced Performance Tests', () => {
  
  describe('Scalability Testing', () => {
    it('should handle progressive data size increases efficiently', async () => {
      const sizes = [25, 75, 150, 300, 500];
      const timings: number[] = [];
      const memoryUsages: number[] = [];
      
      for (const size of sizes) {
        const initialMemory = process.memoryUsage().heapUsed;
        const dataset = TestDatasets.generateLargeDataset(size);
        
        const startTime = Date.now();
        const result = await analyzeDataset(dataset);
        const endTime = Date.now();
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        timings.push(endTime - startTime);
        memoryUsages.push(memoryIncrease);
        
        // Validate result quality
        expect(result.charts_to_generate.length).toBeGreaterThan(0);
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
        
        console.log(`Size ${size}: ${timings[timings.length - 1]}ms, Memory: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
      }
      
      // Performance should scale reasonably
      const maxTime = Math.max(...timings);
      expect(maxTime).toBeLessThan(45000); // 45 seconds max for largest dataset
      
      // Memory usage should be reasonable
      const maxMemory = Math.max(...memoryUsages);
      expect(maxMemory).toBeLessThan(150 * 1024 * 1024); // 150MB max
    }, 300000); // 5 minutes total

    it('should maintain consistent performance across different data types', async () => {
      const datasets = [
        { name: 'Numerical Heavy', data: TestDatasets.getEdgeCaseDatasets().allNumericalDataset },
        { name: 'Categorical Heavy', data: TestDatasets.getEdgeCaseDatasets().allCategoricalDataset },
        { name: 'Mixed Types', data: TestDatasets.getFinancialDataset() },
        { name: 'Time Series', data: TestDatasets.getEdgeCaseDatasets().timeSeriesDataset },
        { name: 'Complex Mixed', data: TestDatasets.getDataTypeCombinations().complexMixed }
      ];
      
      const results: Array<{ name: string; time: number; charts: number; reportLength: number }> = [];
      
      for (const { name, data } of datasets) {
        const startTime = Date.now();
        const result = await analyzeDataset(data);
        const endTime = Date.now();
        
        results.push({
          name,
          time: endTime - startTime,
          charts: result.charts_to_generate.length,
          reportLength: result.full_analysis_report_markdown.length
        });
        
        console.log(`${name}: ${endTime - startTime}ms, ${result.charts_to_generate.length} charts`);
      }
      
      // All should complete within reasonable time
      results.forEach(result => {
        expect(result.time).toBeLessThan(20000); // 20 seconds max
        expect(result.charts).toBeGreaterThan(0);
        expect(result.reportLength).toBeGreaterThan(400);
      });
      
      // Performance variance should be reasonable
      const times = results.map(r => r.time);
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);
      if (minTime > 0) {
        const ratio = maxTime / minTime;
        expect(ratio).toBeLessThan(15); // Max 15x difference
      }
    }, 120000);

    it('should handle concurrent analysis requests efficiently', async () => {
      const datasets = [
        TestDatasets.getFinancialDataset(),
        TestDatasets.getSalesDataset(),
        TestDatasets.getOperationalDataset(),
        TestDatasets.getHealthcareDataset(),
        TestDatasets.getHRDataset()
      ];
      
      const initialMemory = process.memoryUsage().heapUsed;
      const startTime = Date.now();
      
      // Run all analyses concurrently
      const promises = datasets.map(dataset => analyzeDataset(dataset));
      const results = await Promise.all(promises);
      
      const endTime = Date.now();
      const finalMemory = process.memoryUsage().heapUsed;
      
      // All should complete successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.charts_to_generate.length).toBeGreaterThan(0);
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      });
      
      // Concurrent execution should be efficient
      expect(endTime - startTime).toBeLessThan(60000); // 1 minute for all 5
      
      // Memory usage should be reasonable for concurrent execution
      const memoryIncrease = finalMemory - initialMemory;
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // 200MB max
    }, 90000);
  });

  describe('Stress Testing', () => {
    it('should handle repeated analysis cycles without degradation', async () => {
      const dataset = TestDatasets.getFinancialDataset();
      const cycles = 10;
      const timings: number[] = [];
      
      for (let i = 0; i < cycles; i++) {
        const startTime = Date.now();
        const result = await analyzeDataset(dataset);
        const endTime = Date.now();
        
        timings.push(endTime - startTime);
        
        // Validate consistent quality
        expect(result.charts_to_generate.length).toBeGreaterThan(3);
        expect(result.full_analysis_report_markdown).toContain('Financial Services');
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      // Performance should remain consistent
      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxTime = Math.max(...timings);
      const minTime = Math.min(...timings);
      
      // No significant performance degradation
      expect(maxTime).toBeLessThan(avgTime * 5); // Max 5x average
      expect(maxTime).toBeLessThan(25000); // 25 seconds absolute max
      
      console.log(`Average: ${Math.round(avgTime)}ms, Min: ${minTime}ms, Max: ${maxTime}ms`);
    }, 180000);

    it('should handle extreme data scenarios gracefully', async () => {
      const extremeScenarios = [
        {
          name: 'Very Wide Dataset',
          data: {
            headers: Array.from({ length: 50 }, (_, i) => `Col_${i + 1}`),
            sampleData: Array.from({ length: 10 }, (_, row) =>
              Array.from({ length: 50 }, (_, col) => 
                col % 2 === 0 ? `Cat_${row % 3}` : Math.random() * 1000
              )
            )
          }
        },
        {
          name: 'Very Long Dataset',
          data: TestDatasets.generateLargeDataset(1000)
        },
        {
          name: 'High Cardinality Categorical',
          data: {
            headers: ['ID', 'Category', 'Value'],
            sampleData: Array.from({ length: 100 }, (_, i) => [
              i,
              `Category_${i}`, // Each row has unique category
              Math.random() * 1000
            ])
          }
        }
      ];
      
      for (const scenario of extremeScenarios) {
        const startTime = Date.now();
        const result = await analyzeDataset(scenario.data);
        const endTime = Date.now();
        
        // Should complete within reasonable time
        expect(endTime - startTime).toBeLessThan(90000); // 90 seconds max
        
        // Should produce valid results
        expect(result.charts_to_generate).toBeDefined();
        expect(result.full_analysis_report_markdown).toBeDefined();
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
        
        console.log(`${scenario.name}: ${endTime - startTime}ms, ${result.charts_to_generate.length} charts`);
      }
    }, 300000);

    it('should maintain memory efficiency under stress', async () => {
      const iterations = 20;
      const memorySnapshots: number[] = [];
      
      for (let i = 0; i < iterations; i++) {
        const dataset = TestDatasets.generateLargeDataset(100);
        await analyzeDataset(dataset);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
        
        // Take memory snapshot
        const memoryUsage = process.memoryUsage().heapUsed;
        memorySnapshots.push(memoryUsage);
        
        // Brief pause to allow cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Memory should not continuously increase (no major leaks)
      const firstHalf = memorySnapshots.slice(0, iterations / 2);
      const secondHalf = memorySnapshots.slice(iterations / 2);
      
      const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // Memory increase should be reasonable (less than 100MB growth)
      const memoryGrowth = secondHalfAvg - firstHalfAvg;
      expect(memoryGrowth).toBeLessThan(100 * 1024 * 1024);
      
      console.log(`Memory growth over ${iterations} iterations: ${Math.round(memoryGrowth / 1024 / 1024)}MB`);
    }, 240000);
  });

  describe('Edge Case Performance', () => {
    it('should handle malformed data efficiently', async () => {
      const malformedDatasets = [
        {
          name: 'Inconsistent Row Lengths',
          data: {
            headers: ['A', 'B', 'C'],
            sampleData: [
              [1, 2],
              [3, 4, 5, 6],
              [7, 8, 9]
            ]
          }
        },
        {
          name: 'Mixed Null Patterns',
          data: {
            headers: ['A', 'B', 'C'],
            sampleData: [
              [null, null, null],
              [1, null, 3],
              [null, 2, null],
              [1, 2, 3]
            ]
          }
        }
      ];
      
      for (const { name, data } of malformedDatasets) {
        const startTime = Date.now();
        
        try {
          await analyzeDataset(data);
          // If it doesn't throw, that's unexpected for malformed data
          fail(`Expected ${name} to throw an error`);
        } catch (error) {
          const endTime = Date.now();
          
          // Should fail quickly, not hang
          expect(endTime - startTime).toBeLessThan(5000); // 5 seconds max
          expect(error).toBeInstanceOf(Error);
          
          console.log(`${name}: Failed appropriately in ${endTime - startTime}ms`);
        }
      }
    }, 30000);

    it('should handle empty and minimal datasets efficiently', async () => {
      const minimalDatasets = [
        TestDatasets.getEdgeCaseDatasets().minimalDataset,
        TestDatasets.getEdgeCaseDatasets().singleColumnDataset,
        {
          headers: ['Single'],
          sampleData: [[1], [2]]
        }
      ];
      
      for (const dataset of minimalDatasets) {
        const startTime = Date.now();
        const result = await analyzeDataset(dataset);
        const endTime = Date.now();
        
        // Should complete quickly
        expect(endTime - startTime).toBeLessThan(10000); // 10 seconds max
        
        // Should produce valid minimal results
        expect(result.charts_to_generate).toBeDefined();
        expect(result.full_analysis_report_markdown).toBeDefined();
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
        
        console.log(`Minimal dataset: ${endTime - startTime}ms`);
      }
    }, 45000);

    it('should handle datasets with extreme values efficiently', async () => {
      const extremeValueDataset = {
        headers: ['ID', 'Tiny', 'Huge', 'Negative', 'Zero'],
        sampleData: [
          [1, 0.000000001, 999999999999, -999999999, 0],
          [2, 0.000000002, 888888888888, -888888888, 0],
          [3, 0.000000003, 777777777777, -777777777, 0],
          [4, 0.000000004, 666666666666, -666666666, 0],
          [5, 0.000000005, 555555555555, -555555555, 0]
        ]
      };
      
      const startTime = Date.now();
      const result = await analyzeDataset(extremeValueDataset);
      const endTime = Date.now();
      
      // Should handle extreme values without hanging
      expect(endTime - startTime).toBeLessThan(30000); // 30 seconds max
      
      // Should produce valid results
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      
      console.log(`Extreme values: ${endTime - startTime}ms, ${result.charts_to_generate.length} charts`);
    }, 45000);
  });

  describe('Resource Management', () => {
    it('should clean up resources properly after each analysis', async () => {
      const dataset = TestDatasets.getSalesDataset();
      const iterations = 5;
      
      for (let i = 0; i < iterations; i++) {
        const initialMemory = process.memoryUsage();
        
        const result = await analyzeDataset(dataset);
        
        // Validate result
        expect(result.charts_to_generate.length).toBeGreaterThan(0);
        
        // Force cleanup
        if (global.gc) {
          global.gc();
        }
        
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        
        // Memory increase should be minimal after cleanup
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB max per iteration
      }
    }, 60000);

    it('should handle timeout scenarios gracefully', async () => {
      // Create a dataset that might take longer to process
      const complexDataset = {
        headers: Array.from({ length: 40 }, (_, i) => `Column_${i + 1}`),
        sampleData: Array.from({ length: 200 }, (_, row) =>
          Array.from({ length: 40 }, (_, col) => {
            if (col % 5 === 0) return `Category_${row % 10}`;
            if (col % 5 === 1) return `2023-${String((row % 12) + 1).padStart(2, '0')}-${String((col % 28) + 1).padStart(2, '0')}`;
            return Math.random() * 1000000;
          })
        )
      };
      
      const startTime = Date.now();
      const result = await analyzeDataset(complexDataset);
      const endTime = Date.now();
      
      // Should complete within timeout limits
      expect(endTime - startTime).toBeLessThan(120000); // 2 minutes max
      
      // Should produce valid results even for complex data
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      console.log(`Complex dataset: ${endTime - startTime}ms, ${result.charts_to_generate.length} charts`);
    }, 150000);
  });
});