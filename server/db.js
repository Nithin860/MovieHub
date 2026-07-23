import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST || 'localhost';
const isRemoteHost = host !== 'localhost' && host !== '127.0.0.1';

const pool = mysql.createPool({
  host,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'cinematch',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ...(isRemoteHost || process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
});

// Test connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL Database successfully.');
    connection.release();
  } catch (error) {
    console.error('Database connection failed. Verify your environment configurations.', error.message);
  }
})();

export default pool;
