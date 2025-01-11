import React, { useState } from "react";
import BudgetForm from "./BudgetForm";
import BudgetTable from "./BudgetTable";

const Budgets = () => {
  const [refresh, setRefresh] = useState(false);

  const handleFormSubmit = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div>
      <BudgetForm onSubmitSuccess={handleFormSubmit} />
      <BudgetTable key={refresh} />
    </div>
  );
};

export default Budgets;
