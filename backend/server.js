import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dns from 'dns';

// Destructure Pool from the pg default export
const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 4000; 
const DB_URL = process.env.DATABASE_URL;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Function to force IPv4 lookup
const resolveHostname = (hostname) => {
    return new Promise((resolve, reject) => {
        dns.lookup(hostname, 4, (err, address) => {
            if (err) return reject(err);
            resolve(address);
        });
    });
};

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
        ssl: {
            rejectUnauthorized: false
        }
    });

    // Health check endpoint (JSON)
    app.get('/health', async (req, res) => {
        let client;
        try {
            client = await pool.connect();
            const result = await client.query('SELECT NOW() AS now');
            res.status(200).json({
                status: 'ok',
                database: 'connected',
                timestamp: result.rows[0].now
            });
        } catch (err) {
            console.error('Database connection error', err);
            res.status(500).json({
                status: 'error',
                database: 'disconnected',
                error: err.message
            });
        } finally {
             if (client) client.release();
        }
    });

    // Root endpoint (Visual Status Page)
    app.get('/', async (req, res) => {
        let client;
        let dbStatus = "Checking...";
        let dbClass = "pending";
        let timestamp = "";
        let ipv4 = ipv4Address;

        try {
            client = await pool.connect();
            const result = await client.query('SELECT NOW() AS now');
            dbStatus = "Connected";
            dbClass = "success";
            timestamp = result.rows[0].now;
        } catch (err) {
            dbStatus = "Error: " + err.message;
            dbClass = "error";
        } finally {
             if (client) client.release();
        }

        res.status(200).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Server Status</title>
                <style>
                    body {
                        font-family: 'Courier New', Courier, monospace;
                        background-color: #050505;
                        color: #e5e5e5;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                    }
                    .container {
                        border: 1px solid #333;
                        padding: 40px;
                        border-radius: 4px;
                        width: 100%;
                        max-width: 500px;
                        background-color: #0a0a0a;
                        box-shadow: 0 0 20px rgba(0,0,0,0.5);
                    }
                    h1 {
                        font-size: 1.2rem;
                        margin-top: 0;
                        border-bottom: 1px solid #333;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        color: #fff;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    }
                    .status-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 12px;
                        font-size: 0.9rem;
                    }
                    .label { color: #888; }
                    .value { font-weight: bold; }
                    
                    .success { color: #10b981; text-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
                    .error { color: #ef4444; text-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
                    .pending { color: #fbbf24; }

                    .footer {
                        margin-top: 30px;
                        padding-top: 15px;
                        border-top: 1px solid #222;
                        font-size: 0.75rem;
                        color: #444;
                        text-align: center;
                    }
                    code {
                        background: #151515;
                        padding: 2px 6px;
                        border-radius: 3px;
                        font-family: inherit;
                        color: #a3a3a3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>System Status</h1>
                    
                    <div class="status-row">
                        <span class="label">API Service</span>
                        <span class="value success">● Online</span>
                    </div>

                    <div class="status-row">
                        <span class="label">Database</span>
                        <span class="value ${dbClass}">● ${dbStatus}</span>
                    </div>

                    <div class="status-row">
                        <span class="label">IPv4 Resolver</span>
                        <span class="value" style="color: #6366f1;">${ipv4}</span>
                    </div>

                    <div class="status-row" style="margin-top: 20px;">
                        <span class="label">Server Time</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 20px;">${timestamp || 'N/A'}</div>

                    <div class="footer">
                         BE/OB-HRIS • Node.js v${process.version}
                    </div>
                </div>
            </body>
            </html>
        `);
    });

    // Start the Server
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Database connected via IPv4: ${ipv4Address}`);
    });
}

setupDatabaseAndStartServer();