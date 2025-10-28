/**
 * Comprehensive test datasets for various business scenarios
 * Requirements: 5.4, 5.5, 5.6, 6.3, 6.5
 */

import { InputData } from '../types/interfaces';

export class TestDatasets {
  
  /**
   * Financial Services Dataset - Complex financial data with multiple metrics
   */
  static getFinancialDataset(): InputData {
    return {
      headers: [
        'Date', 'Revenue', 'Expenses', 'Profit', 'Department', 
        'Investment_Amount', 'ROI_Percentage', 'Cash_Flow', 'Budget_Variance'
      ],
      sampleData: [
        ['2023-01-01', 150000, 120000, 30000, 'Sales', 50000, 15.5, 25000, -5000],
        ['2023-01-02', 180000, 140000, 40000, 'Marketing', 60000, 18.2, 35000, 2000],
        ['2023-01-03', 165000, 130000, 35000, 'Engineering', 75000, 12.8, 28000, -8000],
        ['2023-01-04', 200000, 160000, 40000, 'Sales', 80000, 20.1, 45000, 5000],
        ['2023-01-05', 175000, 135000, 40000, 'Operations', 55000, 16.7, 38000, 1000],
        ['2023-01-06', 190000, 145000, 45000, 'Marketing', 70000, 19.3, 42000, 3000],
        ['2023-01-07', 155000, 125000, 30000, 'Engineering', 45000, 14.2, 22000, -7000],
        ['2023-01-08', 220000, 170000, 50000, 'Sales', 90000, 22.5, 55000, 8000],
        ['2023-01-09', 185000, 150000, 35000, 'Operations', 65000, 17.8, 40000, 2000],
        ['2023-01-10', 195000, 155000, 40000, 'Marketing', 75000, 18.9, 45000, 4000]
      ]
    };
  }

  /**
   * E-commerce/Sales Dataset - Product and customer focused data
   */
  static getSalesDataset(): InputData {
    return {
      headers: [
        'Product_ID', 'Product_Name', 'Category', 'Price', 'Quantity_Sold', 
        'Customer_Rating', 'Discount_Percentage', 'Shipping_Cost', 'Customer_Segment'
      ],
      sampleData: [
        ['P001', 'iPhone 14 Pro', 'Electronics', 999.99, 25, 4.8, 5.0, 9.99, 'Premium'],
        ['P002', 'Samsung Galaxy S23', 'Electronics', 899.99, 30, 4.6, 8.0, 9.99, 'Premium'],
        ['P003', 'Nike Air Max', 'Footwear', 129.99, 45, 4.4, 15.0, 7.99, 'Standard'],
        ['P004', 'MacBook Pro', 'Electronics', 1999.99, 12, 4.9, 3.0, 0.00, 'Premium'],
        ['P005', 'Adidas Ultraboost', 'Footwear', 179.99, 38, 4.5, 12.0, 7.99, 'Standard'],
        ['P006', 'Dell XPS 13', 'Electronics', 1299.99, 18, 4.3, 10.0, 0.00, 'Business'],
        ['P007', 'Levi\'s Jeans', 'Clothing', 79.99, 55, 4.2, 20.0, 5.99, 'Standard'],
        ['P008', 'Sony WH-1000XM4', 'Electronics', 349.99, 40, 4.7, 7.0, 5.99, 'Premium'],
        ['P009', 'Under Armour Shirt', 'Clothing', 39.99, 65, 4.1, 25.0, 4.99, 'Budget'],
        ['P010', 'iPad Air', 'Electronics', 599.99, 28, 4.6, 6.0, 9.99, 'Standard']
      ]
    };
  }

