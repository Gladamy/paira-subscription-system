# 🚀 Paira Backend Setup Guide

Complete setup instructions for the Paira subscription system backend.

## 📋 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL 12+** - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## 🗄️ Step 1: PostgreSQL Setup

### Windows Installation

1. **Download and Install PostgreSQL**
   - Visit: https://www.postgresql.org/download/windows/
   - Download the installer for your Windows version
   - Run the installer and follow the setup wizard

2. **Default Credentials** (during installation)
   - Username: `postgres`
   - Password: `password` (or whatever you set)
   - Port: `5432`

3. **Verify Installation**
   ```bash
   # Open Command Prompt and run:
   psql -U postgres -h localhost
   ```

4. **Create Database User** (optional, for better security)
   ```sql
   -- Connect to PostgreSQL as postgres user
   psql -U postgres

   -- Create a new user for the app
   CREATE USER paira_user WITH PASSWORD 'your_secure_password';

   -- Create database
   CREATE DATABASE paira_db OWNER paira_user;

   -- Grant permissions
   GRANT ALL PRIVILEGES ON DATABASE paira_db TO paira_user;
   ```

### Alternative: Use Docker

```bash
# Install Docker Desktop for Windows
# Then run:
docker run --name paira-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=paira_db -p 5432:5432 -d postgres:15
```

## 💳 Step 2: Stripe Setup

### 1. Create Stripe Account

1. **Sign up at Stripe**
   - Visit: https://dashboard.stripe.com/register
   - Complete account verification

2. **Get API Keys**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your **Secret key** (starts with `sk_test_`)

### 2. Create Products and Prices

1. **Go to Products**: https://dashboard.stripe.com/test/products

2. **Create Monthly Product**
   - Name: "Paira Bot Monthly"
   - Price: $6.99
   - Billing: Monthly

3. **Create Annual Product**
   - Name: "Paira Bot Annual"
   - Price: $54.99
   - Billing: Yearly

4. **Copy Price IDs**
   - Go to each price and copy the ID (starts with `price_`)

### 3. Configure Webhooks

**For Local Development - Use ngrok or Stripe CLI:**

#### Option A: ngrok (Recommended)
```bash
# Install ngrok: https://ngrok.com/download
npm install -g ngrok

# Expose your local server
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

#### Option B: Stripe CLI
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
# Login to your Stripe account
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

1. **Go to Webhooks**: https://dashboard.stripe.com/test/webhooks

2. **Add Endpoint**
   - URL: `https://your-ngrok-url.ngrok.io/api/webhooks/stripe` (from ngrok)
   - Or use the URL provided by `stripe listen`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **Copy Webhook Secret**
   - After creating, copy the webhook signing secret
   - If using Stripe CLI, it will provide the secret automatically

## ⚙️ Step 3: Environment Configuration

### Update `.env` file

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/paira_db

# JWT
JWT_SECRET=paira-dev-jwt-secret-key-change-in-production-123456789

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend
FRONTEND_URL=http://localhost:3000

# Server
PORT=3001
NODE_ENV=development
```

## 🏗️ Step 4: Database Setup

### Initialize Database

```bash
cd paira-backend
npm run setup-db
```

This will:
- ✅ Create the `paira_db` database
- ✅ Create all required tables
- ✅ Create a test user: `test@example.com` / `password123`

## 🚀 Step 5: Start the Backend

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Test Health Check

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-01-XX..."
}
```

## 🧪 Step 6: Testing the API

### Test User Registration

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test User Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Test License Validation

```bash
curl -X POST http://localhost:3001/api/licenses/validate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"hwid":"test-hwid-hash"}'
```

## 🎨 Step 7: Frontend Integration

### Start the Desktop App

```bash
cd ../bot-desktop-react
npm run tauri dev
```

### Test the Complete Flow

1. **Launch App** → Should show login screen
2. **Register/Login** → Use test credentials
3. **Select Plan** → Choose monthly or annual
4. **Stripe Checkout** → Complete payment (use test card)
5. **License Activation** → HWID registered automatically
6. **Bot Access** → Full functionality unlocked

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
netstat -ano | findstr :5432

# Test connection
psql -U postgres -h localhost -d paira_db
```

### Stripe Webhook Issues

- Ensure webhook URL is accessible (use ngrok for local testing)
- Verify webhook secret matches `.env` file
- Check Stripe dashboard for webhook delivery status

### License Validation Issues

- Verify HWID generation is working in desktop app
- Check database for user subscriptions
- Ensure JWT token is valid and not expired

## 📊 Monitoring

### Health Checks

- **API Health**: `GET /api/health`
- **Database**: Check connection pool status
- **Stripe**: Monitor webhook deliveries

### Logs

- Server logs appear in terminal
- Database errors logged automatically
- Stripe webhook events logged

## 🚀 Production Deployment

### Environment Variables

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://yourapp.com
```

### Hosting Options

- **Railway**: Automatic deployments, built-in PostgreSQL
- **Render**: Free tier available, easy scaling
- **AWS/Heroku**: Traditional cloud hosting

## 📞 Support

If you encounter issues:

1. Check the logs in your terminal
2. Verify all environment variables are set
3. Ensure PostgreSQL and Stripe are properly configured
4. Test API endpoints individually

The system is designed to be robust and provide clear error messages for troubleshooting.