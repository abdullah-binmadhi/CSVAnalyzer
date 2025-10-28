import { JsonOutputFormatter } from '../formatters/JsonOutputFormatter';
import { ChartRecommendation, AnalysisOutput } from '../types/interfaces';

describe('JsonOutputFormatter', () => {
  let formatter: JsonOutputFormatter;
  let validCharts: ChartRecommendation[];
  let validMarkdown: string;

  beforeEach(() => {
    formatter = new JsonOutputFormatter();
    
    validCharts = [
      {
        title: 'Revenue by Category',
        type: 'bar',
        xAxis: 'category',
        yAxis: 'revenue'
      },
      {
        title: 'Sales Trend Over Time',
        type: 'line',
        xAxis: 'date',
        yAxis: 'sales'
      },
      {
        title: 'Price vs Quantity Correlation',
        type: 'scatter',
        xAxis: 'price',
        yAxis: 'quantity'
      }
    ];

    validMarkdown = `# Analysis Report

## Executive Summary
This dataset appears to be from the retail/e-commerce industry.

## Statistical Analysis
- Revenue column shows strong variation
- Category distribution is balanced

## Key Relationships
- Strong correlation between price and quantity
- Seasonal trends in sales data

## Actionable Questions
1. Which categories drive the most revenue?
2. How do seasonal trends affect sales?
3. What is the optimal pricing strategy?

## Conclusion
This dataset has strong analytical potential for business insights.`;
  });

  describe('formatOutput', () => {
    it('should create valid AnalysisOutput structure', () => {
      const result = formatter.formatOutput(validCharts, validMarkdown);

      expect(result).toHaveProperty('charts_to_generate');
      expect(result).toHaveProperty('full_analysis_report_markdown');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should properly format chart recommendations array', () => {
      const result = formatter.formatOutput(validCharts, validMarkdown);

      expect(Array.isArray(result.charts_to_generate)).toBe(true);
      expect(result.charts_to_generate).toHaveLength(3);
      
      result.charts_to_generate.forEach(chart => {
        expect(chart).toHaveProperty('title');
        expect(chart).toHaveProperty('type');
        expect(chart).toHaveProperty('xAxis');
        expect(chart).toHaveProperty('yAxis');
        expect(typeof chart.title).toBe('string');
        expect(typeof chart.type).toBe('string');
        expect(typeof chart.xAxis).toBe('string');
        expect(typeof chart.yAxis).toBe('string');
      });
    });

    it('should properly format markdown report', () => {
      const result = formatter.formatOutput(validCharts, validMarkdown);

      expect(typeof result.full_analysis_report_markdown).toBe('string');
      expect(result.full_analysis_report_markdown.trim()).toBe(validMarkdown.trim());
      expect(result.full_analysis_report_markdown).toContain('# Analysis Report');
    });

    it('should handle empty charts array', () => {
      const result = formatter.formatOutput([], validMarkdown);

      expect(result.charts_to_generate).toEqual([]);
      expect(result.full_analysis_report_markdown).toBe(validMarkdown.trim());
    });

    it('should trim whitespace from chart properties', () => {
      const chartsWithWhitespace = [
        {
          title: '  Revenue by Category  ',
          type: 'bar' as const,
          xAxis: '  category  ',
          yAxis: '  revenue  '
        }
      ];

      const result = formatter.formatOutput(chartsWithWhitespace, validMarkdown);

      expect(result.charts_to_generate[0].title).toBe('Revenue by Category');
      expect(result.charts_to_generate[0].xAxis).toBe('category');
      expect(result.charts_to_generate[0].yAxis).toBe('revenue');
    });

    it('should normalize line endings in markdown', () => {
      const markdownWithCRLF = validMarkdown.replace(/\n/g, '\r\n');
      const result = formatter.formatOutput(validCharts, markdownWithCRLF);

      expect(result.full_analysis_report_markdown).not.toContain('\r\n');
      expect(result.full_analysis_report_markdown).toContain('\n');
    });
  });

  describe('input validation', () => {
    it('should throw error for non-array charts', () => {
      expect(() => {
        formatter.formatOutput('not an array' as any, validMarkdown);
      }).toThrow('Charts must be provided as an array');
    });

    it('should throw error for non-string markdown', () => {
      expect(() => {
        formatter.formatOutput(validCharts, 123 as any);
      }).toThrow('Report markdown must be provided as a string');
    });

    it('should throw error for empty markdown', () => {
      expect(() => {
        formatter.formatOutput(validCharts, '   ');
      }).toThrow('Report markdown cannot be empty');
    });

    it('should throw error for invalid chart object', () => {
      const invalidCharts = [null, undefined, 'string', 123];
      
      invalidCharts.forEach((invalidChart, index) => {
        expect(() => {
          formatter.formatOutput([invalidChart] as any, validMarkdown);
        }).toThrow(`Chart at index 0 must be an object`);
      });
    });

    it('should throw error for missing chart properties', () => {
      const requiredFields = ['title', 'type', 'xAxis', 'yAxis'];
      
      requiredFields.forEach(field => {
        const incompleteChart = { ...validCharts[0] };
        delete incompleteChart[field as keyof ChartRecommendation];
        
        expect(() => {
          formatter.formatOutput([incompleteChart] as any, validMarkdown);
        }).toThrow(`Chart at index 0 must have a valid string '${field}' property`);
      });
    });

    it('should throw error for invalid chart type', () => {
      const invalidChart = {
        ...validCharts[0],
        type: 'pie' as any
      };

      expect(() => {
        formatter.formatOutput([invalidChart], validMarkdown);
      }).toThrow("Chart at index 0 has invalid type 'pie'. Must be one of: bar, line, scatter");
    });

    it('should throw error for empty chart properties', () => {
      const emptyTitleChart = {
        ...validCharts[0],
        title: '   '
      };

      expect(() => {
        formatter.formatOutput([emptyTitleChart], validMarkdown);
      }).toThrow('Chart at index 0 must have a non-empty title');

      const emptyXAxisChart = {
        ...validCharts[0],
        xAxis: ''
      };

      expect(() => {
        formatter.formatOutput([emptyXAxisChart], validMarkdown);
      }).toThrow('Chart at index 0 must have a non-empty xAxis');

      const emptyYAxisChart = {
        ...validCharts[0],
        yAxis: ''
      };

      expect(() => {
        formatter.formatOutput([emptyYAxisChart], validMarkdown);
      }).toThrow('Chart at index 0 must have a non-empty yAxis');
    });
  });

  describe('toJsonString', () => {
    it('should convert AnalysisOutput to valid JSON string', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);
      const jsonString = formatter.toJsonString(output);

      expect(typeof jsonString).toBe('string');
      expect(() => JSON.parse(jsonString)).not.toThrow();
      
      const parsed = JSON.parse(jsonString);
      expect(parsed).toEqual(output);
    });

    it('should produce JSON with no additional text', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);
      const jsonString = formatter.toJsonString(output);

      // Should be valid JSON that parses to the exact same object
      const parsed = JSON.parse(jsonString);
      expect(parsed).toEqual(output);

      // Should not contain any additional text or formatting
      expect(jsonString.trim()).toBe(jsonString);
      expect(jsonString).not.toMatch(/^[^{]/);
      expect(jsonString).not.toMatch(/[^}]$/);
    });

    it('should handle complex markdown with special characters', () => {
      const complexMarkdown = `# Analysis Report

## Special Characters Test
- Quotes: "double" and 'single'
- Backslashes: \\ and \\n
- Unicode: 🚀 📊 💡
- JSON-like: {"key": "value"}

## Code Block
\`\`\`javascript
const data = { test: "value" };
\`\`\`

## Conclusion
This tests special character handling.`;

      const output = formatter.formatOutput(validCharts, complexMarkdown);
      const jsonString = formatter.toJsonString(output);

      expect(() => JSON.parse(jsonString)).not.toThrow();
      const parsed = JSON.parse(jsonString);
      expect(parsed.full_analysis_report_markdown).toContain('🚀 📊 💡');
      expect(parsed.full_analysis_report_markdown).toContain('"double" and \'single\'');
    });

    it('should throw error for invalid output structure', () => {
      const invalidOutput = { invalid: 'structure' } as any;

      expect(() => {
        formatter.toJsonString(invalidOutput);
      }).toThrow('Failed to convert output to JSON');
    });
  });

  describe('validateJsonString', () => {
    it('should validate and parse valid JSON string', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);
      const jsonString = formatter.toJsonString(output);

      const validated = formatter.validateJsonString(jsonString);
      expect(validated).toEqual(output);
    });

    it('should throw error for non-string input', () => {
      expect(() => {
        formatter.validateJsonString(123 as any);
      }).toThrow('Input must be a string');
    });

    it('should throw error for JSON with leading/trailing whitespace', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);
      const jsonString = formatter.toJsonString(output);
      const withWhitespace = `  ${jsonString}  `;

      expect(() => {
        formatter.validateJsonString(withWhitespace);
      }).toThrow('JSON string contains leading or trailing whitespace');
    });

    it('should throw error for invalid JSON syntax', () => {
      const invalidJson = '{"invalid": json}';

      expect(() => {
        formatter.validateJsonString(invalidJson);
      }).toThrow('Invalid JSON format');
    });

    it('should throw error for JSON with wrong structure', () => {
      const wrongStructure = JSON.stringify({ wrong: 'structure' });

      expect(() => {
        formatter.validateJsonString(wrongStructure);
      }).toThrow('Output must contain \'charts_to_generate\' property');
    });

    it('should throw error for JSON with extra properties', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);
      const withExtraProps = {
        ...output,
        extraProperty: 'should not be here'
      };
      const jsonString = JSON.stringify(withExtraProps);

      expect(() => {
        formatter.validateJsonString(jsonString);
      }).toThrow('Output contains unexpected properties: extraProperty');
    });
  });

  describe('output structure validation', () => {
    it('should validate exact specification compliance', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);

      // Must have exactly two properties
      expect(Object.keys(output)).toHaveLength(2);
      expect(output).toHaveProperty('charts_to_generate');
      expect(output).toHaveProperty('full_analysis_report_markdown');

      // charts_to_generate must be array
      expect(Array.isArray(output.charts_to_generate)).toBe(true);

      // full_analysis_report_markdown must be string
      expect(typeof output.full_analysis_report_markdown).toBe('string');
    });

    it('should validate chart recommendation structure', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);

      output.charts_to_generate.forEach(chart => {
        expect(Object.keys(chart)).toHaveLength(4);
        expect(chart).toHaveProperty('title');
        expect(chart).toHaveProperty('type');
        expect(chart).toHaveProperty('xAxis');
        expect(chart).toHaveProperty('yAxis');
        
        expect(['bar', 'line', 'scatter']).toContain(chart.type);
      });
    });

    it('should ensure JSON serialization produces clean output', () => {
      const output = formatter.formatOutput(validCharts, validMarkdown);
      const jsonString = formatter.toJsonString(output);

      // Should not contain any formatting or extra characters
      expect(jsonString).not.toContain('\n');
      expect(jsonString).not.toContain('\t');
      expect(jsonString).not.toContain('  '); // double spaces
      
      // Should start with { and end with }
      expect(jsonString.startsWith('{')).toBe(true);
      expect(jsonString.endsWith('}')).toBe(true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle large number of charts', () => {
      const manyCharts = Array.from({ length: 100 }, (_, i) => ({
        title: `Chart ${i + 1}`,
        type: 'bar' as const,
        xAxis: `column${i}`,
        yAxis: `value${i}`
      }));

      const result = formatter.formatOutput(manyCharts, validMarkdown);
      expect(result.charts_to_generate).toHaveLength(100);

      const jsonString = formatter.toJsonString(result);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it('should handle very long markdown content', () => {
      const longMarkdown = '# Analysis Report\n\n' + 'This is a very long analysis report. '.repeat(1000);
      
      const result = formatter.formatOutput(validCharts, longMarkdown);
      expect(result.full_analysis_report_markdown.length).toBeGreaterThan(30000);

      const jsonString = formatter.toJsonString(result);
      expect(() => JSON.parse(jsonString)).not.toThrow();
    });

    it('should handle markdown with all types of line endings', () => {
      const mixedLineEndings = 'Line 1\nLine 2\r\nLine 3\rLine 4';
      const result = formatter.formatOutput(validCharts, mixedLineEndings);

      // Should normalize to \n only
      expect(result.full_analysis_report_markdown).not.toContain('\r\n');
      expect(result.full_analysis_report_markdown).not.toContain('\r');
      expect(result.full_analysis_report_markdown).toContain('\n');
    });
  });
});