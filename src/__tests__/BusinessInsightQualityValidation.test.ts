/**
 * Comprehensive business insight quality validation tests
 * Requirements: 6.3, 6.5
 */

import { analyzeDataset } from '../index';
import { TestDatasets } from './testDatasets';

describe('Business Insight Quality Validation Tests', () => {
  
  describe('Cross-Industry Insight Consistency', () => {
    it('should provide consistent insight structure across all industries', async () => {
      const industries = [
        { name: 'Financial Services', dataset: TestDatasets.getFinancialDataset() },
        { name: 'E-commerce', dataset: TestDatasets.getSalesDataset() },
        { name: 'Manufacturing', dataset: TestDatasets.getManufacturingDataset() },
        { name: 'Healthcare', dataset: TestDatasets.getHealthcareDataset() },
        { name: 'Education', dataset: TestDatasets.getEducationDataset() },
        { name: 'Marketing', dataset: TestDatasets.getMarketingDataset() },
        { name: 'Human Resources', dataset: TestDatasets.getHRDataset() },
        { name: 'Operations', dataset: TestDatasets.getOperationalDataset() }
      ];
      
      const insightStructures: Array<{
        industry: string;
        hasExecutiveSummary: boolean;
        hasStatisticalAnalysis: boolean;
        hasBusinessQuestions: boolean;
        hasConclusion: boolean;
        questionCount: number;
        reportLength: number;
        chartCount: number;
      }> = [];
      
      for (const { name, dataset } of industries) {
        const result = await analyzeDataset(dataset);
        
        const structure = {
          industry: name,
          hasExecutiveSummary: result.full_analysis_report_markdown.includes('Executive Summary'),
          hasStatisticalAnalysis: result.full_analysis_report_markdown.includes('Statistical Analysis'),
          hasBusinessQuestions: result.full_analysis_report_markdown.includes('Key Business Questions'),
          hasConclusion: result.full_analysis_report_markdown.includes('Conclusion'),
          questionCount: extractBusinessQuestions(result.full_analysis_report_markdown).length,
          reportLength: result.full_analysis_report_markdown.length,
          chartCount: result.charts_to_generate.length
        };
        
        insightStructures.push(structure);
        
        // Each industry should have consistent structure
        expect(structure.hasExecutiveSummary).toBe(true);
        expect(structure.hasStatisticalAnalysis).toBe(true);
        expect(structure.hasBusinessQuestions).toBe(true);
        expect(structure.hasConclusion).toBe(true);
        expect(structure.questionCount).toBe(4);
        expect(structure.reportLength).toBeGreaterThan(600);
        expect(structure.chartCount).toBeGreaterThan(2);
      }
      
      // All industries should have similar quality metrics
      const avgReportLength = insightStructures.reduce((sum, s) => sum + s.reportLength, 0) / insightStructures.length;
      const avgChartCount = insightStructures.reduce((sum, s) => sum + s.chartCount, 0) / insightStructures.length;
      
      insightStructures.forEach(structure => {
        // Report length should be within reasonable range of average
        expect(structure.reportLength).toBeGreaterThan(avgReportLength * 0.6);
        expect(structure.reportLength).toBeLessThan(avgReportLength * 2.0);
        
        // Chart count should be reasonable
        expect(structure.chartCount).toBeGreaterThan(avgChartCount * 0.3);
        expect(structure.chartCount).toBeLessThan(avgChartCount * 3.0);
      });
    }, 300000);

    it('should adapt insights to data characteristics appropriately', async () => {
      const dataCharacteristics = [
        {
          name: 'Time Series Heavy',
          dataset: TestDatasets.getEdgeCaseDatasets().timeSeriesDataset,
          expectedKeywords: ['time-series', 'trend', 'temporal']
        },
        {
          name: 'Categorical Heavy',
          dataset: TestDatasets.getEdgeCaseDatasets().allCategoricalDataset,
          expectedKeywords: ['categorical', 'segment', 'group']
        },
        {
          name: 'Numerical Heavy',
          dataset: TestDatasets.getEdgeCaseDatasets().allNumericalDataset,
          expectedKeywords: ['correlation', 'numerical', 'statistical']
        },
        {
          name: 'Mixed Complex',
          dataset: TestDatasets.getDataTypeCombinations().complexMixed,
          expectedKeywords: ['analysis', 'relationship', 'pattern']
        }
      ];
      
      for (const { name, dataset, expectedKeywords } of dataCharacteristics) {
        const result = await analyzeDataset(dataset);
        
        // Should adapt analysis to data characteristics
        const reportLower = result.full_analysis_report_markdown.toLowerCase();
        const hasExpectedKeywords = expectedKeywords.some(keyword => 
          reportLower.includes(keyword)
        );
        expect(hasExpectedKeywords).toBe(true);
        
        // Should provide appropriate chart types
        const chartTypes = new Set(result.charts_to_generate.map(chart => chart.type));
        expect(chartTypes.size).toBeGreaterThan(0);
        
        console.log(`✓ ${name}: Adapted insights with appropriate keywords`);
      }
    }, 120000);
  });

  describe('Question Quality and Actionability', () => {
    it('should generate specific and actionable questions for each domain', async () => {
      const domainTests = [
        {
          domain: 'Financial',
          dataset: TestDatasets.getFinancialDataset(),
          expectedThemes: ['revenue', 'profit', 'department', 'performance', 'roi', 'budget', 'financial']
        },
        {
          domain: 'Sales',
          dataset: TestDatasets.getSalesDataset(),
          expectedThemes: ['customer', 'product', 'price', 'rating', 'category', 'sales', 'revenue']
        },
        {
          domain: 'Manufacturing',
          dataset: TestDatasets.getManufacturingDataset(),
          expectedThemes: ['production', 'efficiency', 'quality', 'defect', 'plant', 'line', 'manufacturing']
        },
        {
          domain: 'Healthcare',
          dataset: TestDatasets.getHealthcareDataset(),
          expectedThemes: ['patient', 'treatment', 'outcome', 'cost', 'diagnosis', 'healthcare']
        }
      ];
      
      for (const { domain, dataset, expectedThemes } of domainTests) {
        const result = await analyzeDataset(dataset);
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        
        expect(questions).toHaveLength(4);
        
        // Questions should be domain-specific
        const questionsText = questions.join(' ').toLowerCase();
        const hasDomainRelevance = expectedThemes.some(theme => 
          questionsText.includes(theme)
        );
        expect(hasDomainRelevance).toBe(true);
        
        // Each question should be actionable
        questions.forEach(question => {
          expect(question.length).toBeGreaterThan(25);
          expect(question.includes('?')).toBe(true);
          
          // Should contain action-oriented words
          const actionWords = ['analyze', 'compare', 'identify', 'determine', 'evaluate', 'assess', 'investigate', 'optimize', 'improve', 'how', 'what', 'which', 'why'];
          const hasActionWords = actionWords.some(word => 
            question.toLowerCase().includes(word)
          );
          expect(hasActionWords).toBe(true);
        });
        
        console.log(`✓ ${domain}: Generated ${questions.length} actionable questions`);
      }
    }, 180000);

    it('should avoid generic questions and provide specific insights', async () => {
      const datasets = [
        TestDatasets.getEducationDataset(),
        TestDatasets.getMarketingDataset(),
        TestDatasets.getOperationalDataset()
      ];
      
      const genericPhrases = [
        'basic analysis',
        'simple comparison',
        'general overview',
        'standard report',
        'typical analysis',
        'basic information'
      ];
      
      for (const dataset of datasets) {
        const result = await analyzeDataset(dataset);
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        
        // Should not contain generic phrases
        questions.forEach(question => {
          const questionLower = question.toLowerCase();
          genericPhrases.forEach(phrase => {
            expect(questionLower).not.toContain(phrase);
          });
        });
        
        // Should reference specific columns or concepts (or be domain-relevant)
        const columnNames = dataset.headers;
        const questionsText = questions.join(' ').toLowerCase();
        const referencesSpecificData = columnNames.some(col => 
          questionsText.includes(col.toLowerCase().replace('_', ' ')) ||
          questionsText.includes(col.toLowerCase().replace('_', ''))
        ) || questionsText.includes('analysis') || questionsText.includes('performance') || questionsText.includes('data');
        expect(referencesSpecificData).toBe(true);
      }
    }, 120000);

    it('should provide questions that lead to business decisions', async () => {
      const businessDatasets = [
        TestDatasets.getFinancialDataset(),
        TestDatasets.getSalesDataset(),
        TestDatasets.getManufacturingDataset()
      ];
      
      const decisionKeywords = [
        'optimize', 'improve', 'reduce', 'increase', 'enhance', 'maximize', 'minimize',
        'strategy', 'decision', 'action', 'recommendation', 'priority', 'focus',
        'investment', 'resource', 'allocation', 'efficiency', 'performance'
      ];
      
      for (const dataset of businessDatasets) {
        const result = await analyzeDataset(dataset);
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        
        // At least half the questions should imply business decisions
        const decisionOrientedQuestions = questions.filter(question => 
          decisionKeywords.some(keyword => 
            question.toLowerCase().includes(keyword)
          )
        );
        
        expect(decisionOrientedQuestions.length).toBeGreaterThanOrEqual(2);
        
        // Questions should suggest measurable outcomes
        const measurableQuestions = questions.filter(question => {
          const questionLower = question.toLowerCase();
          return questionLower.includes('rate') || 
                 questionLower.includes('percentage') ||
                 questionLower.includes('amount') ||
                 questionLower.includes('cost') ||
                 questionLower.includes('revenue') ||
                 questionLower.includes('score') ||
                 questionLower.includes('efficiency');
        });
        
        expect(measurableQuestions.length).toBeGreaterThanOrEqual(1);
      }
    }, 120000);
  });

  describe('Industry Domain Recognition', () => {
    it('should accurately identify industry domains from column patterns', async () => {
      const industryTests = [
        {
          dataset: TestDatasets.getFinancialDataset(),
          expectedDomains: ['Financial Services', 'Finance', 'Banking']
        },
        {
          dataset: TestDatasets.getSalesDataset(),
          expectedDomains: ['E-commerce', 'Retail', 'Sales']
        },
        {
          dataset: TestDatasets.getHealthcareDataset(),
          expectedDomains: ['Healthcare', 'Medical', 'Health']
        },
        {
          dataset: TestDatasets.getEducationDataset(),
          expectedDomains: ['Education', 'Academic', 'School']
        },
        {
          dataset: TestDatasets.getManufacturingDataset(),
          expectedDomains: ['Manufacturing', 'Industrial', 'Production']
        },
        {
          dataset: TestDatasets.getMarketingDataset(),
          expectedDomains: ['Marketing', 'Advertising', 'Campaign']
        }
      ];
      
      for (const { dataset, expectedDomains } of industryTests) {
        const result = await analyzeDataset(dataset);
        
        // Should identify appropriate industry domain
        const reportText = result.full_analysis_report_markdown;
        const identifiedCorrectDomain = expectedDomains.some(domain => 
          reportText.includes(domain)
        );
        expect(identifiedCorrectDomain).toBe(true);
        
        // Should use industry-appropriate terminology
        const executiveSummary = extractExecutiveSummary(reportText);
        expect(executiveSummary.length).toBeGreaterThan(100);
        
        console.log(`✓ Correctly identified domain for ${expectedDomains[0]} dataset`);
      }
    }, 240000);

    it('should provide industry-specific analytical recommendations', async () => {
      const industryAnalytics = [
        {
          dataset: TestDatasets.getFinancialDataset(),
          expectedAnalytics: ['profitability', 'roi', 'budget', 'variance', 'financial performance']
        },
        {
          dataset: TestDatasets.getManufacturingDataset(),
          expectedAnalytics: ['efficiency', 'quality', 'production', 'defect rate', 'operational performance']
        },
        {
          dataset: TestDatasets.getMarketingDataset(),
          expectedAnalytics: ['conversion', 'campaign', 'roi', 'channel', 'audience']
        }
      ];
      
      for (const { dataset, expectedAnalytics } of industryAnalytics) {
        const result = await analyzeDataset(dataset);
        
        // Should mention industry-specific analytics
        const reportLower = result.full_analysis_report_markdown.toLowerCase();
        const mentionsIndustryAnalytics = expectedAnalytics.some(analytic => 
          reportLower.includes(analytic.toLowerCase())
        );
        expect(mentionsIndustryAnalytics).toBe(true);
        
        // Should provide relevant chart recommendations
        const chartTitles = result.charts_to_generate.map(chart => chart.title.toLowerCase());
        const hasRelevantCharts = chartTitles.some(title => 
          expectedAnalytics.some(analytic => 
            title.includes(analytic.toLowerCase().split(' ')[0])
          )
        );
        expect(hasRelevantCharts).toBe(true);
      }
    }, 150000);
  });

  describe('Insight Depth and Value Assessment', () => {
    it('should provide deeper insights for richer datasets', async () => {
      const datasetComplexity = [
        {
          name: 'Simple',
          dataset: TestDatasets.getEdgeCaseDatasets().minimalDataset,
          expectedMinInsights: 2
        },
        {
          name: 'Moderate',
          dataset: TestDatasets.getSalesDataset(),
          expectedMinInsights: 4
        },
        {
          name: 'Complex',
          dataset: TestDatasets.getFinancialDataset(),
          expectedMinInsights: 6
        },
        {
          name: 'Very Complex',
          dataset: TestDatasets.getManufacturingDataset(),
          expectedMinInsights: 8
        }
      ];
      
      for (const { name, dataset, expectedMinInsights } of datasetComplexity) {
        const result = await analyzeDataset(dataset);
        
        // Count insights in the report
        const insightCount = countInsights(result.full_analysis_report_markdown);
        expect(insightCount).toBeGreaterThanOrEqual(expectedMinInsights);
        
        // Report length should correlate with complexity
        const reportLength = result.full_analysis_report_markdown.length;
        expect(reportLength).toBeGreaterThan(400);
        
        console.log(`${name} dataset: ${insightCount} insights, ${reportLength} chars`);
      }
    }, 180000);

    it('should identify and prioritize primary value drivers', async () => {
      const valueDriverTests = [
        {
          dataset: TestDatasets.getFinancialDataset(),
          expectedDrivers: ['Revenue', 'Profit', 'ROI']
        },
        {
          dataset: TestDatasets.getSalesDataset(),
          expectedDrivers: ['Price', 'Customer_Rating', 'Quantity_Sold']
        },
        {
          dataset: TestDatasets.getManufacturingDataset(),
          expectedDrivers: ['Units_Produced', 'Efficiency_Score', 'Defect_Rate']
        }
      ];
      
      for (const { dataset, expectedDrivers } of valueDriverTests) {
        const result = await analyzeDataset(dataset);
        
        // Should mention primary value drivers
        const reportText = result.full_analysis_report_markdown;
        const mentionsValueDrivers = expectedDrivers.some(driver => 
          reportText.includes(driver)
        );
        expect(mentionsValueDrivers).toBe(true);
        
        // Should prioritize value drivers in charts
        const chartAxes = result.charts_to_generate.flatMap(chart => [chart.xAxis, chart.yAxis]);
        const chartsUseValueDrivers = expectedDrivers.some(driver => 
          chartAxes.includes(driver)
        );
        expect(chartsUseValueDrivers).toBe(true);
      }
    }, 150000);

    it('should provide contextual business value explanations', async () => {
      const datasets = [
        TestDatasets.getEducationDataset(),
        TestDatasets.getHealthcareDataset(),
        TestDatasets.getMarketingDataset()
      ];
      
      const businessValueKeywords = [
        'impact', 'benefit', 'value', 'opportunity', 'improvement', 'optimization',
        'efficiency', 'effectiveness', 'performance', 'outcome', 'result'
      ];
      
      for (const dataset of datasets) {
        const result = await analyzeDataset(dataset);
        
        // Should explain business value
        const reportLower = result.full_analysis_report_markdown.toLowerCase();
        const explainsBusinessValue = businessValueKeywords.some(keyword => 
          reportLower.includes(keyword)
        );
        expect(explainsBusinessValue).toBe(true);
        
        // Should connect data insights to business outcomes
        const hasBusinessContext = reportLower.includes('business') || 
                                  reportLower.includes('organization') ||
                                  reportLower.includes('strategic');
        expect(hasBusinessContext).toBe(true);
        
        // Should provide actionable recommendations
        const hasActionableContent = reportLower.includes('recommend') ||
                                    reportLower.includes('suggest') ||
                                    reportLower.includes('consider') ||
                                    reportLower.includes('should');
        expect(hasActionableContent).toBe(true);
      }
    }, 120000);
  });
});

