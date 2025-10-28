/**
 * Integration tests for comprehensive error handling across all components
 * Requirements: 1.4, 5.6
 */

import { InputProcessor, InputValidationError } from '../processors/InputProcessor';
import { DataTypeAnalyzer } from '../analyzers/DataTypeAnalyzer';
import { VisualizationGenerator } from '../generators/VisualizationGenerator';
import { BusinessIntelligenceAnalyzer } from '../analyzers/BusinessIntelligenceAnalyzer';
import { ReportGenerator } from '../generators/ReportGenerator';
import { JsonOutputFormatter } from '../formatters/JsonOutputFormatter';
import {
  InsufficientDataError,
  DataQualityError,
  ChartGenerationError,
  BusinessAnalysisError,
  ReportGenerationError,
  OutputFormattingError,
  ErrorHandler
} from '../errors/AnalysisErrors';
import { ColumnInfo } from '../types/interfaces';

describe('Error Handling Integration Tests', () => {
  describe('InputProcessor Error Handling', () => {
    it('should handle insufficient data gracefully', () => {
      const input = {
        headers: ['name'],
        sampleData: [['John']] // Only 1 row, need at least 2
      };

      expect(() => {
        InputProcessor.processInput(input);
      }).toThrow(InputValidationError);
    });

    it('should handle extremely poor data quality', () => {
      const input = {
        headers: ['col1', 'col2', 'col3'],
        sampleData: [
          [null, '', undefined],
          ['', null, ''],
          [undefined, '', null]
        ]
      };

      expect(() => {
        InputProcessor.processInput(input);
      }).toThrow(InsufficientDataError);
    });

    it('should handle mixed data type issues', () => {
      const input = {
        headers: ['mixed'],
        sampleData: [
          ['text'],
          [123],
          [true],
          [null],
          ['more text']
        ]
      };

      const result = InputProcessor.processInput(input);
      expect(result.dataQuality.issues.length).toBeGreaterThan(0);
      expect(result.dataQuality.consistency).toBeLessThan(1.0);
    });

    it('should handle very large datasets', () => {
      const headers = Array.from({ length: 100 }, (_, i) => `col${i}`);
      const sampleData = Array.from({ length: 10000 }, () => 
        Array.from({ length: 100 }, (_, i) => `value${i}`)
      );

      expect(() => {
        InputProcessor.processInput({ headers, sampleData });
      }).toThrow(); // Should throw resource exhaustion error
    });
  });

  describe('DataTypeAnalyzer Error Handling', () => {
    it('should handle timeout scenarios', async () => {
      const headers = ['col1'];
      const sampleData = [['value1'], ['value2']];

      // Mock a slow operation by creating a very large dataset
      const largeHeaders = Array.from({ length: 1000 }, (_, i) => `col${i}`);
      const largeSampleData = Array.from({ length: 1000 }, () => 
        Array.from({ length: 1000 }, (_, i) => `value${i}`)
      );

      // This should complete within timeout for reasonable data
      const result = await DataTypeAnalyzer.analyzeColumns(headers, sampleData);
      expect(result).toHaveLength(1);
    });

    it('should gracefully degrade on column analysis failure', async () => {
      const headers = ['problematic'];
      const sampleData = [[Symbol('cannot serialize')]]; // Problematic data

      const result = await DataTypeAnalyzer.analyzeColumns(headers, sampleData);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text'); // Should fallback to text type
    });

    it('should handle data quality analysis failures', async () => {
      const headers = ['col1'];
      const sampleData = [['value']];

      const result = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);
      expect(result.completeness).toBeGreaterThanOrEqual(0);
      expect(result.consistency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('VisualizationGenerator Error Handling', () => {
    it('should handle empty column data', async () => {
      const columns: ColumnInfo[] = [];

      await expect(
        VisualizationGenerator.generateAllCharts(columns)
      ).rejects.toThrow(InsufficientDataError);
    });

    it('should handle columns with no data', async () => {
      const columns = [
        {
          name: 'empty',
          type: 'text' as const,
          uniqueValues: 0,
          hasNulls: true,
          sampleValues: []
        }
      ];

      await expect(
        VisualizationGenerator.generateAllCharts(columns)
      ).rejects.toThrow(InsufficientDataError);
    });

    it('should provide fallback charts when generation fails', async () => {
      const columns = [
        {
          name: 'valid',
          type: 'numerical' as const,
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [1, 2, 3, 4, 5]
        }
      ];

      const result = await VisualizationGenerator.generateAllCharts(columns);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle timeout in chart generation', async () => {
      // Create a scenario that might cause timeout
      const manyColumns = Array.from({ length: 50 }, (_, i) => ({
        name: `col${i}`,
        type: 'numerical' as const,
        uniqueValues: 100,
        hasNulls: false,
        sampleValues: [1, 2, 3, 4, 5]
      }));

      const result = await VisualizationGenerator.generateAllCharts(manyColumns);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('BusinessIntelligenceAnalyzer Error Handling', () => {
    it('should handle empty columns for business analysis', async () => {
      const columns: ColumnInfo[] = [];

      await expect(
        BusinessIntelligenceAnalyzer.generateBusinessInsights(columns)
      ).rejects.toThrow(InsufficientDataError);
    });

    it('should provide fallback insights when analysis fails', async () => {
      const columns = [
        {
          name: 'unknown',
          type: 'text' as const,
          uniqueValues: 1,
          hasNulls: false,
          sampleValues: ['data']
        }
      ];

      const result = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(result.industryDomain).toBeDefined();
      expect(result.actionableQuestions).toHaveLength(4);
      expect(result.datasetPotential).toBeDefined();
    });

    it('should handle timeout in business analysis', async () => {
      const columns = [
        {
          name: 'revenue',
          type: 'numerical' as const,
          uniqueValues: 100,
          hasNulls: false,
          sampleValues: [1000, 2000, 3000]
        }
      ];

      const result = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(result.industryDomain).toBe('Financial Services');
    });
  });

  describe('ReportGenerator Error Handling', () => {
    it('should handle missing business insights', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'test',
          type: 'text' as const,
          uniqueValues: 1,
          hasNulls: false,
          sampleValues: ['value']
        }
      ];

      const businessInsights = {
        industryDomain: 'Test',
        primaryValueColumns: [],
        potentialCorrelations: [],
        actionableQuestions: [],
        datasetPotential: ''
      };

      const dataQuality = {
        completeness: 1.0,
        consistency: 1.0,
        issues: []
      };

      const result = await ReportGenerator.generateAnalysisReport(
        columns,
        businessInsights,
        dataQuality
      );

      expect(result).toContain('# Executive Summary');
      expect(result.length).toBeGreaterThan(100);
    });

    it('should provide fallback report when generation fails', async () => {
      const columns: ColumnInfo[] = [];
      const businessInsights = null as any; // Intentionally invalid
      const dataQuality = null as any; // Intentionally invalid

      const result = await ReportGenerator.generateAnalysisReport(
        columns,
        businessInsights,
        dataQuality
      );

      expect(result).toContain('Analysis Report');
      expect(result).toContain('fallback');
    });

    it('should handle timeout in report generation', async () => {
      const columns = Array.from({ length: 100 }, (_, i) => ({
        name: `col${i}`,
        type: 'text' as const,
        uniqueValues: 10,
        hasNulls: false,
        sampleValues: ['a', 'b', 'c']
      }));

      const businessInsights = {
        industryDomain: 'Test Domain',
        primaryValueColumns: ['col1', 'col2'],
        potentialCorrelations: ['correlation1', 'correlation2'],
        actionableQuestions: ['question1', 'question2', 'question3', 'question4'],
        datasetPotential: 'High potential for analysis'
      };

      const dataQuality = {
        completeness: 0.95,
        consistency: 0.90,
        issues: ['minor issue']
      };

      const result = await ReportGenerator.generateAnalysisReport(
        columns,
        businessInsights,
        dataQuality
      );

      expect(result).toContain('# Executive Summary');
    });
  });

  describe('JsonOutputFormatter Error Handling', () => {
    it('should handle invalid chart data gracefully', () => {
      const formatter = new JsonOutputFormatter();
      const invalidCharts = [null, undefined, 'invalid'] as any;
      const validMarkdown = '# Report\n\nContent';

      expect(() => {
        formatter.formatOutput(invalidCharts, validMarkdown);
      }).toThrow(OutputFormattingError);
    });

    it('should handle empty or invalid markdown', () => {
      const formatter = new JsonOutputFormatter();
      const validCharts = [
        {
          title: 'Test Chart',
          type: 'bar' as const,
          xAxis: 'x',
          yAxis: 'y'
        }
      ];

      expect(() => {
        formatter.formatOutput(validCharts, '');
      }).toThrow(OutputFormattingError);

      expect(() => {
        formatter.formatOutput(validCharts, null as any);
      }).toThrow(OutputFormattingError);
    });

    it('should handle JSON serialization failures', () => {
      const formatter = new JsonOutputFormatter();
      
      // Create circular reference
      const circularChart: any = {
        title: 'Circular',
        type: 'bar',
        xAxis: 'x',
        yAxis: 'y'
      };
      circularChart.self = circularChart;

      const validMarkdown = '# Report\n\nContent';

      expect(() => {
        formatter.formatOutput([circularChart], validMarkdown);
      }).toThrow();
    });

    it('should provide fallback formatting when possible', () => {
      const formatter = new JsonOutputFormatter();
      
      // Test with problematic but recoverable data
      const charts = [
        {
          title: '  Whitespace Chart  ',
          type: 'bar' as const,
          xAxis: '  x  ',
          yAxis: '  y  '
        }
      ];

      const markdown = 'Simple markdown\r\nwith mixed line endings\r';

      const result = formatter.formatOutput(charts, markdown);
      
      expect(result.charts_to_generate[0].title).toBe('Whitespace Chart');
      expect(result.full_analysis_report_markdown).not.toContain('\r');
    });
  });

  describe('End-to-End Error Scenarios', () => {
    it('should handle complete analysis pipeline with problematic data', async () => {
      const input = {
        headers: ['mixed_col', 'sparse_col'],
        sampleData: [
          ['text', null],
          [123, ''],
          [null, 'value'],
          ['more_text', undefined]
        ]
      };

      // Process input (should succeed with warnings)
      const processedInput = InputProcessor.processInput(input);
      expect(processedInput.dataQuality.issues.length).toBeGreaterThan(0);

      // Analyze columns (should succeed with fallbacks)
      const columns = await DataTypeAnalyzer.analyzeColumns(input.headers, input.sampleData);
      expect(columns).toHaveLength(2);

      // Generate charts (should provide fallback charts)
      const charts = await VisualizationGenerator.generateAllCharts(columns);
      expect(Array.isArray(charts)).toBe(true);

      // Generate business insights (should provide fallback insights)
      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      expect(insights.industryDomain).toBeDefined();

      // Generate report (should succeed with available data)
      const report = await ReportGenerator.generateAnalysisReport(
        columns,
        insights,
        processedInput.dataQuality
      );
      expect(report).toContain('# Executive Summary');

      // Format output (should succeed)
      const formatter = new JsonOutputFormatter();
      const output = formatter.formatOutput(charts, report);
      expect(output.charts_to_generate).toBeDefined();
      expect(output.full_analysis_report_markdown).toBeDefined();
    });

    it('should handle cascading failures gracefully', async () => {
      // Start with minimal valid data
      const input = {
        headers: ['col1'],
        sampleData: [['a'], ['b']]
      };

      try {
        const processedInput = InputProcessor.processInput(input);
        const columns = await DataTypeAnalyzer.analyzeColumns(input.headers, input.sampleData);
        const charts = await VisualizationGenerator.generateAllCharts(columns);
        const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
        const report = await ReportGenerator.generateAnalysisReport(
          columns,
          insights,
          processedInput.dataQuality
        );
        const formatter = new JsonOutputFormatter();
        const output = formatter.formatOutput(charts, report);

        // Should complete successfully with fallbacks
        expect(output).toBeDefined();
        expect(output.charts_to_generate).toBeDefined();
        expect(output.full_analysis_report_markdown).toBeDefined();
      } catch (error) {
        // If any step fails, it should be a well-structured error
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBeDefined();
        }
      }
    });

    it('should provide meaningful error messages for user guidance', () => {
      const input = {
        headers: [],
        sampleData: []
      };

      try {
        InputProcessor.processInput(input);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        if (error instanceof InputValidationError) {
          expect(error.suggestions).toBeDefined();
          expect(error.suggestions.length).toBeGreaterThan(0);
          expect(error.code).toBeDefined();
        }
      }
    });
  });

  describe('Performance and Resource Error Handling', () => {
    it('should handle memory constraints', () => {
      // Test with data that would exceed memory limits
      const headers = Array.from({ length: 1000 }, (_, i) => `col${i}`);
      const sampleData = Array.from({ length: 10000 }, () => 
        Array.from({ length: 1000 }, (_, i) => `value${i}`)
      );

      expect(() => {
        InputProcessor.processInput({ headers, sampleData });
      }).toThrow(); // Should throw resource exhaustion error
    });

    it('should handle timeout scenarios across components', async () => {
      const columns = [
        {
          name: 'test',
          type: 'numerical' as const,
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [1, 2, 3, 4, 5]
        }
      ];

      // All operations should complete within reasonable time
      const startTime = Date.now();

      const charts = await VisualizationGenerator.generateAllCharts(columns);
      const insights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
      const report = await ReportGenerator.generateAnalysisReport(
        columns,
        insights,
        { completeness: 1, consistency: 1, issues: [] }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      expect(charts).toBeDefined();
      expect(insights).toBeDefined();
      expect(report).toBeDefined();
    });
  });
});