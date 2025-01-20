/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateFinancialReport = /* GraphQL */ `
  subscription OnCreateFinancialReport(
    $Description: String
    $Expenses: Int
    $NetProfit: Int
    $Revenue: Int
    $month: String
  ) {
    onCreateFinancialReport(
      Description: $Description
      Expenses: $Expenses
      NetProfit: $NetProfit
      Revenue: $Revenue
      month: $month
    ) {
      Description
      Expenses
      NetProfit
      Notes
      Revenue
      month
      __typename
    }
  }
`;
export const onDeleteFinancialReport = /* GraphQL */ `
  subscription OnDeleteFinancialReport(
    $Description: String
    $Expenses: Int
    $NetProfit: Int
    $Revenue: Int
    $month: String
  ) {
    onDeleteFinancialReport(
      Description: $Description
      Expenses: $Expenses
      NetProfit: $NetProfit
      Revenue: $Revenue
      month: $month
    ) {
      Description
      Expenses
      NetProfit
      Notes
      Revenue
      month
      __typename
    }
  }
`;
export const onUpdateFinancialReport = /* GraphQL */ `
  subscription OnUpdateFinancialReport(
    $Description: String
    $Expenses: Int
    $NetProfit: Int
    $Revenue: Int
    $month: String
  ) {
    onUpdateFinancialReport(
      Description: $Description
      Expenses: $Expenses
      NetProfit: $NetProfit
      Revenue: $Revenue
      month: $month
    ) {
      Description
      Expenses
      NetProfit
      Notes
      Revenue
      month
      __typename
    }
  }
`;
