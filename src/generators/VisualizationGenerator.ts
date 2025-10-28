/**
 * Visualization Generator for creating comprehensive chart recommendations
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
 */

import { ColumnInfo, ChartRecommendation } from '../types/interfaces';
import { ErrorHandler, ChartGenerationError, InsufficientDataError } from '../errors/AnalysisErrors';

/**
 * Analytical aspects for chart diversity validation
 */
enum AnalyticalAspect {
  DISTRIBUTION = 'distribution',
  COMPARISON = 'comparison', 
  CORRELATION = 'correlation',
  TREND = 'trend',
  COMPOSITION = 'composition'
}

/**
 * Chart generation metadata for tracking diversity
 */
interface ChartMetadata {
  chart: ChartRecommendation;
  aspect: AnalyticalAspect;
  columnTypes: string[];
}

/**
 * Visualization Generator class for creating all possible unique chart recommendations
 */
export class VisualizationGenerator {
  private static generatedCharts: Set<string> = new Set();
  private static chartMetadata: ChartMetadata[] = [];

  /**
   * Generates all possible unique visualization recommendations with maximum coverage and error handling
   * Requirements: 2.1, 2.7, 2.8
   * 
   * OPTIMIZED VERSION: Improved performance through early filtering and efficient algorithms
   */
  public static async generateAllCharts(columns: ColumnInfo[]): Promise<ChartRecommendation[]> {
    return ErrorHandler.withSyncTimeout(
      () => {
        try {
          // Validate input columns
          this.validateColumnsForChartGeneration(columns);
          
          // Reset tracking for each new analysis
          this.generatedCharts.clear();
          this.chartMetadata = [];
          
          // Pre-filter columns by type for performance optimization
          const columnsByType = this.categorizeColumnsByType(columns);
          
          // Early exit if no viable columns for chart generation
          if (this.shouldSkipChartGeneration(columnsByType)) {
            return this.generateFallbackCharts(columns);
          }
          
          const charts: ChartRecommendation[] = [];
          
          // Generate charts with optimized algorithms
          const allPotentialCharts = [
            ...this.optimizedGenerateBarCharts(columnsByType),
            ...this.optimizedGenerateLineCharts(columnsByType),
            ...this.optimizedGenerateScatterPlots(columnsByType)
          ];
          
          // Batch process chart diversity validation for better performance
          const validatedCharts = this.batchValidateChartDiversity(allPotentialCharts, columns);
          charts.push(...validatedCharts);
          
          // Ensure we have at least some charts
          if (charts.length === 0) {
            return this.generateFallbackCharts(columns);
          }
          
          return charts;
        } catch (error) {
          console.warn('Chart generation failed, attempting fallback:', error);
          return this.generateFallbackCharts(columns);
        }
      },
      15000, // Reduced timeout due to optimizations
      'chart generation'
    );
  }

  /**
   * Generates bar chart recommendations for categorical vs numeric analysis
   * Requirements: 2.4, 2.7
   */
  public static generateBarCharts(columns: ColumnInfo[]): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    const numericalColumns = columns.filter(col => col.type === 'numerical');
    const textColumns = columns.filter(col => col.type === 'text');

