const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool setup
const pool = new Pool({
  user: process.env.DB_USER,        // .env la irunthu varum
  host: process.env.DB_HOST,        // localhost
  database: process.env.DB_DATABASE,  // byepo_db
  password: process.env.DB_PASSWORD,  // pgAdmin password
  port: process.env.DB_PORT || 5432,
});

// Database connection check 
pool.on('connect', () => {
  console.log('PostgreSQL Database connected successfully! ✅');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client ❌', err);
  process.exit(-1);
});

module.exports = pool;