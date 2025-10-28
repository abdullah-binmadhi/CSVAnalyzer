/**
 * Comprehensive error handling system for Senior Data Analyst AI
 * Requirements: 1.4, 5.6
 */

/**
 * Base error class for all analysis-related errors
 */
export class AnalysisError extends Error {
  public readonly code: string;
  public readonly suggestions: string[];
  public readonly timestamp: Date;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    suggestions: string[] = [],
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.suggestions = suggestions;
    this.timestamp = new Date();
    this.context = context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Converts error to a structured JSON format for API responses
   */
  public toJSON(): Record<string, any> {
    return {
      error: true,
      name: this.name,
      message: this.message,
      code: this.code,
      suggestions: this.suggestions,
      timestamp: this.timestamp.toISOString(),
      context: this.context
    };
  }
}

/**
 * Error for insufficient data scenarios
 * Requirements: 5.6
 */
export class InsufficientDataError extends AnalysisError {
  constructor(
    message: string,
    dataSize: number,
    minimumRequired: number,
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      `Provide at least ${minimumRequired} rows of data for meaningful analysis`,
      'Ensure each row contains complete data for all columns',
      'Consider collecting additional data points to improve analysis quality'
    ];

    super(
      message,
      'INSUFFICIENT_DATA',
      [...suggestions, ...defaultSuggestions],
      { dataSize, minimumRequired }
    );
  }
}

/**
 * Error for timeout scenarios during complex operations
 * Requirements: 5.6
 */
export class AnalysisTimeoutError extends AnalysisError {
  constructor(
    operation: string,
    timeoutMs: number,
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Try reducing the dataset size or complexity',
      'Consider breaking the analysis into smaller chunks',
      'Simplify the data structure by removing unnecessary columns',
      'Ensure the dataset contains clean, well-formatted data'
    ];

    super(
      `Analysis operation '${operation}' timed out after ${timeoutMs}ms`,
      'ANALYSIS_TIMEOUT',
      [...suggestions, ...defaultSuggestions],
      { operation, timeoutMs }
    );
  }
}

/**
 * Error for data quality issues that prevent analysis
 * Requirements: 1.4, 5.6
 */
export class DataQualityError extends AnalysisError {
  constructor(
    message: string,
    qualityIssues: string[],
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Clean the data by removing or filling missing values',
      'Ensure consistent data types within each column',
      'Validate that all required columns contain meaningful data',
      'Consider data preprocessing to improve quality metrics'
    ];

    super(
      message,
      'DATA_QUALITY_ERROR',
      [...suggestions, ...defaultSuggestions],
      { qualityIssues }
    );
  }
}

/**
 * Error for chart generation failures
 * Requirements: 5.6
 */
export class ChartGenerationError extends AnalysisError {
  constructor(
    message: string,
    chartType?: string,
    columnInfo?: { xAxis: string; yAxis: string },
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Ensure the dataset contains appropriate column types for visualization',
      'Verify that numerical columns contain valid numeric data',
      'Check that categorical columns have reasonable number of categories',
      'Consider data preprocessing to improve chart generation compatibility'
    ];

    super(
      message,
      'CHART_GENERATION_ERROR',
      [...suggestions, ...defaultSuggestions],
      { chartType, columnInfo }
    );
  }
}

/**
 * Error for business intelligence analysis failures
 * Requirements: 5.6
 */
export class BusinessAnalysisError extends AnalysisError {
  constructor(
    message: string,
    analysisStage: string,
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Ensure column names are descriptive and meaningful',
      'Provide sufficient data variety for business context detection',
      'Consider adding more columns that represent business metrics',
      'Verify that the dataset represents a coherent business domain'
    ];

    super(
      message,
      'BUSINESS_ANALYSIS_ERROR',
      [...suggestions, ...defaultSuggestions],
      { analysisStage }
    );
  }
}

/**
 * Error for report generation failures
 * Requirements: 5.6
 */
export class ReportGenerationError extends AnalysisError {
  constructor(
    message: string,
    reportSection?: string,
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Ensure all required analysis components completed successfully',
      'Verify that business insights were generated properly',
      'Check that column analysis produced valid results',
      'Consider simplifying the analysis scope if generation fails'
    ];

    super(
      message,
      'REPORT_GENERATION_ERROR',
      [...suggestions, ...defaultSuggestions],
      { reportSection }
    );
  }
}

/**
 * Error for output formatting failures
 * Requirements: 5.6
 */
export class OutputFormattingError extends AnalysisError {
  constructor(
    message: string,
    outputType: 'json' | 'markdown' | 'charts',
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Verify that all analysis components completed successfully',
      'Check that the generated content is valid and complete',
      'Ensure no special characters are causing formatting issues',
      'Try regenerating the analysis with cleaned input data'
    ];

    super(
      message,
      'OUTPUT_FORMATTING_ERROR',
      [...suggestions, ...defaultSuggestions],
      { outputType }
    );
  }
}

/**
 * Error for memory or resource exhaustion
 * Requirements: 5.6
 */
export class ResourceExhaustionError extends AnalysisError {
  constructor(
    message: string,
    resourceType: 'memory' | 'cpu' | 'storage',
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Reduce the dataset size by sampling or filtering',
      'Remove unnecessary columns to decrease memory usage',
      'Consider processing the data in smaller batches',
      'Simplify the analysis requirements to reduce resource consumption'
    ];

