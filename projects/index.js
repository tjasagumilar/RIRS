// Required modules
const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const qs = require("querystring");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Load environment variables
dotenv.config({ path: "../aplikacija/.env" });

const app = express();
const port = 5069;

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST_projects,
  user: process.env.DB_USER_projects,
  password: process.env.DB_PASSWORD_projects,
  database: process.env.DB_NAME_projects,
  port: process.env.DB_PORT_projects,
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// JWKS client for Okta token verification
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
  const token = authHeader && authHeader.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.alg) {
      throw new Error("Invalid token header");
    }

    if (decodedHeader.header.alg === "HS256") {
      // Old login tokens
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] },
        (err, user) => {
          if (err) {
            console.error("Old login token validation failed:", err.message);
            throw new Error("Invalid old login token");
          }
          req.user = user;
          next();
        }
      );
    } else if (decodedHeader.header.alg === "RS256") {
      // Okta tokens
      jwt.verify(
        token,
        getKey,
        { algorithms: ["RS256"] },
        (err, user) => {
          if (err) {
            console.error("Okta token validation failed:", err.message);
            throw new Error("Invalid Okta token");
          }
          req.user = user;
          next();
        }
      );
    } else {
      throw new Error("Unsupported token algorithm");
    }
  } catch (error) {
    console.error("Token validation error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Route: Start Okta Authorization Code Flow
app.get("/api/auth", (req, res) => {
  const authUrl = `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/authorize?` +
    qs.stringify({
      client_id: process.env.OKTA_CLIENT_ID,
      response_type: "code",
      scope: "openid profile",
      redirect_uri: "http://localhost:5173/callback",
      state: "some_state",
    });
  res.redirect(authUrl);
});

// Route: Handle Okta Callback
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
        redirect_uri: "http://localhost:5173/callback",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    const userInfoResponse = await axios.get(
      `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/userinfo`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    res.json({ accessToken: access_token, user: userInfoResponse.data });
  } catch (error) {
    console.error("Error exchanging authorization code:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to exchange authorization code" });
  }
});

// Route: Login for Old Authentication
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
        },
        process.env.JWT_SECRET,
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

// Route: Fetch All Projects (Protected)
app.get("/api/projects", authenticateToken, (req, res) => {
  const query = "SELECT * FROM projects";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch projects:", err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
    res.json(results);
  });
});

// Route: Fetch Projects with Budget Over 12000 (Protected)
app.get("/api/projects/budget-over-12000", authenticateToken, (req, res) => {
  const query = "SELECT * FROM projects WHERE budget > 12000";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Failed to fetch projects with budget over 12000:", err);
      return res.status(500).json({ error: "Failed to fetch projects" });
    }
    res.json(results);
  });
});

// Route: Add a Single Project (Protected)
app.post("/api/projects", authenticateToken, (req, res) => {
  const { name, description, budget, start_date, end_date, time_running } = req.body;
  const query = "INSERT INTO projects (name, description, budget, start_date, end_date, time_running) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(query, [name, description, budget, start_date, end_date, time_running], (err, result) => {
    if (err) {
      console.error("Failed to add project:", err);
      return res.status(500).json({ error: "Failed to add project" });
    }
    res.status(201).json({ message: "Project added successfully", projectId: result.insertId });
  });
});

// Route: Add Multiple Projects (Protected)
app.post("/api/projects/multiple", authenticateToken, (req, res) => {
  const projects = req.body; // Expecting an array of project objects
  const query = "INSERT INTO projects (name, description, budget, start_date, end_date, time_running) VALUES ?";
  const values = projects.map(p => [p.name, p.description, p.budget, p.start_date, p.end_date, p.time_running]);
  db.query(query, [values], (err, result) => {
    if (err) {
      console.error("Failed to add multiple projects:", err);
      return res.status(500).json({ error: "Failed to add multiple projects" });
    }
    res.status(201).json({ message: "Multiple projects added successfully", affectedRows: result.affectedRows });
  });
});

// Route: Update Project Name (Protected)
app.put("/api/projects/:id/name", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const query = "UPDATE projects SET name = ? WHERE id = ?";
  db.query(query, [name, id], (err, result) => {
    if (err) {
      console.error("Failed to update project name:", err);
      return res.status(500).json({ error: "Failed to update project name" });
    }
    res.json({ message: "Project name updated successfully" });
  });
});

// Route: Update Project Description (Protected)
app.put("/api/projects/:id/description", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  const query = "UPDATE projects SET description = ? WHERE id = ?";
  db.query(query, [description, id], (err, result) => {
    if (err) {
      console.error("Failed to update project description:", err);
      return res.status(500).json({ error: "Failed to update project description" });
    }
    res.json({ message: "Project description updated successfully" });
  });
});

// Route: Delete a Single Project (Protected)
app.delete("/api/projects/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM projects WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Failed to delete project:", err);
      return res.status(500).json({ error: "Failed to delete project" });
    }
    res.json({ message: "Project deleted successfully" });
  });
});

// Route: Delete Multiple Projects (Protected)
app.delete("/api/projects", authenticateToken, (req, res) => {
  const { ids } = req.body; // Expecting an array of project IDs
  const query = "DELETE FROM projects WHERE id IN (?)";
  db.query(query, [ids], (err, result) => {
    if (err) {
      console.error("Failed to delete multiple projects:", err);
      return res.status(500).json({ error: "Failed to delete multiple projects" });
    }
    res.json({ message: "Multiple projects deleted successfully", affectedRows: result.affectedRows });
  });
});


// Start the Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
