/**
 * Business Intelligence Analyzer for generating business insights and actionable recommendations
 * Requirements: 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.4
 */

import { ColumnInfo, BusinessInsights, RelationshipInfo } from '../types/interfaces';
import { ErrorHandler, BusinessAnalysisError, InsufficientDataError } from '../errors/AnalysisErrors';

/**
 * Business Intelligence Analyzer class for generating comprehensive business insights
 */
export class BusinessIntelligenceAnalyzer {
  
  /**
   * Generates comprehensive business insights from analyzed column data with error handling
   * Requirements: 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.4
   */
  public static async generateBusinessInsights(columns: ColumnInfo[]): Promise<BusinessInsights> {
    return ErrorHandler.withSyncTimeout(
      () => {
        try {
          // Validate input columns
          this.validateColumnsForBusinessAnalysis(columns);

          const industryDomain = this.safeDetectIndustryDomain(columns);
          const primaryValueColumns = this.safeIdentifyPrimaryValueColumns(columns);
          const potentialCorrelations = this.safeDetectPotentialCorrelations(columns);
          const actionableQuestions = this.safeGenerateActionableQuestions(columns, industryDomain, primaryValueColumns);
          const datasetPotential = this.safeAssessDatasetPotential(columns, industryDomain, primaryValueColumns);

          return {
            industryDomain,
            primaryValueColumns,
            potentialCorrelations,
            actionableQuestions,
            datasetPotential
          };
        } catch (error) {
          console.warn('Business analysis failed, using fallback insights:', error);
          return this.generateFallbackInsights(columns);
        }
      },
      15000, // 15 second timeout for business analysis
      'business intelligence analysis'
    );
  }

  /**
   * Detects likely industry/domain based on column names and data patterns
   * Requirements: 3.2, 6.1
   */
  private static detectIndustryDomain(columns: ColumnInfo[]): string {
    const columnNames = columns.map(col => col.name.toLowerCase());
    const allColumnText = columnNames.join(' ');

    // Define industry patterns with keywords and weights
    const industryPatterns = [
      {
        domain: 'Financial Services',
        keywords: ['price', 'cost', 'revenue', 'profit', 'expense', 'budget', 'amount', 'balance', 'payment', 'transaction', 'account', 'investment', 'portfolio', 'stock', 'bond', 'interest', 'loan', 'credit', 'debt'],
        weight: 0
      },
      {
        domain: 'E-commerce/Retail',
        keywords: ['product', 'order', 'customer', 'purchase', 'sale', 'inventory', 'quantity', 'sku', 'category', 'brand', 'rating', 'review', 'cart', 'checkout', 'shipping', 'discount', 'coupon'],
        weight: 0
      },
      {
        domain: 'Healthcare',
        keywords: ['patient', 'diagnosis', 'treatment', 'medication', 'doctor', 'hospital', 'clinic', 'symptom', 'disease', 'health', 'medical', 'prescription', 'therapy', 'surgery', 'vital', 'blood', 'heart'],
        weight: 0
      },
      {
        domain: 'Human Resources',
        keywords: ['employee', 'salary', 'department', 'position', 'hire', 'performance', 'manager', 'team', 'skill', 'experience', 'training', 'benefit', 'leave', 'attendance', 'promotion'],
        weight: 0
      },
      {
        domain: 'Marketing/Advertising',
        keywords: ['campaign', 'click', 'impression', 'conversion', 'lead', 'engagement', 'audience', 'channel', 'source', 'medium', 'bounce', 'session', 'pageview', 'ctr', 'cpc', 'roi'],
        weight: 0
      },
      {
        domain: 'Operations/Manufacturing',
        keywords: ['production', 'manufacturing', 'quality', 'defect', 'batch', 'process', 'machine', 'equipment', 'efficiency', 'downtime', 'maintenance', 'output', 'capacity', 'yield'],
        weight: 0
      },
      {
        domain: 'Education',
        keywords: ['student', 'grade', 'score', 'course', 'class', 'teacher', 'school', 'university', 'exam', 'assignment', 'semester', 'gpa', 'enrollment', 'graduation'],
        weight: 0
      },
      {
        domain: 'Real Estate',
        keywords: ['property', 'house', 'apartment', 'rent', 'mortgage', 'location', 'address', 'bedroom', 'bathroom', 'sqft', 'area', 'neighborhood', 'listing', 'agent'],
        weight: 0
      }
    ];

    // Calculate weights for each industry
    industryPatterns.forEach(pattern => {
      pattern.keywords.forEach(keyword => {
        if (allColumnText.includes(keyword)) {
          pattern.weight += 1;
        }
      });
    });

    // Find the industry with the highest weight
    const bestMatch = industryPatterns.reduce((max, current) => 
      current.weight > max.weight ? current : max
    );

    // If no strong match found, analyze data patterns
    if (bestMatch.weight === 0) {
      return this.detectDomainFromDataPatterns(columns);
    }

    return bestMatch.domain;
  }

