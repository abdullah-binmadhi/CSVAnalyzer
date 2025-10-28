/**
 * Report Generator for creating comprehensive Markdown analysis reports
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { ColumnInfo, BusinessInsights, DataQualityMetrics } from '../types/interfaces';
import { ErrorHandler, ReportGenerationError } from '../errors/AnalysisErrors';

/**
 * Report Generator class for creating structured Markdown analysis reports
 */
export class ReportGenerator {
  
  /**
   * Generates a comprehensive Markdown analysis report with error handling
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   */
  public static async generateAnalysisReport(
    columns: ColumnInfo[],
    businessInsights: BusinessInsights,
    dataQuality: DataQualityMetrics
  ): Promise<string> {
    return ErrorHandler.withSyncTimeout(
      () => {
        try {
          const sections = [
            this.safeGenerateExecutiveSummary(businessInsights),
            this.safeGenerateStatisticalFindings(columns, dataQuality),
            this.safeGenerateRelationshipInsights(businessInsights),
            this.safeGenerateActionableQuestions(businessInsights),
            this.safeGenerateConclusion(businessInsights)
          ];

          const report = sections.filter(section => section.trim().length > 0).join('\n\n');
          
          if (report.trim().length === 0) {
            throw new ReportGenerationError('Generated report is empty');
          }

          return report;
        } catch (error) {
          console.warn('Report generation failed, using fallback report:', error);
          return this.generateFallbackReport(columns, businessInsights, dataQuality);
        }
      },
      10000, // 10 second timeout for report generation
      'report generation'
    );
  }

  /**
   * Generates executive summary with industry context
   * Requirements: 3.2
   */
  private static generateExecutiveSummary(businessInsights: BusinessInsights): string {
    let summary = '# Executive Summary\n\n';
    
    summary += `This dataset appears to be from the **${businessInsights.industryDomain}** domain, `;
    summary += 'presenting significant opportunities for data-driven insights and strategic decision-making.\n\n';
    
    if (businessInsights.primaryValueColumns.length > 0) {
      summary += `The analysis identifies **${businessInsights.primaryValueColumns.join(', ')}** as the primary value-driving columns, `;
      summary += 'which should be the focus of detailed analytical exploration.\n\n';
    }
    
    summary += businessInsights.datasetPotential;
    
    return summary;
  }

  /**
   * Generates statistical findings documentation
   * Requirements: 3.3
   */
  private static generateStatisticalFindings(columns: ColumnInfo[], dataQuality: DataQualityMetrics): string {
    let findings = '# Statistical Analysis\n\n';
    
    // Dataset overview
    findings += '## Dataset Overview\n\n';
    findings += `- **Total Columns**: ${columns.length}\n`;
    
    const columnTypes = this.analyzeColumnTypes(columns);
    Object.entries(columnTypes).forEach(([type, count]) => {
      if (count > 0) {
        findings += `- **${this.capitalizeFirst(type)} Columns**: ${count}\n`;
      }
    });
    
    findings += `- **Data Completeness**: ${(dataQuality.completeness * 100).toFixed(1)}%\n`;
    findings += `- **Data Consistency**: ${(dataQuality.consistency * 100).toFixed(1)}%\n\n`;
    
    // Data quality assessment
    if (dataQuality.issues.length > 0) {
      findings += '## Data Quality Issues\n\n';
      dataQuality.issues.forEach(issue => {
        findings += `- ${issue}\n`;
      });
      findings += '\n';
    }
    
    // Column-specific insights
    findings += '## Column Analysis\n\n';
    
    const numericalColumns = columns.filter(col => col.type === 'numerical');
    const categoricalColumns = columns.filter(col => col.type === 'categorical');
    const datetimeColumns = columns.filter(col => col.type === 'datetime');
    const textColumns = columns.filter(col => col.type === 'text');
    
    if (numericalColumns.length > 0) {
      findings += '### Numerical Columns\n';
      numericalColumns.forEach(col => {
        findings += `- **${col.name}**: `;
        if (col.uniqueValues !== undefined) {
          findings += `${col.uniqueValues} unique values`;
        }
        if (col.hasNulls) {
          findings += ', contains missing values';
        }
        findings += '\n';
      });
      findings += '\n';
    }
    
    if (categoricalColumns.length > 0) {
      findings += '### Categorical Columns\n';
      categoricalColumns.forEach(col => {
        findings += `- **${col.name}**: `;
        if (col.uniqueValues !== undefined) {
          findings += `${col.uniqueValues} categories`;
        }
        if (col.hasNulls) {
          findings += ', contains missing values';
        }
        findings += '\n';
      });
      findings += '\n';
    }
    
    if (datetimeColumns.length > 0) {
      findings += '### Temporal Columns\n';
      datetimeColumns.forEach(col => {
        findings += `- **${col.name}**: Time-series data`;
        if (col.hasNulls) {
          findings += ', contains missing values';
        }
        findings += '\n';
      });
      findings += '\n';
    }
    
    if (textColumns.length > 0) {
      findings += '### Text Columns\n';
      textColumns.forEach(col => {
        findings += `- **${col.name}**: Text data`;
        if (col.hasNulls) {
          findings += ', contains missing values';
        }
        findings += '\n';
      });
      findings += '\n';
    }
    
    return findings.trim();
  }

