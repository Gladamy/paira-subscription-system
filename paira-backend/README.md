# Paira Backend API

Backend API server for the Paira bot subscription system, handling user authentication, payment processing, and license validation.

## Features

- 🔐 **User Authentication**: JWT-based login/registration
- 💳 **Stripe Integration**: Secure subscription payments
- 🔒 **HWID Licensing**: Hardware-based license validation
- 🗄️ **PostgreSQL Database**: ACID-compliant data storage
- 🛡️ **Security**: Rate limiting, CORS, input validation
- 📊 **Webhook Processing**: Real-time subscription updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Payments**: Stripe
- **Authentication**: JWT
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Stripe account (for payments)

### Installation

1. **Clone and setup**:
   ```bash
   cd paira-backend
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Database setup**:
   ```sql
   -- Create database
   CREATE DATABASE paira_db;

   -- Tables are auto-created on server start
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## Environment Configuration

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/paira_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Subscriptions
- `POST /api/subscriptions/create-checkout` - Create Stripe checkout session

### Licenses
- `POST /api/licenses/validate` - Validate HWID license

### User
- `GET /api/user/profile` - Get user profile

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Health
- `GET /api/health` - Health check

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  subscription_status VARCHAR(50) DEFAULT 'inactive'
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(50), -- 'monthly' or 'annual'
  status VARCHAR(50),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Licenses
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  hwid_hash VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW()
);
```

## Stripe Setup

### 1. Create Products and Prices

```javascript
// Monthly subscription - $6.99
const monthlyPrice = await stripe.prices.create({
  product: 'prod_paira_monthly',
  unit_amount: 699,
  currency: 'usd',
  recurring: { interval: 'month' }
});

// Annual subscription - $54.99
const annualPrice = await stripe.prices.create({
  product: 'prod_paira_annual',
  unit_amount: 5499,
  currency: 'usd',
  recurring: { interval: 'year' }
});
```

### 2. Configure Webhooks

Set up webhook endpoint at `/api/webhooks/stripe` with events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Development

### Scripts

```bash
npm run dev      # Start with nodemon (auto-restart)
npm start        # Production start
npm test         # Run tests (when implemented)
```

### Project Structure

```
paira-backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment template
├── README.md          # This file
└── node_modules/      # Dependencies
```

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configured for frontend origin
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **HTTPS Enforcement**: SSL required in production

## Deployment

### Railway (Recommended)

1. Connect GitHub repository
2. Add environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

### Manual Deployment

```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start server.js --name paira-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

## Monitoring

- **Health Check**: `GET /api/health`
- **Error Logging**: Console output with timestamps
- **Database Monitoring**: Connection pool status
- **Stripe Webhooks**: Event processing logs

## License Validation Flow

1. **Desktop App**: Generates HWID on startup
2. **API Call**: `POST /api/licenses/validate` with HWID + JWT token
3. **Database Check**: Verify active subscription + HWID match
4. **Response**: `{ valid: true/false, subscription: {...} }`
5. **App Behavior**: Enable/disable features based on validation

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## Support

For issues and questions:
- Check the logs in the console
- Verify environment variables
- Ensure database connectivity
- Confirm Stripe webhook configuration