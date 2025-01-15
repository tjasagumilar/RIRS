-- Create the database if it doesn't exist
CREATE DATABASE budget_db;

-- Connect to the database
\c budget_db

-- Create the table
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    department VARCHAR(255) NOT NULL,
    total_budget NUMERIC NOT NULL
);
