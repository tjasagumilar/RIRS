const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const qs = require("querystring");

dotenv.config({ path: "../.env" });
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up the MySQL connection
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

// Redirect URI should match the Okta app configuration
const REDIRECT_URI = "http://localhost:5173/callback"; // Adjust as necessary

// Route to initiate the authorization code flow
app.get("/api/auth", (req, res) => {
  console.log("Redirecting to Okta authorization page...");
  const authUrl = `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/authorize?` +
    qs.stringify({
      client_id: process.env.OKTA_CLIENT_ID,
      response_type: "code",
      scope: "openid profile",
      redirect_uri: REDIRECT_URI,
      state: "some_state",
    });
  res.redirect(authUrl);
});


// Route to handle Okta's callback with authorization code
app.get("/api/callback", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Authorization code missing" });
  }

  try {
    const tokenResponse = await axios.post(
      `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/token`,
      qs.stringify({
        grant_type: "authorization_code",
        client_id: process.env.OKTA_CLIENT_ID,
        client_secret: process.env.OKTA_CLIENT_SECRET,
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`,
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    res.json({ accessToken: access_token, user: userInfoResponse.data });
  } catch (error) {
    console.error("Error exchanging authorization code:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to exchange authorization code" });
  }
});


// Verify token endpoint
app.get("/api/verify-token", (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract the token

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  axios
    .get(`https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      res.status(200).json({ user: response.data });
    })
    .catch((err) => {
      console.error("Token verification failed:", err.response?.data || err.message);
      res.status(403).json({ message: "Invalid or expired token" });
    });
});


// Middleware to authenticate token using Okta
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  // Verify token using Okta JWT Verifier
  axios.get(`https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      req.user = response.data; // Attach user claims to request object
      next();
    })
    .catch((err) => {
      console.error("Token validation error:", err);
      return res.status(403).json({ message: "Invalid or expired token" });
    });
};

// Protected route to fetch all employees
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

// Fetch work entries for an employee (protected route)
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

// Insert a new work entry (protected route)
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

// Update a work entry (protected route)
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

// Fetch total work hours for a specific month (protected route)
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
