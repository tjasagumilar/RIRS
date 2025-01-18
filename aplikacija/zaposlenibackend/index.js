const express = require("express");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const fs = require("fs");
const cors = require("cors"); // Add CORS support
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests

// Load database file from environment or fallback
const DB_FILE = process.env.DB_FILE || "./employee.db";

// Check if database file exists; create it if necessary
if (!fs.existsSync(DB_FILE)) {
  console.log("Database file not found. Creating a new database...");
  fs.writeFileSync(DB_FILE, ""); // Create an empty file
}

// Initialize SQLite Database
const db = new Database(DB_FILE, { verbose: console.log });

// Execute database initialization script
const initSQL = `
CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    position TEXT NOT NULL,
    salary REAL NOT NULL
);
`;
db.exec(initSQL);

// Configure JWKS Client for Okta
const jwks = jwksClient({
  jwksUri: `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/keys`,
});

const getKey = (header, callback) => {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error fetching signing key:", err.message);
      callback(err, null);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
};

// Middleware: Authenticate Token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.alg || !decodedHeader.header.kid) {
      throw new Error("Invalid token header");
    }

    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, user) => {
      if (err) {
        console.error("Token validation failed:", err.message);
        return res.status(403).json({ message: "Invalid or expired token" });
      }
      req.user = user; // Attach user payload to the request
      next();
    });
  } catch (error) {
    console.error("Token validation error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Health Check
app.get("/", (req, res) => {
  res.send("Employee Service is running!");
});

// Get all employees (Protected)
app.get("/api/employees", authenticateToken, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM employees").all();
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Get employees with a salary greater than a certain amount
app.get("/api/employees/high-salary/:amount", authenticateToken, (req, res) => {
  const { amount } = req.params;
  if (isNaN(amount)) {
    return res.status(400).json({ error: "Amount must be a number" });
  }

  try {
    const rows = db.prepare("SELECT * FROM employees WHERE salary >= ?").all(amount);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err.message);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

// Create a new employee (Protected)
app.post("/api/employees", authenticateToken, (req, res) => {
  const { name, position, salary } = req.body;

  if (!name || !position || salary == null) {
    return res.status(400).json({ error: "All fields (name, position, salary) are required" });
  }

  try {
    const result = db.prepare("INSERT INTO employees (name, position, salary) VALUES (?, ?, ?)").run(name, position, salary);
    res.status(201).json({ id: result.lastInsertRowid, name, position, salary });
  } catch (err) {
    console.error("Error creating employee:", err.message);
    res.status(500).json({ error: "Failed to create employee" });
  }
});

// Batch creation of employees (Protected)
app.post("/api/employees/batch", authenticateToken, (req, res) => {
  const { employees } = req.body;

  if (!Array.isArray(employees) || employees.length === 0) {
    return res.status(400).json({ error: "Employees array is required" });
  }

  try {
    const insert = db.prepare("INSERT INTO employees (name, position, salary) VALUES (?, ?, ?)");
    const insertMany = db.transaction((emps) => {
      for (const emp of emps) {
        if (!emp.name || !emp.position || emp.salary == null) {
          throw new Error("Each employee must have name, position, and salary");
        }
        insert.run(emp.name, emp.position, emp.salary);
      }
    });

    insertMany(employees);
    res.status(201).json({ message: "Employees created successfully" });
  } catch (err) {
    console.error("Error creating employees:", err.message);
    res.status(500).json({ error: "Failed to create employees" });
  }
});

// Update an employee's salary (Protected)
app.put("/api/employees/:id/salary", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { salary } = req.body;

  if (salary == null) {
    return res.status(400).json({ error: "Salary is required" });
  }

  try {
    const result = db.prepare("UPDATE employees SET salary = ? WHERE id = ?").run(salary, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ id, salary });
  } catch (err) {
    console.error("Error updating salary:", err.message);
    res.status(500).json({ error: "Failed to update salary" });
  }
});

// Update an employee's position (Protected)
app.put("/api/employees/:id/position", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { position } = req.body;

  if (!position) {
    return res.status(400).json({ error: "Position is required" });
  }

  try {
    const result = db.prepare("UPDATE employees SET position = ? WHERE id = ?").run(position, id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ id, position });
  } catch (err) {
    console.error("Error updating position:", err.message);
    res.status(500).json({ error: "Failed to update position" });
  }
});

// Get the average salary of employees
app.get("/api/stats/average-salary", authenticateToken, (req, res) => {
  try {
    const row = db.prepare("SELECT AVG(salary) as averageSalary FROM employees").get();
    res.json({ averageSalary: row.averageSalary });
  } catch (err) {
    console.error("Error calculating average salary:", err.message);
    res.status(500).json({ error: "Failed to calculate average salary" });
  }
});



// Delete employees by position (Protected)
app.delete("/api/employees/position/:position", authenticateToken, (req, res) => {
  const { position } = req.params;

  try {
    const result = db.prepare("DELETE FROM employees WHERE position = ?").run(position);
    res.json({ deleted: result.changes });
  } catch (err) {
    console.error("Error deleting employees:", err.message);
    res.status(500).json({ error: "Failed to delete employees" });
  }
});

// Delete an employee by ID (Protected)
app.delete("/api/employees/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const result = db.prepare("DELETE FROM employees WHERE id = ?").run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err.message);
    res.status(500).json({ error: "Failed to delete employee" });
  }
});

// Start the server
const PORT = process.env.EMPLOYEE_PORT || 7000;
app.listen(PORT, () => {
  console.log(`Employee Service running on port ${PORT}`);
});
