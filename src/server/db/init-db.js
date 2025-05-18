
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { config } = require('dotenv');
const bcrypt = require('bcryptjs');

config();

async function initializeDatabase() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('Connecting to database...');
    await pool.query('SELECT NOW()');

    // Read schema file
    console.log('Reading schema file...');
    const schemaFilePath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaFilePath, 'utf8');

    // Execute schema SQL
    console.log('Creating database schema...');
    await pool.query(schemaSQL);

    // Create admin user
    console.log('Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);

    // Check if admin exists first
    const adminExists = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      ['admin@umistore.com']
    );

    if (adminExists.rows.length === 0) {
      await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin User', 'admin@umistore.com', password, 'admin']
      );
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

initializeDatabase();
