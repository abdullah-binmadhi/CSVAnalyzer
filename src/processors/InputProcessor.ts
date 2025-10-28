/**
 * Input Processor for validating and processing dataset input
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { InputData, ProcessedInput, ColumnInfo, DataQualityMetrics } from '../types/interfaces';
import { ErrorHandler, InsufficientDataError, DataQualityError } from '../errors/AnalysisErrors';

/**
 * Custom error class for input validation errors
 */
export class InputValidationError extends Error {
  public code: string;
  public suggestions: string[];

  constructor(message: string, code: string, suggestions: string[] = []) {
    super(message);
    this.name = 'InputValidationError';
    this.code = code;
    this.suggestions = suggestions;
  }
}

/**
 * Input Processor class for validating and processing dataset input
 */
export class InputProcessor {
  /**
   * Validates and processes input data with comprehensive error handling
   * Requirements: 1.1, 1.2, 1.3, 1.4
   */
  public static processInput(input: any): ProcessedInput {
    try {
      // Validate input structure
      this.validateInputStructure(input);
      
      // Validate headers
      this.validateHeaders(input.headers);
      
      // Validate sample data
      this.validateSampleData(input.sampleData, input.headers);
      
      // Additional data sufficiency validation
      ErrorHandler.validateDataSufficiency(input.sampleData, input.headers);
      
      // Validate system resources
      const dataSize = input.sampleData.length * input.headers.length;
      ErrorHandler.validateSystemResources(dataSize);
      
      // Analyze columns and generate processed input
      const columns = this.analyzeColumns(input.headers, input.sampleData);
      const dataQuality = this.calculateDataQuality(input.sampleData, input.headers);
      
      // Validate minimum data quality requirements
      this.validateMinimumDataQuality(dataQuality);
      
      return {
        columns,
        dataQuality
      };
    } catch (error) {
      // Re-throw known errors, wrap unknown errors
      if (error instanceof InputValidationError || error instanceof InsufficientDataError || error instanceof DataQualityError) {
        throw error;
      }
      throw ErrorHandler.createUserFriendlyError(error);
    }
  }

  /**
   * Validates the basic structure of input data
   * Requirements: 1.1, 1.4
   */
  private static validateInputStructure(input: any): void {
    if (!input || typeof input !== 'object') {
      throw new InputValidationError(
        'Input must be a valid object',
        'INVALID_INPUT_TYPE',
        ['Provide input as a JSON object with headers and sampleData properties']
      );
    }

    if (!input.hasOwnProperty('headers')) {
      throw new InputValidationError(
        'Input must contain a "headers" property',
        'MISSING_HEADERS',
        ['Add a "headers" property containing an array of column names']
      );
    }

    if (!input.hasOwnProperty('sampleData')) {
      throw new InputValidationError(
        'Input must contain a "sampleData" property',
        'MISSING_SAMPLE_DATA',
        ['Add a "sampleData" property containing an array of data rows']
      );
    }
  }

  /**
   * Validates headers array format and content
   * Requirements: 1.2, 1.4
   */
  private static validateHeaders(headers: any): void {
    if (!Array.isArray(headers)) {
      throw new InputValidationError(
        'Headers must be an array',
        'INVALID_HEADERS_TYPE',
        ['Provide headers as an array of strings, e.g., ["Name", "Age", "Salary"]']
      );
    }

    if (headers.length === 0) {
      throw new InputValidationError(
        'Headers array cannot be empty',
        'EMPTY_HEADERS',
        ['Provide at least one column header']
      );
    }

    // Check for non-string headers
    const invalidHeaders = headers.filter((header, index) => typeof header !== 'string');
    if (invalidHeaders.length > 0) {
      throw new InputValidationError(
        'All headers must be strings',
        'INVALID_HEADER_TYPE',
        ['Ensure all header values are strings, not numbers or other types']
      );
    }

    // Check for empty string headers
    const emptyHeaders = headers.filter((header: string) => header.trim() === '');
    if (emptyHeaders.length > 0) {
      throw new InputValidationError(
        'Headers cannot be empty strings',
        'EMPTY_HEADER_VALUES',
        ['Provide meaningful names for all columns']
      );
    }

    // Check for duplicate headers
    const uniqueHeaders = new Set(headers);
    if (uniqueHeaders.size !== headers.length) {
      throw new InputValidationError(
        'Headers must be unique',
        'DUPLICATE_HEADERS',
        ['Ensure all column headers have unique names']
      );
    }
  }

  /**
   * Validates sample data array format and consistency
   * Requirements: 1.3, 1.4
   */
  private static validateSampleData(sampleData: any, headers: string[]): void {
    if (!Array.isArray(sampleData)) {
      throw new InputValidationError(
        'Sample data must be an array',
        'INVALID_SAMPLE_DATA_TYPE',
        ['Provide sampleData as an array of arrays, e.g., [["John", 30], ["Jane", 25]]']
      );
    }

    if (sampleData.length === 0) {
      throw new InputValidationError(
        'Sample data cannot be empty',
        'EMPTY_SAMPLE_DATA',
        ['Provide at least one row of sample data for analysis']
      );
    }

    // Validate each row
    sampleData.forEach((row: any, rowIndex: number) => {
      if (!Array.isArray(row)) {
        throw new InputValidationError(
          `Row ${rowIndex + 1} must be an array`,
          'INVALID_ROW_TYPE',
          [`Ensure row ${rowIndex + 1} is an array of values matching the headers`]
        );
      }

      if (row.length !== headers.length) {
        throw new InputValidationError(
          `Row ${rowIndex + 1} has ${row.length} values but ${headers.length} headers provided`,
          'ROW_HEADER_MISMATCH',
          [
            `Ensure row ${rowIndex + 1} has exactly ${headers.length} values`,
            'Check that all rows have the same number of columns as headers'
          ]
        );
      }
    });

    // Check for minimum data requirement
    if (sampleData.length < 2) {
      throw new InputValidationError(
        'At least 2 rows of sample data are required for meaningful analysis',
        'INSUFFICIENT_DATA',
        ['Provide at least 2 rows of sample data to enable pattern detection']
      );
    }
  }

