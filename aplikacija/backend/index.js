const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

dotenv.config({ path: "../.env" });
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const JWT_SECRET = process.env.JWT_SECRET;

// Authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Token validation error:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  const query = "SELECT * FROM employees WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      const token = jwt.sign(
        {
          sub: user.id,
          name: user.name,
          role: user.isBoss ? "admin" : "employee",
          iat: Math.floor(Date.now() / 1000),
        },
        JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.isBoss ? "admin" : "employee",
        },
      });
    } else {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });
});

// Verify token endpoint
app.get("/api/verify-token", authenticateToken, (req, res) => {
  res.json({
    message: "Token is valid",
    userId: req.user.sub,
    name: req.user.name,
    role: req.user.role,
  });
});

// Fetch all employees
app.get("/api/employees", authenticateToken, (req, res) => {
  const query = "SELECT id, name, username FROM employees";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch employees:", err);
      return res.status(500).json({ error: "Failed to fetch employees" });
    }
    res.json(results);
  });
});

// Fetch work entries for an employee
app.get("/api/entries", authenticateToken, (req, res) => {
  const employeeId = req.query.employeeId;

  if (!employeeId) {
    return res.status(400).json({ message: "Employee ID is required" });
  }

  const query = "SELECT * FROM work_entries WHERE employee_id = ?";
  db.query(query, [employeeId], (err, results) => {
    if (err) {
      console.error("Failed to fetch entries:", err);
      return res.status(500).json({ error: "Failed to fetch entries" });
    }
    res.json(results);
  });
});

// Insert a new work entry
app.post("/api/entries", authenticateToken, (req, res) => {
  const { employeeId, hoursWorked, date, description } = req.body;

  if (!employeeId || !hoursWorked || !date || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "INSERT INTO work_entries (employee_id, hours_worked, date, description) VALUES (?, ?, ?, ?)";
  db.query(query, [employeeId, hoursWorked, date, description], (err, result) => {
    if (err) {
      console.error("Failed to insert entry:", err);
      return res.status(500).json({ error: "Failed to insert entry" });
    }
    res.status(201).json({ message: "Entry created successfully" });
  });
});

// Update a work entry
app.put("/api/entries/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  const { hoursWorked, date, description } = req.body;

  if (!hoursWorked || !date || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = "UPDATE work_entries SET hours_worked = ?, date = ?, description = ? WHERE id = ?";
  db.query(query, [hoursWorked, date, description, id], (err, result) => {
    if (err) {
      console.error("Failed to update entry:", err);
      return res.status(500).json({ error: "Failed to update entry" });
    }
    res.status(200).json({ message: "Entry updated successfully" });
  });
});

// Fetch total work hours for a specific month
app.get("/api/entries/month", authenticateToken, (req, res) => {
  const { employeeId, month } = req.query;

  if (!month) {
    return res.status(400).json({ message: "Month is required" });
  }

  let query = `
    SELECT 
      employees.name,
      SUM(work_entries.hours_worked) AS total_hours
    FROM 
      work_entries
    LEFT JOIN 
      employees ON work_entries.employee_id = employees.id
    WHERE 
      MONTH(work_entries.date) = ?
  `;
  const queryParams = [month];

  if (employeeId) {
    query += " AND employee_id = ?";
    queryParams.push(employeeId);
  }

  query += " GROUP BY employees.id";

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Failed to fetch total hours:", err);
      return res.status(500).json({ error: "Failed to fetch total hours" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
