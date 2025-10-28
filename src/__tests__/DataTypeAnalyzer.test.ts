/**
 * Unit tests for DataTypeAnalyzer
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

import { DataTypeAnalyzer } from '../analyzers/DataTypeAnalyzer';
import { ColumnInfo, ColumnStatistics, DataQualityMetrics } from '../types/interfaces';

describe('DataTypeAnalyzer', () => {
  describe('classifyColumnType', () => {
    describe('numerical type detection', () => {
      it('should classify pure numeric values as numerical', () => {
        const values = [1, 2, 3, 4, 5];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('numerical');
      });

      it('should classify string numbers as numerical', () => {
        const values = ['1', '2', '3', '4', '5'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('numerical');
      });

      it('should classify mixed numeric formats as numerical', () => {
        const values = [1, '2.5', 3, '4.0', 5.7];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('numerical');
      });

      it('should classify as numerical with some null values', () => {
        const values = [1, 2, null, 4, 5, undefined, ''];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('numerical');
      });

      it('should not classify as numerical if less than 80% are numeric', () => {
        const values = [1, 2, 'text', 'more text', 'even more'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).not.toBe('numerical');
      });
    });

    describe('datetime type detection', () => {
      it('should classify ISO date strings as datetime', () => {
        const values = ['2023-01-01', '2023-02-15', '2023-03-30'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('datetime');
      });

      it('should classify US date format as datetime', () => {
        const values = ['01/15/2023', '02/28/2023', '12/31/2023'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('datetime');
      });

      it('should classify mixed date formats as datetime', () => {
        const values = ['2023-01-01', '02/15/2023', '2023/03/30'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('datetime');
      });

      it('should classify as datetime with some null values', () => {
        const values = ['2023-01-01', null, '2023-03-30', '', '2023-12-31'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('datetime');
      });

      it('should not classify invalid dates as datetime', () => {
        const values = ['not-a-date', 'also-not-date', 'definitely-not'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).not.toBe('datetime');
      });
    });

    describe('categorical type detection', () => {
      it('should classify repeated short strings as categorical', () => {
        const values = ['Red', 'Blue', 'Red', 'Green', 'Blue', 'Red'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('categorical');
      });

      it('should classify status values as categorical', () => {
        const values = ['Active', 'Inactive', 'Pending', 'Active', 'Active'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('categorical');
      });

      it('should classify boolean-like values as categorical', () => {
        const values = ['Yes', 'No', 'Yes', 'No', 'Yes'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('categorical');
      });

      it('should not classify unique long strings as categorical', () => {
        const values = [
          'This is a very long unique description',
          'Another completely different long text',
          'Yet another unique long description'
        ];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('text');
      });
    });

    describe('text type detection', () => {
      it('should classify long unique strings as text', () => {
        const values = [
          'Long description of something',
          'Another detailed explanation',
          'Different lengthy text content'
        ];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('text');
      });

      it('should classify empty column as text', () => {
        const values = [null, undefined, '', null];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('text');
      });

      it('should classify mixed non-numeric content as text', () => {
        const values = ['Some text', 123, 'More text', true, 'Final text'];
        expect(DataTypeAnalyzer.classifyColumnType(values)).toBe('text');
      });
    });
  });

  describe('calculateColumnStatistics', () => {
    describe('numerical statistics', () => {
      it('should calculate correct numerical statistics', () => {
        const values = [1, 2, 3, 4, 5];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'numerical');
        
        expect(stats.min).toBe(1);
        expect(stats.max).toBe(5);
        expect(stats.mean).toBe(3);
        expect(stats.median).toBe(3);
        expect(stats.nullCount).toBe(0);
        expect(stats.uniqueCount).toBe(5);
      });

      it('should handle numerical statistics with nulls', () => {
        const values = [1, null, 3, undefined, 5, ''];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'numerical');
        
        expect(stats.min).toBe(1);
        expect(stats.max).toBe(5);
        expect(stats.mean).toBe(3);
        expect(stats.median).toBe(3);
        expect(stats.nullCount).toBe(3);
        expect(stats.uniqueCount).toBe(3);
      });

      it('should calculate median for even number of values', () => {
        const values = [1, 2, 3, 4];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'numerical');
        
        expect(stats.median).toBe(2.5);
      });

      it('should round mean and median to 2 decimal places', () => {
        const values = [1, 2, 4];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'numerical');
        
        expect(stats.mean).toBe(2.33);
      });
    });

    describe('categorical statistics', () => {
      it('should calculate mode for categorical data', () => {
        const values = ['Red', 'Blue', 'Red', 'Green', 'Red'];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'categorical');
        
        expect(stats.mode).toBe('Red');
        expect(stats.nullCount).toBe(0);
        expect(stats.uniqueCount).toBe(3);
        expect(stats.min).toBeUndefined();
        expect(stats.max).toBeUndefined();
      });

      it('should handle categorical data with nulls', () => {
        const values = ['Red', null, 'Blue', '', 'Red'];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'categorical');
        
        expect(stats.mode).toBe('Red');
        expect(stats.nullCount).toBe(2);
        expect(stats.uniqueCount).toBe(2);
      });
    });

    describe('text statistics', () => {
      it('should calculate basic statistics for text data', () => {
        const values = ['Text1', 'Text2', 'Text1', 'Text3'];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'text');
        
        expect(stats.mode).toBe('Text1');
        expect(stats.nullCount).toBe(0);
        expect(stats.uniqueCount).toBe(3);
      });
    });

    describe('datetime statistics', () => {
      it('should calculate basic statistics for datetime data', () => {
        const values = ['2023-01-01', '2023-02-01', '2023-01-01'];
        const stats = DataTypeAnalyzer.calculateColumnStatistics(values, 'datetime');
        
        expect(stats.mode).toBe('2023-01-01');
        expect(stats.nullCount).toBe(0);
        expect(stats.uniqueCount).toBe(2);
      });
    });
  });

  describe('analyzeColumns', () => {
    it('should analyze multiple columns correctly', async () => {
      const headers = ['Name', 'Age', 'Status', 'Date'];
      const sampleData = [
        ['John', 25, 'Active', '2023-01-01'],
        ['Jane', 30, 'Inactive', '2023-02-01'],
        ['Bob', 35, 'Active', '2023-03-01']
      ];

      const columns = await DataTypeAnalyzer.analyzeColumns(headers, sampleData);

      expect(columns).toHaveLength(4);
      
      expect(columns[0].name).toBe('Name');
      expect(columns[0].type).toBe('categorical');
      expect(columns[0].uniqueValues).toBe(3);
      expect(columns[0].hasNulls).toBe(false);
      
      expect(columns[1].name).toBe('Age');
      expect(columns[1].type).toBe('numerical');
      expect(columns[1].uniqueValues).toBe(3);
      
      expect(columns[2].name).toBe('Status');
      expect(columns[2].type).toBe('categorical');
      expect(columns[2].uniqueValues).toBe(2);
      
      expect(columns[3].name).toBe('Date');
      expect(columns[3].type).toBe('datetime');
      expect(columns[3].uniqueValues).toBe(3);
    });

    it('should handle columns with null values', async () => {
      const headers = ['Name', 'Score'];
      const sampleData = [
        ['John', 85],
        [null, 90],
        ['Jane', null],
        ['', 95]
      ];

      const columns = await DataTypeAnalyzer.analyzeColumns(headers, sampleData);

      expect(columns[0].hasNulls).toBe(true);
      expect(columns[0].uniqueValues).toBe(2); // John, Jane (null and empty string filtered out)
      
      expect(columns[1].hasNulls).toBe(true);
      expect(columns[1].uniqueValues).toBe(3); // 85, 90, 95
    });

    it('should provide sample values for each column', async () => {
      const headers = ['Name'];
      const sampleData = [
        ['John'],
        ['Jane'],
        ['Bob'],
        ['Alice'],
        ['Charlie'],
        ['David']
      ];

      const columns = await DataTypeAnalyzer.analyzeColumns(headers, sampleData);

      expect(columns[0].sampleValues).toHaveLength(5); // First 5 values
      expect(columns[0].sampleValues).toEqual(['John', 'Jane', 'Bob', 'Alice', 'Charlie']);
    });
  });

  describe('calculateDataQualityMetrics', () => {
    it('should calculate completeness correctly', async () => {
      const headers = ['Name', 'Age'];
      const sampleData = [
        ['John', 25],
        ['Jane', null],
        [null, 30],
        ['Bob', 35]
      ];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.completeness).toBe(0.75); // 6 out of 8 cells are non-null
    });

    it('should identify data quality issues', async () => {
      const headers = ['Name', 'Mixed', 'Empty'];
      const sampleData = [
        ['John', 25, null],
        ['Jane', 'text', ''],
        ['Bob', true, null]
      ];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.issues).toContain('Column "Mixed" contains mixed data types: number, string, boolean');
      expect(metrics.issues).toContain('Column "Empty" contains no valid data');
    });

    it('should detect high null percentage', async () => {
      const headers = ['Name', 'Sparse'];
      const sampleData = [
        ['John', null],
        ['Jane', null],
        ['Bob', 'value'],
        ['Alice', null]
      ];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.issues.some(issue => issue.includes('Sparse') && issue.includes('75% missing values'))).toBe(true);
    });

    it('should detect inconsistent text casing', async () => {
      const headers = ['Status'];
      const sampleData = [
        ['Active'],
        ['active'],
        ['ACTIVE'],
        ['Inactive']
      ];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.issues).toContain('Column "Status" has inconsistent text casing');
    });

    it('should calculate consistency score', async () => {
      const headers = ['Name', 'Age'];
      const sampleData = [
        ['John', 25],
        ['Jane', 30],
        ['Bob', 35]
      ];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.consistency).toBe(1.0); // Perfect consistency
      expect(metrics.completeness).toBe(1.0); // Perfect completeness
      expect(metrics.issues).toHaveLength(0);
    });

    it('should handle empty dataset', async () => {
      const headers = ['Name'];
      const sampleData: any[][] = [];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.completeness).toBe(0);
      expect(metrics.consistency).toBeGreaterThanOrEqual(0);
    });

    it('should ensure metrics are bounded between 0 and 1', async () => {
      const headers = ['Bad1', 'Bad2', 'Bad3'];
      const sampleData = [
        [null, 'text', null],
        ['', 123, undefined],
        [undefined, true, '']
      ];

      const metrics = await DataTypeAnalyzer.calculateDataQualityMetrics(sampleData, headers);

      expect(metrics.completeness).toBeGreaterThanOrEqual(0);
      expect(metrics.completeness).toBeLessThanOrEqual(1);
      expect(metrics.consistency).toBeGreaterThanOrEqual(0);
      expect(metrics.consistency).toBeLessThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays', () => {
      const result = DataTypeAnalyzer.classifyColumnType([]);
      expect(result).toBe('text');
    });

    it('should handle arrays with only null values', () => {
      const result = DataTypeAnalyzer.classifyColumnType([null, undefined, '']);
      expect(result).toBe('text');
    });

    it('should handle single value arrays', () => {
      expect(DataTypeAnalyzer.classifyColumnType([42])).toBe('numerical');
      expect(DataTypeAnalyzer.classifyColumnType(['2023-01-01'])).toBe('datetime');
      expect(DataTypeAnalyzer.classifyColumnType(['Category'])).toBe('categorical');
    });

    it('should handle mixed valid and invalid numeric values', () => {
      const values = [1, 2, 'NaN', 'Infinity', 3];
      const result = DataTypeAnalyzer.classifyColumnType(values);
      expect(result).toBe('text'); // Less than 80% valid numbers
    });

    it('should handle very large numbers', () => {
      const values = [1e10, 2e15, 3e20];
      const result = DataTypeAnalyzer.classifyColumnType(values);
      expect(result).toBe('numerical');
    });

    it('should handle negative numbers', () => {
      const values = [-1, -2.5, -100];
      const result = DataTypeAnalyzer.classifyColumnType(values);
      expect(result).toBe('numerical');
    });
  });
});