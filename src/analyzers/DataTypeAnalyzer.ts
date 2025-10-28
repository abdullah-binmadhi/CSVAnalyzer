/**
 * Data Type Analyzer for comprehensive column analysis and statistics
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

import { ColumnInfo, ColumnStatistics, DataQualityMetrics } from '../types/interfaces';
import { ErrorHandler, DataQualityError, AnalysisTimeoutError } from '../errors/AnalysisErrors';

/**
 * Data Type Analyzer class for analyzing column types and calculating statistics
 */
export class DataTypeAnalyzer {
  /**
   * Analyzes columns from headers and sample data with timeout protection
   * Requirements: 5.1, 5.2, 5.3
   */
  public static async analyzeColumns(headers: string[], sampleData: any[][]): Promise<ColumnInfo[]> {
    return ErrorHandler.withSyncTimeout(
      () => {
        return headers.map((header, columnIndex) => {
          try {
            const columnValues = sampleData.map(row => row[columnIndex]);
            const type = this.classifyColumnType(columnValues);
            
            return {
              name: header,
              type,
              uniqueValues: this.calculateUniqueValues(columnValues),
              hasNulls: this.hasNullValues(columnValues),
              sampleValues: columnValues.slice(0, 5) // First 5 values as samples
            };
          } catch (error) {
            // Graceful degradation for individual column analysis failures
            console.warn(`Failed to analyze column '${header}':`, error);
            return {
              name: header,
              type: 'text' as const, // Default fallback type
              uniqueValues: 0,
              hasNulls: true,
              sampleValues: []
            };
          }
        });
      },
      15000, // 15 second timeout for column analysis
      'column analysis'
    );
  }

  /**
   * Classifies column type based on sample values
   * Requirements: 5.1, 5.2
   */
  public static classifyColumnType(values: any[]): 'numerical' | 'categorical' | 'datetime' | 'text' {
    const nonNullValues = this.filterNonNullValues(values);
    
    if (nonNullValues.length === 0) {
      return 'text'; // Default for empty columns
    }

    // Check for numerical values first
    if (this.isNumericalColumn(nonNullValues)) {
      return 'numerical';
    }

    // Check for datetime values
    if (this.isDateTimeColumn(nonNullValues)) {
      return 'datetime';
    }

    // Distinguish between categorical and text
    if (this.isCategoricalColumn(nonNullValues)) {
      return 'categorical';
    }

    return 'text';
  }

  /**
   * Calculates basic statistics for a column based on its type
   * Requirements: 5.3
   */
  public static calculateColumnStatistics(values: any[], type: 'numerical' | 'categorical' | 'datetime' | 'text'): ColumnStatistics {
    const nonNullValues = this.filterNonNullValues(values);
    const nullCount = values.length - nonNullValues.length;
    const uniqueCount = new Set(nonNullValues).size;

    const baseStats: ColumnStatistics = {
      nullCount,
      uniqueCount
    };

    switch (type) {
      case 'numerical':
        return {
          ...baseStats,
          ...this.calculateNumericalStatistics(nonNullValues)
        };
      
      case 'categorical':
      case 'text':
      case 'datetime':
        return {
          ...baseStats,
          mode: this.calculateMode(nonNullValues)
        };
      
      default:
        return baseStats;
    }
  }

  /**
   * Calculates comprehensive data quality metrics with error handling
   * Requirements: 5.5
   */
  public static async calculateDataQualityMetrics(sampleData: any[][], headers: string[]): Promise<DataQualityMetrics> {
    return ErrorHandler.withSyncTimeout(
      () => {
        try {
          const totalCells = sampleData.length * headers.length;
          let nullCells = 0;
          const issues: string[] = [];

          // Count null/empty cells and analyze each column
          headers.forEach((header, colIndex) => {
            try {
              const columnValues = sampleData.map(row => row[colIndex]);
              const columnNulls = columnValues.filter(val => this.isNullValue(val)).length;
              nullCells += columnNulls;

              // Check for column-specific issues
              this.analyzeColumnQuality(header, columnValues, issues);
            } catch (error) {
              // Graceful degradation for individual column quality analysis
              console.warn(`Failed to analyze quality for column '${header}':`, error);
              issues.push(`Column "${header}" could not be analyzed for quality issues`);
            }
          });

          const completeness = totalCells > 0 ? (totalCells - nullCells) / totalCells : 0;
          const consistency = this.calculateConsistencyScore(sampleData, headers, issues);

          return {
            completeness: Math.max(0, Math.min(1, completeness)),
            consistency: Math.max(0, Math.min(1, consistency)),
            issues
          };
        } catch (error) {
          // Fallback quality metrics if analysis fails completely
          console.warn('Data quality analysis failed, using fallback metrics:', error);
          return {
            completeness: 0.5, // Conservative estimate
            consistency: 0.5,  // Conservative estimate
            issues: ['Data quality analysis failed - manual review recommended']
          };
        }
      },
      10000, // 10 second timeout for quality analysis
      'data quality analysis'
    );
  }

  // Private helper methods

  /**
   * Filters out null, undefined, and empty string values
   */
  private static filterNonNullValues(values: any[]): any[] {
    return values.filter(val => !this.isNullValue(val));
  }

  /**
   * Checks if a value is considered null/empty
   */
  private static isNullValue(val: any): boolean {
    return val === null || val === undefined || val === '';
  }

  /**
   * Determines if a column contains numerical data
   */
  private static isNumericalColumn(values: any[]): boolean {
    if (values.length === 0) return false;

    const numericValues = values.filter(val => {
      const num = Number(val);
      return !isNaN(num) && isFinite(num);
    });

    // At least 80% of values should be numeric
    return numericValues.length / values.length >= 0.8;
  }