  /**
   * Operational Dataset - Manufacturing and logistics data
   */
  static getOperationalDataset(): InputData {
    return {
      headers: [
        'Machine_ID', 'Production_Date', 'Units_Produced', 'Downtime_Hours', 
        'Quality_Score', 'Energy_Consumption', 'Maintenance_Cost', 'Operator_Shift'
      ],
      sampleData: [
        ['M001', '2023-01-01', 1200, 2.5, 98.5, 450.0, 250.00, 'Day'],
        ['M002', '2023-01-01', 1150, 3.0, 97.8, 480.0, 300.00, 'Day'],
        ['M003', '2023-01-01', 1300, 1.5, 99.2, 420.0, 150.00, 'Night'],
        ['M001', '2023-01-02', 1180, 3.5, 97.2, 470.0, 350.00, 'Day'],
        ['M002', '2023-01-02', 1220, 2.0, 98.8, 440.0, 200.00, 'Night'],
        ['M003', '2023-01-02', 1250, 2.8, 98.1, 460.0, 280.00, 'Day'],
        ['M001', '2023-01-03', 1350, 1.0, 99.5, 400.0, 100.00, 'Night'],
        ['M002', '2023-01-03', 1100, 4.0, 96.5, 500.0, 400.00, 'Day'],
        ['M003', '2023-01-03', 1280, 2.2, 98.6, 435.0, 220.00, 'Night'],
        ['M001', '2023-01-04', 1320, 1.8, 99.0, 415.0, 180.00, 'Day']
      ]
    };
  }

  /**
   * Healthcare Dataset - Patient and treatment data
   */
  static getHealthcareDataset(): InputData {
    return {
      headers: [
        'Patient_ID', 'Age', 'Gender', 'Diagnosis', 'Treatment_Duration_Days', 
        'Treatment_Cost', 'Outcome', 'Hospital_Stay_Days', 'Insurance_Coverage'
      ],
      sampleData: [
        ['PT001', 45, 'Male', 'Hypertension', 30, 1500.00, 'Improved', 0, 'Full'],
        ['PT002', 62, 'Female', 'Diabetes', 90, 3200.00, 'Stable', 3, 'Partial'],
        ['PT003', 38, 'Male', 'Hypertension', 45, 1800.00, 'Improved', 1, 'Full'],
        ['PT004', 55, 'Female', 'Heart Disease', 120, 8500.00, 'Improved', 7, 'Full'],
        ['PT005', 41, 'Male', 'Diabetes', 60, 2800.00, 'Stable', 2, 'Partial'],
        ['PT006', 67, 'Female', 'Heart Disease', 150, 12000.00, 'Critical', 14, 'Full'],
        ['PT007', 29, 'Female', 'Hypertension', 25, 1200.00, 'Recovered', 0, 'Full'],
        ['PT008', 58, 'Male', 'Diabetes', 75, 3500.00, 'Improved', 4, 'Partial'],
        ['PT009', 72, 'Male', 'Heart Disease', 180, 15000.00, 'Stable', 21, 'Full'],
        ['PT010', 33, 'Female', 'Hypertension', 35, 1600.00, 'Recovered', 1, 'Full']
      ]
    };
  }

  /**
   * Human Resources Dataset - Employee and performance data
   */
  static getHRDataset(): InputData {
    return {
      headers: [
        'Employee_ID', 'Name', 'Department', 'Position', 'Salary', 
        'Years_Experience', 'Performance_Rating', 'Training_Hours', 'Bonus_Percentage'
      ],
      sampleData: [
        ['E001', 'John Smith', 'Engineering', 'Senior Developer', 95000, 8, 4.5, 40, 15.0],
        ['E002', 'Jane Doe', 'Marketing', 'Marketing Manager', 78000, 6, 4.2, 32, 12.0],
        ['E003', 'Mike Johnson', 'Sales', 'Sales Representative', 65000, 4, 3.8, 25, 8.0],
        ['E004', 'Sarah Wilson', 'Engineering', 'Tech Lead', 110000, 10, 4.8, 45, 18.0],
        ['E005', 'David Brown', 'HR', 'HR Specialist', 58000, 3, 4.0, 35, 10.0],
        ['E006', 'Lisa Garcia', 'Finance', 'Financial Analyst', 72000, 5, 4.3, 28, 13.0],
        ['E007', 'Tom Anderson', 'Operations', 'Operations Manager', 85000, 7, 4.1, 38, 14.0],
        ['E008', 'Emily Davis', 'Marketing', 'Content Specialist', 52000, 2, 3.9, 30, 9.0],
        ['E009', 'Chris Miller', 'Engineering', 'Junior Developer', 68000, 2, 4.0, 50, 11.0],
        ['E010', 'Amanda Taylor', 'Sales', 'Sales Manager', 92000, 9, 4.6, 35, 16.0]
      ]
    };
  }