    // Generate categorical vs numerical bar charts
    for (const catCol of categoricalColumns) {
      for (const numCol of numericalColumns) {
        const chart: ChartRecommendation = {
          title: `${numCol.name} by ${catCol.name}`,
          type: 'bar',
          xAxis: catCol.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate distribution charts for categorical columns (count by category)
    for (const catCol of categoricalColumns) {
      const chart: ChartRecommendation = {
        title: `Distribution of ${catCol.name}`,
        type: 'bar',
        xAxis: catCol.name,
        yAxis: 'Count'
      };

      if (this.isUniqueChart(chart)) {
        charts.push(chart);
      }
    }

    // Generate distribution charts for text columns with limited unique values
    for (const textCol of textColumns) {
      if (textCol.uniqueValues && textCol.uniqueValues <= 20) {
        const chart: ChartRecommendation = {
          title: `Distribution of ${textCol.name}`,
          type: 'bar',
          xAxis: textCol.name,
          yAxis: 'Count'
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate text vs numerical bar charts (if text has limited unique values)
    for (const textCol of textColumns) {
      if (textCol.uniqueValues && textCol.uniqueValues <= 20) {
        for (const numCol of numericalColumns) {
          const chart: ChartRecommendation = {
            title: `${numCol.name} by ${textCol.name}`,
            type: 'bar',
            xAxis: textCol.name,
            yAxis: numCol.name
          };

          if (this.isUniqueChart(chart)) {
            charts.push(chart);
          }
        }
      }
    }

    return charts;
  }

  /**
   * Generates line chart recommendations for time-series and trend analysis
   * Requirements: 2.5, 2.7
   */
  public static generateLineCharts(columns: ColumnInfo[]): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const datetimeColumns = columns.filter(col => col.type === 'datetime');
    const numericalColumns = columns.filter(col => col.type === 'numerical');

    // Generate time-series line charts (datetime vs numerical)
    for (const dateCol of datetimeColumns) {
      for (const numCol of numericalColumns) {
        const chart: ChartRecommendation = {
          title: `${numCol.name} over ${dateCol.name}`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate trend analysis using sequential/index columns
    const sequentialColumns = numericalColumns.filter(col => this.isSequentialColumn(col));
    for (const seqCol of sequentialColumns) {
      for (const numCol of numericalColumns) {
        if (numCol.name !== seqCol.name) {
          const chart: ChartRecommendation = {
            title: `${numCol.name} trend over ${seqCol.name}`,
            type: 'line',
            xAxis: seqCol.name,
            yAxis: numCol.name
          };

          if (this.isUniqueChart(chart)) {
            charts.push(chart);
          }
        }
      }
    }

    // Generate trend analysis for numerical columns (if no datetime or sequential available)
    if (datetimeColumns.length === 0 && sequentialColumns.length === 0 && numericalColumns.length >= 2) {
      // Use the first numerical column as a proxy for sequence/index
      const indexColumn = numericalColumns[0];
      
      for (let i = 1; i < numericalColumns.length; i++) {
        const numCol = numericalColumns[i];
        const chart: ChartRecommendation = {
          title: `${numCol.name} trend over ${indexColumn.name}`,
          type: 'line',
          xAxis: indexColumn.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate cumulative/running total charts for numerical columns
    for (const numCol of numericalColumns) {
      if (datetimeColumns.length > 0) {
        const dateCol = datetimeColumns[0];
        const chart: ChartRecommendation = {
          title: `Cumulative ${numCol.name} over ${dateCol.name}`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: `Cumulative ${numCol.name}`
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    return charts;
  }

  /**
   * Generates scatter plot recommendations for numeric-numeric correlations
   * Requirements: 2.6, 2.7
   */
  public static generateScatterPlots(columns: ColumnInfo[]): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const numericalColumns = columns.filter(col => col.type === 'numerical');

    // Generate all possible numeric-numeric combinations
    for (let i = 0; i < numericalColumns.length; i++) {
      for (let j = i + 1; j < numericalColumns.length; j++) {
        const xCol = numericalColumns[i];
        const yCol = numericalColumns[j];

        const chart: ChartRecommendation = {
          title: `${yCol.name} vs ${xCol.name}`,
          type: 'scatter',
          xAxis: xCol.name,
          yAxis: yCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate scatter plots with size/color dimensions (simulated with additional numerical columns)
    if (numericalColumns.length >= 3) {
      for (let i = 0; i < numericalColumns.length; i++) {
        for (let j = i + 1; j < numericalColumns.length; j++) {
          for (let k = j + 1; k < numericalColumns.length; k++) {
            const xCol = numericalColumns[i];
            const yCol = numericalColumns[j];
            const sizeCol = numericalColumns[k];

            const chart: ChartRecommendation = {
              title: `${yCol.name} vs ${xCol.name} (sized by ${sizeCol.name})`,
              type: 'scatter',
              xAxis: xCol.name,
              yAxis: yCol.name
            };

            if (this.isUniqueChart(chart)) {
              charts.push(chart);
            }
          }
        }
      }
    }

    return charts;
  }

  /**
   * Checks if a chart is unique (not already generated)
   * Requirements: 2.8
   */
  private static isUniqueChart(chart: ChartRecommendation): boolean {
    const chartKey = this.generateChartKey(chart);
    return !this.generatedCharts.has(chartKey);
  }

  /**
   * Adds a chart to the generated charts set
   * Requirements: 2.8
   */
  private static addToGeneratedCharts(chart: ChartRecommendation): void {
    const chartKey = this.generateChartKey(chart);
    this.generatedCharts.add(chartKey);
  }

  /**
   * Generates a unique key for a chart to detect duplicates
   * Requirements: 2.8
   */
  private static generateChartKey(chart: ChartRecommendation): string {
    // For enhanced charts (with additional dimensions), include title to differentiate
    if (chart.title.includes('sized by') || chart.title.includes('Cumulative')) {
      return `${chart.type}:${chart.xAxis}:${chart.yAxis}:${chart.title}`;
    }
    
    // Create a normalized key that accounts for axis swapping in scatter plots
    if (chart.type === 'scatter') {
      // For scatter plots, normalize by sorting axes to catch swapped duplicates
      const axes = [chart.xAxis, chart.yAxis].sort();
      return `${chart.type}:${axes[0]}:${axes[1]}`;
    }
    
    // For bar and line charts, order matters (x vs y axis has meaning)
    return `${chart.type}:${chart.xAxis}:${chart.yAxis}`;
  }

  /**
   * Validates that chart recommendations meet requirements
   * Requirements: 2.3
   */
  public static validateChartRecommendations(charts: ChartRecommendation[]): boolean {
    for (const chart of charts) {
      // Validate chart type is one of the allowed types
      if (!['bar', 'line', 'scatter'].includes(chart.type)) {
        return false;
      }

      // Validate required fields are present
      if (!chart.title || !chart.xAxis || !chart.yAxis) {
        return false;
      }

      // Validate title is descriptive
      if (chart.title.length < 3) {
        return false;
      }
    }

    return true;
  }

  /**
   * Gets the count of generated charts for testing purposes
   */
  public static getGeneratedChartsCount(): number {
    return this.generatedCharts.size;
  }

  /**
   * Validates chart diversity to ensure different analytical aspects are covered
   * Requirements: 2.7
   */
  private static validateChartDiversity(chart: ChartRecommendation, columns: ColumnInfo[]): boolean {
    if (!this.isUniqueChart(chart)) {
      return false;
    }
    
    const aspect = this.determineAnalyticalAspect(chart, columns);
    const columnTypes = this.getColumnTypesForChart(chart, columns);
    
    // Check if this combination of aspect and column types adds analytical value
    const isDiverse = this.addsDiverseAnalyticalValue(aspect, columnTypes, chart);
    
    if (isDiverse) {
      this.addToGeneratedCharts(chart);
      this.chartMetadata.push({
        chart,
        aspect,
        columnTypes
      });
    }
    
    return isDiverse;
  }

  /**
   * Determines the analytical aspect of a chart
   * Requirements: 2.7
   */
  private static determineAnalyticalAspect(chart: ChartRecommendation, columns: ColumnInfo[]): AnalyticalAspect {
    const xColumn = columns.find(col => col.name === chart.xAxis);
    const yColumn = columns.find(col => col.name === chart.yAxis);
    
    if (!xColumn || !yColumn) {
      return AnalyticalAspect.COMPARISON;
    }
    
    switch (chart.type) {
      case 'bar':
        if (chart.yAxis === 'Count') {
          return AnalyticalAspect.DISTRIBUTION;
        }
        if (xColumn.type === 'categorical' && yColumn.type === 'numerical') {
          return AnalyticalAspect.COMPARISON;
        }
        return AnalyticalAspect.COMPOSITION;
        
      case 'line':
        if (xColumn.type === 'datetime' || this.isSequentialColumn(xColumn)) {
          return AnalyticalAspect.TREND;
        }
        return AnalyticalAspect.COMPARISON;
        
      case 'scatter':
        return AnalyticalAspect.CORRELATION;
        
      default:
        return AnalyticalAspect.COMPARISON;
    }
  }

  /**
   * Gets column types involved in a chart
   * Requirements: 2.7
   */
  private static getColumnTypesForChart(chart: ChartRecommendation, columns: ColumnInfo[]): string[] {
    const xColumn = columns.find(col => col.name === chart.xAxis);
    const yColumn = columns.find(col => col.name === chart.yAxis);
    
    const types: string[] = [];
    if (xColumn) types.push(xColumn.type);
    if (yColumn && chart.yAxis !== 'Count') types.push(yColumn.type);
    
    return types.sort(); // Sort for consistent comparison
  }

  /**
   * Checks if a chart adds diverse analytical value
   * Requirements: 2.7
   */
  private static addsDiverseAnalyticalValue(aspect: AnalyticalAspect, columnTypes: string[], chart: ChartRecommendation): boolean {
    // Always allow the first chart of each analytical aspect
    const existingAspects = this.chartMetadata.map(meta => meta.aspect);
    if (!existingAspects.includes(aspect)) {
      return true;
    }
    
    // Allow enhanced charts (with additional dimensions like "sized by")
    if (chart.title.includes('sized by') || chart.title.includes('Cumulative')) {
      return true;
    }
    
    // For existing aspects, check if column type combination is new
    const existingCombinations = this.chartMetadata
      .filter(meta => meta.aspect === aspect)
      .map(meta => meta.columnTypes.join('-'));
    
    const newCombination = columnTypes.join('-');
    return !existingCombinations.includes(newCombination);
  }

  /**
   * Checks if a column represents sequential data (like index or ID)
   * Requirements: 2.7
   */
  private static isSequentialColumn(column: ColumnInfo): boolean {
    if (column.type !== 'numerical') return false;
    
    // Check if column name suggests sequential data
    const sequentialNames = ['index', 'id', 'sequence', 'order', 'rank', 'position'];
    const columnNameLower = column.name.toLowerCase();
    
    return sequentialNames.some(name => columnNameLower.includes(name));
  }

  /**
   * Gets comprehensive chart generation statistics
   * Requirements: 2.7, 2.8
   */
  public static getChartGenerationStats(): {
    totalCharts: number;
    aspectCoverage: Record<string, number>;
    uniqueColumnCombinations: number;
    diversityScore: number;
  } {
    const aspectCounts: Record<string, number> = {};
    const uniqueCombinations = new Set<string>();
    
    this.chartMetadata.forEach(meta => {
      aspectCounts[meta.aspect] = (aspectCounts[meta.aspect] || 0) + 1;
      uniqueCombinations.add(meta.columnTypes.join('-'));
    });
    
    // Calculate diversity score (0-1, higher is more diverse)
    const totalAspects = Object.keys(AnalyticalAspect).length;
    const coveredAspects = Object.keys(aspectCounts).length;
    const diversityScore = coveredAspects / totalAspects;
    
    return {
      totalCharts: this.chartMetadata.length,
      aspectCoverage: aspectCounts,
      uniqueColumnCombinations: uniqueCombinations.size,
      diversityScore
    };
  }

  /**
   * Clears the generated charts set and metadata (useful for testing)
   */
  public static clearGeneratedCharts(): void {
    this.generatedCharts.clear();
    this.chartMetadata = [];
  }

  /**
   * OPTIMIZATION: Pre-categorizes columns by type for efficient processing
   * Requirements: 2.7 (Performance optimization)
   */
  private static categorizeColumnsByType(columns: ColumnInfo[]): {
    numerical: ColumnInfo[];
    categorical: ColumnInfo[];
    datetime: ColumnInfo[];
    text: ColumnInfo[];
    textLimited: ColumnInfo[];
  } {
    const result = {
      numerical: [] as ColumnInfo[],
      categorical: [] as ColumnInfo[],
      datetime: [] as ColumnInfo[],
      text: [] as ColumnInfo[],
      textLimited: [] as ColumnInfo[]
    };

    for (const col of columns) {
      switch (col.type) {
        case 'numerical':
          result.numerical.push(col);
          break;
        case 'categorical':
          result.categorical.push(col);
          break;
        case 'datetime':
          result.datetime.push(col);
          break;
        case 'text':
          result.text.push(col);
          if (col.uniqueValues && col.uniqueValues <= 20) {
            result.textLimited.push(col);
          }
          break;
      }
    }

    return result;
  }

  /**
   * OPTIMIZATION: Determines if chart generation should be skipped early
   * Requirements: 2.7 (Performance optimization)
   */
  private static shouldSkipChartGeneration(columnsByType: ReturnType<typeof this.categorizeColumnsByType>): boolean {
    const { numerical, categorical, datetime, textLimited } = columnsByType;
    
    // Skip if no viable columns for any chart type
    return numerical.length === 0 && 
           categorical.length === 0 && 
           datetime.length === 0 && 
           textLimited.length === 0;
  }

  /**
   * OPTIMIZATION: Optimized bar chart generation using pre-categorized columns
   * Requirements: 2.4, 2.7 (Performance optimization)
   */
  private static optimizedGenerateBarCharts(columnsByType: ReturnType<typeof this.categorizeColumnsByType>): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const { numerical, categorical, textLimited } = columnsByType;

    // Generate categorical vs numerical bar charts
    for (const catCol of categorical) {
      for (const numCol of numerical) {
        const chart: ChartRecommendation = {
          title: `${numCol.name} by ${catCol.name}`,
          type: 'bar',
          xAxis: catCol.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate distribution charts for categorical columns
    for (const catCol of categorical) {
      const chart: ChartRecommendation = {
        title: `Distribution of ${catCol.name}`,
        type: 'bar',
        xAxis: catCol.name,
        yAxis: 'Count'
      };

      if (this.isUniqueChart(chart)) {
        charts.push(chart);
      }
    }

    // Generate charts for limited text columns
    for (const textCol of textLimited) {
      // Distribution chart
      const distChart: ChartRecommendation = {
        title: `Distribution of ${textCol.name}`,
        type: 'bar',
        xAxis: textCol.name,
        yAxis: 'Count'
      };

      if (this.isUniqueChart(distChart)) {
        charts.push(distChart);
      }

      // Text vs numerical charts
      for (const numCol of numerical) {
        const chart: ChartRecommendation = {
          title: `${numCol.name} by ${textCol.name}`,
          type: 'bar',
          xAxis: textCol.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    return charts;
  }

  /**
   * OPTIMIZATION: Optimized line chart generation using pre-categorized columns
   * Requirements: 2.5, 2.7 (Performance optimization)
   */
  private static optimizedGenerateLineCharts(columnsByType: ReturnType<typeof this.categorizeColumnsByType>): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const { numerical, datetime } = columnsByType;

    // Generate time-series line charts
    for (const dateCol of datetime) {
      for (const numCol of numerical) {
        const chart: ChartRecommendation = {
          title: `${numCol.name} over ${dateCol.name}`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate trend analysis using sequential columns (optimized detection)
    const sequentialColumns = numerical.filter(col => this.isSequentialColumn(col));
    for (const seqCol of sequentialColumns) {
      for (const numCol of numerical) {
        if (numCol.name !== seqCol.name) {
          const chart: ChartRecommendation = {
            title: `${numCol.name} trend over ${seqCol.name}`,
            type: 'line',
            xAxis: seqCol.name,
            yAxis: numCol.name
          };

          if (this.isUniqueChart(chart)) {
            charts.push(chart);
          }
        }
      }
    }

    // Generate fallback trend analysis if no datetime or sequential columns
    if (datetime.length === 0 && sequentialColumns.length === 0 && numerical.length >= 2) {
      const indexColumn = numerical[0];
      
      for (let i = 1; i < numerical.length; i++) {
        const numCol = numerical[i];
        const chart: ChartRecommendation = {
          title: `${numCol.name} trend over ${indexColumn.name}`,
          type: 'line',
          xAxis: indexColumn.name,
          yAxis: numCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate cumulative charts for datetime columns
    if (datetime.length > 0) {
      const dateCol = datetime[0];
      for (const numCol of numerical) {
        const chart: ChartRecommendation = {
          title: `Cumulative ${numCol.name} over ${dateCol.name}`,
          type: 'line',
          xAxis: dateCol.name,
          yAxis: `Cumulative ${numCol.name}`
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    return charts;
  }

  /**
   * OPTIMIZATION: Optimized scatter plot generation using pre-categorized columns
   * Requirements: 2.6, 2.7 (Performance optimization)
   */
  private static optimizedGenerateScatterPlots(columnsByType: ReturnType<typeof this.categorizeColumnsByType>): ChartRecommendation[] {
    const charts: ChartRecommendation[] = [];
    const { numerical } = columnsByType;

    // Early exit if insufficient numerical columns
    if (numerical.length < 2) {
      return charts;
    }

    // Generate basic numeric-numeric combinations
    for (let i = 0; i < numerical.length; i++) {
      for (let j = i + 1; j < numerical.length; j++) {
        const xCol = numerical[i];
        const yCol = numerical[j];

        const chart: ChartRecommendation = {
          title: `${yCol.name} vs ${xCol.name}`,
          type: 'scatter',
          xAxis: xCol.name,
          yAxis: yCol.name
        };

        if (this.isUniqueChart(chart)) {
          charts.push(chart);
        }
      }
    }

    // Generate enhanced scatter plots with size dimensions (only if 3+ numerical columns)
    if (numerical.length >= 3) {
      for (let i = 0; i < numerical.length && i < 3; i++) { // Limit to first 3 for performance
        for (let j = i + 1; j < numerical.length && j < 4; j++) {
          for (let k = j + 1; k < numerical.length && k < 5; k++) {
            const xCol = numerical[i];
            const yCol = numerical[j];
            const sizeCol = numerical[k];

            const chart: ChartRecommendation = {
              title: `${yCol.name} vs ${xCol.name} (sized by ${sizeCol.name})`,
              type: 'scatter',
              xAxis: xCol.name,
              yAxis: yCol.name
            };

            if (this.isUniqueChart(chart)) {
              charts.push(chart);
            }
          }
        }
      }
    }

    return charts;
  }

  /**
   * OPTIMIZATION: Batch validates chart diversity for better performance
   * Requirements: 2.7 (Performance optimization)
   */
  private static batchValidateChartDiversity(charts: ChartRecommendation[], columns: ColumnInfo[]): ChartRecommendation[] {
    const validatedCharts: ChartRecommendation[] = [];
    
    // Pre-compute column lookup for performance
    const columnLookup = new Map<string, ColumnInfo>();
    for (const col of columns) {
      columnLookup.set(col.name, col);
    }

    for (const chart of charts) {
      try {
        if (this.fastValidateChartDiversity(chart, columnLookup)) {
          validatedCharts.push(chart);
        }
      } catch (error) {
        console.warn(`Failed to validate chart diversity for '${chart.title}':`, error);
        // Continue with other charts
      }
    }

    return validatedCharts;
  }

  /**
   * OPTIMIZATION: Fast chart diversity validation using lookup map
   * Requirements: 2.7 (Performance optimization)
   */
  private static fastValidateChartDiversity(chart: ChartRecommendation, columnLookup: Map<string, ColumnInfo>): boolean {
    if (!this.isUniqueChart(chart)) {
      return false;
    }
    
    const xColumn = columnLookup.get(chart.xAxis);
    const yColumn = columnLookup.get(chart.yAxis);
    
    if (!xColumn || (!yColumn && chart.yAxis !== 'Count')) {
      return false;
    }
    
    const aspect = this.fastDetermineAnalyticalAspect(chart, xColumn, yColumn);
    const columnTypes = this.fastGetColumnTypesForChart(chart, xColumn, yColumn);
    
    const isDiverse = this.addsDiverseAnalyticalValue(aspect, columnTypes, chart);
    
    if (isDiverse) {
      this.addToGeneratedCharts(chart);
      this.chartMetadata.push({
        chart,
        aspect,
        columnTypes
      });
    }
    
    return isDiverse;
  }

  /**
   * OPTIMIZATION: Fast analytical aspect determination
   * Requirements: 2.7 (Performance optimization)
   */
  private static fastDetermineAnalyticalAspect(chart: ChartRecommendation, xColumn: ColumnInfo, yColumn?: ColumnInfo): AnalyticalAspect {
    switch (chart.type) {
      case 'bar':
        if (chart.yAxis === 'Count') {
          return AnalyticalAspect.DISTRIBUTION;
        }
        if (xColumn.type === 'categorical' && yColumn?.type === 'numerical') {
          return AnalyticalAspect.COMPARISON;
        }
        return AnalyticalAspect.COMPOSITION;
        
      case 'line':
        if (xColumn.type === 'datetime' || this.isSequentialColumn(xColumn)) {
          return AnalyticalAspect.TREND;
        }
        return AnalyticalAspect.COMPARISON;
        
      case 'scatter':
        return AnalyticalAspect.CORRELATION;
        
      default:
        return AnalyticalAspect.COMPARISON;
    }
  }

  /**
   * OPTIMIZATION: Fast column types extraction
   * Requirements: 2.7 (Performance optimization)
   */
  private static fastGetColumnTypesForChart(chart: ChartRecommendation, xColumn: ColumnInfo, yColumn?: ColumnInfo): string[] {
    const types: string[] = [xColumn.type];
    if (yColumn && chart.yAxis !== 'Count') {
      types.push(yColumn.type);
    }
    return types.sort(); // Sort for consistent comparison
  }

  /**
   * Validates columns for chart generation capability
   * Requirements: 2.1, 5.6
   */
  private static validateColumnsForChartGeneration(columns: ColumnInfo[]): void {
    if (!columns || columns.length === 0) {
      throw new InsufficientDataError(
        'No columns available for chart generation',
        0,
        1,
        ['Provide a dataset with at least one column']
      );
    }

    // Check for at least one column with meaningful data
    const columnsWithData = columns.filter(col => 
      col.uniqueValues !== undefined && col.uniqueValues > 0
    );

    if (columnsWithData.length === 0) {
      throw new InsufficientDataError(
        'No columns contain sufficient data for visualization',
        0,
        1,
        [
          'Ensure columns contain actual data values',
          'Remove empty columns from the dataset',
          'Provide columns with varied data for meaningful visualizations'
        ]
      );
    }

    // Check for minimum visualization requirements
    const numericalColumns = columns.filter(col => col.type === 'numerical');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    const datetimeColumns = columns.filter(col => col.type === 'datetime');
    const textColumns = columns.filter(col => col.type === 'text');

    if (numericalColumns.length === 0 && categoricalColumns.length === 0 && 
        datetimeColumns.length === 0 && textColumns.length === 0) {
      throw new ChartGenerationError(
        'Dataset contains no recognizable column types for visualization',
        undefined,
        undefined,
        [
          'Ensure data contains numerical, categorical, or datetime columns',
          'Check data formatting and type detection',
          'Consider data preprocessing to improve type recognition'
        ]
      );
    }
  }

  /**
   * Safely generates bar charts with error handling
   * Requirements: 2.4, 5.6
   */
  private static safeGenerateBarCharts(columns: ColumnInfo[]): ChartRecommendation[] {
    try {
      return this.generateBarCharts(columns);
    } catch (error) {
      console.warn('Bar chart generation failed:', error);
      return [];
    }
  }

  /**
   * Safely generates line charts with error handling
   * Requirements: 2.5, 5.6
   */
  private static safeGenerateLineCharts(columns: ColumnInfo[]): ChartRecommendation[] {
    try {
      return this.generateLineCharts(columns);
    } catch (error) {
      console.warn('Line chart generation failed:', error);
      return [];
    }
  }

  /**
   * Safely generates scatter plots with error handling
   * Requirements: 2.6, 5.6
   */
  private static safeGenerateScatterPlots(columns: ColumnInfo[]): ChartRecommendation[] {
    try {
      return this.generateScatterPlots(columns);
    } catch (error) {
      console.warn('Scatter plot generation failed:', error);
      return [];
    }
  }

  /**
   * Generates fallback charts when primary generation fails
   * Requirements: 2.1, 5.6
   */
  private static generateFallbackCharts(columns: ColumnInfo[]): ChartRecommendation[] {
    const fallbackCharts: ChartRecommendation[] = [];

    try {
      // Try to create at least one basic chart
      const firstColumn = columns.find(col => col.uniqueValues && col.uniqueValues > 0);
      
      if (firstColumn) {
        if (firstColumn.type === 'numerical') {
          fallbackCharts.push({
            title: `Distribution of ${firstColumn.name}`,
            type: 'bar',
            xAxis: firstColumn.name,
            yAxis: 'Count'
          });
        } else if (firstColumn.type === 'categorical') {
          fallbackCharts.push({
            title: `${firstColumn.name} Categories`,
            type: 'bar',
            xAxis: firstColumn.name,
            yAxis: 'Count'
          });
        } else if (firstColumn.type === 'text' && firstColumn.uniqueValues && firstColumn.uniqueValues <= 20) {
          fallbackCharts.push({
            title: `Analysis of ${firstColumn.name}`,
            type: 'bar',
            xAxis: firstColumn.name,
            yAxis: 'Count'
          });
        }
      }

      // Try to create a second chart if we have multiple columns
      if (columns.length >= 2) {
        const secondColumn = columns.find((col, index) => 
          index > 0 && col.uniqueValues && col.uniqueValues > 0
        );
        
        if (secondColumn && firstColumn) {
          // Only create scatter plot if both columns are numerical
          if (firstColumn.type === 'numerical' && secondColumn.type === 'numerical') {
            fallbackCharts.push({
              title: `${secondColumn.name} vs ${firstColumn.name}`,
              type: 'scatter',
              xAxis: firstColumn.name,
              yAxis: secondColumn.name
            });
          } else {
            // Create a bar chart instead for mixed types
            const categoricalCol = firstColumn.type === 'categorical' || 
                                 (firstColumn.type === 'text' && firstColumn.uniqueValues && firstColumn.uniqueValues <= 20) 
                                 ? firstColumn : secondColumn;
            const numericalCol = firstColumn.type === 'numerical' ? firstColumn : 
                               (secondColumn.type === 'numerical' ? secondColumn : null);
            
            if (categoricalCol && numericalCol && categoricalCol !== numericalCol) {
              fallbackCharts.push({
                title: `${numericalCol.name} by ${categoricalCol.name}`,
                type: 'bar',
                xAxis: categoricalCol.name,
                yAxis: numericalCol.name
              });
            }
          }
        }
      }
    } catch (error) {
      console.warn('Fallback chart generation also failed:', error);
      // Return empty array if even fallback fails
    }

    return fallbackCharts;
  }
}