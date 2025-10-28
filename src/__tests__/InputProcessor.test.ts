/**
 * Unit tests for InputProcessor class
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { InputProcessor, InputValidationError } from '../processors/InputProcessor';
import { InputData, ProcessedInput } from '../types/interfaces';
import { InsufficientDataError, DataQualityError } from '../errors/AnalysisErrors';

describe('InputProcessor', () => {
  describe('processInput - Valid Input', () => {
    it('should process valid input data successfully', () => {
      const validInput: InputData = {
        headers: ['Name', 'Age', 'Salary'],
        sampleData: [
          ['John', 30, 50000],
          ['Jane', 25, 45000],
          ['Bob', 35, 60000]
        ]
      };

      const result: ProcessedInput = InputProcessor.processInput(validInput);

      expect(result.columns).toHaveLength(3);
      expect(result.columns[0].name).toBe('Name');
      expect(result.columns[1].name).toBe('Age');
      expect(result.columns[2].name).toBe('Salary');
      expect(result.dataQuality.completeness).toBe(1.0);
      expect(result.dataQuality.issues).toHaveLength(0);
    });

    it('should correctly detect column types', () => {
      const input: InputData = {
        headers: ['Name', 'Age', 'Category', 'Date', 'Score'],
        sampleData: [
          ['John', 30, 'A', '2023-01-01', 85.5],
          ['Jane', 25, 'B', '2023-02-15', 92.0],
          ['Bob', 35, 'A', '2023-03-10', 78.3]
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].type).toBe('text'); // Name
      expect(result.columns[1].type).toBe('numerical'); // Age
      expect(result.columns[2].type).toBe('categorical'); // Category
      expect(result.columns[3].type).toBe('datetime'); // Date
      expect(result.columns[4].type).toBe('numerical'); // Score
    });

    it('should handle mixed data types and null values', () => {
      const input: InputData = {
        headers: ['Mixed', 'WithNulls'],
        sampleData: [
          ['text', 100],
          [null, 200],
          ['', null],
          ['more text', 300]
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].hasNulls).toBe(true);
      expect(result.columns[1].hasNulls).toBe(true);
      expect(result.dataQuality.completeness).toBeLessThan(1.0);
      expect(result.dataQuality.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Enhanced Error Handling', () => {
    it('should handle extremely poor data quality', () => {
      const poorQualityInput: InputData = {
        headers: ['col1', 'col2', 'col3'],
        sampleData: [
          [null, '', undefined],
          ['', null, '']
        ]
      };

      expect(() => {
        InputProcessor.processInput(poorQualityInput);
      }).toThrow(InsufficientDataError);
    });

    it('should validate system resources for large datasets', () => {
      const headers = Array.from({ length: 100 }, (_, i) => `col${i}`);
      const sampleData = Array.from({ length: 20000 }, () => 
        Array.from({ length: 100 }, (_, i) => `value${i}`)
      );

      expect(() => {
        InputProcessor.processInput({ headers, sampleData });
      }).toThrow(); // Should throw resource exhaustion error
    });

    it('should throw InsufficientDataError for completely empty data', () => {
      const input: InputData = {
        headers: ['col1', 'col2'],
        sampleData: [
          [null, ''],
          ['', null],
          [undefined, ''],
          ['', undefined],
          [null, null]
        ]
      };

      expect(() => {
        InputProcessor.processInput(input);
      }).toThrow(InsufficientDataError);
    });
  });

  describe('Input Structure Validation', () => {
    it('should throw error for null input', () => {
      expect(() => {
        InputProcessor.processInput(null);
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput(null);
      } catch (error) {
        expect(error).toBeInstanceOf(InputValidationError);
        expect((error as InputValidationError).code).toBe('INVALID_INPUT_TYPE');
        expect((error as InputValidationError).suggestions).toContain('Provide input as a JSON object with headers and sampleData properties');
      }
    });

    it('should throw error for non-object input', () => {
      expect(() => {
        InputProcessor.processInput('invalid');
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput('invalid');
      } catch (error) {
        expect((error as InputValidationError).code).toBe('INVALID_INPUT_TYPE');
      }
    });

    it('should throw error for missing headers property', () => {
      expect(() => {
        InputProcessor.processInput({ sampleData: [] });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({ sampleData: [] });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('MISSING_HEADERS');
        expect((error as InputValidationError).suggestions).toContain('Add a "headers" property containing an array of column names');
      }
    });

    it('should throw error for missing sampleData property', () => {
      expect(() => {
        InputProcessor.processInput({ headers: ['Name'] });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({ headers: ['Name'] });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('MISSING_SAMPLE_DATA');
        expect((error as InputValidationError).suggestions).toContain('Add a "sampleData" property containing an array of data rows');
      }
    });
  });

  describe('Headers Validation', () => {
    it('should throw error for non-array headers', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: 'not an array',
          sampleData: [['data']]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: 'not an array',
          sampleData: [['data']]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('INVALID_HEADERS_TYPE');
        expect((error as InputValidationError).suggestions).toContain('Provide headers as an array of strings, e.g., ["Name", "Age", "Salary"]');
      }
    });

    it('should throw error for empty headers array', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: [],
          sampleData: [['data']]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: [],
          sampleData: [['data']]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('EMPTY_HEADERS');
        expect((error as InputValidationError).suggestions).toContain('Provide at least one column header');
      }
    });

    it('should throw error for non-string headers', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name', 123, 'Age'],
          sampleData: [['John', 30, 25]]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name', 123, 'Age'],
          sampleData: [['John', 30, 25]]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('INVALID_HEADER_TYPE');
        expect((error as InputValidationError).suggestions).toContain('Ensure all header values are strings, not numbers or other types');
      }
    });

    it('should throw error for empty string headers', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name', '', 'Age'],
          sampleData: [['John', 30, 25]]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name', '', 'Age'],
          sampleData: [['John', 30, 25]]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('EMPTY_HEADER_VALUES');
        expect((error as InputValidationError).suggestions).toContain('Provide meaningful names for all columns');
      }
    });

    it('should throw error for duplicate headers', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name', 'Age', 'Name'],
          sampleData: [['John', 30, 'Duplicate']]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name', 'Age', 'Name'],
          sampleData: [['John', 30, 'Duplicate']]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('DUPLICATE_HEADERS');
        expect((error as InputValidationError).suggestions).toContain('Ensure all column headers have unique names');
      }
    });
  });

  describe('Sample Data Validation', () => {
    it('should throw error for non-array sample data', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name'],
          sampleData: 'not an array'
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name'],
          sampleData: 'not an array'
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('INVALID_SAMPLE_DATA_TYPE');
        expect((error as InputValidationError).suggestions).toContain('Provide sampleData as an array of arrays, e.g., [["John", 30], ["Jane", 25]]');
      }
    });

    it('should throw error for empty sample data', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name'],
          sampleData: []
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name'],
          sampleData: []
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('EMPTY_SAMPLE_DATA');
        expect((error as InputValidationError).suggestions).toContain('Provide at least one row of sample data for analysis');
      }
    });

    it('should throw error for non-array rows', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name', 'Age'],
          sampleData: [['John', 30], 'not an array']
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name', 'Age'],
          sampleData: [['John', 30], 'not an array']
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('INVALID_ROW_TYPE');
        expect((error as InputValidationError).message).toContain('Row 2 must be an array');
      }
    });

    it('should throw error for row-header mismatch', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name', 'Age'],
          sampleData: [['John', 30, 'Extra']]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name', 'Age'],
          sampleData: [['John', 30, 'Extra']]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('ROW_HEADER_MISMATCH');
        expect((error as InputValidationError).message).toContain('Row 1 has 3 values but 2 headers provided');
      }
    });

    it('should throw error for insufficient data', () => {
      expect(() => {
        InputProcessor.processInput({
          headers: ['Name'],
          sampleData: [['John']]
        });
      }).toThrow(InputValidationError);
      
      try {
        InputProcessor.processInput({
          headers: ['Name'],
          sampleData: [['John']]
        });
      } catch (error) {
        expect((error as InputValidationError).code).toBe('INSUFFICIENT_DATA');
        expect((error as InputValidationError).suggestions).toContain('Provide at least 2 rows of sample data to enable pattern detection');
      }
    });
  });

  describe('Column Type Detection', () => {
    it('should detect numerical columns correctly', () => {
      const input: InputData = {
        headers: ['Integer', 'Float', 'StringNumbers'],
        sampleData: [
          [1, 1.5, '100'],
          [2, 2.7, '200'],
          [3, 3.9, '300']
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].type).toBe('numerical');
      expect(result.columns[1].type).toBe('numerical');
      expect(result.columns[2].type).toBe('numerical');
    });

    it('should detect categorical columns correctly', () => {
      const input: InputData = {
        headers: ['Category'],
        sampleData: [
          ['A'],
          ['B'],
          ['A'],
          ['C'],
          ['B'],
          ['A']
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].type).toBe('categorical');
    });

    it('should detect datetime columns correctly', () => {
      const input: InputData = {
        headers: ['Date1', 'Date2', 'Date3'],
        sampleData: [
          ['2023-01-01', '01/15/2023', '2023-12-25'],
          ['2023-02-01', '02/15/2023', '2023-11-25'],
          ['2023-03-01', '03/15/2023', '2023-10-25']
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].type).toBe('datetime');
      expect(result.columns[1].type).toBe('datetime');
      expect(result.columns[2].type).toBe('datetime');
    });

    it('should detect text columns correctly', () => {
      const input: InputData = {
        headers: ['Description'],
        sampleData: [
          ['This is a long description'],
          ['Another unique description'],
          ['Yet another different description']
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].type).toBe('text');
    });

    it('should handle empty columns', () => {
      const input: InputData = {
        headers: ['Empty'],
        sampleData: [
          [null],
          [''],
          [undefined]
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].type).toBe('text');
      expect(result.columns[0].hasNulls).toBe(true);
    });
  });

  describe('Data Quality Metrics', () => {
    it('should calculate completeness correctly', () => {
      const input: InputData = {
        headers: ['A', 'B'],
        sampleData: [
          ['value1', 'value2'],
          [null, 'value4'],
          ['value5', null],
          ['value7', 'value8']
        ]
      };

      const result = InputProcessor.processInput(input);

      // 6 out of 8 cells have values = 0.75 completeness
      expect(result.dataQuality.completeness).toBe(0.75);
    });

    it('should identify data quality issues', () => {
      const input: InputData = {
        headers: ['Mixed', 'Empty'],
        sampleData: [
          ['text', null],
          [123, ''],
          ['more text', null]
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.dataQuality.issues.length).toBeGreaterThan(0);
      expect(result.dataQuality.issues.some(issue => issue.includes('mixed data types'))).toBe(true);
    });

    it('should handle perfect data quality', () => {
      const input: InputData = {
        headers: ['Name', 'Age'],
        sampleData: [
          ['John', 30],
          ['Jane', 25],
          ['Bob', 35]
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.dataQuality.completeness).toBe(1.0);
      expect(result.dataQuality.consistency).toBe(1.0);
      expect(result.dataQuality.issues).toHaveLength(0);
    });
  });

  describe('Column Analysis', () => {
    it('should calculate unique values correctly', () => {
      const input: InputData = {
        headers: ['Repeated'],
        sampleData: [
          ['A'],
          ['B'],
          ['A'],
          ['C'],
          ['B']
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].uniqueValues).toBe(3); // A, B, C
    });

    it('should provide sample values', () => {
      const input: InputData = {
        headers: ['Values'],
        sampleData: [
          [1],
          [2],
          [3],
          [4],
          [5],
          [6],
          [7]
        ]
      };

      const result = InputProcessor.processInput(input);

      expect(result.columns[0].sampleValues).toHaveLength(5); // First 5 values
      expect(result.columns[0].sampleValues).toEqual([1, 2, 3, 4, 5]);
    });
  });
});