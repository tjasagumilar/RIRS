// Required modules


const fastify = require("fastify")({ logger: true });
const cors = require("@fastify/cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const axios = require("axios");
const qs = require("querystring");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

// Load environment variables
dotenv.config({ path: "../aplikacija/.env" });

await fastify.register(require('@fastify/cors'), {
  origin: "http://localhost:5173", // Allow requests from your frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  credentials: true, // Allow cookies and Authorization headers
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  exposedHeaders: ["Authorization"], // Exposed headers
});

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST_calendar,
  user: process.env.DB_USER_calendar,
  password: process.env.DB_PASSWORD_calendar,
  database: process.env.DB_NAME_calendar,
  port: process.env.DB_PORT_calendar,
});

// Connect to MySQL database
db.connect((err) => {
  if (err) {
    fastify.log.error("Error connecting to MySQL:", err);
    return;
  }
  fastify.log.info("Connected to MySQL database");
});

// JWKS client for Okta token verification
const jwks = jwksClient({
  jwksUri: `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/keys`,
});

const getKey = (header, callback) => {
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) {
      fastify.log.error("Error fetching signing key:", err.message);
      callback(err, null);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
};

// Middleware: Authenticate Token
const authenticateToken = async (request, reply) => {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return reply.status(401).send({ message: "Access token required" });
  }

  try {
    const decodedHeader = jwt.decode(token, { complete: true });
    if (!decodedHeader || !decodedHeader.header.alg) {
      throw new Error("Invalid token header");
    }

    if (decodedHeader.header.alg === "HS256") {
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] },
        (err, user) => {
          if (err) {
            throw new Error("Invalid old login token");
          }
          request.user = user;
        }
      );
    } else if (decodedHeader.header.alg === "RS256") {
      jwt.verify(
        token,
        getKey,
        { algorithms: ["RS256"] },
        (err, user) => {
          if (err) {
            throw new Error("Invalid Okta token");
          }
          request.user = user;
        }
      );
    } else {
      throw new Error("Unsupported token algorithm");
    }
  } catch (error) {
    fastify.log.error("Token validation error:", error.message);
    return reply.status(403).send({ message: "Invalid or expired token" });
  }
};

// Route: Start Okta Authorization Code Flow
fastify.get("/api/auth", (request, reply) => {
  const authUrl = `https://${process.env.OKTA_DOMAIN}/oauth2/default/v1/authorize?` +
    qs.stringify({
      client_id: process.env.OKTA_CLIENT_ID,
      response_type: "code",
      scope: "openid profile",
      redirect_uri: "http://localhost:5173/callback",
      state: "some_state",
    });
  reply.redirect(authUrl);
});

// Route: Handle Okta Callback
fastify.get("/api/callback", async (request, reply) => {
  const { code } = request.query;

  if (!code) {
    return reply.status(400).send({ error: "Authorization code missing" });
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

    reply.send({ accessToken: access_token, user: userInfoResponse.data });
  } catch (error) {
    fastify.log.error("Error exchanging authorization code:", error.response?.data || error.message);
    reply.status(500).send({ error: "Failed to exchange authorization code" });
  }
});

// Route: Login for Old Authentication
fastify.post("/api/login", async (request, reply) => {
  const { username, password } = request.body;

  const query = "SELECT * FROM employees WHERE username = ?";
  db.query(query, [username], async (err, results) => {
    if (err) {
      fastify.log.error("Database error:", err);
      return reply.status(500).send({ error: "Database error" });
    }

    if (results.length === 0) {
      return reply.status(401).send({ success: false, message: "Invalid credentials" });
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
      reply.send({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          role: user.isBoss ? "admin" : "employee",
        },
      });
    } else {
      reply.status(401).send({ success: false, message: "Invalid credentials" });
    }
  });
});

// Start the Fastify server
const start = async () => {
  try {
    await fastify.listen({ port: 5420 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

// GET: Fetch all events
fastify.get("/api/events", { preHandler: authenticateToken }, async (request, reply) => {
  const query = "SELECT * FROM events";
  try {
    const [results] = await db.promise().query(query);
    reply.send(results);
  } catch (err) {
    console.error("Failed to fetch events:", err);
    reply.status(500).send({ error: "Failed to fetch events" });
  }
});

// GET: Fetch all tasks
fastify.get("/api/tasks", { preHandler: authenticateToken }, async (request, reply) => {
  const query = "SELECT * FROM tasks";
  try {
    const [results] = await db.promise().query(query);
    reply.send(results);
  } catch (err) {
    console.error("Failed to fetch tasks:", err);
    reply.status(500).send({ error: "Failed to fetch tasks" });
  }
});

// POST: Add a new event
fastify.post("/api/events", { preHandler: authenticateToken }, async (request, reply) => {
  const { name, description, event_time, color } = request.body;
  const query = "INSERT INTO events (name, description, event_time, color) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await db.promise().query(query, [name, description, event_time, color]);
    reply.send({ message: "Event added successfully", id: result.insertId });
  } catch (err) {
    console.error("Failed to add event:", err);
    reply.status(500).send({ error: "Failed to add event" });
  }
});

// POST: Add a new task
fastify.post("/api/tasks", { preHandler: authenticateToken }, async (request, reply) => {
  const { title, due_date, status, priority } = request.body;
  const query = "INSERT INTO tasks (title, due_date, status, priority) VALUES (?, ?, ?, ?)";
  try {
    const [result] = await db.promise().query(query, [title, due_date, status, priority]);
    reply.send({ message: "Task added successfully", id: result.insertId });
  } catch (err) {
    console.error("Failed to add task:", err);
    reply.status(500).send({ error: "Failed to add task" });
  }
});

// PUT: Update an event by ID
fastify.put("/api/events/:id", { preHandler: authenticateToken }, async (request, reply) => {
  const { id } = request.params;
  const { name, description, event_time, color } = request.body;
  const query = "UPDATE events SET name = ?, description = ?, event_time = ?, color = ? WHERE id = ?";
  try {
    const [result] = await db.promise().query(query, [name, description, event_time, color, id]);
    reply.send({ message: "Event updated successfully", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Failed to update event:", err);
    reply.status(500).send({ error: "Failed to update event" });
  }
});

// PUT: Update a task by ID
fastify.put("/api/tasks/:id", { preHandler: authenticateToken }, async (request, reply) => {
  const { id } = request.params;
  const { title, due_date, status, priority } = request.body;
  const query = "UPDATE tasks SET title = ?, due_date = ?, status = ?, priority = ? WHERE id = ?";
  try {
    const [result] = await db.promise().query(query, [title, due_date, status, priority, id]);
    reply.send({ message: "Task updated successfully", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Failed to update task:", err);
    reply.status(500).send({ error: "Failed to update task" });
  }
});

// DELETE: Delete an event by ID
fastify.delete("/api/events/:id", { preHandler: authenticateToken }, async (request, reply) => {
  const { id } = request.params;
  const query = "DELETE FROM events WHERE id = ?";
  try {
    const [result] = await db.promise().query(query, [id]);
    reply.send({ message: "Event deleted successfully", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Failed to delete event:", err);
    reply.status(500).send({ error: "Failed to delete event" });
  }
});

// DELETE: Delete a task by ID
fastify.delete("/api/tasks/:id", { preHandler: authenticateToken }, async (request, reply) => {
  const { id } = request.params;
  const query = "DELETE FROM tasks WHERE id = ?";
  try {
    const [result] = await db.promise().query(query, [id]);
    reply.send({ message: "Task deleted successfully", affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Failed to delete task:", err);
    reply.status(500).send({ error: "Failed to delete task" });
  }
});