  /**
   * Analyzes columns to determine types and characteristics
   * Requirements: 1.1, 1.2
   */
  private static analyzeColumns(headers: string[], sampleData: any[][]): ColumnInfo[] {
    return headers.map((header, columnIndex) => {
      const columnValues = sampleData.map(row => row[columnIndex]);
      
      return {
        name: header,
        type: this.detectColumnType(columnValues),
        uniqueValues: new Set(columnValues.filter(val => val !== null && val !== undefined)).size,
        hasNulls: columnValues.some(val => val === null || val === undefined || val === ''),
        sampleValues: columnValues.slice(0, 5) // First 5 values as samples
      };
    });
  }

  /**
   * Detects the data type of a column based on sample values
   * Requirements: 1.2
   */
  private static detectColumnType(values: any[]): 'numerical' | 'categorical' | 'datetime' | 'text' {
    const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '');
    
    if (nonNullValues.length === 0) {
      return 'text'; // Default for empty columns
    }

    // Check for numerical values
    const numericValues = nonNullValues.filter(val => {
      const num = Number(val);
      return !isNaN(num) && isFinite(num);
    });

    if (numericValues.length / nonNullValues.length >= 0.8) {
      return 'numerical';
    }

    // Check for datetime values
    const dateValues = nonNullValues.filter(val => {
      if (typeof val === 'string') {
        const date = new Date(val);
        return !isNaN(date.getTime()) && val.match(/\d{4}|\d{2}\/\d{2}|\d{2}-\d{2}/);
      }
      return false;
    });

    if (dateValues.length / nonNullValues.length >= 0.7) {
      return 'datetime';
    }

    // Check for categorical vs text based on uniqueness and value characteristics
    const uniqueValues = new Set(nonNullValues);
    const uniqueRatio = uniqueValues.size / nonNullValues.length;
    
    // Consider categorical if:
    // 1. Low uniqueness ratio (repeated values)
    // 2. Short string values (typically categories are short)
    // 3. Reasonable number of samples
    const avgLength = nonNullValues
      .filter(val => typeof val === 'string')
      .reduce((sum, val) => sum + val.length, 0) / nonNullValues.length;
    
    if (uniqueRatio <= 0.7 && nonNullValues.length >= 2 && avgLength <= 10) {
      return 'categorical';
    }

    return 'text';
  }

  /**
   * Calculates data quality metrics
   * Requirements: 1.3, 1.4
   */
  private static calculateDataQuality(sampleData: any[][], headers: string[]): DataQualityMetrics {
    const totalCells = sampleData.length * headers.length;
    let nullCells = 0;
    const issues: string[] = [];

    // Count null/empty cells
    sampleData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null || cell === undefined || cell === '') {
          nullCells++;
        }
      });
    });

    const completeness = (totalCells - nullCells) / totalCells;

    // Check for consistency issues
    let consistencyScore = 1.0;
    
    headers.forEach((header, colIndex) => {
      const columnValues = sampleData.map(row => row[colIndex]);
      const nonNullValues = columnValues.filter(val => val !== null && val !== undefined && val !== '');
      
      if (nonNullValues.length === 0) {
        issues.push(`Column "${header}" contains no valid data`);
        consistencyScore -= 0.1;
      } else {
        // Check for mixed data types
        const types = new Set(nonNullValues.map(val => typeof val));
        if (types.size > 1) {
          issues.push(`Column "${header}" contains mixed data types`);
          consistencyScore -= 0.05;
        }
      }
    });

    // Add completeness issues
    if (completeness < 0.9) {
      issues.push(`Data completeness is ${Math.round(completeness * 100)}% - consider providing more complete sample data`);
    }

    return {
      completeness: Math.max(0, completeness),
      consistency: Math.max(0, consistencyScore),
      issues
    };
  }

  /**
   * Validates minimum data quality requirements for analysis
   * Requirements: 1.4, 5.6
   */
  private static validateMinimumDataQuality(dataQuality: DataQualityMetrics): void {
    // Check for critical data quality issues that prevent analysis
    if (dataQuality.completeness < 0.05) {
      throw new DataQualityError(
        `Data completeness is critically low (${Math.round(dataQuality.completeness * 100)}%)`,
        dataQuality.issues,
        [
          'Provide a dataset with more complete data values',
          'Remove columns that are mostly empty',
          'Fill in missing values where possible'
        ]
      );
    }

    if (dataQuality.consistency < 0.1) {
      throw new DataQualityError(
        `Data consistency is critically low (${Math.round(dataQuality.consistency * 100)}%)`,
        dataQuality.issues,
        [
          'Ensure consistent data types within each column',
          'Clean up mixed data type issues',
          'Standardize data formats across the dataset'
        ]
      );
    }

    // Check for excessive quality issues
    if (dataQuality.issues.length > 10) {
      throw new DataQualityError(
        `Dataset has too many quality issues (${dataQuality.issues.length}) for reliable analysis`,
        dataQuality.issues.slice(0, 10), // Show first 10 issues
        [
          'Address the most critical data quality issues first',
          'Consider data preprocessing to clean the dataset',
          'Reduce the number of problematic columns'
        ]
      );
    }
  }
}