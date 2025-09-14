const { Pool } = require('pg');
require('dotenv').config();

// Database setup script
async function setupDatabase() {
  // Connect without specifying a database first
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres',
  });

  try {
    console.log('🔄 Setting up Paira database...');

    // Create database if it doesn't exist
    await pool.query('CREATE DATABASE paira_db;').catch(err => {
      if (!err.message.includes('already exists')) {
        throw err;
      }
      console.log('✅ Database already exists');
    });

    // Close connection and reconnect to the new database
    await pool.end();

    const dbPool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/paira_db',
    });

    console.log('📋 Creating tables...');

    // Create tables
    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        subscription_status VARCHAR(50) DEFAULT 'inactive'
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255) UNIQUE,
        plan_type VARCHAR(50),
        status VARCHAR(50),
        current_period_start TIMESTAMP,
        current_period_end TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS licenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        hwid_hash VARCHAR(255) NOT NULL,
        device_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        last_used TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_licenses_user_hwid ON licenses(user_id, hwid_hash);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
    `);

    console.log('✅ Tables created successfully');

    // Create test user for development
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(testPassword, saltRounds);

    await dbPool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
      [testEmail, passwordHash]
    );

    console.log('✅ Test user created:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);

    await dbPool.end();
    console.log('🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;