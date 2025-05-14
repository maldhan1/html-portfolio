const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Import the CORS package

dotenv.config();

const app = express();

// Enable CORS for all origins (or specify your frontend origin)
app.use(cors());

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST || 'localhost',
  database: process.env.PG_DATABASE || 'marathwada_db',
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT || 5432,
});

app.use(express.json()); // Middleware to parse JSON requests

// Serve static files from the frontend folder (if any)
app.use(express.static(path.join(__dirname, '../frontend')));

// Register route
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;

  const checkUserQuery = 'SELECT * FROM users WHERE username = $1';
  
  try {
    const checkResult = await pool.query(checkUserQuery, [username]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Username already taken' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = 'INSERT INTO users (username, password) VALUES ($1, $2)';
    await pool.query(insertQuery, [username, hashedPassword]);

    res.json({ success: true, message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // Query to check if the user exists in the database
  const query = 'SELECT * FROM users WHERE username = $1';

  try {
    const result = await pool.query(query, [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];

      // Compare the provided password with the hashed password in the database
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        res.json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