  /**
   * Determines if a column contains datetime data
   */
  private static isDateTimeColumn(values: any[]): boolean {
    if (values.length === 0) return false;

    const dateValues = values.filter(val => {
      if (typeof val === 'string') {
        // Check for common date patterns
        const datePatterns = [
          /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
          /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
          /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
          /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
          /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // M/D/YY or MM/DD/YYYY
        ];

        const hasDatePattern = datePatterns.some(pattern => pattern.test(val));
        if (hasDatePattern) {
          const date = new Date(val);
          return !isNaN(date.getTime());
        }
      }
      return false;
    });

    // At least 70% of values should be valid dates
    return dateValues.length / values.length >= 0.7;
  }

  /**
   * Determines if a column should be classified as categorical
   */
  private static isCategoricalColumn(values: any[]): boolean {
    if (values.length === 0) return false;

    // Check for mixed data types - if we have mixed types, it's likely text
    const types = new Set(values.map(val => typeof val));
    if (types.size > 1) {
      return false; // Mixed types should be classified as text
    }

    const uniqueValues = new Set(values);
    const uniqueRatio = uniqueValues.size / values.length;
    
    // Calculate average string length for string values
    const stringValues = values.filter(val => typeof val === 'string');
    const avgLength = stringValues.length > 0 
      ? stringValues.reduce((sum, val) => sum + val.length, 0) / stringValues.length 
      : 0;

    // Special case: single value should be categorical if it's a short string
    if (values.length === 1 && typeof values[0] === 'string' && values[0].length <= 20) {
      return true;
    }

    // For string values, consider categorical if:
    // 1. Low uniqueness ratio (repeated values) OR reasonable number of unique values
    // 2. Short average string length (typical for categories)
    // 3. Not too many unique values for the dataset size
    if (stringValues.length === values.length) { // All values are strings
      const hasRepeatedValues = uniqueRatio <= 0.7;
      const hasReasonableUniqueCount = uniqueValues.size <= Math.max(10, values.length * 0.8);
      const hasShortStrings = avgLength <= 20;
      
      return (hasRepeatedValues || hasReasonableUniqueCount) && hasShortStrings;
    }

    return false; // Non-string values are not categorical
  }

  /**
   * Calculates unique value count, filtering out nulls
   */
  private static calculateUniqueValues(values: any[]): number {
    const nonNullValues = this.filterNonNullValues(values);
    return new Set(nonNullValues).size;
  }

  /**
   * Checks if column has any null values
   */
  private static hasNullValues(values: any[]): boolean {
    return values.some(val => this.isNullValue(val));
  }

  /**
   * Calculates numerical statistics (min, max, mean, median)
   */
  private static calculateNumericalStatistics(values: any[]): Partial<ColumnStatistics> {
    const numbers = values.map(val => Number(val)).filter(num => !isNaN(num) && isFinite(num));
    
    if (numbers.length === 0) {
      return {};
    }

    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const mean = sum / numbers.length;
    
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: Math.round(mean * 100) / 100, // Round to 2 decimal places
      median: Math.round(median * 100) / 100
    };
  }

  /**
   * Calculates the mode (most frequent value)
   */
  private static calculateMode(values: any[]): any {
    if (values.length === 0) return undefined;

    const frequency = new Map();
    values.forEach(val => {
      frequency.set(val, (frequency.get(val) || 0) + 1);
    });

    let maxCount = 0;
    let mode = values[0];
    
    frequency.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });

    return mode;
  }

  /**
   * Analyzes quality issues for a specific column
   */
  private static analyzeColumnQuality(header: string, values: any[], issues: string[]): void {
    const nonNullValues = this.filterNonNullValues(values);
    
    // Check for completely empty columns
    if (nonNullValues.length === 0) {
      issues.push(`Column "${header}" contains no valid data`);
      return;
    }

    // Check for high null percentage
    const nullPercentage = (values.length - nonNullValues.length) / values.length;
    if (nullPercentage > 0.5) {
      issues.push(`Column "${header}" has ${Math.round(nullPercentage * 100)}% missing values`);
    }

    // Check for mixed data types
    const types = new Set(nonNullValues.map(val => typeof val));
    if (types.size > 1) {
      issues.push(`Column "${header}" contains mixed data types: ${Array.from(types).join(', ')}`);
    }

    // Check for potential data quality issues in string columns
    if (types.has('string')) {
      const stringValues = nonNullValues.filter(val => typeof val === 'string');
      const hasInconsistentCasing = this.hasInconsistentCasing(stringValues);
      if (hasInconsistentCasing) {
        issues.push(`Column "${header}" has inconsistent text casing`);
      }
    }
  }

  /**
   * Calculates overall consistency score
   */
  private static calculateConsistencyScore(sampleData: any[][], headers: string[], issues: string[]): number {
    let consistencyScore = 1.0;
    const totalColumns = headers.length;

    // Penalize based on number of issues
    const issueWeight = 0.1;
    consistencyScore -= Math.min(issues.length * issueWeight, 0.8);

    // Check for row length consistency
    const expectedLength = headers.length;
    const inconsistentRows = sampleData.filter(row => row.length !== expectedLength).length;
    if (inconsistentRows > 0) {
      consistencyScore -= (inconsistentRows / sampleData.length) * 0.3;
    }

    return Math.max(0, consistencyScore);
  }

  /**
   * Checks for inconsistent casing in string values
   */
  private static hasInconsistentCasing(stringValues: string[]): boolean {
    if (stringValues.length < 2) return false;

    const uniqueValues = new Set(stringValues);
    const lowerCaseValues = new Set(stringValues.map(val => val.toLowerCase()));
    
    // If we have fewer unique lowercase values than original values,
    // it suggests inconsistent casing
    return lowerCaseValues.size < uniqueValues.size;
  }
}