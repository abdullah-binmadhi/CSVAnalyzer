/**
 * Unit tests for comprehensive error handling system
 * Requirements: 1.4, 5.6
 */

import {
  AnalysisError,
  InsufficientDataError,
  AnalysisTimeoutError,
  DataQualityError,
  ChartGenerationError,
  BusinessAnalysisError,
  ReportGenerationError,
  OutputFormattingError,
  ResourceExhaustionError,
  SystemConfigurationError,
  ErrorHandler
} from '../errors/AnalysisErrors';

describe('AnalysisError Base Class', () => {
  it('should create error with all properties', () => {
    const error = new InsufficientDataError(
      'Test error message',
      5,
      10,
      ['Custom suggestion']
    );

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AnalysisError);
    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('INSUFFICIENT_DATA');
    expect(error.suggestions).toContain('Custom suggestion');
    expect(error.suggestions).toContain('Provide at least 10 rows of data for meaningful analysis');
    expect(error.timestamp).toBeInstanceOf(Date);
    expect(error.context).toEqual({ dataSize: 5, minimumRequired: 10 });
  });

  it('should convert error to JSON format', () => {
    const error = new DataQualityError(
      'Quality issue',
      ['Issue 1', 'Issue 2']
    );

    const json = error.toJSON();

    expect(json.error).toBe(true);
    expect(json.name).toBe('DataQualityError');
    expect(json.message).toBe('Quality issue');
    expect(json.code).toBe('DATA_QUALITY_ERROR');
    expect(json.suggestions).toContain('Clean the data by removing or filling missing values');
    expect(json.timestamp).toBeDefined();
    expect(json.context).toEqual({ qualityIssues: ['Issue 1', 'Issue 2'] });
  });

  it('should maintain proper prototype chain for instanceof checks', () => {
    const error = new ChartGenerationError('Chart error');

    expect(error instanceof Error).toBe(true);
    expect(error instanceof AnalysisError).toBe(true);
    expect(error instanceof ChartGenerationError).toBe(true);
  });
});

describe('Specific Error Types', () => {
  describe('InsufficientDataError', () => {
    it('should create error with data size context', () => {
      const error = new InsufficientDataError(
        'Not enough data',
        1,
        5
      );

      expect(error.code).toBe('INSUFFICIENT_DATA');
      expect(error.context?.dataSize).toBe(1);
      expect(error.context?.minimumRequired).toBe(5);
      expect(error.suggestions).toContain('Provide at least 5 rows of data for meaningful analysis');
    });
  });

  describe('AnalysisTimeoutError', () => {
    it('should create error with timeout context', () => {
      const error = new AnalysisTimeoutError(
        'chart generation',
        30000
      );

      expect(error.code).toBe('ANALYSIS_TIMEOUT');
      expect(error.message).toContain('chart generation');
      expect(error.message).toContain('30000ms');
      expect(error.context?.operation).toBe('chart generation');
      expect(error.context?.timeoutMs).toBe(30000);
      expect(error.suggestions).toContain('Try reducing the dataset size or complexity');
    });
  });

  describe('DataQualityError', () => {
    it('should create error with quality issues context', () => {
      const issues = ['Missing values', 'Inconsistent types'];
      const error = new DataQualityError(
        'Poor data quality',
        issues
      );

      expect(error.code).toBe('DATA_QUALITY_ERROR');
      expect(error.context?.qualityIssues).toEqual(issues);
      expect(error.suggestions).toContain('Clean the data by removing or filling missing values');
    });
  });

  describe('ChartGenerationError', () => {
    it('should create error with chart context', () => {
      const error = new ChartGenerationError(
        'Cannot create chart',
        'bar',
        { xAxis: 'category', yAxis: 'value' }
      );

      expect(error.code).toBe('CHART_GENERATION_ERROR');
      expect(error.context?.chartType).toBe('bar');
      expect(error.context?.columnInfo).toEqual({ xAxis: 'category', yAxis: 'value' });
      expect(error.suggestions).toContain('Ensure the dataset contains appropriate column types for visualization');
    });
  });

  describe('BusinessAnalysisError', () => {
    it('should create error with analysis stage context', () => {
      const error = new BusinessAnalysisError(
        'Business analysis failed',
        'industry detection'
      );

      expect(error.code).toBe('BUSINESS_ANALYSIS_ERROR');
      expect(error.context?.analysisStage).toBe('industry detection');
      expect(error.suggestions).toContain('Ensure column names are descriptive and meaningful');
    });
  });

  describe('ReportGenerationError', () => {
    it('should create error with report section context', () => {
      const error = new ReportGenerationError(
        'Report generation failed',
        'executive summary'
      );

      expect(error.code).toBe('REPORT_GENERATION_ERROR');
      expect(error.context?.reportSection).toBe('executive summary');
      expect(error.suggestions).toContain('Ensure all required analysis components completed successfully');
    });
  });

  describe('OutputFormattingError', () => {
    it('should create error with output type context', () => {
      const error = new OutputFormattingError(
        'JSON formatting failed',
        'json'
      );

      expect(error.code).toBe('OUTPUT_FORMATTING_ERROR');
      expect(error.context?.outputType).toBe('json');
      expect(error.suggestions).toContain('Verify that all analysis components completed successfully');
    });
  });

  describe('ResourceExhaustionError', () => {
    it('should create error with resource type context', () => {
      const error = new ResourceExhaustionError(
        'Out of memory',
        'memory'
      );

      expect(error.code).toBe('RESOURCE_EXHAUSTION');
      expect(error.context?.resourceType).toBe('memory');
      expect(error.suggestions).toContain('Reduce the dataset size by sampling or filtering');
    });
  });

  describe('SystemConfigurationError', () => {
    it('should create error with configuration context', () => {
      const error = new SystemConfigurationError(
        'System misconfigured',
        'missing dependencies'
      );

      expect(error.code).toBe('SYSTEM_CONFIGURATION_ERROR');
      expect(error.context?.configurationIssue).toBe('missing dependencies');
      expect(error.suggestions).toContain('Verify that all required system components are properly configured');
    });
  });
});

