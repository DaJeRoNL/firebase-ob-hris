const express = require('express');
const { Pool } = require('pg');
const dns = require('dns'); // Import dns module
const url = require('url');   // Import url module

const app = express();
const PORT = process.env.PORT || 4000; 
const DB_URL = process.env.DATABASE_URL;

// === NEW: Function to force IPv4 lookup ===
const resolveHostname = (hostname) => {
    return new Promise((resolve, reject) => {
        // Look up the hostname, forcing the resolution to IPv4 (family 4)
        dns.lookup(hostname, 4, (err, address) => {
            if (err) return reject(err);
            resolve(address);
        });
    });
};
// ============================================


// 1. Initialize Database Pool
// We need to use an async function to set up the pool AFTER resolving the host
async function setupDatabaseAndStartServer() {
    
    if (!DB_URL) {
        console.error("DATABASE_URL environment variable is not set.");
        return;
    }
    
    // Parse the connection string to get the hostname
    const parsedUrl = new URL(DB_URL);
    
    // Resolve the hostname to an IPv4 address
    const ipv4Address = await resolveHostname(parsedUrl.hostname);
    console.log(`Resolved hostname ${parsedUrl.hostname} to IPv4: ${ipv4Address}`);

    // Create a new connection string using the resolved IPv4 address
    const finalConnectionString = DB_URL.replace(parsedUrl.hostname, ipv4Address);
    
    const pool = new Pool({
        connectionString: finalConnectionString,
        // FINAL FIX: Use the simple 'ssl: true'
        ssl: true
    });

    // 2. Simple Test Route (rest of your app logic)
    app.get('/', async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const result = await client.query('SELECT NOW() AS now');
            res.status(200).send(`
                <h1>HRIS Web App is RUNNING!</h1>
                <p>Database Time: ${result.rows[0].now}</p>
                <p>Connection to Supabase successful via IPv4: ${ipv4Address}.</p>
            `);
        } catch (err) {
            console.error('Database connection error', err);
            res.status(500).send(`
                <h1>HRIS Web App Error</h1>
                <p>Failed to connect to Supabase database.</p>
                <p>Error: ${err.message}</p>
            `);
        } finally {
             if (client) client.release();
        }
    });

    // 3. Start the Server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
}

setupDatabaseAndStartServer();