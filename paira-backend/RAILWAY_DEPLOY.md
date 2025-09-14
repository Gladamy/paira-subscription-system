# 🚂 Railway Deployment Guide for Paira.live

Deploy your subscription system to Railway with custom domain support.

## 📋 Prerequisites

- GitHub account with repository access
- Railway account (free tier available)
- Stripe account with live keys
- Domain: paira.live

## 🚀 Step-by-Step Deployment

### **Step 1: Create Railway Account**
1. Visit: https://railway.app
2. Sign up with GitHub (recommended)
3. Verify your email

### **Step 2: Create New Project**
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Connect your GitHub account
4. Select your repository (the one containing `paira-backend/`)
5. Click **"Deploy"**

### **Step 3: Add PostgreSQL Database**
1. In your Railway project dashboard, click **"Add Plugin"**
2. Select **"PostgreSQL"**
3. Choose the free tier (512MB)
4. Click **"Add"**

### **Step 4: Configure Environment Variables**
1. Go to your service settings (click on the web service)
2. Click **"Variables"** tab
3. Add these variables:

```
JWT_SECRET=paira-production-jwt-secret-replace-with-secure-random-string-123456789
STRIPE_SECRET_KEY=sk_live_your_actual_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret_here
FRONTEND_URL=https://paira.live
NODE_ENV=production
```

**Note**: `DATABASE_URL` is automatically provided by Railway's PostgreSQL plugin.

### **Step 5: Database Setup**
1. Wait for deployment to complete
2. Click on your web service → **"Shell"** tab
3. Run: `npm run setup-db`
4. This creates all tables and a test user

### **Step 6: Add Custom Domain**
1. In your project dashboard, click **"Settings"**
2. Click **"Domains"**
3. Add: `paira.live`
4. Railway will show DNS records to configure

### **Step 7: Configure DNS**
1. Go to your domain registrar (where paira.live is registered)
2. Add these DNS records:

```
Type: CNAME
Name: @
Value: [Railway provided CNAME]
TTL: 300

Type: TXT
Name: @
Value: [Railway provided TXT for verification]
TTL: 300
```

3. Wait 5-10 minutes for DNS propagation

### **Step 8: Enable SSL**
1. Railway automatically provisions SSL certificate
2. Your site will be available at `https://paira.live`
3. HTTP automatically redirects to HTTPS

## 💳 Stripe Configuration

### **Create Live Products**
1. Go to: https://dashboard.stripe.com/products
2. Create **"Paira Bot Monthly"**:
   - Price: $6.99
   - Billing: Monthly
3. Create **"Paira Bot Annual"**:
   - Price: $54.99
   - Billing: Yearly

### **Setup Webhooks**
1. Go to: https://dashboard.stripe.com/webhooks
2. Click **"Add endpoint"**
3. URL: `https://paira.live/api/webhooks/stripe`
4. Events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **webhook signing secret**

### **Update Environment Variables**
1. In Railway dashboard, update `STRIPE_WEBHOOK_SECRET`
2. Use the secret from step above

## 🧪 Testing Deployment

### **Test Health Check**
```bash
curl https://paira.live/api/health
# Should return: {"status":"OK","timestamp":"..."}
```

### **Test User Registration**
```bash
curl -X POST https://paira.live/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@paira.live","password":"testpass123"}'
```

### **Test Database**
1. Go to Railway → PostgreSQL → **"Query"** tab
2. Run: `SELECT * FROM users;`
3. Should show your test user

## 📊 Monitoring & Logs

### **View Application Logs**
1. Railway dashboard → Your service → **"Logs"** tab
2. Real-time log streaming
3. Search and filter logs

### **Database Monitoring**
1. PostgreSQL plugin → **"Metrics"** tab
2. Connection count, storage usage
3. Query performance

### **Health Monitoring**
- Railway automatically monitors your app
- Automatic restarts on failures
- Email alerts for downtime

## 🔧 Troubleshooting

### **Build Failures**
- Check Railway logs for error messages
- Verify all dependencies are in `package.json`
- Ensure `railway.json` is correct

### **Database Connection Issues**
- Check `DATABASE_URL` environment variable
- Verify PostgreSQL plugin is attached
- Run `npm run test-setup` in Railway shell

### **Webhook Issues**
- Verify webhook URL is `https://paira.live/api/webhooks/stripe`
- Check webhook secret matches environment variable
- Test webhook delivery in Stripe dashboard

### **Domain Issues**
- Wait 10-15 minutes after DNS changes
- Check DNS propagation with: `nslookup paira.live`
- Verify SSL certificate status

## 💰 Cost Breakdown

### **Railway Costs (Monthly)**
- **Hobby Plan**: $5/month (includes 512MB PostgreSQL)
- **Bandwidth**: Free up to 1GB, then $0.10/GB
- **Storage**: Free up to 1GB

### **Stripe Costs**
- **Transaction Fee**: 2.9% + $0.30 per transaction
- **Monthly Fee**: None for standard accounts
- **International**: Additional 1% for non-US cards

### **Domain Costs**
- **paira.live**: Your existing domain costs

## 🚀 Production Checklist

- [ ] Railway project created and deployed
- [ ] PostgreSQL database attached
- [ ] Environment variables configured
- [ ] Database tables created (`npm run setup-db`)
- [ ] Custom domain (paira.live) added and DNS configured
- [ ] SSL certificate active
- [ ] Stripe products created
- [ ] Webhooks configured with correct URL
- [ ] Test user registration works
- [ ] Health check endpoint responds
- [ ] Desktop app configured for production URLs

## 🎯 Go Live!

Once everything is configured:

1. **Test the complete flow**:
   - Register account on paira.live
   - Subscribe to a plan
   - Complete Stripe payment
   - License gets activated

2. **Update desktop app**:
   - Change API URLs to `https://paira.live`
   - Build production version
   - Distribute to users

3. **Monitor and scale**:
   - Watch Railway logs and metrics
   - Monitor Stripe dashboard
   - Scale as user base grows

## 📞 Support

**Railway Support**:
- Dashboard → Help → Contact Support
- Documentation: https://docs.railway.app/

**Stripe Support**:
- Dashboard → Help → Contact Support
- Documentation: https://stripe.com/docs/

**Your System**:
- Check Railway logs for application errors
- Test API endpoints individually
- Verify database connectivity

---

**🎉 Your subscription system is now live on paira.live!**

Users can now register, subscribe, and access your bot with full license protection. 🚀💰