describe('ErrorHandler Utility Functions', () => {
  describe('withTimeout', () => {
    it('should resolve when operation completes within timeout', async () => {
      const operation = () => Promise.resolve('success');
      
      const result = await ErrorHandler.withTimeout(operation, 1000, 'test operation');
      
      expect(result).toBe('success');
    });

    it('should reject with timeout error when operation exceeds timeout', async () => {
      const operation = () => new Promise(resolve => setTimeout(() => resolve('late'), 200));
      
      await expect(
        ErrorHandler.withTimeout(operation, 100, 'slow operation')
      ).rejects.toThrow(AnalysisTimeoutError);
    });

    it('should reject with original error when operation fails', async () => {
      const operation = () => Promise.reject(new Error('operation failed'));
      
      await expect(
        ErrorHandler.withTimeout(operation, 1000, 'failing operation')
      ).rejects.toThrow('operation failed');
    });
  });

  describe('withSyncTimeout', () => {
    it('should resolve when sync operation completes within timeout', async () => {
      const operation = () => 'sync success';
      
      const result = await ErrorHandler.withSyncTimeout(operation, 1000, 'sync test');
      
      expect(result).toBe('sync success');
    });

    it('should handle sync operations within timeout', async () => {
      const operation = () => {
        // Quick sync operation
        return 'completed';
      };
      
      const result = await ErrorHandler.withSyncTimeout(operation, 1000, 'quick sync operation');
      expect(result).toBe('completed');
    });
  });

  describe('safeExecute', () => {
    it('should return operation result when successful', async () => {
      const operation = () => Promise.resolve('operation success');
      const fallback = () => 'fallback';
      
      const result = await ErrorHandler.safeExecute(operation, fallback, 'safe test');
      
      expect(result).toBe('operation success');
    });

    it('should return fallback result when operation fails', async () => {
      const operation = () => Promise.reject(new Error('operation failed'));
      const fallback = () => 'fallback success';
      
      const result = await ErrorHandler.safeExecute(operation, fallback, 'safe test');
      
      expect(result).toBe('fallback success');
    });

    it('should return fallback result when operation times out', async () => {
      const operation = () => new Promise(resolve => setTimeout(() => resolve('late'), 200));
      const fallback = () => 'timeout fallback';
      
      const result = await ErrorHandler.safeExecute(operation, fallback, 'timeout test', 100);
      
      expect(result).toBe('timeout fallback');
    });
  });

  describe('validateDataSufficiency', () => {
    it('should pass validation for sufficient data', () => {
      const data = [['a', 1], ['b', 2], ['c', 3]];
      const headers = ['name', 'value'];
      
      expect(() => {
        ErrorHandler.validateDataSufficiency(data, headers);
      }).not.toThrow();
    });

    it('should throw InsufficientDataError for too few rows', () => {
      const data = [['a', 1]];
      const headers = ['name', 'value'];
      
      expect(() => {
        ErrorHandler.validateDataSufficiency(data, headers, 2);
      }).toThrow(InsufficientDataError);
    });

    it('should throw InsufficientDataError for no headers', () => {
      const data = [['a', 1], ['b', 2]];
      const headers: string[] = [];
      
      expect(() => {
        ErrorHandler.validateDataSufficiency(data, headers);
      }).toThrow(InsufficientDataError);
    });

    it('should throw InsufficientDataError for completely empty data', () => {
      const data = [[null, ''], [undefined, null]];
      const headers = ['col1', 'col2'];
      
      expect(() => {
        ErrorHandler.validateDataSufficiency(data, headers);
      }).toThrow(InsufficientDataError);
    });

    it('should throw DataQualityError for very low data density', () => {
      const data = [
        [null, '', undefined, null],
        ['', null, '', undefined],
        [null, '', 'value', null] // Only 1 out of 12 cells has data
      ];
      const headers = ['col1', 'col2', 'col3', 'col4'];
      
      expect(() => {
        ErrorHandler.validateDataSufficiency(data, headers);
      }).toThrow(DataQualityError);
    });
  });

  describe('validateSystemResources', () => {
    it('should pass validation for reasonable data size', () => {
      expect(() => {
        ErrorHandler.validateSystemResources(1000);
      }).not.toThrow();
    });

    it('should throw ResourceExhaustionError for excessive data size', () => {
      expect(() => {
        ErrorHandler.validateSystemResources(2000000, 1000000);
      }).toThrow(ResourceExhaustionError);
    });
  });

  describe('createUserFriendlyError', () => {
    it('should return AnalysisError unchanged', () => {
      const originalError = new DataQualityError('Quality issue', []);
      
      const result = ErrorHandler.createUserFriendlyError(originalError);
      
      expect(result).toBe(originalError);
    });

    it('should wrap regular Error in AnalysisError', () => {
      const originalError = new Error('Regular error');
      
      const result = ErrorHandler.createUserFriendlyError(originalError);
      
      expect(result).toBeInstanceOf(AnalysisError);
      expect(result.message).toContain('Regular error');
      expect(result.code).toBe('UNEXPECTED_ERROR');
      expect(result.context?.originalError).toBe('Error');
    });

    it('should wrap unknown error types', () => {
      const unknownError = 'string error';
      
      const result = ErrorHandler.createUserFriendlyError(unknownError);
      
      expect(result).toBeInstanceOf(AnalysisError);
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.context?.originalError).toBe('string error');
    });

    it('should provide helpful suggestions for unknown errors', () => {
      const result = ErrorHandler.createUserFriendlyError('unknown');
      
      expect(result.suggestions).toContain('Try running the analysis again');
      expect(result.suggestions).toContain('Verify that your input data is valid and complete');
    });
  });
});

describe('Error Integration Tests', () => {
  it('should handle nested error scenarios', async () => {
    const operation = () => {
      throw new DataQualityError('Inner quality error', ['issue1']);
    };
    
    const fallback = () => 'fallback result';
    
    const result = await ErrorHandler.safeExecute(operation, fallback, 'nested test');
    
    expect(result).toBe('fallback result');
  });

  it('should preserve error context through transformations', () => {
    const originalError = new ChartGenerationError(
      'Chart failed',
      'bar',
      { xAxis: 'x', yAxis: 'y' },
      ['Custom suggestion']
    );

    const json = originalError.toJSON();
    
    expect(json.context?.chartType).toBe('bar');
    expect(json.context?.columnInfo).toEqual({ xAxis: 'x', yAxis: 'y' });
    expect(json.suggestions).toContain('Custom suggestion');
  });

  it('should handle timeout scenarios gracefully', async () => {
    const longOperation = () => new Promise(resolve => {
      setTimeout(() => resolve('completed'), 1000);
    });

    const start = Date.now();
    
    await expect(
      ErrorHandler.withTimeout(longOperation, 100, 'timeout test')
    ).rejects.toThrow(AnalysisTimeoutError);

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(200); // Should timeout quickly
  });
});