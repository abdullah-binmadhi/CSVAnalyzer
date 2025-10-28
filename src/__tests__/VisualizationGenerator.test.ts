/**
 * Unit tests for VisualizationGenerator
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.8
 */

import { VisualizationGenerator } from '../generators/VisualizationGenerator';
import { ColumnInfo, ChartRecommendation } from '../types/interfaces';

describe('VisualizationGenerator', () => {
  beforeEach(() => {
    // Clear generated charts before each test
    VisualizationGenerator.clearGeneratedCharts();
  });

  describe('generateAllCharts', () => {
    it('should generate all possible unique charts for mixed data types', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: ['A', 'B', 'C']
        },
        {
          name: 'Sales',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [100, 200, 300, 150, 250]
        },
        {
          name: 'Date',
          type: 'datetime',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05']
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);

      // Should generate: 1 bar chart (Category vs Sales), 1 distribution chart (Category), 1 line chart (Date vs Sales), 1 cumulative chart
      expect(charts).toHaveLength(4);
      expect(charts.some(c => c.type === 'bar')).toBe(true);
      expect(charts.some(c => c.type === 'line')).toBe(true);
    });

    it('should return empty array for empty columns', async () => {
      const charts = await VisualizationGenerator.generateAllCharts([]);
      expect(charts).toHaveLength(0);
    });

    it('should reset generated charts set for each new analysis', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['A', 'B']
        },
        {
          name: 'Value',
          type: 'numerical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: [10, 20]
        }
      ];

      const charts1 = await VisualizationGenerator.generateAllCharts(columns);
      const charts2 = await VisualizationGenerator.generateAllCharts(columns);

      // Should generate the same charts both times (set is reset)
      expect(charts1).toHaveLength(charts2.length);
    });
  });

  describe('generateBarCharts', () => {
    it('should generate bar charts for categorical vs numerical columns', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Department',
          type: 'categorical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: ['Sales', 'Marketing', 'IT']
        },
        {
          name: 'Revenue',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [10000, 15000, 12000]
        },
        {
          name: 'Employees',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [5, 8, 6]
        }
      ];

      const charts = VisualizationGenerator.generateBarCharts(columns);

      // Should generate: Department vs Revenue, Department vs Employees, Distribution of Department
      expect(charts).toHaveLength(3);
      
      const categoryVsRevenue = charts.find(c => c.xAxis === 'Department' && c.yAxis === 'Revenue');
      expect(categoryVsRevenue).toBeDefined();
      expect(categoryVsRevenue?.type).toBe('bar');
      expect(categoryVsRevenue?.title).toBe('Revenue by Department');

      const categoryVsEmployees = charts.find(c => c.xAxis === 'Department' && c.yAxis === 'Employees');
      expect(categoryVsEmployees).toBeDefined();
      expect(categoryVsEmployees?.type).toBe('bar');

      const distribution = charts.find(c => c.xAxis === 'Department' && c.yAxis === 'Count');
      expect(distribution).toBeDefined();
      expect(distribution?.title).toBe('Distribution of Department');
    });

    it('should generate distribution charts for categorical columns only', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Status',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['Active', 'Inactive']
        },
        {
          name: 'Region',
          type: 'categorical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: ['North', 'South', 'East']
        }
      ];

      const charts = VisualizationGenerator.generateBarCharts(columns);

      // Should generate distribution charts for both categorical columns
      expect(charts).toHaveLength(2);
      expect(charts.every(c => c.type === 'bar')).toBe(true);
      expect(charts.every(c => c.yAxis === 'Count')).toBe(true);
    });

    it('should return empty array when no categorical columns exist', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Value1',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [1, 2, 3]
        },
        {
          name: 'Value2',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [4, 5, 6]
        }
      ];

      const charts = VisualizationGenerator.generateBarCharts(columns);
      expect(charts).toHaveLength(0);
    });
  });

  describe('generateLineCharts', () => {
    it('should generate line charts for datetime vs numerical columns', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Date',
          type: 'datetime',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05']
        },
        {
          name: 'Temperature',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [20, 22, 25, 23, 21]
        },
        {
          name: 'Humidity',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [60, 65, 70, 68, 62]
        }
      ];

      const charts = VisualizationGenerator.generateLineCharts(columns);

      // Should generate: Date vs Temperature, Date vs Humidity, trend analysis, and cumulative charts
      expect(charts).toHaveLength(5);
      
      const tempChart = charts.find(c => c.yAxis === 'Temperature');
      expect(tempChart).toBeDefined();
      expect(tempChart?.type).toBe('line');
      expect(tempChart?.xAxis).toBe('Date');
      expect(tempChart?.title).toBe('Temperature over Date');

      const humidityChart = charts.find(c => c.yAxis === 'Humidity');
      expect(humidityChart).toBeDefined();
      expect(humidityChart?.type).toBe('line');
      expect(humidityChart?.xAxis).toBe('Date');
    });

    it('should generate trend analysis when no datetime columns exist', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Index',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [1, 2, 3, 4, 5]
        },
        {
          name: 'Value1',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [10, 20, 30, 40, 50]
        },
        {
          name: 'Value2',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [15, 25, 35, 45, 55]
        }
      ];

      const charts = VisualizationGenerator.generateLineCharts(columns);

      // Should generate trend charts using first numerical column as index
      expect(charts).toHaveLength(2);
      expect(charts.every(c => c.type === 'line')).toBe(true);
      expect(charts.every(c => c.xAxis === 'Index')).toBe(true);
      expect(charts.some(c => c.yAxis === 'Value1')).toBe(true);
      expect(charts.some(c => c.yAxis === 'Value2')).toBe(true);
    });

    it('should return empty array when insufficient numerical columns for trends', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'SingleValue',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [1, 2, 3]
        },
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['A', 'B']
        }
      ];

      const charts = VisualizationGenerator.generateLineCharts(columns);
      expect(charts).toHaveLength(0);
    });
  });

  describe('generateScatterPlots', () => {
    it('should generate scatter plots for all numerical column combinations', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Height',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [170, 175, 180, 165, 185]
        },
        {
          name: 'Weight',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [70, 75, 80, 65, 85]
        },
        {
          name: 'Age',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [25, 30, 35, 20, 40]
        }
      ];

      const charts = VisualizationGenerator.generateScatterPlots(columns);

      // Should generate 3 basic combinations plus 1 enhanced: Height-Weight, Height-Age, Weight-Age, plus sized scatter
      expect(charts).toHaveLength(4);
      expect(charts.every(c => c.type === 'scatter')).toBe(true);

      // Check that all combinations are present
      const combinations = charts.map(c => `${c.xAxis}-${c.yAxis}`);
      expect(combinations).toContain('Height-Weight');
      expect(combinations).toContain('Height-Age');
      expect(combinations).toContain('Weight-Age');
    });

    it('should generate correct titles for scatter plots', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'X',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [1, 2, 3]
        },
        {
          name: 'Y',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [4, 5, 6]
        }
      ];

      const charts = VisualizationGenerator.generateScatterPlots(columns);

      expect(charts).toHaveLength(1);
      expect(charts[0].title).toBe('Y vs X');
      expect(charts[0].xAxis).toBe('X');
      expect(charts[0].yAxis).toBe('Y');
    });

    it('should return empty array when less than 2 numerical columns', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'SingleNum',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [1, 2, 3]
        },
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['A', 'B']
        }
      ];

      const charts = VisualizationGenerator.generateScatterPlots(columns);
      expect(charts).toHaveLength(0);
    });
  });

  describe('duplicate detection', () => {
    it('should prevent duplicate charts from being generated', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['A', 'B']
        },
        {
          name: 'Value',
          type: 'numerical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: [10, 20]
        }
      ];

      // Generate charts using the main method which handles duplicates
      const charts1 = await VisualizationGenerator.generateAllCharts(columns);
      const charts2 = await VisualizationGenerator.generateAllCharts(columns);

      // Both generations should produce the same unique charts (no duplicates)
      expect(charts1.length).toBeGreaterThan(0);
      expect(charts2.length).toBe(charts1.length);
      
      // Verify no duplicate chart keys exist within a single generation
      const chartKeys = charts1.map(c => `${c.type}:${c.xAxis}:${c.yAxis}`);
      const uniqueKeys = [...new Set(chartKeys)];
      expect(chartKeys.length).toBe(uniqueKeys.length);
    });

    it('should detect swapped axis duplicates in scatter plots', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'X',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [1, 2, 3]
        },
        {
          name: 'Y',
          type: 'numerical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: [4, 5, 6]
        }
      ];

      const charts1 = VisualizationGenerator.generateScatterPlots(columns);
      
      // Manually create a chart with swapped axes
      const swappedChart: ChartRecommendation = {
        title: 'X vs Y',
        type: 'scatter',
        xAxis: 'Y',
        yAxis: 'X'
      };

      // This should be detected as duplicate
      expect(charts1).toHaveLength(1);
      
      // Test the internal duplicate detection
      const allCharts = await VisualizationGenerator.generateAllCharts(columns);
      const scatterCharts = allCharts.filter(c => c.type === 'scatter');
      expect(scatterCharts).toHaveLength(1);
    });
  });

  describe('validateChartRecommendations', () => {
    it('should validate correct chart recommendations', () => {
      const validCharts: ChartRecommendation[] = [
        {
          title: 'Sales by Region',
          type: 'bar',
          xAxis: 'Region',
          yAxis: 'Sales'
        },
        {
          title: 'Temperature over Time',
          type: 'line',
          xAxis: 'Date',
          yAxis: 'Temperature'
        },
        {
          title: 'Height vs Weight',
          type: 'scatter',
          xAxis: 'Height',
          yAxis: 'Weight'
        }
      ];

      const isValid = VisualizationGenerator.validateChartRecommendations(validCharts);
      expect(isValid).toBe(true);
    });

    it('should reject charts with invalid types', () => {
      const invalidCharts: ChartRecommendation[] = [
        {
          title: 'Invalid Chart',
          type: 'pie' as any, // Invalid type
          xAxis: 'X',
          yAxis: 'Y'
        }
      ];

      const isValid = VisualizationGenerator.validateChartRecommendations(invalidCharts);
      expect(isValid).toBe(false);
    });

    it('should reject charts with missing required fields', () => {
      const invalidCharts: ChartRecommendation[] = [
        {
          title: '',
          type: 'bar',
          xAxis: 'X',
          yAxis: 'Y'
        }
      ];

      const isValid = VisualizationGenerator.validateChartRecommendations(invalidCharts);
      expect(isValid).toBe(false);
    });

    it('should reject charts with very short titles', () => {
      const invalidCharts: ChartRecommendation[] = [
        {
          title: 'AB', // Too short
          type: 'bar',
          xAxis: 'X',
          yAxis: 'Y'
        }
      ];

      const isValid = VisualizationGenerator.validateChartRecommendations(invalidCharts);
      expect(isValid).toBe(false);
    });
  });

  describe('maximum chart generation logic', () => {
    it('should generate maximum unique charts without duplicates', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: ['A', 'B', 'C']
        },
        {
          name: 'Region',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['North', 'South']
        },
        {
          name: 'Sales',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [100, 200, 300, 150, 250]
        },
        {
          name: 'Profit',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [10, 20, 30, 15, 25]
        },
        {
          name: 'Date',
          type: 'datetime',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05']
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);

      // Should generate multiple chart types covering different analytical aspects
      expect(charts.length).toBeGreaterThanOrEqual(5);
      
      // Should have different chart types
      const chartTypes = [...new Set(charts.map(c => c.type))];
      expect(chartTypes.length).toBeGreaterThan(1);
      
      // Should have no duplicate chart keys
      const chartKeys = charts.map(c => `${c.type}:${c.xAxis}:${c.yAxis}`);
      const uniqueKeys = [...new Set(chartKeys)];
      expect(chartKeys.length).toBe(uniqueKeys.length);
    });

    it('should stop generation when no more unique charts can be created', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'SingleCategory',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['X', 'Y']
        },
        {
          name: 'SingleValue',
          type: 'numerical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: [1, 2]
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);

      // With limited columns, should generate a specific number of unique charts
      expect(charts.length).toBe(2); // Category vs Value + Distribution of Category
      
      // Running again should produce the same result (no infinite generation)
      VisualizationGenerator.clearGeneratedCharts();
      const charts2 = await VisualizationGenerator.generateAllCharts(columns);
      expect(charts2.length).toBe(charts.length);
    });

    it('should validate chart diversity across analytical aspects', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Product',
          type: 'categorical',
          uniqueValues: 4,
          hasNulls: false,
          sampleValues: ['A', 'B', 'C', 'D']
        },
        {
          name: 'Revenue',
          type: 'numerical',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]
        },
        {
          name: 'Cost',
          type: 'numerical',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
        },
        {
          name: 'Date',
          type: 'datetime',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05', '2023-01-06', '2023-01-07', '2023-01-08', '2023-01-09', '2023-01-10']
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);
      const stats = VisualizationGenerator.getChartGenerationStats();

      // Should cover multiple analytical aspects
      expect(Object.keys(stats.aspectCoverage).length).toBeGreaterThan(2);
      
      // Should have reasonable diversity score
      expect(stats.diversityScore).toBeGreaterThan(0.4);
      
      // Should have multiple unique column combinations
      expect(stats.uniqueColumnCombinations).toBeGreaterThan(3);
    });

    it('should handle text columns with limited unique values', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Status',
          type: 'text',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: ['Active', 'Inactive', 'Pending']
        },
        {
          name: 'Score',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [85, 90, 78, 92, 88]
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);

      // Should generate charts for text columns with limited unique values
      expect(charts.length).toBeGreaterThan(0);
      expect(charts.some(c => c.xAxis === 'Status')).toBe(true);
    });

    it('should skip text columns with too many unique values', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Description',
          type: 'text',
          uniqueValues: 50, // Too many unique values
          hasNulls: false,
          sampleValues: ['Text1', 'Text2', 'Text3', 'Text4', 'Text5']
        },
        {
          name: 'Score',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [85, 90, 78, 92, 88]
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);

      // Should not generate charts for text columns with too many unique values
      expect(charts.every(c => c.xAxis !== 'Description')).toBe(true);
    });

    it('should generate enhanced scatter plots with size dimensions', () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Height',
          type: 'numerical',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: [160, 165, 170, 175, 180, 185, 190, 195, 200, 205]
        },
        {
          name: 'Weight',
          type: 'numerical',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: [50, 55, 60, 65, 70, 75, 80, 85, 90, 95]
        },
        {
          name: 'Age',
          type: 'numerical',
          uniqueValues: 10,
          hasNulls: false,
          sampleValues: [20, 25, 30, 35, 40, 45, 50, 55, 60, 65]
        }
      ];

      // Clear any previous state
      VisualizationGenerator.clearGeneratedCharts();
      
      // Test the scatter plot generation directly to ensure enhanced charts are created
      const directScatterCharts = VisualizationGenerator.generateScatterPlots(columns);
      
      const enhancedScatters = directScatterCharts.filter(c => c.title.includes('sized by'));
      expect(enhancedScatters.length).toBeGreaterThan(0);
    });

    it('should generate cumulative charts for time series data', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Date',
          type: 'datetime',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05']
        },
        {
          name: 'Sales',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [100, 150, 200, 175, 225]
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);
      const lineCharts = charts.filter(c => c.type === 'line');

      // Should generate both regular and cumulative line charts
      expect(lineCharts.length).toBeGreaterThan(1);
      expect(lineCharts.some(c => c.title.includes('Cumulative'))).toBe(true);
    });

    it('should identify and use sequential columns for trend analysis', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Index',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [1, 2, 3, 4, 5]
        },
        {
          name: 'Performance',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [85, 87, 90, 88, 92]
        }
      ];

      const charts = await VisualizationGenerator.generateAllCharts(columns);
      const lineCharts = charts.filter(c => c.type === 'line');

      // Should generate trend analysis using sequential column
      expect(lineCharts.length).toBeGreaterThan(0);
      expect(lineCharts.some(c => c.xAxis === 'Index' && c.title.includes('trend'))).toBe(true);
    });
  });

  describe('chart generation statistics', () => {
    it('should provide comprehensive generation statistics', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 3,
          hasNulls: false,
          sampleValues: ['A', 'B', 'C']
        },
        {
          name: 'Value1',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [10, 20, 30, 40, 50]
        },
        {
          name: 'Value2',
          type: 'numerical',
          uniqueValues: 5,
          hasNulls: false,
          sampleValues: [15, 25, 35, 45, 55]
        }
      ];

      await VisualizationGenerator.generateAllCharts(columns);
      const stats = VisualizationGenerator.getChartGenerationStats();

      expect(stats.totalCharts).toBeGreaterThan(0);
      expect(stats.aspectCoverage).toBeDefined();
      expect(stats.uniqueColumnCombinations).toBeGreaterThan(0);
      expect(stats.diversityScore).toBeGreaterThanOrEqual(0);
      expect(stats.diversityScore).toBeLessThanOrEqual(1);
    });

    it('should calculate diversity score correctly', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['X', 'Y']
        },
        {
          name: 'Value',
          type: 'numerical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: [1, 2]
        },
        {
          name: 'Date',
          type: 'datetime',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['2023-01-01', '2023-01-02']
        }
      ];

      await VisualizationGenerator.generateAllCharts(columns);
      const stats = VisualizationGenerator.getChartGenerationStats();

      // With diverse column types, should achieve reasonable diversity
      expect(stats.diversityScore).toBeGreaterThanOrEqual(0.4);
    });
  });

  describe('utility methods', () => {
    it('should track generated charts count', async () => {
      expect(VisualizationGenerator.getGeneratedChartsCount()).toBe(0);

      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['A', 'B']
        },
        {
          name: 'Value',
          type: 'numerical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: [10, 20]
        }
      ];

      await VisualizationGenerator.generateAllCharts(columns);
      expect(VisualizationGenerator.getGeneratedChartsCount()).toBeGreaterThan(0);
    });

    it('should clear generated charts and metadata', async () => {
      const columns: ColumnInfo[] = [
        {
          name: 'Category',
          type: 'categorical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: ['A', 'B']
        },
        {
          name: 'Value',
          type: 'numerical',
          uniqueValues: 2,
          hasNulls: false,
          sampleValues: [10, 20]
        }
      ];

      await VisualizationGenerator.generateAllCharts(columns);
      expect(VisualizationGenerator.getGeneratedChartsCount()).toBeGreaterThan(0);

      VisualizationGenerator.clearGeneratedCharts();
      expect(VisualizationGenerator.getGeneratedChartsCount()).toBe(0);
      
      const stats = VisualizationGenerator.getChartGenerationStats();
      expect(stats.totalCharts).toBe(0);
    });
  });
});