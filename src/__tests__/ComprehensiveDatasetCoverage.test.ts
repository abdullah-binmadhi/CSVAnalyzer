/**
 * Comprehensive dataset coverage tests for various business scenarios
 * Requirements: 5.4, 5.5, 5.6, 6.3, 6.5
 */

import { analyzeDataset } from '../index';
import { TestDatasets } from './testDatasets';

describe('Comprehensive Dataset Coverage Tests', () => {
  
  describe('Industry-Specific Dataset Coverage', () => {
    it('should handle manufacturing/industrial datasets', async () => {
      const dataset = TestDatasets.getManufacturingDataset();
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should generate appropriate charts for manufacturing data
      expect(result.charts_to_generate.length).toBeGreaterThan(5);
      
      // Should identify manufacturing/industrial context
      const hasIndustrialContext = result.full_analysis_report_markdown.includes('Manufacturing') ||
                                  result.full_analysis_report_markdown.includes('Industrial') ||
                                  result.full_analysis_report_markdown.includes('Production');
      expect(hasIndustrialContext).toBe(true);
      
      // Should analyze production metrics
      expect(result.full_analysis_report_markdown).toContain('Units_Produced');
      expect(result.full_analysis_report_markdown).toContain('Efficiency');
      
      // Should provide business insights
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.full_analysis_report_markdown).toContain('Key Business Questions');
    }, 30000);

    it('should handle education sector datasets', async () => {
      const dataset = TestDatasets.getEducationDataset();
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should generate appropriate charts for education data
      expect(result.charts_to_generate.length).toBeGreaterThan(3);
      
      // Should identify education context
      const hasEducationContext = result.full_analysis_report_markdown.includes('Education') ||
                                 result.full_analysis_report_markdown.includes('Academic') ||
                                 result.full_analysis_report_markdown.includes('Student');
      expect(hasEducationContext).toBe(true);
      
      // Should analyze academic performance metrics
      expect(result.full_analysis_report_markdown).toContain('Test_Score');
      expect(result.full_analysis_report_markdown).toContain('Grade');
      
      // Should provide educational insights
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      expect(questions).toHaveLength(4);
      
      const hasEducationalQuestions = questions.some(q => 
        q.toLowerCase().includes('student') || 
        q.toLowerCase().includes('performance') ||
        q.toLowerCase().includes('score')
      );
      expect(hasEducationalQuestions).toBe(true);
    }, 30000);

    it('should handle marketing campaign datasets', async () => {
      const dataset = TestDatasets.getMarketingDataset();
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should generate appropriate charts for marketing data
      expect(result.charts_to_generate.length).toBeGreaterThan(4);
      
      // Should identify marketing context
      const hasMarketingContext = result.full_analysis_report_markdown.includes('Marketing') ||
                                 result.full_analysis_report_markdown.includes('Campaign') ||
                                 result.full_analysis_report_markdown.includes('Advertising');
      expect(hasMarketingContext).toBe(true);
      
      // Should analyze marketing metrics
      expect(result.full_analysis_report_markdown).toContain('Campaign');
      expect(result.full_analysis_report_markdown).toContain('Revenue');
      
      // Should provide marketing insights
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      const hasMarketingQuestions = questions.some(q => 
        q.toLowerCase().includes('campaign') || 
        q.toLowerCase().includes('conversion') ||
        q.toLowerCase().includes('channel')
      );
      expect(hasMarketingQuestions).toBe(true);
    }, 30000);
  });

  describe('Advanced Edge Case Coverage', () => {
    it('should handle datasets with very long text values', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().longTextDataset;
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors despite long text
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should generate some charts (may treat long text as categorical or skip)
      expect(Array.isArray(result.charts_to_generate)).toBe(true);
      
      // Should handle long text gracefully in analysis
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(300);
    }, 30000);

    it('should handle datasets with boolean values', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().booleanDataset;
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should treat boolean values appropriately (likely as categorical)
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Should mention boolean columns in analysis
      const hasBooleanAnalysis = result.full_analysis_report_markdown.includes('Active') ||
                               result.full_analysis_report_markdown.includes('Premium') ||
                               result.full_analysis_report_markdown.includes('Verified');
      expect(hasBooleanAnalysis).toBe(true);
    }, 30000);

    it('should handle datasets with financial formatting', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().financialFormatsDataset;
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors despite currency symbols and percentages
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should generate charts for financial data
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
      
      // Should handle financial formatting in analysis
      expect(result.full_analysis_report_markdown).toContain('Price');
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(400);
    }, 30000);

    it('should handle datasets with scientific notation', async () => {
      const dataset = TestDatasets.getEdgeCaseDatasets().scientificDataset;
      const result = await analyzeDataset(dataset);
      
      // Should complete without errors despite scientific notation
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should generate some analysis
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      
      // Should handle scientific values appropriately
      expect(result.full_analysis_report_markdown).toContain('Value');
      expect(result.full_analysis_report_markdown).toContain('Measurement');
    }, 30000);
  });

  describe('Data Quality and Robustness Coverage', () => {
    it('should provide consistent quality across different data sizes', async () => {
      const sizes = [10, 50, 100];
      const results = [];
      
      for (const size of sizes) {
        const dataset = TestDatasets.generateLargeDataset(size);
        const result = await analyzeDataset(dataset);
        results.push(result);
        
        // Each result should have consistent structure
        expect(result.charts_to_generate).toBeDefined();
        expect(result.full_analysis_report_markdown).toBeDefined();
        expect(result.charts_to_generate.length).toBeGreaterThan(0);
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      }
      
      // All results should have similar quality indicators
      results.forEach(result => {
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        expect(questions).toHaveLength(4);
        expect(result.full_analysis_report_markdown).toContain('Statistical Analysis');
        expect(result.full_analysis_report_markdown).toContain('Conclusion');
      });
    }, 90000);

    it('should handle datasets with mixed data quality issues', async () => {
      const problematicDataset = {
        headers: ['ID', 'Mixed_Types', 'Sparse_Data', 'Inconsistent_Format', 'Normal_Data'],
        sampleData: [
          [1, 'Text', null, '2023-01-01', 100],
          [2, 42, 'Some Value', '01/02/2023', 200],
          [3, null, null, 'Invalid Date', 150],
          [4, true, 'Another Value', '2023-03-01', null],
          [5, 3.14, null, '2023/04/01', 300],
          [6, 'More Text', 'Final Value', '2023-05-01', 250]
        ]
      };
      
      const result = await analyzeDataset(problematicDataset);
      
      // Should handle problematic data gracefully
      expect(result.charts_to_generate).toBeDefined();
      expect(result.full_analysis_report_markdown).toBeDefined();
      
      // Should mention data quality issues
      expect(result.full_analysis_report_markdown).toContain('Data Quality Issues');
      
      // Should still provide some analysis
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.charts_to_generate.length).toBeGreaterThan(0);
    }, 30000);

    it('should maintain performance with wide datasets', async () => {
      const wideDataset = {
        headers: Array.from({ length: 25 }, (_, i) => `Column_${i + 1}`),
        sampleData: Array.from({ length: 20 }, (_, row) =>
          Array.from({ length: 25 }, (_, col) => {
            if (col % 4 === 0) return `Category_${row % 3}`;
            if (col % 4 === 1) return `2023-${String((row % 12) + 1).padStart(2, '0')}-01`;
            if (col % 4 === 2) return Math.random() * 1000;
            return `Text_${row}_${col}`;
          })
        )
      };
      
      const startTime = Date.now();
      const result = await analyzeDataset(wideDataset);
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(45000); // 45 seconds max
      
      // Should generate comprehensive analysis
      expect(result.charts_to_generate.length).toBeGreaterThan(10);
      expect(result.charts_to_generate.length).toBeLessThan(500); // Reasonable upper bound
      
      // Should provide quality analysis
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(800);
    }, 60000);
  });

  describe('Business Insight Quality Validation', () => {
    it('should provide domain-appropriate insights across all test datasets', async () => {
      const testDatasets = [
        { name: 'Financial', data: TestDatasets.getFinancialDataset() },
        { name: 'Sales', data: TestDatasets.getSalesDataset() },
        { name: 'Operational', data: TestDatasets.getOperationalDataset() },
        { name: 'Healthcare', data: TestDatasets.getHealthcareDataset() },
        { name: 'HR', data: TestDatasets.getHRDataset() },
        { name: 'Manufacturing', data: TestDatasets.getManufacturingDataset() },
        { name: 'Education', data: TestDatasets.getEducationDataset() },
        { name: 'Marketing', data: TestDatasets.getMarketingDataset() }
      ];
      
      for (const { name, data } of testDatasets) {
        const result = await analyzeDataset(data);
        
        // Each dataset should produce quality insights
        expect(result.charts_to_generate.length).toBeGreaterThan(2);
        
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        expect(questions).toHaveLength(4);
        
        // Questions should be substantial and relevant
        questions.forEach(question => {
          expect(question.length).toBeGreaterThan(20);
          expect(question.includes('?')).toBe(true);
        });
        
        // Should have comprehensive analysis structure
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
        expect(result.full_analysis_report_markdown).toContain('Statistical Analysis');
        expect(result.full_analysis_report_markdown).toContain('Key Business Questions');
        expect(result.full_analysis_report_markdown).toContain('Conclusion');
        
        console.log(`✓ ${name} dataset analyzed successfully`);
      }
    }, 240000); // 4 minutes for all datasets

    it('should generate diverse chart types across different data structures', async () => {
      const diverseDatasets = [
        TestDatasets.getDataTypeCombinations().numericalCategorical,
        TestDatasets.getDataTypeCombinations().dateTimeNumerical,
        TestDatasets.getDataTypeCombinations().complexMixed,
        TestDatasets.getEdgeCaseDatasets().allNumericalDataset,
        TestDatasets.getEdgeCaseDatasets().allCategoricalDataset
      ];
      
      const allChartTypes = new Set();
      
      for (const dataset of diverseDatasets) {
        const result = await analyzeDataset(dataset);
        
        result.charts_to_generate.forEach(chart => {
          allChartTypes.add(chart.type);
        });
        
        // Each dataset should generate appropriate charts
        expect(result.charts_to_generate.length).toBeGreaterThan(0);
      }
      
      // Should have generated all three chart types across datasets
      expect(allChartTypes.has('bar')).toBe(true);
      expect(allChartTypes.has('line')).toBe(true);
      expect(allChartTypes.has('scatter')).toBe(true);
    }, 120000);

    it('should maintain insight quality with edge case data', async () => {
      const edgeCases = TestDatasets.getEdgeCaseDatasets();
      
      for (const [name, dataset] of Object.entries(edgeCases)) {
        const result = await analyzeDataset(dataset);
        
        // Should complete without errors
        expect(result.charts_to_generate).toBeDefined();
        expect(result.full_analysis_report_markdown).toBeDefined();
        
        // Should provide meaningful analysis even for edge cases
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
        
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        expect(questions).toHaveLength(4);
        
        // Should have substantial content
        expect(result.full_analysis_report_markdown.length).toBeGreaterThan(400);
        
        console.log(`✓ Edge case '${name}' handled with quality insights`);
      }
    }, 180000);
  });

  describe('Chart Generation Coverage Validation', () => {
    it('should generate maximum unique charts for complex datasets', async () => {
      const complexDataset = {
        headers: [
          'Date', 'Category_A', 'Category_B', 'Value_1', 'Value_2', 'Value_3',
          'Status', 'Region', 'Score', 'Amount', 'Percentage', 'Count'
        ],
        sampleData: Array.from({ length: 30 }, (_, i) => [
          `2023-${String((i % 12) + 1).padStart(2, '0')}-01`,
          `Cat_A_${i % 3}`,
          `Cat_B_${i % 4}`,
          Math.random() * 1000,
          Math.random() * 500,
          Math.random() * 200,
          ['Active', 'Inactive', 'Pending'][i % 3],
          ['North', 'South', 'East', 'West'][i % 4],
          Math.random() * 100,
          Math.random() * 10000,
          Math.random() * 100,
          Math.floor(Math.random() * 50)
        ])
      };
      
      const result = await analyzeDataset(complexDataset);
      
      // Should generate many charts but not excessive
      expect(result.charts_to_generate.length).toBeGreaterThan(15);
      expect(result.charts_to_generate.length).toBeLessThan(200);
      
      // Should have diverse chart types
      const chartTypes = new Set(result.charts_to_generate.map(chart => chart.type));
      expect(chartTypes.size).toBeGreaterThanOrEqual(2);
      
      // Should avoid duplicates
      const chartSignatures = result.charts_to_generate.map(chart => 
        `${chart.type}-${chart.xAxis}-${chart.yAxis}`
      );
      const uniqueSignatures = new Set(chartSignatures);
      expect(uniqueSignatures.size).toBeGreaterThan(chartSignatures.length * 0.5);
    }, 45000);

    it('should handle chart generation limits gracefully', async () => {
      const massiveDataset = {
        headers: Array.from({ length: 30 }, (_, i) => `Column_${i + 1}`),
        sampleData: Array.from({ length: 50 }, (_, row) =>
          Array.from({ length: 30 }, (_, col) => {
            if (col % 3 === 0) return `Category_${row % 5}`;
            if (col % 3 === 1) return Math.random() * 1000;
            return `Text_${row}_${col}`;
          })
        )
      };
      
      const startTime = Date.now();
      const result = await analyzeDataset(massiveDataset);
      const endTime = Date.now();
      
      // Should complete within reasonable time despite large potential chart space
      expect(endTime - startTime).toBeLessThan(60000); // 1 minute max
      
      // Should generate substantial but not excessive charts
      expect(result.charts_to_generate.length).toBeGreaterThan(20);
      expect(result.charts_to_generate.length).toBeLessThan(1000);
      
      // Should maintain quality
      expect(result.full_analysis_report_markdown).toContain('Executive Summary');
    }, 75000);
  });
});

/**
 * Helper function to extract business questions from the markdown report
 */
function extractBusinessQuestions(markdown: string): string[] {
  const lines = markdown.split('\n');
  const questions: string[] = [];
  let inQuestionsSection = false;
  
  for (const line of lines) {
    if (line.includes('Key Business Questions') || line.includes('Business Questions')) {
      inQuestionsSection = true;
      continue;
    }
    
    if (inQuestionsSection) {
      if (line.startsWith('#') && !line.includes('Question') && !line.match(/^## \d+\./)) {
        break; // End of questions section
      }
      
      // Look for questions formatted as "## 1. Question text"
      if (line.match(/^## \d+\./)) {
        const question = line.replace(/^## \d+\.\s*/, '').trim();
        if (question.length > 10) {
          questions.push(question);
        }
      }
    }
  }
  
  return questions;
}