  /**
   * Generates relationship insights presentation
   * Requirements: 3.4
   */
  private static generateRelationshipInsights(businessInsights: BusinessInsights): string {
    let insights = '# Relationship Analysis\n\n';
    
    if (businessInsights.potentialCorrelations.length === 0) {
      insights += 'No significant relationships were identified in the current dataset structure.\n\n';
      insights += 'Consider collecting additional data points to enable correlation analysis.';
      return insights;
    }
    
    insights += 'The following potential relationships and patterns have been identified:\n\n';
    
    businessInsights.potentialCorrelations.forEach((correlation, index) => {
      insights += `${index + 1}. **${correlation}**\n`;
      insights += `   - This relationship could provide insights into data dependencies and business drivers\n`;
      insights += `   - Recommended for detailed statistical analysis and visualization\n\n`;
    });
    
    insights += '## Analytical Recommendations\n\n';
    insights += '- Conduct correlation analysis for numerical relationships\n';
    insights += '- Perform segmentation analysis for categorical relationships\n';
    insights += '- Create cross-tabulations to explore categorical interactions\n';
    insights += '- Use time-series analysis for temporal patterns\n';
    insights += '- Consider multivariate analysis to understand complex relationships';
    
    return insights;
  }

  /**
   * Generates actionable questions formatting
   * Requirements: 3.5
   */
  private static generateActionableQuestions(businessInsights: BusinessInsights): string {
    let questions = '# Key Business Questions\n\n';
    
    questions += 'Based on the dataset analysis, the following strategic questions can be addressed:\n\n';
    
    businessInsights.actionableQuestions.forEach((question, index) => {
      questions += `## ${index + 1}. ${question}\n\n`;
      questions += 'This question can be explored through:\n';
      questions += '- Detailed data visualization and statistical analysis\n';
      questions += '- Comparative analysis across different segments\n';
      questions += '- Trend analysis and pattern identification\n';
      questions += '- Performance benchmarking and optimization strategies\n\n';
    });
    
    return questions.trim();
  }

  /**
   * Generates dataset potential summary and conclusion
   * Requirements: 3.6
   */
  private static generateConclusion(businessInsights: BusinessInsights): string {
    let conclusion = '# Conclusion and Next Steps\n\n';
    
    conclusion += '## Dataset Potential\n\n';
    conclusion += businessInsights.datasetPotential + '\n\n';
    
    conclusion += '## Recommended Actions\n\n';
    conclusion += '1. **Immediate Analysis**: Begin with the recommended visualizations to understand data distributions and relationships\n\n';
    conclusion += '2. **Deep Dive Investigation**: Focus analytical efforts on the identified primary value columns and key relationships\n\n';
    conclusion += '3. **Business Integration**: Connect analytical findings to specific business processes and decision-making workflows\n\n';
    conclusion += '4. **Data Enhancement**: Consider collecting additional data points to strengthen analytical capabilities\n\n';
    conclusion += '5. **Continuous Monitoring**: Establish regular analysis cycles to track performance and identify emerging patterns\n\n';
    
    conclusion += '## Strategic Value\n\n';
    conclusion += `This dataset provides a solid foundation for ${businessInsights.industryDomain.toLowerCase()} analytics, `;
    conclusion += 'with clear pathways to actionable insights and measurable business impact. ';
    conclusion += 'The combination of identified relationships, primary value drivers, and strategic questions ';
    conclusion += 'creates a comprehensive framework for data-driven decision making.';
    
    return conclusion;
  }