    super(
      message,
      'RESOURCE_EXHAUSTION',
      [...suggestions, ...defaultSuggestions],
      { resourceType }
    );
  }
}

/**
 * Error for configuration or system setup issues
 * Requirements: 5.6
 */
export class SystemConfigurationError extends AnalysisError {
  constructor(
    message: string,
    configurationIssue: string,
    suggestions: string[] = []
  ) {
    const defaultSuggestions = [
      'Verify that all required system components are properly configured',
      'Check that the analysis environment has sufficient resources',
      'Ensure all dependencies are correctly installed and accessible',
      'Review system logs for additional configuration details'
    ];

    super(
      message,
      'SYSTEM_CONFIGURATION_ERROR',
      [...suggestions, ...defaultSuggestions],
      { configurationIssue }
    );
  }
}

/**
 * Utility functions for error handling
 */
export class ErrorHandler {
  /**
   * Wraps a function with timeout handling
   * Requirements: 5.6
   */
  public static withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new AnalysisTimeoutError(operationName, timeoutMs));
      }, timeoutMs);

      operation()
        .then(result => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Wraps a synchronous function with timeout handling
   * Requirements: 5.6
   */
  public static withSyncTimeout<T>(
    operation: () => T,
    timeoutMs: number,
    operationName: string
  ): Promise<T> {
    return this.withTimeout(
      () => Promise.resolve(operation()),
      timeoutMs,
      operationName
    );
  }

  /**
   * Safely executes an operation with error handling and graceful degradation
   * Requirements: 5.6
   */
  public static async safeExecute<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    operationName: string,
    timeoutMs: number = 30000
  ): Promise<T> {
    try {
      return await this.withTimeout(operation, timeoutMs, operationName);
    } catch (error) {
      console.warn(`Operation '${operationName}' failed, using fallback:`, error);
      return fallback();
    }
  }

  /**
   * Validates data sufficiency for analysis
   * Requirements: 5.6
   */
  public static validateDataSufficiency(
    data: any[][],
    headers: string[],
    minimumRows: number = 2
  ): void {
    if (!data || data.length < minimumRows) {
      throw new InsufficientDataError(
        `Dataset contains ${data?.length || 0} rows, but ${minimumRows} are required for analysis`,
        data?.length || 0,
        minimumRows
      );
    }

    if (!headers || headers.length === 0) {
      throw new InsufficientDataError(
        'Dataset must contain at least one column header',
        0,
        1
      );
    }

    // Check for completely empty dataset
    const totalCells = data.length * headers.length;
    const nonEmptyCells = data.flat().filter(cell => 
      cell !== null && cell !== undefined && cell !== ''
    ).length;

    if (nonEmptyCells === 0) {
      throw new InsufficientDataError(
        'Dataset contains no valid data values',
        0,
        1,
        ['Provide a dataset with actual data values, not just empty cells']
      );
    }

    // Check for minimum data density
    const dataDensity = nonEmptyCells / totalCells;
    if (dataDensity < 0.1) {
      throw new DataQualityError(
        `Dataset has very low data density (${Math.round(dataDensity * 100)}%)`,
        [`Only ${Math.round(dataDensity * 100)}% of cells contain data`],
        ['Provide a dataset with more complete data coverage']
      );
    }
  }

  /**
   * Validates system resources before analysis
   * Requirements: 5.6
   */
  public static validateSystemResources(
    dataSize: number,
    maxDataSize: number = 1000000
  ): void {
    if (dataSize > maxDataSize) {
      throw new ResourceExhaustionError(
        `Dataset size (${dataSize} cells) exceeds maximum allowed size (${maxDataSize} cells)`,
        'memory',
        [`Consider sampling the dataset to reduce size below ${maxDataSize} cells`]
      );
    }

    // Check available memory (simplified check)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      const availableMemory = memUsage.heapTotal - memUsage.heapUsed;
      const estimatedMemoryNeeded = dataSize * 100; // Rough estimate

      if (estimatedMemoryNeeded > availableMemory) {
        throw new ResourceExhaustionError(
          'Insufficient memory available for dataset analysis',
          'memory',
          ['Reduce dataset size or restart the analysis process to free memory']
        );
      }
    }
  }

  /**
   * Creates a user-friendly error message from any error
   * Requirements: 5.6
   */
  public static createUserFriendlyError(error: unknown): AnalysisError {
    if (error instanceof AnalysisError) {
      return error;
    }

    if (error instanceof Error) {
      return new AnalysisError(
        `An unexpected error occurred: ${error.message}`,
        'UNEXPECTED_ERROR',
        [
          'Try running the analysis again with the same data',
          'If the error persists, consider simplifying your dataset',
          'Check that your data is properly formatted and complete'
        ],
        { originalError: error.name, stack: error.stack }
      );
    }

    return new AnalysisError(
      'An unknown error occurred during analysis',
      'UNKNOWN_ERROR',
      [
        'Try running the analysis again',
        'Verify that your input data is valid and complete',
        'Contact support if the issue persists'
      ],
      { originalError: String(error) }
    );
  }
}