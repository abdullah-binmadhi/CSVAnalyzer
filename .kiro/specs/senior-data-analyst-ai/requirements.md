# Requirements Document

## Introduction

The Senior Data Analyst AI is an automated exploratory data analysis (EDA) system that analyzes dataset structures and generates comprehensive analysis packages. The system takes dataset headers and sample data as input and produces both visualization recommendations and detailed business intelligence reports in a structured JSON format. This tool aims to demonstrate the full analytical potential of any dataset by identifying meaningful relationships, distributions, and actionable insights.

## Requirements

### Requirement 1

**User Story:** As a data analyst, I want to input dataset headers and sample data, so that I can receive automated EDA recommendations without manual analysis.

#### Acceptance Criteria

1. WHEN a user provides dataset headers and sample data THEN the system SHALL accept the input in the specified format
2. WHEN the input contains column headers as an array THEN the system SHALL parse and validate all column names
3. WHEN the input contains sample data rows THEN the system SHALL analyze the data structure and types
4. IF the input format is invalid THEN the system SHALL return appropriate error messages

### Requirement 2

**User Story:** As a data analyst, I want the system to generate as many meaningful visualization recommendations as possible, so that I can explore all potential ways to visualize my data.

#### Acceptance Criteria

1. WHEN the system analyzes the dataset THEN it SHALL generate all possible distinct visualization recommendations until no more unique charts can be created
2. WHEN generating visualizations THEN each recommendation SHALL include title, type, xAxis, and yAxis specifications
3. WHEN selecting chart types THEN the system SHALL only recommend 'bar', 'line', or 'scatter' charts
4. WHEN recommending bar charts THEN the system SHALL use them for categorical-vs-numeric grouping
5. WHEN recommending line charts THEN the system SHALL use them for time-series or trend analysis
6. WHEN recommending scatter charts THEN the system SHALL use them for numerical correlations
7. WHEN creating visualization diversity THEN the system SHALL ensure each chart highlights different aspects (distribution, trend, comparison, correlation, composition)
8. WHEN reaching the limit of unique visualizations THEN the system SHALL stop generating charts to avoid duplicates

### Requirement 3

**User Story:** As a data analyst, I want to receive a comprehensive analysis report in Markdown format, so that I can understand the business context and potential of my dataset.

#### Acceptance Criteria

1. WHEN generating the analysis report THEN the system SHALL format it as valid Markdown
2. WHEN creating the executive summary THEN the system SHALL identify the likely industry/domain of the dataset
3. WHEN analyzing statistical potential THEN the system SHALL identify primary value columns and data quality issues
4. WHEN identifying relationships THEN the system SHALL note at least two potential correlations or patterns
5. WHEN providing actionable insights THEN the system SHALL list 3-4 specific business questions that could be answered
6. WHEN concluding the report THEN the system SHALL summarize the overall potential of the dataset

### Requirement 4

**User Story:** As a developer integrating this system, I want to receive output in a specific JSON format, so that I can programmatically process the results.

#### Acceptance Criteria

1. WHEN the system completes analysis THEN it SHALL return a single, valid JSON object
2. WHEN formatting output THEN the system SHALL include no text outside the JSON object
3. WHEN structuring the JSON THEN it SHALL contain exactly two keys: 'charts_to_generate' and 'full_analysis_report_markdown'
4. WHEN providing charts_to_generate THEN it SHALL be an array containing all possible unique chart objects
5. WHEN providing full_analysis_report_markdown THEN it SHALL be a single string containing the complete Markdown report

### Requirement 5

**User Story:** As a data analyst, I want the system to intelligently handle different data types and structures, so that it can provide relevant analysis regardless of my dataset's domain.

#### Acceptance Criteria

1. WHEN analyzing numerical columns THEN the system SHALL identify distribution patterns and outlier potential
2. WHEN analyzing categorical columns THEN the system SHALL identify grouping and comparison opportunities
3. WHEN detecting time/date columns THEN the system SHALL prioritize trend analysis visualizations
4. WHEN identifying relationships THEN the system SHALL suggest both categorical-numeric and numeric-numeric correlations
5. WHEN handling missing or incomplete data THEN the system SHALL note data quality issues in the report
6. IF the dataset contains insufficient data for meaningful analysis THEN the system SHALL provide appropriate guidance

### Requirement 6

**User Story:** As a business stakeholder, I want the analysis to focus on actionable insights, so that I can make data-driven decisions based on the recommendations.

#### Acceptance Criteria

1. WHEN generating business questions THEN the system SHALL focus on actionable, specific inquiries
2. WHEN identifying correlations THEN the system SHALL explain potential business implications
3. WHEN recommending visualizations THEN the system SHALL prioritize charts that reveal business-relevant patterns
4. WHEN summarizing findings THEN the system SHALL connect technical insights to business value
5. WHEN suggesting next steps THEN the system SHALL provide concrete analytical directions