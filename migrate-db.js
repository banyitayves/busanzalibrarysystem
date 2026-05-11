const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrateDatabase() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✓ Connected to database');

    // Check if columns exist before adding them
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'books' AND TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);

    const columnNames = columns.map(col => col.COLUMN_NAME);

    // Add isbn column if not exists
    if (!columnNames.includes('isbn')) {
      await connection.query(`
        ALTER TABLE books ADD COLUMN isbn VARCHAR(20) AFTER author
      `);
      console.log('✓ Added isbn column');
    }

    // Add category column if not exists
    if (!columnNames.includes('category')) {
      await connection.query(`
        ALTER TABLE books ADD COLUMN category VARCHAR(100) AFTER isbn
      `);
      console.log('✓ Added category column');
    }

    // Add quantity column if not exists
    if (!columnNames.includes('quantity')) {
      await connection.query(`
        ALTER TABLE books ADD COLUMN quantity INT DEFAULT 0 AFTER category
      `);
      console.log('✓ Added quantity column');
    }

    // Make file_path nullable if it's not already
    await connection.query(`
      ALTER TABLE books MODIFY COLUMN file_path VARCHAR(255) NULL
    `);
    console.log('✓ Updated file_path to nullable');

    // Add updated_at if not exists
    if (!columnNames.includes('updated_at')) {
      await connection.query(`
        ALTER TABLE books ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('✓ Added updated_at column');
    }

    // Add indexes for better query performance
    try {
      await connection.query(`CREATE INDEX idx_isbn ON books(isbn)`);
      console.log('✓ Added isbn index');
    } catch (err) {
      // Index might already exist
    }

    try {
      await connection.query(`CREATE INDEX idx_category ON books(category)`);
      console.log('✓ Added category index');
    } catch (err) {
      // Index might already exist
    }

    console.log('\n✅ Database migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

migrateDatabase();