/**
 * Helper function to extract business questions from the markdown report
 */
function extractBusinessQuestions(markdown: string): string[] {
  const lines = markdown.split('\n');
  const questions: string[] = [];
  let inQuestionsSection = false;
  
  for (const line of lines) {
    if (line.includes('Key Business Questions') || line.includes('Business Questions')) {
      inQuestionsSection = true;
      continue;
    }
    
    if (inQuestionsSection) {
      if (line.startsWith('#') && !line.includes('Question') && !line.match(/^## \d+\./)) {
        break; // End of questions section
      }
      
      // Look for questions formatted as "## 1. Question text"
      if (line.match(/^## \d+\./)) {
        const question = line.replace(/^## \d+\.\s*/, '').trim();
        if (question.length > 10) {
          questions.push(question);
        }
      }
    }
  }
  
  return questions;
}

/**
 * Helper function to extract executive summary from the markdown report
 */
function extractExecutiveSummary(markdown: string): string {
  const lines = markdown.split('\n');
  const summaryLines: string[] = [];
  let inSummarySection = false;
  
  for (const line of lines) {
    if (line.includes('Executive Summary')) {
      inSummarySection = true;
      continue;
    }
    
    if (inSummarySection) {
      if (line.startsWith('#') && !line.includes('Executive')) {
        break; // End of summary section
      }
      summaryLines.push(line);
    }
  }
  
  return summaryLines.join('\n').trim();
}

/**
 * Helper function to count insights in the markdown report
 */
function countInsights(markdown: string): number {
  const insightIndicators = [
    'insight', 'finding', 'observation', 'pattern', 'trend', 'correlation',
    'relationship', 'analysis shows', 'data reveals', 'indicates that'
  ];
  
  const markdownLower = markdown.toLowerCase();
  let insightCount = 0;
  
  insightIndicators.forEach(indicator => {
    const matches = markdownLower.split(indicator).length - 1;
    insightCount += matches;
  });
  
  return insightCount;
}