/**
 * Test file for core interfaces validation
 */

import {
  InputData,
  ColumnInfo,
  ChartRecommendation,
  AnalysisOutput,
  DataQualityMetrics,
  ProcessedInput,
  BusinessInsights
} from '../types/interfaces';

describe('Core Interfaces', () => {
  describe('InputData interface', () => {
    it('should accept valid input data structure', () => {
      const validInput: InputData = {
        headers: ['Name', 'Age', 'Salary'],
        sampleData: [
          ['John', 30, 50000],
          ['Jane', 25, 45000],
          ['Bob', 35, 60000]
        ]
      };

      expect(validInput.headers).toHaveLength(3);
      expect(validInput.sampleData).toHaveLength(3);
      expect(validInput.sampleData[0]).toHaveLength(3);
    });
  });

  describe('ColumnInfo interface', () => {
    it('should properly structure column information', () => {
      const columnInfo: ColumnInfo = {
        name: 'Age',
        type: 'numerical',
        uniqueValues: 10,
        hasNulls: false,
        sampleValues: [30, 25, 35, 28, 42]
      };

      expect(columnInfo.name).toBe('Age');
      expect(columnInfo.type).toBe('numerical');
      expect(columnInfo.hasNulls).toBe(false);
      expect(columnInfo.sampleValues).toHaveLength(5);
    });

    it('should support all data types', () => {
      const types: ColumnInfo['type'][] = ['numerical', 'categorical', 'datetime', 'text'];
      
      types.forEach(type => {
        const column: ColumnInfo = {
          name: 'TestColumn',
          type: type,
          hasNulls: false,
          sampleValues: ['sample']
        };
        expect(column.type).toBe(type);
      });
    });
  });

  describe('ChartRecommendation interface', () => {
    it('should structure chart recommendations correctly', () => {
      const chartRec: ChartRecommendation = {
        title: 'Age vs Salary Distribution',
        type: 'scatter',
        xAxis: 'Age',
        yAxis: 'Salary'
      };

      expect(chartRec.title).toBe('Age vs Salary Distribution');
      expect(chartRec.type).toBe('scatter');
      expect(chartRec.xAxis).toBe('Age');
      expect(chartRec.yAxis).toBe('Salary');
    });

    it('should support all chart types', () => {
      const chartTypes: ChartRecommendation['type'][] = ['bar', 'line', 'scatter'];
      
      chartTypes.forEach(type => {
        const chart: ChartRecommendation = {
          title: 'Test Chart',
          type: type,
          xAxis: 'X',
          yAxis: 'Y'
        };
        expect(chart.type).toBe(type);
      });
    });
  });

  describe('AnalysisOutput interface', () => {
    it('should structure final output correctly', () => {
      const output: AnalysisOutput = {
        charts_to_generate: [
          {
            title: 'Test Chart',
            type: 'bar',
            xAxis: 'Category',
            yAxis: 'Value'
          }
        ],
        full_analysis_report_markdown: '# Analysis Report\n\nThis is a test report.'
      };

      expect(output.charts_to_generate).toHaveLength(1);
      expect(output.full_analysis_report_markdown).toContain('# Analysis Report');
      expect(typeof output.full_analysis_report_markdown).toBe('string');
    });
  });

  describe('DataQualityMetrics interface', () => {
    it('should track data quality information', () => {
      const metrics: DataQualityMetrics = {
        completeness: 0.95,
        consistency: 0.88,
        issues: ['Missing values in column X', 'Inconsistent date formats']
      };

      expect(metrics.completeness).toBe(0.95);
      expect(metrics.consistency).toBe(0.88);
      expect(metrics.issues).toHaveLength(2);
    });
  });

  describe('ProcessedInput interface', () => {
    it('should combine columns and quality metrics', () => {
      const processed: ProcessedInput = {
        columns: [
          {
            name: 'TestColumn',
            type: 'numerical',
            hasNulls: false,
            sampleValues: [1, 2, 3]
          }
        ],
        dataQuality: {
          completeness: 1.0,
          consistency: 1.0,
          issues: []
        }
      };

      expect(processed.columns).toHaveLength(1);
      expect(processed.dataQuality.completeness).toBe(1.0);
    });
  });

  describe('BusinessInsights interface', () => {
    it('should structure business analysis results', () => {
      const insights: BusinessInsights = {
        industryDomain: 'Financial Services',
        primaryValueColumns: ['Revenue', 'Profit'],
        potentialCorrelations: ['Revenue vs Marketing Spend', 'Profit vs Customer Count'],
        actionableQuestions: [
          'How does marketing spend correlate with revenue?',
          'What factors drive profit margins?'
        ],
        datasetPotential: 'High potential for financial performance analysis'
      };

      expect(insights.industryDomain).toBe('Financial Services');
      expect(insights.primaryValueColumns).toHaveLength(2);
      expect(insights.potentialCorrelations).toHaveLength(2);
      expect(insights.actionableQuestions).toHaveLength(2);
    });
  });
});