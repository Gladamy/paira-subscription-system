const { Pool } = require('pg');
require('dotenv').config();

// Test script to verify backend setup
async function testSetup() {
  console.log('🧪 Testing Paira Backend Setup...\n');

  // Test 1: Environment variables
  console.log('1️⃣  Checking environment variables...');
  const requiredEnvVars = [
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please update your .env file with the required values.');
    return;
  }
  console.log('✅ All required environment variables are set');

  // Test 2: Database connection
  console.log('\n2️⃣  Testing database connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Test 3: Check tables exist
    console.log('\n3️⃣  Checking database tables...');
    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'subscriptions', 'licenses')
    `);

    const existingTables = tables.rows.map(row => row.table_name);
    const requiredTables = ['users', 'subscriptions', 'licenses'];

    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length > 0) {
      console.log('❌ Missing tables:', missingTables.join(', '));
      console.log('Run: npm run setup-db');
      return;
    }
    console.log('✅ All required tables exist');

    // Test 4: Check test user exists
    console.log('\n4️⃣  Checking test user...');
    const testUser = await client.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['test@example.com']
    );

    if (testUser.rows.length === 0) {
      console.log('❌ Test user not found');
      console.log('Run: npm run setup-db');
      return;
    }
    console.log('✅ Test user exists:', testUser.rows[0].email);

    client.release();

  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('Make sure PostgreSQL is running and DATABASE_URL is correct');
    return;
  } finally {
    await pool.end();
  }

  // Test 5: Test server startup (basic)
  console.log('\n5️⃣  Testing server startup...');
  try {
    const express = require('express');
    const app = express();

    // Simple health check endpoint
    app.get('/test', (req, res) => res.json({ status: 'OK' }));

    const server = app.listen(0, () => {
      const port = server.address().port;
      console.log(`✅ Server can start on port ${port}`);
      server.close();
    });

  } catch (error) {
    console.log('❌ Server startup test failed:', error.message);
    return;
  }

  console.log('\n🎉 All tests passed! Your backend is ready.');
  console.log('\nNext steps:');
  console.log('1. Start the backend: npm run dev');
  console.log('2. Test API endpoints with the provided curl commands');
  console.log('3. Set up Stripe webhooks with ngrok or Stripe CLI');
  console.log('4. Launch the desktop app and test the complete flow');
}

// Run tests
testSetup().catch(console.error);