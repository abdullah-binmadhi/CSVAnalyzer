/**
 * Core interfaces for the Senior Data Analyst AI system
 */

/**
 * Input data structure containing dataset headers and sample data
 * Requirements: 1.1, 4.2
 */
export interface InputData {
  headers: string[];
  sampleData: any[][];
}

/**
 * Information about a specific column in the dataset
 * Requirements: 1.1
 */
export interface ColumnInfo {
  name: string;
  type: 'numerical' | 'categorical' | 'datetime' | 'text';
  uniqueValues?: number;
  hasNulls: boolean;
  sampleValues: any[];
}

/**
 * Chart recommendation specification
 * Requirements: 4.2, 4.3
 */
export interface ChartRecommendation {
  title: string;
  type: 'bar' | 'line' | 'scatter';
  xAxis: string;
  yAxis: string;
}

/**
 * Final analysis output structure
 * Requirements: 4.1, 4.2, 4.3
 */
export interface AnalysisOutput {
  charts_to_generate: ChartRecommendation[];
  full_analysis_report_markdown: string;
}

/**
 * Data quality metrics for input validation
 */
export interface DataQualityMetrics {
  completeness: number;
  consistency: number;
  issues: string[];
}

/**
 * Processed input data with analyzed columns
 */
export interface ProcessedInput {
  columns: ColumnInfo[];
  dataQuality: DataQualityMetrics;
}

/**
 * Business insights generated from data analysis
 */
export interface BusinessInsights {
  industryDomain: string;
  primaryValueColumns: string[];
  potentialCorrelations: string[];
  actionableQuestions: string[];
  datasetPotential: string;
}

/**
 * Column statistics for analysis
 */
export interface ColumnStatistics {
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  mode?: any;
  nullCount: number;
  uniqueCount: number;
}

/**
 * Relationship information between columns
 */
export interface RelationshipInfo {
  relatedColumn: string;
  relationshipType: 'correlation' | 'grouping' | 'temporal';
  strength: number;
}

/**
 * Column analysis with detailed information
 */
export interface ColumnAnalysis {
  name: string;
  dataType: 'numerical' | 'categorical' | 'datetime' | 'text';
  statistics: ColumnStatistics;
  relationships: RelationshipInfo[];
}

/**
 * Chart specification with rationale
 */
export interface ChartSpec {
  title: string;
  type: 'bar' | 'line' | 'scatter';
  xAxis: string;
  yAxis: string;
  rationale: string;
}

/**
 * Business analysis structure
 */
export interface BusinessAnalysis {
  executiveSummary: string;
  statisticalFindings: string[];
  relationshipInsights: string[];
  actionableQuestions: string[];
  conclusion: string;
}