  /**
   * Detects domain from data patterns when column names don't provide clear indicators
   */
  private static detectDomainFromDataPatterns(columns: ColumnInfo[]): string {
    const numericalColumns = columns.filter(col => col.type === 'numerical').length;
    const categoricalColumns = columns.filter(col => col.type === 'categorical').length;
    const datetimeColumns = columns.filter(col => col.type === 'datetime').length;
    const totalColumns = columns.length;

    // High numerical content suggests financial or operational data
    if (numericalColumns / totalColumns > 0.6) {
      return datetimeColumns > 0 ? 'Financial Services' : 'Operations/Manufacturing';
    }

    // High categorical content suggests customer or product data
    if (categoricalColumns / totalColumns > 0.5) {
      return 'E-commerce/Retail';
    }

    // Mixed data with datetime suggests business operations
    if (datetimeColumns > 0 && numericalColumns > 0) {
      return 'Business Operations';
    }

    return 'General Business';
  }

  /**
   * Identifies primary value-driving columns in the dataset
   * Requirements: 3.3, 6.2
   */
  private static identifyPrimaryValueColumns(columns: ColumnInfo[]): string[] {
    if (columns.length === 0) {
      return [];
    }

    const valueColumns: Array<{name: string, score: number}> = [];

    columns.forEach(column => {
      let score = 0;
      const columnName = column.name.toLowerCase();

      // High-value keywords
      const highValueKeywords = ['revenue', 'profit', 'sales', 'income', 'amount', 'value', 'price', 'cost', 'total', 'sum'];
      const mediumValueKeywords = ['quantity', 'count', 'number', 'rate', 'percentage', 'score', 'rating'];
      const lowValueKeywords = ['id', 'name', 'description', 'type', 'category', 'status'];

      // Score based on column name
      if (highValueKeywords.some(keyword => columnName.includes(keyword))) {
        score += 10;
      } else if (mediumValueKeywords.some(keyword => columnName.includes(keyword))) {
        score += 5;
      } else if (lowValueKeywords.some(keyword => columnName.includes(keyword))) {
        score -= 8; // Increased penalty for low-value keywords
      }

      // Score based on data type
      if (column.type === 'numerical') {
        score += 8;
      } else if (column.type === 'datetime') {
        score += 3;
      } else if (column.type === 'categorical') {
        score += 2;
      }

      // Score based on data diversity
      if (column.uniqueValues && column.uniqueValues > 1) {
        score += Math.min(column.uniqueValues / 10, 5);
      } else if (column.uniqueValues === 0) {
        score -= 10; // Heavy penalty for empty columns
      }

      // Penalize columns with many nulls
      if (column.hasNulls) {
        score -= 5; // Increased penalty for null values
      }

      valueColumns.push({ name: column.name, score });
    });

    // Sort by score and return only positive-scoring columns (at most 3)
    const sortedColumns = valueColumns
      .filter(col => col.score > 0) // Only include columns with positive scores
      .sort((a, b) => b.score - a.score);
    
    const topColumns = sortedColumns.slice(0, Math.min(3, sortedColumns.length));
    
    return topColumns.map(col => col.name);
  }

