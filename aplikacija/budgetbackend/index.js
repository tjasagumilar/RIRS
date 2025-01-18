const express = require("express");
const pool = require("./db");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
require("dotenv").config();

const app = express();
app.use(express.json());

// Validate environment variables
if (!process.env.OKTA_DOMAIN) {
  console.error("Environment variable OKTA_DOMAIN is not defined");
  process.exit(1);
}
if (!process.env.BUDGET_DB_HOST || !process.env.BUDGET_DB_PORT) {
  console.error("Database environment variables are not defined");
  process.exit(1);
}

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
    if (
      !decodedHeader ||
      !decodedHeader.header.alg ||
      !decodedHeader.header.kid
    ) {
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

// Health Check (Public)
app.get("/", (req, res) => {
  res.send("Budget Service is running");
});

// Get All Budgets (Protected)
app.get("/api/budgets", authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM budgets");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching budgets:", err.message);
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
});

// Get Budget by ID (Protected)
app.get("/api/budgets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query("SELECT * FROM budgets WHERE id = $1", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching budget:", err.message);
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

// Create Budget (Protected)
app.post("/api/budgets", authenticateToken, async (req, res) => {
  const { department, total_budget } = req.body;

  if (!department || !total_budget) {
    return res
      .status(400)
      .json({ error: "Department and total_budget are required" });
  }

  try {
    const { rows } = await pool.query(
      "INSERT INTO budgets (department, total_budget) VALUES ($1, $2) RETURNING *",
      [department, total_budget]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating budget:", err.message);
    res.status(500).json({ error: "Failed to create budget" });
  }
});

// Create Multiple Budgets (Protected)
app.post("/api/budgets/bulk", authenticateToken, async (req, res) => {
  const { budgets } = req.body;

  if (!Array.isArray(budgets) || budgets.length === 0) {
    return res.status(400).json({ error: "Budgets array is required" });
  }

  try {
    const values = budgets
      .map((b) => `('${b.department}', ${b.total_budget})`)
      .join(", ");
    const query = `INSERT INTO budgets (department, total_budget) VALUES ${values} RETURNING *`;
    const { rows } = await pool.query(query);
    res.status(201).json(rows);
  } catch (err) {
    console.error("Error creating multiple budgets:", err.message);
    res.status(500).json({ error: "Failed to create multiple budgets" });
  }
});

// Update Budget by ID (Protected)
app.put("/api/budgets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { department, total_budget } = req.body;

  if (!department && !total_budget) {
    return res
      .status(400)
      .json({
        error:
          "At least one field (department or total_budget) must be provided",
      });
  }

  try {
    const fields = [];
    const values = [];
    let query = "UPDATE budgets SET ";

    if (department) {
      fields.push("department = $1");
      values.push(department);
    }

    if (total_budget) {
      fields.push("total_budget = $2");
      values.push(total_budget);
    }

    query += fields.join(", ") + " WHERE id = $3 RETURNING *";
    values.push(id);

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating budget:", err.message);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

app.put("/api/budgets/bulk", authenticateToken, async (req, res) => {
    const { updates } = req.body;
  
    console.log("Received updates:", updates); // Debugging log
  
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: "Updates array is required" });
    }
  
    try {
      const queries = updates.map(({ id, department, total_budget }) => {
        if (!id || !department || !total_budget) {
          throw new Error("Invalid update object: id, department, and total_budget are required");
        }
  
        // Ensure id is integer and total_budget is number
        const parsedId = parseInt(id, 10);
        const parsedBudget = parseFloat(total_budget);
  
        if (isNaN(parsedId) || isNaN(parsedBudget)) {
          throw new Error(`Invalid data types: id=${id}, total_budget=${total_budget}`);
        }
  
        return pool.query(
          "UPDATE budgets SET department = $1, total_budget = $2 WHERE id = $3",
          [department, parsedBudget, parsedId]
        );
      });
  
      await Promise.all(queries);
      res.json({ message: "Budgets updated successfully" });
    } catch (err) {
      console.error("Error updating multiple budgets:", err.message);
      res.status(400).json({ error: err.message });
    }
  });
  
  
  

// Bulk Delete Budgets (Protected)
app.delete("/api/budgets/bulk", authenticateToken, async (req, res) => {
    const { ids } = req.body;
  
    console.log("Received IDs for deletion:", ids); // Debugging log
  
    if (!Array.isArray(ids) || ids.some((id) => isNaN(id))) {
      return res
        .status(400)
        .json({ error: "IDs must be an array of valid integers" });
    }
  
    try {
      // Use PostgreSQL's ANY() array syntax for bulk deletion
      const query = "DELETE FROM budgets WHERE id = ANY($1::int[])";
      const { rowCount } = await pool.query(query, [ids]);
  
      if (rowCount === 0) {
        return res.status(404).json({ error: "No budgets found for the given IDs" });
      }
  
      res.json({ message: `Deleted ${rowCount} budgets successfully` });
    } catch (err) {
      console.error("Error deleting budgets:", err.message);
      res.status(500).json({ error: "Failed to delete budgets" });
    }
  });
  
  // Single Delete Budget by ID (Protected)
  app.delete("/api/budgets/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
  
    try {
      const { rowCount } = await pool.query("DELETE FROM budgets WHERE id = $1", [id]);
      if (rowCount === 0) {
        return res.status(404).json({ error: "Budget not found" });
      }
      res.json({ message: "Budget deleted successfully" });
    } catch (err) {
      console.error("Error deleting budget:", err.message);
      res.status(500).json({ error: "Failed to delete budget" });
    }
  });
  

// Start the Server
const PORT = process.env.BUDGET_PORT || 6000;
app.listen(PORT, () => {
  console.log(`Budget Service running on port ${PORT}`);
});
