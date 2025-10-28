import { JsonOutputFormatter } from '../formatters/JsonOutputFormatter';
import { VisualizationGenerator } from '../generators/VisualizationGenerator';
import { ReportGenerator } from '../generators/ReportGenerator';
import { BusinessIntelligenceAnalyzer } from '../analyzers/BusinessIntelligenceAnalyzer';
import { InputProcessor } from '../processors/InputProcessor';

describe('JsonOutputFormatter Integration', () => {
  let formatter: JsonOutputFormatter;

  beforeEach(() => {
    formatter = new JsonOutputFormatter();
    // Note: Other components use static methods, so no instantiation needed
  });

  it('should integrate with other components to produce valid JSON output', async () => {
    // Sample input data
    const inputData = {
      headers: ['product', 'category', 'price', 'sales', 'date'],
      sampleData: [
        ['Widget A', 'Electronics', 29.99, 150, '2024-01-15'],
        ['Widget B', 'Electronics', 39.99, 200, '2024-01-16'],
        ['Gadget X', 'Home', 19.99, 300, '2024-01-17'],
        ['Gadget Y', 'Home', 24.99, 250, '2024-01-18']
      ]
    };

    // Process through the pipeline
    const processedInput = InputProcessor.processInput(inputData);
    const charts = await VisualizationGenerator.generateAllCharts(processedInput.columns);
    const businessInsights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(processedInput.columns);
    const reportMarkdown = await ReportGenerator.generateAnalysisReport(processedInput.columns, businessInsights, processedInput.dataQuality);

    // Format the final output
    const analysisOutput = formatter.formatOutput(charts, reportMarkdown);

    // Verify the output structure
    expect(analysisOutput).toHaveProperty('charts_to_generate');
    expect(analysisOutput).toHaveProperty('full_analysis_report_markdown');
    expect(Array.isArray(analysisOutput.charts_to_generate)).toBe(true);
    expect(typeof analysisOutput.full_analysis_report_markdown).toBe('string');

    // Convert to JSON string
    const jsonString = formatter.toJsonString(analysisOutput);

    // Verify JSON is valid and contains no additional text
    expect(typeof jsonString).toBe('string');
    expect(() => JSON.parse(jsonString)).not.toThrow();
    
    const parsed = JSON.parse(jsonString);
    expect(parsed).toEqual(analysisOutput);

    // Verify JSON structure compliance
    expect(Object.keys(parsed)).toHaveLength(2);
    expect(parsed).toHaveProperty('charts_to_generate');
    expect(parsed).toHaveProperty('full_analysis_report_markdown');

    // Validate the JSON string format
    const validated = formatter.validateJsonString(jsonString);
    expect(validated).toEqual(analysisOutput);
  });

  it('should handle real-world data flow with complex markdown', async () => {
    const complexInput = {
      headers: ['timestamp', 'user_id', 'session_duration', 'page_views', 'conversion', 'revenue'],
      sampleData: [
        ['2024-01-01T10:00:00Z', 'user_001', 1200, 5, true, 99.99],
        ['2024-01-01T11:00:00Z', 'user_002', 800, 3, false, 0],
        ['2024-01-01T12:00:00Z', 'user_003', 1500, 8, true, 149.99],
        ['2024-01-01T13:00:00Z', 'user_004', 600, 2, false, 0]
      ]
    };

    // Full pipeline processing
    const processedInput = InputProcessor.processInput(complexInput);
    const charts = await VisualizationGenerator.generateAllCharts(processedInput.columns);
    const businessInsights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(processedInput.columns);
    const reportMarkdown = await ReportGenerator.generateAnalysisReport(processedInput.columns, businessInsights, processedInput.dataQuality);

    // Format and validate output
    const analysisOutput = formatter.formatOutput(charts, reportMarkdown);
    const jsonString = formatter.toJsonString(analysisOutput);

    // Ensure the JSON is properly formatted
    expect(jsonString).not.toContain('\n');
    expect(jsonString).not.toContain('\t');
    expect(jsonString.startsWith('{')).toBe(true);
    expect(jsonString.endsWith('}')).toBe(true);

    // Ensure the content is preserved correctly
    const parsed = JSON.parse(jsonString);
    expect(parsed.charts_to_generate.length).toBeGreaterThan(0);
    expect(parsed.full_analysis_report_markdown).toContain('Executive Summary');
    expect(parsed.full_analysis_report_markdown).toContain('Statistical Analysis');
  });

  it('should maintain data integrity through the entire pipeline', async () => {
    const testInput = {
      headers: ['id', 'name', 'score', 'grade', 'active'],
      sampleData: [
        [1, 'Alice', 95.5, 'A', true],
        [2, 'Bob', 87.2, 'B', true],
        [3, 'Charlie', 92.1, 'A', false],
        [4, 'Diana', 78.9, 'C', true]
      ]
    };

    // Process data
    const processedInput = InputProcessor.processInput(testInput);
    const charts = await VisualizationGenerator.generateAllCharts(processedInput.columns);
    const businessInsights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(processedInput.columns);
    const reportMarkdown = await ReportGenerator.generateAnalysisReport(processedInput.columns, businessInsights, processedInput.dataQuality);

    // Format output
    const analysisOutput = formatter.formatOutput(charts, reportMarkdown);

    // Verify all original column names are preserved in charts
    const allAxisNames = new Set();
    analysisOutput.charts_to_generate.forEach(chart => {
      allAxisNames.add(chart.xAxis);
      allAxisNames.add(chart.yAxis);
    });

    // Should contain references to original columns
    const originalColumns = testInput.headers;
    const hasOriginalColumns = originalColumns.some(col => 
      Array.from(allAxisNames).includes(col)
    );
    expect(hasOriginalColumns).toBe(true);

    // Verify report contains column information
    originalColumns.forEach(column => {
      // At least some columns should be mentioned in the report
      if (['score', 'grade', 'name'].includes(column)) {
        expect(analysisOutput.full_analysis_report_markdown.toLowerCase()).toContain(column.toLowerCase());
      }
    });
  });
});