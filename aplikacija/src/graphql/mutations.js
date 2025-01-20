export const createFinancialReport = /* GraphQL */ `
  mutation CreateFinancialReport($input: CreateFinancialReportInput!) {
    createFinancialReport(input: $input) {
      month
      Revenue
      Expenses
      NetProfit
      Description
      Notes
    }
  }
`;
