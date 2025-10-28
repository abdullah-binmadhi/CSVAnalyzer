/**
 * Main entry point for the Senior Data Analyst AI system
 */

import { InputData, AnalysisOutput } from './types/interfaces';
import { InputProcessor } from './processors/InputProcessor';
import { DataTypeAnalyzer } from './analyzers/DataTypeAnalyzer';
import { VisualizationGenerator } from './generators/VisualizationGenerator';
import { BusinessIntelligenceAnalyzer } from './analyzers/BusinessIntelligenceAnalyzer';
import { ReportGenerator } from './generators/ReportGenerator';
import { JsonOutputFormatter } from './formatters/JsonOutputFormatter';
import { ErrorHandler } from './errors/AnalysisErrors';

export * from './types/interfaces';
export * from './processors/InputProcessor';
export * from './generators/ReportGenerator';
export * from './formatters/JsonOutputFormatter';

/**
 * Main analysis orchestrator function that coordinates all components
 * Requirements: All requirements integration
 */
export async function analyzeDataset(input: InputData): Promise<AnalysisOutput> {
  return ErrorHandler.withSyncTimeout(
    async () => {
      let processedInput;
      let columns;
      let charts;
      let businessInsights;
      let reportMarkdown;

      try {
        // Step 1: Process and validate input data
        processedInput = InputProcessor.processInput(input);
        
        // Step 2: Analyze column types and characteristics
        columns = await DataTypeAnalyzer.analyzeColumns(input.headers, input.sampleData);
        
        // Step 3: Generate all possible unique visualizations
        charts = await VisualizationGenerator.generateAllCharts(columns);
        
        // Step 4: Generate business intelligence insights
        businessInsights = await BusinessIntelligenceAnalyzer.generateBusinessInsights(columns);
        
        // Step 5: Generate comprehensive analysis report
        reportMarkdown = await ReportGenerator.generateAnalysisReport(
          columns,
          businessInsights,
          processedInput.dataQuality
        );
        
        // Step 6: Format final JSON output
        const formatter = new JsonOutputFormatter();
        const output = formatter.formatOutput(charts, reportMarkdown);
        
        return output;
        
      } catch (error) {
        // Cleanup any partial processing state
        cleanupProcessingState();
        
        // Re-throw the error for proper error handling
        throw error;
      } finally {
        // Ensure memory cleanup regardless of success or failure
        cleanupProcessingState();
      }
    },
    60000, // 60 second timeout for complete analysis
    'complete dataset analysis'
  );
}

/**
 * Cleanup function for memory management and processing state
 */
function cleanupProcessingState(): void {
  try {
    // Clear any cached data in visualization generator
    VisualizationGenerator.clearGeneratedCharts();
    
    // Force garbage collection if available (Node.js)
    if (global.gc) {
      global.gc();
    }
  } catch (error) {
    // Ignore cleanup errors to avoid masking original errors
    console.warn('Cleanup warning:', error);
  }
}