import { AnalysisOutput, ChartRecommendation } from '../types/interfaces';
import { ErrorHandler, OutputFormattingError } from '../errors/AnalysisErrors';

/**
 * JSON Output Formatter for the Senior Data Analyst AI
 * 
 * This class is responsible for formatting the final analysis output into a valid JSON structure
 * that matches the exact specification required by the system.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export class JsonOutputFormatter {
  /**
   * Formats the analysis results into the required JSON structure with comprehensive error handling
   * 
   * @param charts Array of chart recommendations
   * @param reportMarkdown Complete analysis report in Markdown format
   * @returns Formatted AnalysisOutput object
   * @throws Error if validation fails
   */
  public formatOutput(charts: ChartRecommendation[], reportMarkdown: string): AnalysisOutput {
    try {
      // Validate inputs with enhanced error handling
      this.validateInputs(charts, reportMarkdown);

      // Create the output structure with safe formatting
      const output: AnalysisOutput = {
        charts_to_generate: this.safeFormatChartRecommendations(charts),
        full_analysis_report_markdown: this.safeFormatMarkdownReport(reportMarkdown)
      };

      // Validate the final output structure
      this.validateOutput(output);

      return output;
    } catch (error) {
      if (error instanceof OutputFormattingError) {
        throw error;
      }
      throw new OutputFormattingError(
        `Failed to format analysis output: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'json',
        [
          'Verify that chart recommendations are properly structured',
          'Ensure the markdown report contains valid content',
          'Check for any special characters that might cause formatting issues'
        ]
      );
    }
  }

  /**
   * Converts the analysis output to a JSON string with proper formatting and error handling
   * 
   * @param output The AnalysisOutput object to convert
   * @returns Valid JSON string with no additional text
   */
  public toJsonString(output: AnalysisOutput): string {
    try {
      // Ensure the output is valid before stringifying
      this.validateOutput(output);
      
      // Convert to JSON string with no additional formatting
      const jsonString = JSON.stringify(output);
      
      // Validate the resulting JSON string
      if (!jsonString || jsonString.trim().length === 0) {
        throw new OutputFormattingError(
          'JSON stringification produced empty result',
          'json'
        );
      }

      return jsonString;
    } catch (error) {
      if (error instanceof OutputFormattingError) {
        throw error;
      }
      throw new OutputFormattingError(
        `Failed to convert output to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'json',
        [
          'Verify that the output object is properly structured',
          'Check for circular references in the data',
          'Ensure all values are JSON-serializable'
        ]
      );
    }
  }

  /**
   * Validates the input parameters for formatting
   * 
   * @param charts Array of chart recommendations
   * @param reportMarkdown Markdown report string
   * @throws Error if validation fails
   */
  private validateInputs(charts: ChartRecommendation[], reportMarkdown: string): void {
    if (!Array.isArray(charts)) {
      throw new Error('Charts must be provided as an array');
    }

    if (typeof reportMarkdown !== 'string') {
      throw new Error('Report markdown must be provided as a string');
    }

    if (reportMarkdown.trim().length === 0) {
      throw new Error('Report markdown cannot be empty');
    }

    // Validate each chart recommendation
    charts.forEach((chart, index) => {
      this.validateChartRecommendation(chart, index);
    });
  }

  /**
   * Validates a single chart recommendation
   * 
   * @param chart Chart recommendation to validate
   * @param index Index of the chart for error reporting
   * @throws Error if validation fails
   */
  private validateChartRecommendation(chart: ChartRecommendation, index: number): void {
    if (!chart || typeof chart !== 'object') {
      throw new Error(`Chart at index ${index} must be an object`);
    }

    const requiredFields = ['title', 'type', 'xAxis', 'yAxis'];
    for (const field of requiredFields) {
      if (!(field in chart) || typeof chart[field as keyof ChartRecommendation] !== 'string') {
        throw new Error(`Chart at index ${index} must have a valid string '${field}' property`);
      }
    }

    // Validate chart type
    const validTypes = ['bar', 'line', 'scatter'];
    if (!validTypes.includes(chart.type)) {
      throw new Error(`Chart at index ${index} has invalid type '${chart.type}'. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate that strings are not empty
    if (chart.title.trim().length === 0) {
      throw new Error(`Chart at index ${index} must have a non-empty title`);
    }
    if (chart.xAxis.trim().length === 0) {
      throw new Error(`Chart at index ${index} must have a non-empty xAxis`);
    }
    if (chart.yAxis.trim().length === 0) {
      throw new Error(`Chart at index ${index} must have a non-empty yAxis`);
    }
  }

  /**
   * Formats chart recommendations ensuring proper array structure
   * 
   * @param charts Array of chart recommendations
   * @returns Properly formatted chart recommendations array
   */
  private formatChartRecommendations(charts: ChartRecommendation[]): ChartRecommendation[] {
    // Create a clean copy of the charts array to avoid mutations
    return charts.map(chart => ({
      title: chart.title.trim(),
      type: chart.type,
      xAxis: chart.xAxis.trim(),
      yAxis: chart.yAxis.trim()
    }));
  }

  /**
   * Formats the markdown report ensuring proper string formatting
   * 
   * @param reportMarkdown Raw markdown report
   * @returns Properly formatted markdown string
   */
  private formatMarkdownReport(reportMarkdown: string): string {
    // Ensure consistent line endings and trim whitespace
    // First replace \r\n, then standalone \r
    return reportMarkdown.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  /**
   * Validates the final output structure
   * 
   * @param output The AnalysisOutput object to validate
   * @throws Error if validation fails
   */
  private validateOutput(output: AnalysisOutput): void {
    if (!output || typeof output !== 'object') {
      throw new Error('Output must be an object');
    }

    // Check required keys
    const requiredKeys = ['charts_to_generate', 'full_analysis_report_markdown'];
    const outputKeys = Object.keys(output);
    
    for (const key of requiredKeys) {
      if (!outputKeys.includes(key)) {
        throw new Error(`Output must contain '${key}' property`);
      }
    }

    // Check for extra keys (output should contain exactly the required keys)
    const extraKeys = outputKeys.filter(key => !requiredKeys.includes(key));
    if (extraKeys.length > 0) {
      throw new Error(`Output contains unexpected properties: ${extraKeys.join(', ')}`);
    }

    // Validate charts_to_generate is an array
    if (!Array.isArray(output.charts_to_generate)) {
      throw new Error('charts_to_generate must be an array');
    }

    // Validate full_analysis_report_markdown is a string
    if (typeof output.full_analysis_report_markdown !== 'string') {
      throw new Error('full_analysis_report_markdown must be a string');
    }

    if (output.full_analysis_report_markdown.trim().length === 0) {
      throw new Error('full_analysis_report_markdown cannot be empty');
    }
  }

  /**
   * Validates that a JSON string contains only valid JSON with no additional text
   * 
   * @param jsonString The JSON string to validate
   * @returns The parsed object if valid
   * @throws Error if the string is not valid JSON or contains additional text
   */
  public validateJsonString(jsonString: string): AnalysisOutput {
    if (typeof jsonString !== 'string') {
      throw new Error('Input must be a string');
    }

    // Check for any text before or after the JSON
    const trimmed = jsonString.trim();
    if (trimmed !== jsonString) {
      throw new Error('JSON string contains leading or trailing whitespace');
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate that the parsed object matches our expected structure
      this.validateOutput(parsed);
      
      return parsed as AnalysisOutput;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON format: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * ENHANCED: Comprehensive output format compliance validation
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
   */
  public validateComprehensiveOutputCompliance(output: AnalysisOutput): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metrics: {
      chartCount: number;
      reportLength: number;
      hasRequiredSections: boolean;
      jsonSize: number;
    };
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Basic structure validation
      this.validateOutput(output);
    } catch (error) {
      errors.push(`Structure validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Chart validation
    const chartValidation = this.validateChartCompliance(output.charts_to_generate);
    errors.push(...chartValidation.errors);
    warnings.push(...chartValidation.warnings);

    // Report validation
    const reportValidation = this.validateReportCompliance(output.full_analysis_report_markdown);
    errors.push(...reportValidation.errors);
    warnings.push(...reportValidation.warnings);

    // JSON serialization validation
    let jsonSize = 0;
    try {
      const jsonString = JSON.stringify(output);
      jsonSize = jsonString.length;
      
      // Validate round-trip serialization
      const reparsed = JSON.parse(jsonString);
      if (JSON.stringify(reparsed) !== jsonString) {
        errors.push('JSON serialization is not stable (round-trip failed)');
      }
    } catch (error) {
      errors.push(`JSON serialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      metrics: {
        chartCount: output.charts_to_generate.length,
        reportLength: output.full_analysis_report_markdown.length,
        hasRequiredSections: reportValidation.hasRequiredSections,
        jsonSize
      }
    };
  }

  /**
   * ENHANCED: Validates chart array compliance
   * Requirements: 4.2, 4.4
   */
  private validateChartCompliance(charts: ChartRecommendation[]): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!Array.isArray(charts)) {
      errors.push('charts_to_generate must be an array');
      return { errors, warnings };
    }

    // Check for duplicate charts
    const chartKeys = new Set<string>();
    const duplicates: string[] = [];

    charts.forEach((chart, index) => {
      try {
        this.validateChartRecommendation(chart, index);
        
        // Check for duplicates
        const key = `${chart.type}:${chart.xAxis}:${chart.yAxis}`;
        if (chartKeys.has(key)) {
          duplicates.push(`Chart ${index}: ${chart.title}`);
        } else {
          chartKeys.add(key);
        }

        // Validate chart type compliance
        if (!['bar', 'line', 'scatter'].includes(chart.type)) {
          errors.push(`Chart ${index}: Invalid chart type '${chart.type}'`);
        }

        // Check for meaningful titles
        if (chart.title.length < 5) {
          warnings.push(`Chart ${index}: Title may be too short: '${chart.title}'`);
        }

        // Check for axis consistency
        if (chart.xAxis === chart.yAxis && chart.yAxis !== 'Count') {
          warnings.push(`Chart ${index}: Same column used for both axes: '${chart.xAxis}'`);
        }

      } catch (error) {
        errors.push(`Chart ${index}: ${error instanceof Error ? error.message : 'Validation failed'}`);
      }
    });

    if (duplicates.length > 0) {
      warnings.push(`Potential duplicate charts detected: ${duplicates.join(', ')}`);
    }

    // Check chart diversity
    const chartTypes = new Set(charts.map(c => c.type));
    if (charts.length > 3 && chartTypes.size === 1) {
      warnings.push('All charts are of the same type - consider adding diversity');
    }

    return { errors, warnings };
  }

  /**
   * ENHANCED: Validates markdown report compliance
   * Requirements: 4.3, 4.5
   */
  private validateReportCompliance(report: string): {
    errors: string[];
    warnings: string[];
    hasRequiredSections: boolean;
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof report !== 'string') {
      errors.push('full_analysis_report_markdown must be a string');
      return { errors, warnings, hasRequiredSections: false };
    }

    if (report.trim().length === 0) {
      errors.push('full_analysis_report_markdown cannot be empty');
      return { errors, warnings, hasRequiredSections: false };
    }

    // Check for required sections
    const requiredSections = [
      'Executive Summary',
      'Statistical Analysis', 
      'Relationship Insights',
      'Actionable Questions',
      'Dataset Potential'
    ];

    const missingSections: string[] = [];
    const hasRequiredSections = requiredSections.every(section => {
      const hasSection = report.includes(section);
      if (!hasSection) {
        missingSections.push(section);
      }
      return hasSection;
    });

    if (missingSections.length > 0) {
      warnings.push(`Missing recommended sections: ${missingSections.join(', ')}`);
    }

    // Validate markdown structure
    const lines = report.split('\n');
    let hasMainHeading = false;
    let hasSubHeadings = false;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        hasMainHeading = true;
      } else if (line.startsWith('## ')) {
        hasSubHeadings = true;
      }
    }

    if (!hasMainHeading) {
      warnings.push('Report should have a main heading (# )');
    }

    if (!hasSubHeadings) {
      warnings.push('Report should have section headings (## )');
    }

    // Check report length
    if (report.length < 500) {
      warnings.push('Report may be too short for comprehensive analysis');
    } else if (report.length > 10000) {
      warnings.push('Report may be too long - consider condensing');
    }

    // Check for actionable content
    const actionableKeywords = ['recommend', 'suggest', 'should', 'could', 'consider', 'analyze', 'investigate'];
    const hasActionableContent = actionableKeywords.some(keyword => 
      report.toLowerCase().includes(keyword)
    );

    if (!hasActionableContent) {
      warnings.push('Report may lack actionable recommendations');
    }

    return { errors, warnings, hasRequiredSections };
  }

  /**
   * Safely formats chart recommendations with error handling
   * Requirements: 4.2, 5.6
   */
  private safeFormatChartRecommendations(charts: ChartRecommendation[]): ChartRecommendation[] {
    try {
      return this.formatChartRecommendations(charts);
    } catch (error) {
      console.warn('Chart formatting failed, using fallback:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Safely formats markdown report with error handling
   * Requirements: 4.3, 5.6
   */
  private safeFormatMarkdownReport(reportMarkdown: string): string {
    try {
      return this.formatMarkdownReport(reportMarkdown);
    } catch (error) {
      console.warn('Markdown formatting failed, using fallback:', error);
      // Return basic fallback report
      return '# Analysis Report\n\nAnalysis completed with formatting limitations. Please review the source data and try again.';
    }
  }

  /**
   * ENHANCED: Comprehensive edge case handling for various input scenarios
   * Requirements: 5.6 (Edge case handling)
   */
  public handleEdgeCases(charts: ChartRecommendation[], reportMarkdown: string): {
    processedCharts: ChartRecommendation[];
    processedReport: string;
    warnings: string[];
  } {
    const warnings: string[] = [];
    let processedCharts = charts;
    let processedReport = reportMarkdown;

    // Handle empty or null charts array
    if (!charts || charts.length === 0) {
      warnings.push('No charts provided - using empty array');
      processedCharts = [];
    }

    // Handle malformed charts
    if (Array.isArray(charts)) {
      processedCharts = charts.filter((chart, index) => {
        try {
          this.validateChartRecommendation(chart, index);
          return true;
        } catch (error) {
          warnings.push(`Removed malformed chart at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return false;
        }
      });
    }

    // Handle empty or invalid report
    if (!reportMarkdown || typeof reportMarkdown !== 'string' || reportMarkdown.trim().length === 0) {
      warnings.push('Invalid or empty report - using fallback');
      processedReport = this.generateFallbackReport();
    }

    // Handle extremely long reports
    if (processedReport.length > 50000) {
      warnings.push('Report truncated due to excessive length');
      processedReport = processedReport.substring(0, 50000) + '\n\n*[Report truncated due to length]*';
    }

    // Handle reports with invalid characters
    try {
      JSON.stringify(processedReport);
    } catch (error) {
      warnings.push('Report contains invalid characters - attempting cleanup');
      processedReport = this.cleanupReportContent(processedReport);
    }

    // Handle excessive number of charts
    if (processedCharts.length > 100) {
      warnings.push(`Too many charts (${processedCharts.length}) - limiting to first 100`);
      processedCharts = processedCharts.slice(0, 100);
    }

    return {
      processedCharts,
      processedReport,
      warnings
    };
  }

  /**
   * Generates a fallback report when the original is invalid
   * Requirements: 5.6 (Edge case handling)
   */
  private generateFallbackReport(): string {
    return `# Analysis Report

## Executive Summary

This dataset has been analyzed using automated exploratory data analysis techniques. Due to processing limitations, a detailed analysis could not be generated.

## Statistical Analysis

Basic statistical analysis was attempted on the provided dataset. The system encountered limitations that prevented comprehensive analysis.

## Relationship Insights

Column relationships could not be fully analyzed due to data processing constraints.

## Actionable Questions

1. What are the key patterns in this dataset?
2. Which columns contain the most valuable information?
3. How can data quality be improved for better analysis?
4. What additional data would enhance the analytical potential?

## Dataset Potential

This dataset shows potential for analysis. Consider reviewing data quality and format to enable more comprehensive insights.

*Note: This is a fallback report generated due to processing limitations.*`;
  }

  /**
   * Cleans up report content to ensure JSON compatibility
   * Requirements: 5.6 (Edge case handling)
   */
  private cleanupReportContent(report: string): string {
    try {
      // Remove or replace problematic characters
      let cleaned = report
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\u0000/g, '') // Remove null characters
        .replace(/\uFEFF/g, '') // Remove BOM
        .replace(/[\u2028\u2029]/g, '\n'); // Replace line/paragraph separators

      // Ensure valid UTF-8
      cleaned = cleaned.normalize('NFC');

      // Test JSON serialization
      JSON.stringify(cleaned);
      
      return cleaned;
    } catch (error) {
      console.warn('Report cleanup failed, using safe fallback');
      return this.generateFallbackReport();
    }
  }

  /**
   * ENHANCED: Robust output formatting with comprehensive error handling
   * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.6
   */
  public formatOutputRobust(charts: ChartRecommendation[], reportMarkdown: string): {
    output: AnalysisOutput;
    warnings: string[];
    metrics: {
      originalChartCount: number;
      finalChartCount: number;
      reportLength: number;
      processingTime: number;
    };
  } {
    const startTime = Date.now();
    const originalChartCount = charts?.length || 0;
    
    // Handle edge cases
    const { processedCharts, processedReport, warnings } = this.handleEdgeCases(charts, reportMarkdown);
    
    // Format output with enhanced error handling
    let output: AnalysisOutput;
    try {
      output = this.formatOutput(processedCharts, processedReport);
    } catch (error) {
      warnings.push(`Primary formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Fallback formatting
      output = {
        charts_to_generate: [],
        full_analysis_report_markdown: this.generateFallbackReport()
      };
    }

    // Final validation
    try {
      this.validateOutput(output);
    } catch (error) {
      warnings.push(`Final validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    const processingTime = Date.now() - startTime;

    return {
      output,
      warnings,
      metrics: {
        originalChartCount,
        finalChartCount: output.charts_to_generate.length,
        reportLength: output.full_analysis_report_markdown.length,
        processingTime
      }
    };
  }
}