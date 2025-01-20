export const listFinancialReports = /* GraphQL */ `
  query ListFinancialReports {
    listFinancialReports {
      items {
        month
        Revenue
        Expenses
        NetProfit
        Description
        Notes
      }
    }
  }
`;

export const getMonthlyRevenue = /* GraphQL */ `
  query GetMonthlyRevenue {
    getMonthlyRevenue {
      month
      revenue
    }
  } 
`;

export const getAnnualSummary = /* GraphQL */ `
  query GetAnnualSummary {
    getAnnualSummary {
      totalRevenue
      totalExpenses
      netProfit
    }
  }
`;

export const deleteFinancialReport = /* GraphQL */ `
  mutation DeleteFinancialReport($input: DeleteFinancialReportInput!) {
    deleteFinancialReport(input: $input) {
      month
    }
  }
`;
