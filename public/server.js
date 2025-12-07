const express = require('express');
const { Pool } = require('pg');

const app = express();
// Render automatically provides the PORT environment variable.
const PORT = process.env.PORT || 4000; 

// 1. Initialize Database Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false 
  }
});

// 2. Simple Test Route (to confirm the server is running)
app.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() AS now');
        client.release();
        res.status(200).send(`
            <h1>HRIS Web App is RUNNING!</h1>
            <p>Database Time: ${result.rows[0].now}</p>
            <p>Connection to Supabase successful.</p>
        `);
    } catch (err) {
        console.error('Database connection error', err);
        res.status(500).send(`
            <h1>HRIS Web App Error</h1>
            <p>Failed to connect to Supabase database.</p>
            <p>Error: ${err.message}</p>
        `);
    }
});

// 3. Start the Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});