  /**
   * Detects potential correlations and patterns between columns
   * Requirements: 3.4, 6.2
   */
  private static detectPotentialCorrelations(columns: ColumnInfo[]): string[] {
    const correlations: string[] = [];
    const numericalColumns = columns.filter(col => col.type === 'numerical');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    const datetimeColumns = columns.filter(col => col.type === 'datetime');

    // Numerical-Numerical correlations
    for (let i = 0; i < numericalColumns.length; i++) {
      for (let j = i + 1; j < numericalColumns.length; j++) {
        const col1 = numericalColumns[i];
        const col2 = numericalColumns[j];
        correlations.push(`Potential correlation between ${col1.name} and ${col2.name} (both numerical)`);
      }
    }

    // Categorical-Numerical relationships
    categoricalColumns.forEach(catCol => {
      numericalColumns.forEach(numCol => {
        correlations.push(`${catCol.name} may influence ${numCol.name} (categorical vs numerical)`);
      });
    });

    // Time-series patterns
    if (datetimeColumns.length > 0 && numericalColumns.length > 0) {
      datetimeColumns.forEach(dateCol => {
        numericalColumns.forEach(numCol => {
          correlations.push(`${numCol.name} trends over ${dateCol.name} (time-series analysis)`);
        });
      });
    }

    // Categorical grouping patterns
    if (categoricalColumns.length >= 2) {
      for (let i = 0; i < categoricalColumns.length; i++) {
        for (let j = i + 1; j < categoricalColumns.length; j++) {
          const col1 = categoricalColumns[i];
          const col2 = categoricalColumns[j];
          correlations.push(`Cross-tabulation between ${col1.name} and ${col2.name} (categorical grouping)`);
        }
      }
    }

    // Return top correlations (limit to avoid overwhelming output)
    return correlations.slice(0, 6);
  }

  /**
   * Generates 3-4 specific actionable business questions
   * Requirements: 3.5, 6.1, 6.4
   */
  private static generateActionableQuestions(
    columns: ColumnInfo[], 
    industryDomain: string, 
    primaryValueColumns: string[]
  ): string[] {
    const questions: string[] = [];
    const numericalColumns = columns.filter(col => col.type === 'numerical');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    const datetimeColumns = columns.filter(col => col.type === 'datetime');

    // Domain-specific questions (always add at least one)
    const domainQuestions = this.generateDomainSpecificQuestions(industryDomain, columns, primaryValueColumns);
    questions.push(...domainQuestions);

    // Generic analytical questions based on data structure
    if (datetimeColumns.length > 0 && numericalColumns.length > 0) {
      const timeCol = datetimeColumns[0].name;
      const valueCol = primaryValueColumns[0] || numericalColumns[0].name;
      questions.push(`What are the seasonal trends and patterns in ${valueCol} over ${timeCol}?`);
    }

    if (categoricalColumns.length > 0 && numericalColumns.length > 0) {
      const catCol = categoricalColumns[0].name;
      const valueCol = primaryValueColumns[0] || numericalColumns[0].name;
      questions.push(`Which ${catCol} categories drive the highest ${valueCol} performance?`);
    }

    if (numericalColumns.length >= 2) {
      const col1 = numericalColumns[0].name;
      const col2 = numericalColumns[1].name;
      questions.push(`What is the relationship between ${col1} and ${col2}, and how can this inform strategy?`);
    }

    // Always ensure we have exactly 4 questions
    while (questions.length < 4) {
      if (questions.length === 1) {
        questions.push(`What are the key performance indicators that should be monitored in this dataset?`);
      } else if (questions.length === 2) {
        questions.push(`What data quality improvements would enhance the analytical value of this dataset?`);
      } else if (questions.length === 3) {
        questions.push(`What additional data sources could enhance the analytical insights from this dataset?`);
      }
    }

    return questions.slice(0, 4);
  }

