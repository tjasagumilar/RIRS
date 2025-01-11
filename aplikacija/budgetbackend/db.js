const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.BUDGET_DB_HOST,
  port: process.env.BUDGET_DB_PORT,
  user: process.env.BUDGET_DB_USER,
  password: process.env.BUDGET_DB_PASSWORD,
  database: process.env.BUDGET_DB_NAME,
});

module.exports = pool;
