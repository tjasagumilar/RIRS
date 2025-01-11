CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    department VARCHAR(255) NOT NULL,
    total_budget NUMERIC NOT NULL
);