  /**
   * Analyzes column types distribution
   */
  private static analyzeColumnTypes(columns: ColumnInfo[]): Record<string, number> {
    const types = { numerical: 0, categorical: 0, datetime: 0, text: 0 };
    
    columns.forEach(col => {
      types[col.type]++;
    });
    
    return types;
  }

  /**
   * Capitalizes the first letter of a string
   */
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Safely generates executive summary with error handling
   * Requirements: 3.2, 5.6
   */
  private static safeGenerateExecutiveSummary(businessInsights: BusinessInsights): string {
    try {
      return this.generateExecutiveSummary(businessInsights);
    } catch (error) {
      console.warn('Executive summary generation failed:', error);
      return `# Executive Summary\n\nThis dataset from the ${businessInsights.industryDomain || 'business'} domain contains analytical opportunities for data-driven insights.`;
    }
  }

  /**
   * Safely generates statistical findings with error handling
   * Requirements: 3.3, 5.6
   */
  private static safeGenerateStatisticalFindings(columns: ColumnInfo[], dataQuality: DataQualityMetrics): string {
    try {
      return this.generateStatisticalFindings(columns, dataQuality);
    } catch (error) {
      console.warn('Statistical findings generation failed:', error);
      return `# Statistical Analysis\n\n## Dataset Overview\n\n- **Total Columns**: ${columns.length}\n- **Data Quality**: Analysis completed with limitations`;
    }
  }

  /**
   * Safely generates relationship insights with error handling
   * Requirements: 3.4, 5.6
   */
  private static safeGenerateRelationshipInsights(businessInsights: BusinessInsights): string {
    try {
      return this.generateRelationshipInsights(businessInsights);
    } catch (error) {
      console.warn('Relationship insights generation failed:', error);
      return '# Relationship Analysis\n\nBasic relationship analysis completed. Consider additional data exploration for detailed correlations.';
    }
  }

  /**
   * Safely generates actionable questions with error handling
   * Requirements: 3.5, 5.6
   */
  private static safeGenerateActionableQuestions(businessInsights: BusinessInsights): string {
    try {
      return this.generateActionableQuestions(businessInsights);
    } catch (error) {
      console.warn('Actionable questions generation failed:', error);
      return '# Key Business Questions\n\n## 1. What are the primary insights available in this dataset?\n\n## 2. How can this data support business decision-making?';
    }
  }

  /**
   * Safely generates conclusion with error handling
   * Requirements: 3.6, 5.6
   */
  private static safeGenerateConclusion(businessInsights: BusinessInsights): string {
    try {
      return this.generateConclusion(businessInsights);
    } catch (error) {
      console.warn('Conclusion generation failed:', error);
      return '# Conclusion and Next Steps\n\nThis dataset provides a foundation for analytical insights. Consider data quality improvements and additional context for enhanced analysis capabilities.';
    }
  }

  /**
   * Generates a fallback report when primary generation fails
   * Requirements: 3.1, 5.6
   */
  private static generateFallbackReport(
    columns: ColumnInfo[],
    businessInsights: BusinessInsights,
    dataQuality: DataQualityMetrics
  ): string {
    const columnCount = columns.length;
    const domain = businessInsights.industryDomain || 'business';
    
    return `# Analysis Report

## Executive Summary

This dataset contains ${columnCount} columns and appears to be from the ${domain.toLowerCase()} domain. While detailed analysis encountered some limitations, the dataset shows potential for basic analytical insights.

## Dataset Overview

- **Total Columns**: ${columnCount}
- **Analysis Status**: Completed with fallback methods
- **Domain**: ${domain}

## Key Findings

The dataset structure suggests opportunities for:
- Basic data exploration and visualization
- Fundamental business intelligence applications
- Pattern identification and trend analysis

## Recommendations

1. **Data Quality**: Consider improving data completeness and consistency
2. **Analysis Enhancement**: Additional context and data preprocessing may improve insights
3. **Business Integration**: Connect findings to specific business processes and decisions
4. **Continuous Monitoring**: Establish regular analysis cycles for ongoing insights

## Conclusion

This dataset provides a starting point for analytical work in the ${domain.toLowerCase()} context. While comprehensive analysis faced some challenges, the fundamental data structure supports basic business intelligence and reporting capabilities.`;
  }
}