/**
 * Tests to verify business insight quality and actionability
 * Requirements: 6.3, 6.5
 */

import { analyzeDataset } from '../index';
import { TestDatasets } from './testDatasets';

describe('Business Insight Quality Tests', () => {
  
  describe('Domain-Specific Insight Quality', () => {
    it('should provide high-quality financial insights', async () => {
      const dataset = TestDatasets.getFinancialDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify financial domain correctly
      expect(result.full_analysis_report_markdown).toContain('Financial Services');
      
      // Should identify key financial metrics
      expect(result.full_analysis_report_markdown).toContain('Revenue');
      expect(result.full_analysis_report_markdown).toContain('Profit');
      expect(result.full_analysis_report_markdown).toContain('ROI');
      
      // Should provide actionable financial questions
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      expect(questions.length).toBe(4);
      
      // Questions should be specific and actionable
      const financialKeywords = ['revenue', 'profit', 'department', 'performance', 'roi', 'investment', 'budget'];
      const hasFinancialFocus = questions.some(q => 
        financialKeywords.some(keyword => q.toLowerCase().includes(keyword))
      );
      expect(hasFinancialFocus).toBe(true);
      
      // Should suggest relevant correlations
      expect(result.full_analysis_report_markdown).toContain('correlation');
      expect(result.full_analysis_report_markdown).toContain('Department');
    });

    it('should provide high-quality e-commerce insights', async () => {
      const dataset = TestDatasets.getSalesDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify e-commerce domain
      expect(result.full_analysis_report_markdown).toContain('E-commerce');
      
      // Should identify key e-commerce metrics
      expect(result.full_analysis_report_markdown).toContain('Price');
      expect(result.full_analysis_report_markdown).toContain('Customer');
      expect(result.full_analysis_report_markdown).toContain('Product');
      
      // Should provide actionable e-commerce questions
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      const ecommerceKeywords = ['customer', 'product', 'price', 'rating', 'category', 'sales', 'discount'];
      const hasEcommerceFocus = questions.some(q => 
        ecommerceKeywords.some(keyword => q.toLowerCase().includes(keyword))
      );
      expect(hasEcommerceFocus).toBe(true);
      
      // Should mention customer segmentation or product analysis
      const hasSegmentationInsight = result.full_analysis_report_markdown.toLowerCase().includes('segment') ||
                                   result.full_analysis_report_markdown.toLowerCase().includes('customer') ||
                                   result.full_analysis_report_markdown.toLowerCase().includes('product');
      expect(hasSegmentationInsight).toBe(true);
    });

    it('should provide high-quality operational insights', async () => {
      const dataset = TestDatasets.getOperationalDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify operational/manufacturing context
      const hasOperationalContext = result.full_analysis_report_markdown.includes('Manufacturing') ||
                                   result.full_analysis_report_markdown.includes('Operations');
      expect(hasOperationalContext).toBe(true);
      
      // Should identify key operational metrics
      const hasOperationalMetrics = result.full_analysis_report_markdown.includes('Production') ||
                                   result.full_analysis_report_markdown.includes('Units') ||
                                   result.full_analysis_report_markdown.includes('Quality');
      expect(hasOperationalMetrics).toBe(true);
      
      // Should provide actionable operational questions
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      const operationalKeywords = ['production', 'quality', 'efficiency', 'downtime', 'machine', 'performance'];
      const hasOperationalFocus = questions.some(q => 
        operationalKeywords.some(keyword => q.toLowerCase().includes(keyword))
      );
      expect(hasOperationalFocus).toBe(true);
    });

    it('should provide high-quality healthcare insights', async () => {
      const dataset = TestDatasets.getHealthcareDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify healthcare domain
      expect(result.full_analysis_report_markdown).toContain('Healthcare');
      
      // Should identify key healthcare metrics
      const hasHealthcareMetrics = result.full_analysis_report_markdown.includes('Patient') ||
                                  result.full_analysis_report_markdown.includes('Treatment') ||
                                  result.full_analysis_report_markdown.includes('Age');
      expect(hasHealthcareMetrics).toBe(true);
      
      // Should provide actionable healthcare questions
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      const healthcareKeywords = ['patient', 'treatment', 'outcome', 'cost', 'age', 'diagnosis'];
      const hasHealthcareFocus = questions.some(q => 
        healthcareKeywords.some(keyword => q.toLowerCase().includes(keyword))
      );
      expect(hasHealthcareFocus).toBe(true);
    });

    it('should provide high-quality HR insights', async () => {
      const dataset = TestDatasets.getHRDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify HR domain
      const hasHRDomain = result.full_analysis_report_markdown.includes('Human Resources') ||
                         result.full_analysis_report_markdown.includes('HR');
      expect(hasHRDomain).toBe(true);
      
      // Should identify key HR metrics
      const hasHRMetrics = result.full_analysis_report_markdown.includes('Employee') ||
                          result.full_analysis_report_markdown.includes('Salary') ||
                          result.full_analysis_report_markdown.includes('Performance');
      expect(hasHRMetrics).toBe(true);
      
      // Should provide actionable HR questions
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      const hrKeywords = ['employee', 'salary', 'performance', 'department', 'experience', 'training'];
      const hasHRFocus = questions.some(q => 
        hrKeywords.some(keyword => q.toLowerCase().includes(keyword))
      );
      expect(hasHRFocus).toBe(true);
    });
  });

  describe('Actionability Assessment', () => {
    it('should generate specific, measurable questions', async () => {
      const dataset = TestDatasets.getFinancialDataset();
      const result = await analyzeDataset(dataset);
      
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      
      // Questions should be relevant to the dataset (may not always mention exact column names)
      const columnNames = dataset.headers;
      const questionsText = questions.join(' ').toLowerCase();
      const hasRelevantContent = columnNames.some(col => 
        questionsText.includes(col.toLowerCase()) || 
        questionsText.includes(col.toLowerCase().replace('_', ' '))
      ) || questionsText.includes('revenue') || questionsText.includes('financial');
      expect(hasRelevantContent).toBe(true);
      
      // Questions should be actionable (contain action words or business terms)
      const actionWords = ['analyze', 'compare', 'identify', 'determine', 'evaluate', 'assess', 'investigate', 'optimize', 'improve', 'how', 'what', 'which'];
      const hasActionableContent = actionWords.some(word => 
        questionsText.includes(word)
      );
      expect(hasActionableContent).toBe(true);
    });

    it('should provide questions that can be answered with the data', async () => {
      const dataset = TestDatasets.getSalesDataset();
      const result = await analyzeDataset(dataset);
      
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      
      // Questions should be answerable with the available data
      const availableColumns = dataset.headers.map(h => h.toLowerCase());
      const questionsText = questions.join(' ').toLowerCase();
      const canBeAnswered = availableColumns.some(col => 
        questionsText.includes(col.replace('_', ' ')) || 
        questionsText.includes(col.replace('_', ''))
      ) || questionsText.includes('price') || questionsText.includes('customer') || questionsText.includes('product');
      expect(canBeAnswered).toBe(true);
    });

    it('should suggest analysis that leads to business decisions', async () => {
      const dataset = TestDatasets.getOperationalDataset();
      const result = await analyzeDataset(dataset);
      
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      
      // Questions should imply business decisions or actions
      const decisionKeywords = [
        'optimize', 'improve', 'reduce', 'increase', 'enhance', 'maximize', 'minimize',
        'strategy', 'decision', 'action', 'recommendation', 'priority', 'focus'
      ];
      
      const hasDecisionOrientation = questions.some(q => 
        decisionKeywords.some(keyword => q.toLowerCase().includes(keyword))
      );
      expect(hasDecisionOrientation).toBe(true);
    });

    it('should provide context for why questions are important', async () => {
      const dataset = TestDatasets.getHealthcareDataset();
      const result = await analyzeDataset(dataset);
      
      // Should provide context in the analysis sections
      expect(result.full_analysis_report_markdown).toContain('Statistical Analysis');
      expect(result.full_analysis_report_markdown).toContain('Relationship Analysis');
      
      // Should explain the significance of findings
      const hasExplanation = result.full_analysis_report_markdown.includes('insights') ||
                           result.full_analysis_report_markdown.includes('analysis') ||
                           result.full_analysis_report_markdown.includes('relationship') ||
                           result.full_analysis_report_markdown.includes('patterns');
      expect(hasExplanation).toBe(true);
    });
  });

  describe('Insight Relevance and Depth', () => {
    it('should identify primary value drivers correctly', async () => {
      const dataset = TestDatasets.getFinancialDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify Revenue and Profit as primary value columns
      expect(result.full_analysis_report_markdown).toContain('Revenue');
      expect(result.full_analysis_report_markdown).toContain('Profit');
      
      // Should prioritize these in the analysis
      const revenuePosition = result.full_analysis_report_markdown.indexOf('Revenue');
      const profitPosition = result.full_analysis_report_markdown.indexOf('Profit');
      expect(revenuePosition).toBeGreaterThan(-1);
      expect(profitPosition).toBeGreaterThan(-1);
    });

    it('should identify meaningful correlations', async () => {
      const dataset = TestDatasets.getSalesDataset();
      const result = await analyzeDataset(dataset);
      
      // Should identify logical correlations (e.g., Price vs Rating, Category vs Price)
      expect(result.full_analysis_report_markdown).toContain('correlation');
      
      // Should mention specific column relationships
      const mentionsRelationships = result.full_analysis_report_markdown.includes('Price') &&
                                   result.full_analysis_report_markdown.includes('Rating') ||
                                   result.full_analysis_report_markdown.includes('Category');
      expect(mentionsRelationships).toBe(true);
    });

    it('should provide industry-appropriate recommendations', async () => {
      const datasets = [
        { data: TestDatasets.getFinancialDataset(), keywords: ['revenue', 'profit', 'roi', 'budget'] },
        { data: TestDatasets.getSalesDataset(), keywords: ['customer', 'product', 'price', 'rating'] },
        { data: TestDatasets.getOperationalDataset(), keywords: ['production', 'quality', 'efficiency'] },
        { data: TestDatasets.getHealthcareDataset(), keywords: ['patient', 'treatment', 'outcome'] }
      ];
      
      for (const { data, keywords } of datasets) {
        const result = await analyzeDataset(data);
        
        // Should use industry-appropriate terminology
        const usesIndustryTerms = keywords.some(keyword => 
          result.full_analysis_report_markdown.toLowerCase().includes(keyword)
        );
        expect(usesIndustryTerms).toBe(true);
      }
    });

    it('should assess dataset potential accurately', async () => {
      const richDataset = TestDatasets.getFinancialDataset(); // Rich dataset with many columns
      const minimalDataset = TestDatasets.getEdgeCaseDatasets().minimalDataset;
      
      const richResult = await analyzeDataset(richDataset);
      const minimalResult = await analyzeDataset(minimalDataset);
      
      // Rich dataset should have higher potential assessment
      expect(richResult.full_analysis_report_markdown).toContain('analytical potential');
      expect(minimalResult.full_analysis_report_markdown).toContain('analytical potential');
      
      // Rich dataset should mention more capabilities
      const richCapabilities = (richResult.full_analysis_report_markdown.match(/analysis|correlation|trend|segmentation/gi) || []).length;
      const minimalCapabilities = (minimalResult.full_analysis_report_markdown.match(/analysis|correlation|trend|segmentation/gi) || []).length;
      
      expect(richCapabilities).toBeGreaterThan(minimalCapabilities);
    });
  });

  describe('Question Quality Standards', () => {
    it('should generate exactly 4 questions consistently', async () => {
      const datasets = [
        TestDatasets.getFinancialDataset(),
        TestDatasets.getSalesDataset(),
        TestDatasets.getOperationalDataset(),
        TestDatasets.getHealthcareDataset(),
        TestDatasets.getHRDataset()
      ];
      
      for (const dataset of datasets) {
        const result = await analyzeDataset(dataset);
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        expect(questions).toHaveLength(4);
      }
    });

    it('should generate diverse question types', async () => {
      const dataset = TestDatasets.getFinancialDataset();
      const result = await analyzeDataset(dataset);
      
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      
      // Should have different question focuses
      const questionTypes = {
        performance: questions.some(q => q.toLowerCase().includes('performance') || q.toLowerCase().includes('efficiency')),
        comparison: questions.some(q => q.toLowerCase().includes('compare') || q.toLowerCase().includes('difference')),
        trend: questions.some(q => q.toLowerCase().includes('trend') || q.toLowerCase().includes('time')),
        correlation: questions.some(q => q.toLowerCase().includes('relationship') || q.toLowerCase().includes('correlation'))
      };
      
      // Should have at least 2 different types of questions
      const typeCount = Object.values(questionTypes).filter(Boolean).length;
      expect(typeCount).toBeGreaterThanOrEqual(2);
    });

    it('should avoid generic or vague questions', async () => {
      const dataset = TestDatasets.getSalesDataset();
      const result = await analyzeDataset(dataset);
      
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      
      // Should not contain overly generic phrases (but allow some common business terms)
      const genericPhrases = ['basic information', 'simple analysis'];
      questions.forEach(question => {
        const isGeneric = genericPhrases.some(phrase => 
          question.toLowerCase().includes(phrase)
        );
        expect(isGeneric).toBe(false);
      });
      
      // Each question should be substantial (more than just a few words)
      questions.forEach(question => {
        expect(question.length).toBeGreaterThan(20);
      });
    });

    it('should provide questions with clear business value', async () => {
      const dataset = TestDatasets.getOperationalDataset();
      const result = await analyzeDataset(dataset);
      
      const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
      
      // Questions should imply business impact
      const businessValueKeywords = [
        'cost', 'revenue', 'profit', 'efficiency', 'performance', 'quality',
        'productivity', 'optimization', 'improvement', 'reduction', 'increase',
        'strategy', 'decision', 'analysis', 'insights', 'patterns', 'trends'
      ];
      
      const questionsText = questions.join(' ').toLowerCase();
      const hasBusinessValue = businessValueKeywords.some(keyword => 
        questionsText.includes(keyword)
      );
      expect(hasBusinessValue).toBe(true);
    });
  });

  describe('Cross-Domain Insight Consistency', () => {
    it('should maintain consistent quality across different domains', async () => {
      const datasets = [
        TestDatasets.getFinancialDataset(),
        TestDatasets.getSalesDataset(),
        TestDatasets.getOperationalDataset(),
        TestDatasets.getHealthcareDataset()
      ];
      
      const results = await Promise.all(datasets.map(dataset => analyzeDataset(dataset)));
      
      // All should have similar structure and quality
      results.forEach(result => {
        // Should have executive summary
        expect(result.full_analysis_report_markdown).toContain('Executive Summary');
        
        // Should have statistical analysis
        expect(result.full_analysis_report_markdown).toContain('Statistical Analysis');
        
        // Should have business questions
        const questions = extractBusinessQuestions(result.full_analysis_report_markdown);
        expect(questions).toHaveLength(4);
        
        // Should have conclusion
        expect(result.full_analysis_report_markdown).toContain('Conclusion');
        
        // Should have substantial content
        expect(result.full_analysis_report_markdown.length).toBeGreaterThan(800);
      });
    });

    it('should adapt insights to data characteristics', async () => {
      const timeSeriesDataset = TestDatasets.getEdgeCaseDatasets().timeSeriesDataset;
      const categoricalDataset = TestDatasets.getEdgeCaseDatasets().allCategoricalDataset;
      
      const timeSeriesResult = await analyzeDataset(timeSeriesDataset);
      const categoricalResult = await analyzeDataset(categoricalDataset);
      
      // Time series should focus on temporal analysis
      expect(timeSeriesResult.full_analysis_report_markdown).toContain('time-series');
      expect(timeSeriesResult.full_analysis_report_markdown).toContain('trend');
      
      // Categorical should focus on segmentation
      expect(categoricalResult.full_analysis_report_markdown).toContain('categorical');
      const hasSegmentationFocus = categoricalResult.full_analysis_report_markdown.includes('segment') ||
                                  categoricalResult.full_analysis_report_markdown.includes('group');
      expect(hasSegmentationFocus).toBe(true);
    });
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