  /**
   * Manufacturing Dataset - Industrial production data
   */
  static getManufacturingDataset(): InputData {
    return {
      headers: [
        'Plant_ID', 'Production_Line', 'Shift', 'Date', 'Units_Produced', 
        'Defect_Rate', 'Energy_Usage', 'Maintenance_Hours', 'Operator_Count', 'Efficiency_Score'
      ],
      sampleData: [
        ['PLANT_A', 'Line_1', 'Day', '2023-01-01', 1200, 2.5, 450.0, 2.0, 8, 95.2],
        ['PLANT_A', 'Line_2', 'Day', '2023-01-01', 1150, 3.1, 480.0, 2.5, 8, 92.8],
        ['PLANT_B', 'Line_1', 'Night', '2023-01-01', 1300, 1.8, 420.0, 1.5, 6, 98.1],
        ['PLANT_A', 'Line_1', 'Night', '2023-01-02', 1180, 2.8, 470.0, 3.0, 6, 94.5],
        ['PLANT_B', 'Line_2', 'Day', '2023-01-02', 1220, 2.2, 440.0, 2.0, 8, 96.7],
        ['PLANT_C', 'Line_1', 'Day', '2023-01-02', 1250, 2.6, 460.0, 2.8, 8, 95.8],
        ['PLANT_A', 'Line_2', 'Night', '2023-01-03', 1350, 1.5, 400.0, 1.0, 6, 99.2],
        ['PLANT_B', 'Line_1', 'Day', '2023-01-03', 1100, 4.2, 500.0, 4.0, 8, 89.3],
        ['PLANT_C', 'Line_2', 'Night', '2023-01-03', 1280, 2.1, 435.0, 2.2, 6, 97.4],
        ['PLANT_A', 'Line_1', 'Day', '2023-01-04', 1320, 1.9, 415.0, 1.8, 8, 98.6]
      ]
    };
  }

  /**
   * Education Dataset - Student performance and institutional data
   */
  static getEducationDataset(): InputData {
    return {
      headers: [
        'Student_ID', 'Grade_Level', 'Subject', 'Test_Score', 'Study_Hours', 
        'Attendance_Rate', 'Teacher_Rating', 'Parent_Education', 'School_Type'
      ],
      sampleData: [
        ['STU001', 'Grade_10', 'Mathematics', 85, 15, 95.0, 4.2, 'College', 'Public'],
        ['STU002', 'Grade_11', 'Science', 92, 20, 98.0, 4.8, 'Graduate', 'Private'],
        ['STU003', 'Grade_9', 'English', 78, 12, 88.0, 3.9, 'High School', 'Public'],
        ['STU004', 'Grade_12', 'Mathematics', 96, 25, 99.0, 4.9, 'Graduate', 'Private'],
        ['STU005', 'Grade_10', 'Science', 82, 14, 92.0, 4.1, 'College', 'Public'],
        ['STU006', 'Grade_11', 'English', 89, 18, 96.0, 4.5, 'College', 'Private'],
        ['STU007', 'Grade_9', 'Mathematics', 74, 10, 85.0, 3.6, 'High School', 'Public'],
        ['STU008', 'Grade_12', 'Science', 94, 22, 97.0, 4.7, 'Graduate', 'Private'],
        ['STU009', 'Grade_10', 'English', 87, 16, 94.0, 4.3, 'College', 'Public'],
        ['STU010', 'Grade_11', 'Mathematics', 91, 19, 96.0, 4.6, 'Graduate', 'Private']
      ]
    };
  }

  /**
   * Marketing Dataset - Campaign performance and customer engagement
   */
  static getMarketingDataset(): InputData {
    return {
      headers: [
        'Campaign_ID', 'Channel', 'Target_Audience', 'Budget', 'Impressions', 
        'Clicks', 'Conversions', 'Revenue', 'Duration_Days', 'Season'
      ],
      sampleData: [
        ['CAM001', 'Social Media', 'Young Adults', 5000, 50000, 2500, 125, 12500, 30, 'Spring'],
        ['CAM002', 'Email', 'Professionals', 3000, 25000, 1500, 90, 9000, 14, 'Spring'],
        ['CAM003', 'Display Ads', 'Seniors', 8000, 80000, 3200, 160, 16000, 45, 'Summer'],
        ['CAM004', 'Search Ads', 'Young Adults', 6000, 60000, 3600, 180, 18000, 21, 'Summer'],
        ['CAM005', 'Social Media', 'Professionals', 4500, 45000, 2250, 112, 11200, 28, 'Fall'],
        ['CAM006', 'Email', 'Seniors', 2500, 20000, 1200, 72, 7200, 10, 'Fall'],
        ['CAM007', 'Display Ads', 'Young Adults', 7500, 75000, 3750, 187, 18700, 35, 'Winter'],
        ['CAM008', 'Search Ads', 'Professionals', 5500, 55000, 3300, 165, 16500, 25, 'Winter'],
        ['CAM009', 'Social Media', 'Seniors', 4000, 40000, 2000, 100, 10000, 20, 'Spring'],
        ['CAM010', 'Email', 'Young Adults', 3500, 30000, 1800, 108, 10800, 15, 'Summer']
      ]
    };
  }