  /**
   * Generates domain-specific business questions
   */
  private static generateDomainSpecificQuestions(
    domain: string, 
    columns: ColumnInfo[], 
    primaryValueColumns: string[]
  ): string[] {
    const questions: string[] = [];
    const primaryCol = primaryValueColumns[0];

    switch (domain) {
      case 'Financial Services':
        if (primaryCol) {
          questions.push(`How can we optimize ${primaryCol} to improve overall financial performance?`);
        } else {
          questions.push(`What are the key financial performance drivers in this dataset?`);
        }
        questions.push(`What are the key risk factors and opportunities identified in this financial data?`);
        break;

      case 'E-commerce/Retail':
        if (primaryCol) {
          questions.push(`Which customer segments or product categories contribute most to ${primaryCol}?`);
        } else {
          questions.push(`What are the key drivers of business performance in this retail dataset?`);
        }
        questions.push(`What pricing or inventory strategies could improve business outcomes?`);
        break;

      case 'Healthcare':
        questions.push(`What patterns in patient data could improve treatment outcomes or operational efficiency?`);
        if (primaryCol) {
          questions.push(`How do different factors influence ${primaryCol} and what interventions are most effective?`);
        } else {
          questions.push(`What are the most critical healthcare metrics to monitor in this dataset?`);
        }
        break;

      case 'Human Resources':
        questions.push(`What factors contribute to employee performance and retention?`);
        if (primaryCol) {
          questions.push(`How can we optimize ${primaryCol} across different departments or roles?`);
        } else {
          questions.push(`What are the key HR metrics that drive organizational success?`);
        }
        break;

      case 'Marketing/Advertising':
        questions.push(`Which marketing channels and campaigns deliver the highest ROI?`);
        if (primaryCol) {
          questions.push(`What customer behaviors and characteristics drive ${primaryCol} performance?`);
        } else {
          questions.push(`What are the most effective marketing strategies based on this data?`);
        }
        break;

      default:
        if (primaryCol) {
          questions.push(`What are the primary drivers of ${primaryCol} in this business context?`);
        } else {
          questions.push(`What are the key performance indicators in this business dataset?`);
        }
        questions.push(`What operational improvements could be made based on these data insights?`);
        break;
    }

    return questions;
  }

  /**
   * Assesses the overall analytical potential of the dataset
   * Requirements: 3.6, 6.4
   */
  private static assessDatasetPotential(
    columns: ColumnInfo[], 
    industryDomain: string, 
    primaryValueColumns: string[]
  ): string {
    const numericalColumns = columns.filter(col => col.type === 'numerical').length;
    const categoricalColumns = columns.filter(col => col.type === 'categorical').length;
    const datetimeColumns = columns.filter(col => col.type === 'datetime').length;
    const totalColumns = columns.length;

    let potential = '';

    // Assess data richness
    if (totalColumns >= 8) {
      potential += 'This dataset shows high analytical potential with rich data dimensions. ';
    } else if (totalColumns >= 4) {
      potential += 'This dataset has moderate analytical potential with sufficient data variety. ';
    } else {
      potential += 'This dataset has basic analytical potential but may benefit from additional data sources. ';
    }

    // Assess analytical capabilities
    const capabilities: string[] = [];

    if (numericalColumns >= 2) {
      capabilities.push('correlation analysis');
      capabilities.push('statistical modeling');
    }

    if (categoricalColumns >= 1 && numericalColumns >= 1) {
      capabilities.push('segmentation analysis');
      capabilities.push('comparative analysis');
    }

    if (datetimeColumns >= 1) {
      capabilities.push('trend analysis');
      capabilities.push('forecasting');
    }

    if (primaryValueColumns.length > 0) {
      capabilities.push('performance optimization');
    }

    if (capabilities.length > 0) {
      potential += `Key analytical capabilities include: ${capabilities.join(', ')}. `;
    }

    // Domain-specific potential
    potential += `Within the ${industryDomain} context, this data could support strategic decision-making, `;
    potential += 'operational improvements, and performance monitoring. ';

    // Recommendations
    if (datetimeColumns === 0) {
      potential += 'Adding temporal data would enhance trend analysis capabilities. ';
    }

    if (numericalColumns < 2) {
      potential += 'Additional quantitative metrics would improve analytical depth. ';
    }

    potential += 'Consider integrating with external data sources for comprehensive business intelligence.';

    return potential;
  }

  /**
   * Validates columns for business analysis capability
   * Requirements: 3.2, 5.6
   */
  private static validateColumnsForBusinessAnalysis(columns: ColumnInfo[]): void {
    if (!columns || columns.length === 0) {
      throw new InsufficientDataError(
        'No columns available for business analysis',
        0,
        1,
        ['Provide a dataset with at least one column for business insights']
      );
    }

    // Check for columns with meaningful data
    const columnsWithData = columns.filter(col => 
      col.uniqueValues !== undefined && col.uniqueValues > 0
    );

    if (columnsWithData.length === 0) {
      throw new InsufficientDataError(
        'No columns contain sufficient data for business analysis',
        0,
        1,
        [
          'Ensure columns contain actual business data',
          'Remove empty columns from the dataset',
          'Provide columns with business-relevant information'
        ]
      );
    }
  }

