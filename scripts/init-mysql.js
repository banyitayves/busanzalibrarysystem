require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error('Missing MySQL configuration in .env.local. Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.');
    process.exit(1);
  }

  const sqlPath = path.resolve(__dirname, '..', 'database_schema.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('database_schema.sql not found at', sqlPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');

  const pool = await mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT ? Number(DB_PORT) : 3306,
    multipleStatements: true,
  });

  try {
    console.log('Executing schema...');
    await pool.query(sql);
    console.log('Schema executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to execute schema:', err.message || err);
    process.exit(2);
  } finally {
    await pool.end();
  }
}

run();
