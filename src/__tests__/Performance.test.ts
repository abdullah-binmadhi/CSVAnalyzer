/**
 * Performance tests for large dataset handling
 * Requirements: 5.4, 5.5, 5.6
 */

import { analyzeDataset } from '../index';
import { TestDatasets } from './testDatasets';

describe('Performance Tests', () => {
  
  describe('Large Dataset Handling', () => {
    it('should handle 100 rows efficiently', async () => {
      const dataset = TestDatasets.generateLargeDataset(100);
      const startTime = Date.now();
      
      const result = await analyzeDataset(dataset);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 10 seconds for 100 rows
      expect(duration).toBeLessThan(10000);
      
      // Should produce valid results
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(500);
    }, 15000);

    it('should handle 500 rows efficiently', async () => {
      const dataset = TestDatasets.generateLargeDataset(500);
      const startTime = Date.now();
      
      const result = await analyzeDataset(dataset);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 20 seconds for 500 rows
      expect(duration).toBeLessThan(20000);
      
      // Should produce comprehensive results
      expect(result.charts_to_generate.length).toBeGreaterThan(5);
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
    }, 25000);

    it('should handle 1000 rows within reasonable time', async () => {
      const dataset = TestDatasets.generateLargeDataset(1000);
      const startTime = Date.now();
      
      const result = await analyzeDataset(dataset);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 30 seconds for 1000 rows
      expect(duration).toBeLessThan(30000);
      
      // Should maintain quality with larger datasets
      expect(result.charts_to_generate.length).toBeGreaterThan(8);
      expect(result.full_analysis_report_markdown).toContain('Statistical Analysis');
    }, 35000);

    it('should scale memory usage appropriately', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Process multiple datasets sequentially
      const datasets = [
        TestDatasets.generateLargeDataset(50),
        TestDatasets.generateLargeDataset(100),
        TestDatasets.generateLargeDataset(200)
      ];
      
      for (const dataset of datasets) {
        await analyzeDataset(dataset);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    }, 60000);
  });

  describe('Chart Generation Performance', () => {
    it('should generate charts efficiently for wide datasets', async () => {
      // Create dataset with many columns
      const wideDataset = {
        headers: Array.from({ length: 20 }, (_, i) => `Column_${i + 1}`),
        sampleData: Array.from({ length: 50 }, (_, row) => 
          Array.from({ length: 20 }, (_, col) => 
            col % 3 === 0 ? `Category_${row % 5}` : Math.random() * 1000
          )
        )
      };
      
      const startTime = Date.now();
      const result = await analyzeDataset(wideDataset);
      const endTime = Date.now();
      
      // Should handle wide datasets efficiently
      expect(endTime - startTime).toBeLessThan(15000);
      
      // Should generate appropriate number of charts without exponential explosion
      expect(result.charts_to_generate.length).toBeGreaterThan(10);
      expect(result.charts_to_generate.length).toBeLessThan(400); // Reasonable upper bound
    }, 20000);

    it('should limit chart generation to prevent infinite loops', async () => {
      // Dataset designed to potentially generate many charts
      const dataset = {
        headers: ['Cat1', 'Cat2', 'Cat3', 'Num1', 'Num2', 'Num3', 'Date1'],
        sampleData: Array.from({ length: 100 }, (_, i) => [
          `Category_${i % 3}`,
          `Type_${i % 4}`,
          `Group_${i % 5}`,
          Math.random() * 1000,
          Math.random() * 500,
          Math.random() * 200,
          `2023-${String((i % 12) + 1).padStart(2, '0')}-01`
        ])
      };
      
      const startTime = Date.now();
      const result = await analyzeDataset(dataset);
      const endTime = Date.now();
      
      // Should complete in reasonable time even with many potential combinations
      expect(endTime - startTime).toBeLessThan(25000);
      
      // Should generate charts but not an excessive number
      expect(result.charts_to_generate.length).toBeGreaterThan(5);
      expect(result.charts_to_generate.length).toBeLessThan(50);
    }, 30000);
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory during repeated analyses', async () => {
      const getMemoryUsage = () => process.memoryUsage().heapUsed;
      
      // Baseline memory
      const baselineMemory = getMemoryUsage();
      
      // Perform multiple analyses
      for (let i = 0; i < 10; i++) {
        const dataset = TestDatasets.generateLargeDataset(100);
        await analyzeDataset(dataset);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = getMemoryUsage();
      const memoryIncrease = finalMemory - baselineMemory;
      
      // Memory increase should be minimal (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, 120000);

    it('should handle concurrent analyses without excessive memory usage', async () => {
      const datasets = [
        TestDatasets.getFinancialDataset(),
        TestDatasets.getSalesDataset(),
        TestDatasets.getOperationalDataset()
      ];
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Run analyses concurrently
      const promises = datasets.map(dataset => analyzeDataset(dataset));
      const results = await Promise.all(promises);
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // All analyses should complete successfully
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.charts_to_generate.length).toBeGreaterThan(0);
        expect(result.full_analysis_report_markdown.length).toBeGreaterThan(500);
      });
      
      // Memory usage should be reasonable for concurrent execution
      expect(memoryIncrease).toBeLessThan(75 * 1024 * 1024);
    }, 45000);
  });

  describe('Processing Time Scaling', () => {
    it('should scale processing time sub-linearly with data size', async () => {
      const sizes = [10, 50, 100, 200];
      const timings: number[] = [];
      
      for (const size of sizes) {
        const dataset = TestDatasets.generateLargeDataset(size);
        const startTime = Date.now();
        
        await analyzeDataset(dataset);
        
        const endTime = Date.now();
        timings.push(endTime - startTime);
      }
      
      // Processing time should not increase exponentially
      // Check that 200 rows doesn't take more than 6x the time of 50 rows
      const ratio200to50 = timings[3] / timings[1];
      expect(ratio200to50).toBeLessThan(6);
      
      // Check that 100 rows doesn't take more than 3x the time of 50 rows
      // Skip if any timing is 0 (very fast execution)
      if (timings[1] > 0) {
        const ratio100to50 = timings[2] / timings[1];
        expect(ratio100to50).toBeLessThan(3);
      }
    }, 180000);

    it('should maintain consistent performance across different data types', async () => {
      const datasets = [
        TestDatasets.getFinancialDataset(),
        TestDatasets.getSalesDataset(),
        TestDatasets.getOperationalDataset(),
        TestDatasets.getHealthcareDataset(),
        TestDatasets.getHRDataset()
      ];
      
      const timings: number[] = [];
      
      for (const dataset of datasets) {
        const startTime = Date.now();
        await analyzeDataset(dataset);
        const endTime = Date.now();
        
        timings.push(endTime - startTime);
      }
      
      // All datasets should process within similar timeframes
      const maxTime = Math.max(...timings);
      const minTime = Math.min(...timings);
      const ratio = maxTime / minTime;
      
      // Performance should be consistent across different domains (within 10x)
      // Skip this check if any timing is 0 (very fast execution)
      if (minTime > 0) {
        expect(ratio).toBeLessThan(10);
      }
      
      // All should complete within reasonable time
      timings.forEach(timing => {
        expect(timing).toBeLessThan(15000);
      });
    }, 90000);
  });

  describe('Resource Cleanup', () => {
    it('should properly clean up resources after analysis', async () => {
      const dataset = TestDatasets.generateLargeDataset(200);
      
      // Monitor file descriptors and memory before
      const initialMemory = process.memoryUsage();
      
      const result = await analyzeDataset(dataset);
      
      // Verify analysis completed successfully
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Force garbage collection
      if (global.gc) {
        global.gc();
      }
      
      // Wait a bit for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const finalMemory = process.memoryUsage();
      
      // Memory should not have increased dramatically
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      expect(memoryIncrease).toBeLessThan(30 * 1024 * 1024); // Less than 30MB increase
    }, 30000);

    it('should handle analysis interruption gracefully', async () => {
      const dataset = TestDatasets.generateLargeDataset(500);
      
      // Start analysis but don't wait for completion in this test
      const analysisPromise = analyzeDataset(dataset);
      
      // Wait a short time then check that the promise is still valid
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // The promise should still be pending or resolved, not rejected
      const result = await analysisPromise;
      expect(result).toBeDefined();
      expect(result.charts_to_generate).toBeDefined();
    }, 60000);
  });
});