  /**
   * Large Dataset Generator - Creates datasets with specified number of rows
   */
  static generateLargeDataset(rows: number): InputData {
    const headers = [
      'ID', 'Timestamp', 'Category', 'Value1', 'Value2', 'Value3', 
      'Status', 'Region', 'Score', 'Amount'
    ];
    
    const categories = ['A', 'B', 'C', 'D', 'E'];
    const statuses = ['Active', 'Inactive', 'Pending', 'Completed'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];
    
    const sampleData = [];
    for (let i = 1; i <= rows; i++) {
      const date = new Date(2023, 0, 1 + (i % 365));
      sampleData.push([
        `ID${i.toString().padStart(6, '0')}`,
        date.toISOString().split('T')[0],
        categories[i % categories.length],
        Math.round(Math.random() * 1000),
        Math.round(Math.random() * 500),
        Math.round(Math.random() * 200),
        statuses[i % statuses.length],
        regions[i % regions.length],
        Math.round(Math.random() * 100),
        Math.round(Math.random() * 10000)
      ]);
    }
    
    return { headers, sampleData };
  }

  /**
   * Edge Case Datasets - Various problematic scenarios
   */
  static getEdgeCaseDatasets() {
    return {
      // Dataset with many null values
      highNullDataset: {
        headers: ['ID', 'Value1', 'Value2', 'Category'],
        sampleData: [
          ['1', 100, null, 'A'],
          ['2', null, 200, null],
          ['3', null, null, 'B'],
          ['4', 400, 300, 'A'],
          ['5', null, null, null]
        ]
      },

      // Dataset with mixed data types in columns
      mixedTypeDataset: {
        headers: ['ID', 'Mixed_Column', 'Another_Mixed'],
        sampleData: [
          ['1', 'Text Value', 100],
          ['2', 42, 'String Value'],
          ['3', '2023-01-01', true],
          ['4', null, 3.14],
          ['5', 'Another Text', null]
        ]
      },

      // Minimal dataset
      minimalDataset: {
        headers: ['ID', 'Value'],
        sampleData: [
          [1, 100],
          [2, 200]
        ]
      },

      // Single column dataset
      singleColumnDataset: {
        headers: ['Value'],
        sampleData: [
          [100],
          [200],
          [150],
          [300],
          [250]
        ]
      },

      // All categorical dataset
      allCategoricalDataset: {
        headers: ['Category1', 'Category2', 'Category3'],
        sampleData: [
          ['A', 'X', 'Red'],
          ['B', 'Y', 'Blue'],
          ['A', 'Z', 'Green'],
          ['C', 'X', 'Red'],
          ['B', 'Y', 'Blue']
        ]
      },

      // All numerical dataset
      allNumericalDataset: {
        headers: ['Value1', 'Value2', 'Value3', 'Value4'],
        sampleData: [
          [10, 20, 30, 40],
          [15, 25, 35, 45],
          [12, 22, 32, 42],
          [18, 28, 38, 48],
          [14, 24, 34, 44]
        ]
      },

      // Time series dataset
      timeSeriesDataset: {
        headers: ['Date', 'Time', 'Value', 'Cumulative'],
        sampleData: [
          ['2023-01-01', '09:00:00', 100, 100],
          ['2023-01-01', '10:00:00', 150, 250],
          ['2023-01-01', '11:00:00', 120, 370],
          ['2023-01-02', '09:00:00', 180, 550],
          ['2023-01-02', '10:00:00', 200, 750]
        ]
      },

      // Dataset with very long text values
      longTextDataset: {
        headers: ['ID', 'Description', 'Category', 'Value'],
        sampleData: [
          [1, 'This is a very long description that contains multiple sentences and detailed information about the product or service being described in this particular row of data.', 'A', 100],
          [2, 'Another extremely lengthy description with lots of details, specifications, and comprehensive information that might be found in real-world datasets.', 'B', 200],
          [3, 'Short desc', 'A', 150],
          [4, 'Medium length description with some details but not as extensive as the previous entries in this dataset.', 'C', 300],
          [5, 'Brief', 'B', 250]
        ]
      },

      // Dataset with boolean values
      booleanDataset: {
        headers: ['ID', 'Active', 'Premium', 'Verified', 'Score'],
        sampleData: [
          [1, true, false, true, 85],
          [2, false, true, true, 92],
          [3, true, true, false, 78],
          [4, true, false, true, 88],
          [5, false, false, false, 65]
        ]
      },

      // Dataset with currency and percentage values
      financialFormatsDataset: {
        headers: ['Product', 'Price', 'Discount', 'Tax_Rate', 'Final_Amount'],
        sampleData: [
          ['Product A', '$29.99', '10%', '8.5%', '$29.32'],
          ['Product B', '$49.99', '15%', '8.5%', '$46.07'],
          ['Product C', '$19.99', '5%', '8.5%', '$20.60'],
          ['Product D', '$99.99', '20%', '8.5%', '$86.79'],
          ['Product E', '$39.99', '12%', '8.5%', '$38.15']
        ]
      },

      // Dataset with scientific notation
      scientificDataset: {
        headers: ['Measurement', 'Value_Scientific', 'Value_Decimal', 'Unit'],
        sampleData: [
          ['Mass', '1.23e-6', 0.00000123, 'kg'],
          ['Distance', '4.56e+8', 456000000, 'm'],
          ['Temperature', '2.73e+2', 273, 'K'],
          ['Pressure', '1.01e+5', 101000, 'Pa'],
          ['Energy', '6.63e-34', 0.000000000000000000000000000000000663, 'J']
        ]
      }
    };
  }

