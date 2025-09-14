const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, desktop apps, curl requests)
    if (!origin) return callback(null, true);

    // Allow specific origins
    const allowedOrigins = [
      'https://paira.live',
      'http://localhost:3000',
      'http://localhost:1420', // Vite dev server
      'tauri://localhost' // Tauri apps
    ];

    if (process.env.NODE_ENV !== 'production') {
      // In development, allow all origins
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Database initialization
const initDatabase = async () => {
  try {
    // Create tables
    await pool.query(`
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

      CREATE TABLE IF NOT EXISTS checkout_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(255) UNIQUE NOT NULL,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        subscription_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_licenses_user_hwid ON licenses(user_id, hwid_hash);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
      CREATE INDEX IF NOT EXISTS idx_checkout_sessions_session ON checkout_sessions(session_id);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query(
      'SELECT id, email, subscription_status, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// License validation
app.post('/api/licenses/validate', authenticateToken, async (req, res) => {
  try {
    const { hwid } = req.body;

    if (!hwid) {
      return res.status(400).json({ error: 'HWID is required' });
    }

    // Check if user has active subscription
    const subscription = await pool.query(`
      SELECT s.* FROM subscriptions s
      WHERE s.user_id = $1 AND s.status = 'active'
      AND s.current_period_end > NOW()
    `, [req.user.userId]);

    if (subscription.rows.length === 0) {
      return res.status(403).json({
        valid: false,
        message: 'No active subscription found'
      });
    }

    // Check if HWID is registered for this user
    const license = await pool.query(`
      SELECT * FROM licenses
      WHERE user_id = $1 AND hwid_hash = $2 AND is_active = true
    `, [req.user.userId, hwid]);

    if (license.rows.length === 0) {
      return res.status(403).json({
        valid: false,
        message: 'License not found for this device'
      });
    }

    // Update last used timestamp
    await pool.query(
      'UPDATE licenses SET last_used = NOW() WHERE id = $1',
      [license.rows[0].id]
    );

    res.json({
      valid: true,
      subscription: {
        plan: subscription.rows[0].plan_type,
        expires: subscription.rows[0].current_period_end
      }
    });

  } catch (error) {
    console.error('License validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get subscription status
app.get('/api/subscriptions/status', authenticateToken, async (req, res) => {
  try {
    const subscription = await pool.query(`
      SELECT s.*, u.subscription_status
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.user_id = $1 AND s.status = 'active'
      AND s.current_period_end > NOW()
      ORDER BY s.created_at DESC
      LIMIT 1
    `, [req.user.userId]);

    if (subscription.rows.length > 0) {
      res.json({
        subscription: {
          id: subscription.rows[0].id,
          plan: subscription.rows[0].plan_type,
          status: subscription.rows[0].status,
          current_period_start: subscription.rows[0].current_period_start,
          current_period_end: subscription.rows[0].current_period_end
        }
      });
    } else {
      res.json({ subscription: null });
    }

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stripe checkout session
app.post('/api/subscriptions/create-checkout', authenticateToken, async (req, res) => {
  try {
    const { priceId } = req.body;

    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        userId: req.user.userId
      }
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhooks
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
async function handleCheckoutCompleted(session) {
  try {
    // Store the session ID -> user ID mapping for later use
    if (session.metadata?.userId) {
      await pool.query(`
        INSERT INTO checkout_sessions (session_id, user_id, subscription_id)
        VALUES ($1, $2, $3)
        ON CONFLICT (session_id)
        DO UPDATE SET subscription_id = EXCLUDED.subscription_id
      `, [session.id, session.metadata.userId, session.subscription]);

      console.log(`Checkout completed for user ${session.metadata.userId}, session: ${session.id}`);
    }
  } catch (error) {
    console.error('Checkout completed handler error:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription) {
      console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
    }
  } catch (error) {
    console.error('Invoice payment succeeded handler error:', error);
  }
}

async function handleSubscriptionChange(subscription) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Find user ID from checkout sessions table
    const sessionResult = await client.query(
      'SELECT user_id FROM checkout_sessions WHERE subscription_id = $1',
      [subscription.id]
    );

    if (sessionResult.rows.length === 0) {
      console.log(`No checkout session found for subscription ${subscription.id}`);
      await client.query('COMMIT');
      return;
    }

    const userId = sessionResult.rows[0].user_id;

    // Update or create subscription record
    const result = await client.query(`
      INSERT INTO subscriptions (
        user_id, stripe_subscription_id, plan_type, status,
        current_period_start, current_period_end
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      )
      ON CONFLICT (stripe_subscription_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end
    `, [
      userId,
      subscription.id,
      subscription.items.data[0]?.price?.id?.includes('year') ? 'annual' : 'monthly',
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000)
    ]);

    // Update user subscription status
    await client.query(
      'UPDATE users SET subscription_status = $1 WHERE id = $2',
      [subscription.status, userId]
    );

    console.log(`Subscription ${subscription.id} created/updated for user ${userId}`);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function handleSubscriptionCancellation(subscription) {
  await pool.query(
    'UPDATE users SET subscription_status = $1 WHERE id = (SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $2)',
    ['canceled', subscription.id]
  );
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(console.error);