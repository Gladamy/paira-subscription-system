# 🚀 Paira Backend Deployment Guide

Deploy your subscription system to **paira.live** with professional hosting.

## 📋 Deployment Options

### **Option 1: Railway (Recommended)**
**Best for**: Easy deployment, PostgreSQL included, custom domains

#### Setup Steps:
1. **Create Railway Account**: https://railway.app
2. **Connect GitHub**: Link your repository
3. **Deploy**: Automatic deployment on git push
4. **Add Custom Domain**:
   - Go to Settings → Domains
   - Add `paira.live`
   - Configure DNS records as instructed

#### Environment Variables:
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-production-jwt-secret
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
FRONTEND_URL=https://paira.live
NODE_ENV=production
```

### **Option 2: Render**
**Best for**: Free tier, easy scaling, PostgreSQL add-on

#### Setup Steps:
1. **Create Render Account**: https://render.com
2. **Create PostgreSQL Database**:
   - Add PostgreSQL service
   - Note the connection string
3. **Create Web Service**:
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
4. **Add Custom Domain**:
   - Settings → Custom Domains
   - Add `paira.live`

### **Option 3: DigitalOcean App Platform**
**Best for**: Full control, scalable infrastructure

#### Setup Steps:
1. **Create DigitalOcean Account**: https://digitalocean.com
2. **Create App**:
   - Connect GitHub repository
   - App Spec: Node.js, PostgreSQL database
3. **Configure Environment**:
   - Add all environment variables
   - Set up database connection
4. **Add Domain**:
   - Networking → Domains
   - Add `paira.live`

### **Option 4: Vercel + Neon (PostgreSQL)**
**Best for**: Serverless, fast deployments

#### Setup Steps:
1. **Create Vercel Account**: https://vercel.com
2. **Create Neon Database**: https://neon.tech
3. **Deploy Backend**:
   - Connect GitHub repository
   - Configure build settings
4. **Add Custom Domain**:
   - Project Settings → Domains
   - Add `paira.live`

## 🔧 Pre-Deployment Checklist

### Environment Setup
- [ ] Update `.env` with production values
- [ ] Generate secure JWT secret (32+ characters)
- [ ] Switch to live Stripe keys (`sk_live_*`)
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database URL

### Stripe Configuration
- [ ] Create live Stripe products and prices
- [ ] Update webhook endpoint to production URL
- [ ] Test webhook delivery
- [ ] Verify webhook secret

### Security Setup
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Configure CORS for production domain
- [ ] Set up proper environment variables
- [ ] Enable database SSL connections

### Domain Configuration
- [ ] Point `paira.live` DNS to hosting provider
- [ ] Configure SSL certificate (usually automatic)
- [ ] Test domain resolution
- [ ] Update frontend API calls to production URL

## 📊 Production Database Setup

### Railway PostgreSQL (Automatic)
```bash
# Database is created automatically
# Connection string available in environment variables
```

### Manual PostgreSQL Setup
```sql
-- Create production database
CREATE DATABASE paira_prod;

-- Create application user
CREATE USER paira_app WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE paira_prod TO paira_app;

-- Run setup script
npm run setup-db
```

## 🔒 Production Security

### Environment Variables
```env
# Production secrets (never commit to git)
JWT_SECRET=your-very-secure-jwt-secret-here
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
DATABASE_URL=postgresql://user:pass@host:5432/paira_prod
```

### SSL & HTTPS
- [ ] Enable HTTPS redirect
- [ ] Configure secure headers
- [ ] Set up CORS properly
- [ ] Enable database SSL

### Monitoring
- [ ] Set up error logging
- [ ] Configure health checks
- [ ] Enable database monitoring
- [ ] Set up alerts for failures

## 🚀 Deployment Steps

### Step 1: Prepare Code
```bash
# Update environment configuration
cp .env.example .env.production
# Edit .env.production with production values

# Test production build
npm run build
npm start
```

### Step 2: Database Migration
```bash
# Connect to production database
# Run setup script
npm run setup-db
```

### Step 3: Deploy Application
```bash
# Commit changes
git add .
git commit -m "Production deployment"
git push origin main

# Deploy via your chosen platform
# Follow platform-specific deployment steps
```

### Step 4: Configure Domain
```bash
# Add custom domain in hosting platform
# Configure DNS records as instructed
# Wait for SSL certificate provisioning
```

### Step 5: Update Stripe
```bash
# Update webhook URL to production domain
# https://paira.live/api/webhooks/stripe

# Test webhook delivery
# Verify subscription creation/updates work
```

### Step 6: Test Production
```bash
# Test all endpoints
curl https://paira.live/api/health

# Test user registration
curl -X POST https://paira.live/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@paira.live","password":"testpass123"}'

# Test license validation
# (requires authentication token)
```

## 📈 Scaling & Monitoring

### Performance Monitoring
- **Response Times**: Monitor API latency
- **Error Rates**: Track failed requests
- **Database Performance**: Monitor query times
- **Memory Usage**: Track resource consumption

### Backup Strategy
- **Database Backups**: Daily automated backups
- **Code Backups**: Git repository versioning
- **Configuration Backups**: Environment variable documentation

### Scaling Considerations
- **Database**: Connection pooling, read replicas
- **API**: Load balancing, caching layers
- **CDN**: Static asset delivery optimization

## 🔧 Troubleshooting

### Common Issues
- **Database Connection**: Check DATABASE_URL format
- **Webhook Failures**: Verify endpoint URL and secret
- **CORS Errors**: Update allowed origins
- **SSL Issues**: Check certificate validity

### Debug Commands
```bash
# Check application logs
# (platform-specific, check hosting dashboard)

# Test database connection
npm run test-setup

# Verify webhook delivery
# Check Stripe dashboard → Events
```

## 💰 Cost Optimization

### Hosting Costs
- **Railway**: $5/month (Hobby plan)
- **Render**: $7/month (Starter plan)
- **DigitalOcean**: $12/month (Basic plan)
- **Vercel**: $0-20/month (based on usage)

### Database Costs
- **Railway PostgreSQL**: Included in app plan
- **Neon**: $0-50/month (based on usage)
- **DigitalOcean Managed DB**: $15/month minimum

## 🎯 Go-Live Checklist

- [ ] Production environment configured
- [ ] Database created and migrated
- [ ] Stripe webhooks updated
- [ ] Domain configured and SSL active
- [ ] All endpoints tested
- [ ] Error monitoring set up
- [ ] Backup strategy implemented
- [ ] Performance monitoring active

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Test API endpoints individually
4. Verify environment configuration
5. Check Stripe webhook delivery

Your subscription system is now ready for production deployment on **paira.live**! 🚀