  /**
   * Data Type Combination Datasets - Test various type combinations
   */
  static getDataTypeCombinations() {
    return {
      // Numerical + Categorical
      numericalCategorical: {
        headers: ['Amount', 'Category', 'Score'],
        sampleData: [
          [1000, 'Premium', 95],
          [500, 'Standard', 80],
          [1500, 'Premium', 98],
          [300, 'Budget', 70],
          [800, 'Standard', 85]
        ]
      },

      // DateTime + Numerical
      dateTimeNumerical: {
        headers: ['Date', 'Revenue', 'Growth_Rate'],
        sampleData: [
          ['2023-01-01', 10000, 5.2],
          ['2023-02-01', 12000, 20.0],
          ['2023-03-01', 11000, -8.3],
          ['2023-04-01', 15000, 36.4],
          ['2023-05-01', 14000, -6.7]
        ]
      },

      // Text + Numerical + Categorical
      textNumericalCategorical: {
        headers: ['Description', 'Price', 'Category', 'Rating'],
        sampleData: [
          ['High-quality product', 299.99, 'Electronics', 4.8],
          ['Budget-friendly option', 49.99, 'Accessories', 4.2],
          ['Premium service', 199.99, 'Services', 4.9],
          ['Standard offering', 99.99, 'Electronics', 4.0],
          ['Luxury item', 599.99, 'Premium', 4.7]
        ]
      },

      // Complex mixed types
      complexMixed: {
        headers: ['ID', 'Name', 'Date_Created', 'Score', 'Status', 'Amount', 'Tags'],
        sampleData: [
          ['ID001', 'Project Alpha', '2023-01-15', 87.5, 'Active', 15000, 'urgent,priority'],
          ['ID002', 'Project Beta', '2023-02-20', 92.3, 'Completed', 22000, 'standard'],
          ['ID003', 'Project Gamma', '2023-03-10', 78.9, 'On Hold', 8000, 'review,pending'],
          ['ID004', 'Project Delta', '2023-04-05', 95.1, 'Active', 35000, 'priority,critical'],
          ['ID005', 'Project Epsilon', '2023-05-12', 83.7, 'Planning', 12000, 'standard,new']
        ]
      }
    };
  }
}