  /**
   * Safely detects industry domain with error handling
   * Requirements: 3.2, 5.6
   */
  private static safeDetectIndustryDomain(columns: ColumnInfo[]): string {
    try {
      return this.detectIndustryDomain(columns);
    } catch (error) {
      console.warn('Industry domain detection failed:', error);
      return 'General Business';
    }
  }

  /**
   * Safely identifies primary value columns with error handling
   * Requirements: 3.3, 5.6
   */
  private static safeIdentifyPrimaryValueColumns(columns: ColumnInfo[]): string[] {
    try {
      return this.identifyPrimaryValueColumns(columns);
    } catch (error) {
      console.warn('Primary value column identification failed:', error);
      // Fallback: return first few column names
      return columns.slice(0, 2).map(col => col.name);
    }
  }

  /**
   * Safely detects potential correlations with error handling
   * Requirements: 3.4, 5.6
   */
  private static safeDetectPotentialCorrelations(columns: ColumnInfo[]): string[] {
    try {
      return this.detectPotentialCorrelations(columns);
    } catch (error) {
      console.warn('Correlation detection failed:', error);
      // Fallback: basic correlation suggestions
      if (columns.length >= 2) {
        return [`Potential relationship between ${columns[0].name} and ${columns[1].name}`];
      }
      return ['Insufficient data for correlation analysis'];
    }
  }

  /**
   * Safely generates actionable questions with error handling
   * Requirements: 3.5, 5.6
   */
  private static safeGenerateActionableQuestions(
    columns: ColumnInfo[], 
    industryDomain: string, 
    primaryValueColumns: string[]
  ): string[] {
    try {
      return this.generateActionableQuestions(columns, industryDomain, primaryValueColumns);
    } catch (error) {
      console.warn('Actionable question generation failed:', error);
      // Fallback questions
      return [
        'What are the key patterns in this dataset?',
        'Which factors drive the most significant outcomes?',
        'How can this data inform business decisions?',
        'What additional data would enhance this analysis?'
      ];
    }
  }

  /**
   * Safely assesses dataset potential with error handling
   * Requirements: 3.6, 5.6
   */
  private static safeAssessDatasetPotential(
    columns: ColumnInfo[], 
    industryDomain: string, 
    primaryValueColumns: string[]
  ): string {
    try {
      return this.assessDatasetPotential(columns, industryDomain, primaryValueColumns);
    } catch (error) {
      console.warn('Dataset potential assessment failed:', error);
      // Fallback assessment
      return `This dataset contains ${columns.length} columns and shows potential for ${industryDomain.toLowerCase()} analysis. ` +
             'The data structure suggests opportunities for basic analytical insights and business intelligence applications. ' +
             'Consider data quality improvements and additional context for enhanced analysis capabilities.';
    }
  }

  /**
   * Generates fallback insights when primary analysis fails
   * Requirements: 3.2, 5.6
   */
  private static generateFallbackInsights(columns: ColumnInfo[]): BusinessInsights {
    const columnNames = columns.map(col => col.name);
    
    return {
      industryDomain: 'General Business',
      primaryValueColumns: columnNames.slice(0, Math.min(3, columnNames.length)),
      potentialCorrelations: columns.length >= 2 
        ? [`Basic relationship analysis between ${columnNames[0]} and other columns`]
        : ['Limited correlation analysis due to insufficient columns'],
      actionableQuestions: [
        'What are the main characteristics of this dataset?',
        'How can this data support business decision-making?',
        'What data quality improvements would enhance analysis?',
        'What additional context would improve insights?'
      ],
      datasetPotential: `This dataset contains ${columns.length} columns with basic analytical potential. ` +
                       'While detailed business intelligence analysis encountered limitations, the data structure ' +
                       'suggests opportunities for fundamental insights and reporting capabilities. ' +
                       'Consider data enrichment and quality improvements for enhanced analysis.'
    };
  }
}