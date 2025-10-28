/**
 * Unit tests for Business Intelligence Analyzer
 * Requirements: 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.4
 */

import { BusinessIntelligenceAnalyzer } from '../analyzers/BusinessIntelligenceAnalyzer';
import { ColumnInfo } from '../types/interfaces';

describe('BusinessIntelligenceAnalyzer', () => {
  
  describe('generateBusinessInsights', () => {
    it('should generate comprehensive business insights for financial data', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Date', type: 'datetime', uniqueValues: 30, hasNulls: false, sampleValues: ['2023-01-01', '2023-01-02'] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 25, hasNulls: false, sampleValues: [1000, 1200, 950] },
        { name: 'Expenses', type: 'numerical', uniqueValues: 20, hasNulls: false, sampleValues: [800, 900, 750] },
        { name: 'Department', type: 'categorical', uniqueValues: 5, hasNulls: false, sampleValues: ['Sales', 'Marketing'] },
        { name: 'Profit', type: 'numerical', uniqueValues: 22, hasNulls: false, sampleValues: [200, 300, 200] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);

      expect(insights.industryDomain).toBe('Financial Services');
      expect(insights.primaryValueColumns).toContain('Revenue');
      expect(insights.primaryValueColumns).toContain('Profit');
      expect(insights.potentialCorrelations.length).toBeGreaterThan(0);
      expect(insights.actionableQuestions).toHaveLength(4);
      expect(insights.datasetPotential).toContain('analytical potential');
    });

    it('should generate insights for e-commerce data', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Product_Name', type: 'text', uniqueValues: 100, hasNulls: false, sampleValues: ['iPhone', 'Samsung'] },
        { name: 'Category', type: 'categorical', uniqueValues: 10, hasNulls: false, sampleValues: ['Electronics', 'Clothing'] },
        { name: 'Price', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [299, 199, 399] },
        { name: 'Quantity_Sold', type: 'numerical', uniqueValues: 30, hasNulls: false, sampleValues: [5, 10, 3] },
        { name: 'Customer_Rating', type: 'numerical', uniqueValues: 5, hasNulls: true, sampleValues: [4.5, 3.8, 5.0] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);

      expect(insights.industryDomain).toBe('E-commerce/Retail');
      expect(insights.primaryValueColumns).toContain('Price');
      expect(insights.actionableQuestions.some((q: string) => q.includes('customer') || q.includes('product'))).toBe(true);
    });

    it('should generate insights for healthcare data', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Patient_ID', type: 'text', uniqueValues: 1000, hasNulls: false, sampleValues: ['P001', 'P002'] },
        { name: 'Age', type: 'numerical', uniqueValues: 60, hasNulls: false, sampleValues: [45, 32, 67] },
        { name: 'Diagnosis', type: 'categorical', uniqueValues: 20, hasNulls: false, sampleValues: ['Diabetes', 'Hypertension'] },
        { name: 'Treatment_Cost', type: 'numerical', uniqueValues: 100, hasNulls: false, sampleValues: [1500, 2000, 800] },
        { name: 'Recovery_Days', type: 'numerical', uniqueValues: 30, hasNulls: true, sampleValues: [7, 14, 21] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);

      expect(insights.industryDomain).toBe('Healthcare');
      expect(insights.actionableQuestions.some((q: string) => q.includes('patient') || q.includes('treatment'))).toBe(true);
    });

    it('should handle mixed data types and generate appropriate insights', async () => {
      const columns: ColumnInfo[] = [
        { name: 'ID', type: 'text', uniqueValues: 100, hasNulls: false, sampleValues: ['001', '002'] },
        { name: 'Value', type: 'numerical', uniqueValues: 80, hasNulls: false, sampleValues: [100, 200, 150] },
        { name: 'Status', type: 'categorical', uniqueValues: 3, hasNulls: false, sampleValues: ['Active', 'Inactive'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);

      expect(insights.industryDomain).toBeDefined();
      expect(insights.primaryValueColumns).toContain('Value');
      expect(insights.potentialCorrelations.length).toBeGreaterThan(0);
      expect(insights.actionableQuestions).toHaveLength(4);
      expect(insights.datasetPotential).toBeDefined();
    });
  });

  describe('industry domain detection', () => {
    it('should detect financial services domain', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Revenue', type: 'numerical', uniqueValues: 100, hasNulls: false, sampleValues: [1000, 2000] },
        { name: 'Profit', type: 'numerical', uniqueValues: 80, hasNulls: false, sampleValues: [200, 400] },
        { name: 'Investment', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [5000, 10000] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.industryDomain).toBe('Financial Services');
    });

    it('should detect e-commerce domain', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Product', type: 'text', uniqueValues: 100, hasNulls: false, sampleValues: ['iPhone', 'iPad'] },
        { name: 'Customer', type: 'text', uniqueValues: 200, hasNulls: false, sampleValues: ['John', 'Jane'] },
        { name: 'Order_Total', type: 'numerical', uniqueValues: 150, hasNulls: false, sampleValues: [299, 199] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.industryDomain).toBe('E-commerce/Retail');
    });

    it('should detect human resources domain', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Employee_Name', type: 'text', uniqueValues: 50, hasNulls: false, sampleValues: ['John Doe', 'Jane Smith'] },
        { name: 'Department', type: 'categorical', uniqueValues: 8, hasNulls: false, sampleValues: ['HR', 'IT'] },
        { name: 'Salary', type: 'numerical', uniqueValues: 40, hasNulls: false, sampleValues: [50000, 60000] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.industryDomain).toBe('Human Resources');
    });

    it('should fallback to general business for unclear domains', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Column_A', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [1, 2, 3] },
        { name: 'Column_B', type: 'text', uniqueValues: 30, hasNulls: false, sampleValues: ['A', 'B', 'C'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(['General Business', 'Business Operations']).toContain(insights.industryDomain);
    });
  });

  describe('primary value column identification', () => {
    it('should identify revenue and profit as primary value columns', async () => {
      const columns: ColumnInfo[] = [
        { name: 'ID', type: 'text', uniqueValues: 100, hasNulls: false, sampleValues: ['1', '2'] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 80, hasNulls: false, sampleValues: [1000, 2000] },
        { name: 'Profit', type: 'numerical', uniqueValues: 70, hasNulls: false, sampleValues: [200, 400] },
        { name: 'Description', type: 'text', uniqueValues: 90, hasNulls: false, sampleValues: ['Desc1', 'Desc2'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.primaryValueColumns).toContain('Revenue');
      expect(insights.primaryValueColumns).toContain('Profit');
      expect(insights.primaryValueColumns).not.toContain('ID');
      expect(insights.primaryValueColumns).not.toContain('Description');
    });

    it('should prioritize numerical columns with value-related names', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Amount', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [100, 200] },
        { name: 'Count', type: 'numerical', uniqueValues: 20, hasNulls: false, sampleValues: [5, 10] },
        { name: 'Name', type: 'text', uniqueValues: 100, hasNulls: false, sampleValues: ['A', 'B'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.primaryValueColumns[0]).toBe('Amount');
    });

    it('should handle columns with nulls appropriately', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Sales', type: 'numerical', uniqueValues: 50, hasNulls: true, sampleValues: [100, null, 200] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 60, hasNulls: false, sampleValues: [1000, 2000, 1500] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.primaryValueColumns[0]).toBe('Revenue'); // Should prefer non-null column
    });
  });

  describe('correlation detection', () => {
    it('should detect numerical-numerical correlations', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Price', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [10, 20] },
        { name: 'Quantity', type: 'numerical', uniqueValues: 30, hasNulls: false, sampleValues: [5, 10] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 40, hasNulls: false, sampleValues: [50, 200] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.potentialCorrelations.some((corr: string) => 
        corr.includes('Price') && corr.includes('Quantity')
      )).toBe(true);
    });

    it('should detect categorical-numerical relationships', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Category', type: 'categorical', uniqueValues: 5, hasNulls: false, sampleValues: ['A', 'B'] },
        { name: 'Sales', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [100, 200] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.potentialCorrelations.some((corr: string) => 
        corr.includes('Category') && corr.includes('Sales')
      )).toBe(true);
    });

    it('should detect time-series patterns', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Date', type: 'datetime', uniqueValues: 30, hasNulls: false, sampleValues: ['2023-01-01'] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 25, hasNulls: false, sampleValues: [1000, 2000] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.potentialCorrelations.some((corr: string) => 
        corr.includes('Revenue') && corr.includes('Date') && corr.includes('time-series')
      )).toBe(true);
    });

    it('should detect categorical grouping patterns', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Department', type: 'categorical', uniqueValues: 5, hasNulls: false, sampleValues: ['Sales', 'Marketing'] },
        { name: 'Region', type: 'categorical', uniqueValues: 4, hasNulls: false, sampleValues: ['North', 'South'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.potentialCorrelations.some((corr: string) => 
        corr.includes('Department') && corr.includes('Region')
      )).toBe(true);
    });
  });

  describe('actionable question generation', () => {
    it('should generate domain-specific questions for financial data', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Revenue', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [1000, 2000] },
        { name: 'Date', type: 'datetime', uniqueValues: 30, hasNulls: false, sampleValues: ['2023-01-01'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.actionableQuestions.some((q: string) => 
        q.includes('Revenue') || q.includes('financial')
      )).toBe(true);
      expect(insights.actionableQuestions).toHaveLength(4);
    });

    it('should generate time-series questions when datetime columns exist', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Date', type: 'datetime', uniqueValues: 30, hasNulls: false, sampleValues: ['2023-01-01'] },
        { name: 'Sales', type: 'numerical', uniqueValues: 25, hasNulls: false, sampleValues: [100, 200] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.actionableQuestions.some((q: string) => 
        q.includes('trends') || q.includes('seasonal')
      )).toBe(true);
    });

    it('should generate categorical analysis questions', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Category', type: 'categorical', uniqueValues: 5, hasNulls: false, sampleValues: ['A', 'B'] },
        { name: 'Performance', type: 'numerical', uniqueValues: 30, hasNulls: false, sampleValues: [80, 90] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.actionableQuestions.some((q: string) => 
        q.includes('Category') && q.includes('Performance')
      )).toBe(true);
    });

    it('should always generate exactly 4 questions', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Value', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [1, 2, 3] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.actionableQuestions).toHaveLength(4);
    });
  });

  describe('dataset potential assessment', () => {
    it('should assess high potential for rich datasets', async () => {
      const columns: ColumnInfo[] = Array.from({ length: 10 }, (_, i) => ({
        name: `Column_${i}`,
        type: i % 2 === 0 ? 'numerical' : 'categorical',
        uniqueValues: 50,
        hasNulls: false,
        sampleValues: [1, 2, 3]
      }));

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.datasetPotential).toContain('high analytical potential');
    });

    it('should assess moderate potential for medium datasets', async () => {
      const columns: ColumnInfo[] = Array.from({ length: 5 }, (_, i) => ({
        name: `Column_${i}`,
        type: 'numerical',
        uniqueValues: 30,
        hasNulls: false,
        sampleValues: [1, 2, 3]
      }));

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.datasetPotential).toContain('moderate analytical potential');
    });

    it('should assess basic potential for small datasets', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Value', type: 'numerical', uniqueValues: 10, hasNulls: false, sampleValues: [1, 2] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.datasetPotential).toContain('basic analytical potential');
    });

    it('should mention specific analytical capabilities', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Date', type: 'datetime', uniqueValues: 30, hasNulls: false, sampleValues: ['2023-01-01'] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 25, hasNulls: false, sampleValues: [1000] },
        { name: 'Category', type: 'categorical', uniqueValues: 5, hasNulls: false, sampleValues: ['A'] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.datasetPotential).toContain('trend analysis');
      expect(insights.datasetPotential).toContain('segmentation analysis');
    });

    it('should provide recommendations for improvement', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Value', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [1, 2, 3] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.datasetPotential).toContain('Adding temporal data');
    });
  });

  describe('edge cases', () => {
    it('should handle empty column list', async () => {
      const columns: ColumnInfo[] = [];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.industryDomain).toBeDefined();
      expect(insights.primaryValueColumns).toEqual([]);
      expect(insights.potentialCorrelations).toEqual([]);
      expect(insights.actionableQuestions).toHaveLength(4);
      expect(insights.datasetPotential).toBeDefined();
    });

    it('should handle single column', async () => {
      const columns: ColumnInfo[] = [
        { name: 'Revenue', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [1000, 2000] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.primaryValueColumns).toContain('Revenue');
      expect(insights.actionableQuestions).toHaveLength(4);
    });

    it('should handle columns with all nulls', async () => {
      const columns: ColumnInfo[] = [
        { name: 'EmptyColumn', type: 'text', uniqueValues: 0, hasNulls: true, sampleValues: [null, null] },
        { name: 'Revenue', type: 'numerical', uniqueValues: 50, hasNulls: false, sampleValues: [1000, 2000] }
      ];

      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.primaryValueColumns).toContain('Revenue');
      expect(insights.primaryValueColumns).not.toContain('EmptyColumn');
    });
  });
});