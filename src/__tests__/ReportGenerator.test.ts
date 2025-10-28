/**
 * Tests for Report Generator
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { ReportGenerator } from '../generators/ReportGenerator';
import { ColumnInfo, BusinessInsights, DataQualityMetrics } from '../types/interfaces';

describe('ReportGenerator', () => {
  
  // Test data setup
  const mockColumns: ColumnInfo[] = [
    {
      name: 'revenue',
      type: 'numerical',
      uniqueValues: 100,
      hasNulls: false,
      sampleValues: [1000, 2000, 3000]
    },
    {
      name: 'product_category',
      type: 'categorical',
      uniqueValues: 5,
      hasNulls: false,
      sampleValues: ['Electronics', 'Clothing', 'Books']
    },
    {
      name: 'order_date',
      type: 'datetime',
      uniqueValues: 50,
      hasNulls: false,
      sampleValues: ['2023-01-01', '2023-01-02', '2023-01-03']
    },
    {
      name: 'customer_id',
      type: 'text',
      uniqueValues: 80,
      hasNulls: true,
      sampleValues: ['CUST001', 'CUST002', 'CUST003']
    }
  ];

  const mockBusinessInsights: BusinessInsights = {
    industryDomain: 'E-commerce/Retail',
    primaryValueColumns: ['revenue', 'product_category'],
    potentialCorrelations: [
      'Potential correlation between revenue and product_category (categorical vs numerical)',
      'revenue trends over order_date (time-series analysis)'
    ],
    actionableQuestions: [
      'Which product_category categories drive the highest revenue performance?',
      'What are the seasonal trends and patterns in revenue over order_date?',
      'What is the relationship between customer_id and revenue, and how can this inform strategy?',
      'What are the key performance indicators that should be monitored in this dataset?'
    ],
    datasetPotential: 'This dataset shows high analytical potential with rich data dimensions. Key analytical capabilities include: correlation analysis, statistical modeling, segmentation analysis, comparative analysis, trend analysis, forecasting, performance optimization. Within the E-commerce/Retail context, this data could support strategic decision-making, operational improvements, and performance monitoring. Consider integrating with external data sources for comprehensive business intelligence.'
  };

  const mockDataQuality: DataQualityMetrics = {
    completeness: 0.95,
    consistency: 0.88,
    issues: ['customer_id column contains missing values', 'Some inconsistent date formats detected']
  };

  describe('generateAnalysisReport', () => {
    
    it('should generate a complete Markdown report with all required sections', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      // Check that all major sections are present
      expect(report).toContain('# Executive Summary');
      expect(report).toContain('# Statistical Analysis');
      expect(report).toContain('# Relationship Analysis');
      expect(report).toContain('# Key Business Questions');
      expect(report).toContain('# Conclusion and Next Steps');
    });

    it('should include industry domain in executive summary', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('E-commerce/Retail');
      expect(report).toContain('primary value-driving columns');
      expect(report).toContain('revenue, product_category');
    });

    it('should handle empty primary value columns gracefully', async () => {
      const insightsWithoutPrimary = {
        ...mockBusinessInsights,
        primaryValueColumns: []
      };
      
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, insightsWithoutPrimary, mockDataQuality);
      
      expect(report).toContain('# Executive Summary');
      expect(report).not.toContain('primary value-driving columns');
    });

    it('should be valid Markdown format', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      // Check for proper Markdown headers
      expect(report).toMatch(/^# /m);
      expect(report).toMatch(/^## /m);
      
      // Check for proper list formatting
      expect(report).toMatch(/^- /m);
      expect(report).toMatch(/^\d+\. /m);
      
      // Check for bold text formatting
      expect(report).toMatch(/\*\*.*\*\*/);
    });
  });

  describe('Statistical Analysis Section', () => {
    
    it('should include dataset overview with column counts', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('**Total Columns**: 4');
      expect(report).toContain('**Numerical Columns**: 1');
      expect(report).toContain('**Categorical Columns**: 1');
      expect(report).toContain('**Datetime Columns**: 1');
      expect(report).toContain('**Text Columns**: 1');
    });

    it('should include data quality metrics', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('**Data Completeness**: 95.0%');
      expect(report).toContain('**Data Consistency**: 88.0%');
    });

    it('should list data quality issues when present', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('## Data Quality Issues');
      expect(report).toContain('customer_id column contains missing values');
      expect(report).toContain('Some inconsistent date formats detected');
    });

    it('should not include data quality issues section when no issues exist', async () => {
      const cleanDataQuality = { ...mockDataQuality, issues: [] };
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, cleanDataQuality);
      
      expect(report).not.toContain('## Data Quality Issues');
    });

    it('should provide column-specific analysis', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('### Numerical Columns');
      expect(report).toContain('**revenue**: 100 unique values');
      
      expect(report).toContain('### Categorical Columns');
      expect(report).toContain('**product_category**: 5 categories');
      
      expect(report).toContain('### Temporal Columns');
      expect(report).toContain('**order_date**: Time-series data');
      
      expect(report).toContain('### Text Columns');
      expect(report).toContain('**customer_id**: Text data, contains missing values');
    });
  });

  describe('Relationship Analysis Section', () => {
    
    it('should list all potential correlations', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('# Relationship Analysis');
      expect(report).toContain('Potential correlation between revenue and product_category');
      expect(report).toContain('revenue trends over order_date');
    });

    it('should provide analytical recommendations', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('## Analytical Recommendations');
      expect(report).toContain('Conduct correlation analysis');
      expect(report).toContain('Perform segmentation analysis');
      expect(report).toContain('Create cross-tabulations');
    });

    it('should handle empty correlations gracefully', async () => {
      const insightsWithoutCorrelations = {
        ...mockBusinessInsights,
        potentialCorrelations: []
      };
      
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, insightsWithoutCorrelations, mockDataQuality);
      
      expect(report).toContain('No significant relationships were identified');
      expect(report).toContain('Consider collecting additional data points');
    });
  });

  describe('Key Business Questions Section', () => {
    
    it('should format all actionable questions properly', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('# Key Business Questions');
      expect(report).toContain('## 1. Which product_category categories drive the highest revenue performance?');
      expect(report).toContain('## 2. What are the seasonal trends and patterns in revenue over order_date?');
      expect(report).toContain('## 3. What is the relationship between customer_id and revenue');
      expect(report).toContain('## 4. What are the key performance indicators');
    });

    it('should provide exploration methods for each question', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('This question can be explored through:');
      expect(report).toContain('Detailed data visualization and statistical analysis');
      expect(report).toContain('Comparative analysis across different segments');
      expect(report).toContain('Trend analysis and pattern identification');
      expect(report).toContain('Performance benchmarking and optimization strategies');
    });
  });

  describe('Conclusion Section', () => {
    
    it('should include dataset potential assessment', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('# Conclusion and Next Steps');
      expect(report).toContain('## Dataset Potential');
      expect(report).toContain('high analytical potential with rich data dimensions');
    });

    it('should provide recommended actions', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('## Recommended Actions');
      expect(report).toContain('1. **Immediate Analysis**');
      expect(report).toContain('2. **Deep Dive Investigation**');
      expect(report).toContain('3. **Business Integration**');
      expect(report).toContain('4. **Data Enhancement**');
      expect(report).toContain('5. **Continuous Monitoring**');
    });

    it('should include strategic value assessment', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('## Strategic Value');
      expect(report).toContain('e-commerce/retail analytics');
      expect(report).toContain('data-driven decision making');
    });
  });

  describe('Edge Cases', () => {
    
    it('should handle minimal dataset with single column', async () => {
      const minimalColumns: ColumnInfo[] = [
        {
          name: 'value',
          type: 'numerical',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: [1, 2, 3]
        }
      ];

      const minimalInsights: BusinessInsights = {
        industryDomain: 'General Business',
        primaryValueColumns: ['value'],
        potentialCorrelations: [],
        actionableQuestions: ['What are the key performance indicators in this business dataset?'],
        datasetPotential: 'This dataset has basic analytical potential.'
      };

      const minimalQuality: DataQualityMetrics = {
        completeness: 1.0,
        consistency: 1.0,
        issues: []
      };

      const report = await ReportGenerator.generateAnalysisReport(minimalColumns, minimalInsights, minimalQuality);
      
      expect(report).toContain('**Total Columns**: 1');
      expect(report).toContain('**Numerical Columns**: 1');
      expect(report).not.toContain('**Categorical Columns**');
      expect(report).toContain('General Business');
    });

    it('should handle columns with undefined uniqueValues', async () => {
      const columnsWithUndefined: ColumnInfo[] = [
        {
          name: 'test_column',
          type: 'categorical',
          uniqueValues: undefined,
          hasNulls: false,
          sampleValues: ['A', 'B', 'C']
        }
      ];

      const report = await ReportGenerator.generateAnalysisReport(columnsWithUndefined, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('**test_column**:');
      expect(report).not.toContain('undefined');
    });

    it('should handle empty columns array', async () => {
      const emptyColumns: ColumnInfo[] = [];
      
      const report = await ReportGenerator.generateAnalysisReport(emptyColumns, mockBusinessInsights, mockDataQuality);
      
      expect(report).toContain('**Total Columns**: 0');
      expect(report).toContain('# Executive Summary');
    });
  });

  describe('Markdown Structure Validation', () => {
    
    it('should have proper heading hierarchy', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      // Should have h1 headers for main sections
      const h1Headers = report.match(/^# .+$/gm);
      expect(h1Headers).toBeTruthy();
      expect(h1Headers!.length).toBeGreaterThanOrEqual(5);
      
      // Should have h2 headers for subsections
      const h2Headers = report.match(/^## .+$/gm);
      expect(h2Headers).toBeTruthy();
      expect(h2Headers!.length).toBeGreaterThan(0);
    });

    it('should have proper list formatting', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      // Should have bullet points
      expect(report).toMatch(/^- .+$/m);
      
      // Should have numbered lists
      expect(report).toMatch(/^\d+\. .+$/m);
    });

    it('should have proper emphasis formatting', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      // Should have bold text
      expect(report).toMatch(/\*\*[^*]+\*\*/);
    });

    it('should not have malformed Markdown', async () => {
      const report = await ReportGenerator.generateAnalysisReport(mockColumns, mockBusinessInsights, mockDataQuality);
      
      // Should not have unmatched bold markers
      const boldMarkers = report.match(/\*\*/g);
      if (boldMarkers) {
        expect(boldMarkers.length % 2).toBe(0);
      }
      
      // Should not have empty headers
      expect(report).not.toMatch(/^#+\s*$/m);
    });
  });
});