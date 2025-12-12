# 🚀 Production Deployment Guide

Complete guide for deploying your E-commerce platform to production.

## Deployment Options

1. [Heroku](#heroku-deployment) - Easy, free tier available
2. [AWS](#aws-deployment) - Scalable, professional
3. [DigitalOcean](#digitalocean-deployment) - Simple VPS
4. [Vercel + MongoDB Atlas](#vercel-deployment) - Serverless frontend
5. [Docker](#docker-deployment) - Any cloud provider

## Pre-Deployment Checklist

- [ ] All features tested locally
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] SSL certificate ready
- [ ] Domain name purchased (optional)
- [ ] Payment gateway in production mode
- [ ] Email service configured
- [ ] Error logging setup
- [ ] Performance optimization done

## Heroku Deployment

### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

### Steps

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   heroku login
   ```

2. **Create Heroku Apps**
   ```bash
   # Backend
   heroku create your-app-backend
   
   # Frontend
   heroku create your-app-frontend
   ```

3. **Setup MongoDB Atlas**
   - Create cluster at mongodb.com/cloud/atlas
   - Get connection string
   - Whitelist Heroku IPs (0.0.0.0/0)

4. **Configure Backend Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production -a your-app-backend
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri -a your-app-backend
   heroku config:set JWT_SECRET=your_jwt_secret -a your-app-backend
   heroku config:set STRIPE_SECRET_KEY=your_stripe_key -a your-app-backend
   heroku config:set CLIENT_URL=https://your-app-frontend.herokuapp.com -a your-app-backend
   ```

5. **Deploy Backend**
   ```bash
   cd backend
   git init
   heroku git:remote -a your-app-backend
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

6. **Deploy Frontend**
   ```bash
   cd frontend
   # Update API URL in .env.production
   echo "REACT_APP_API_URL=https://your-app-backend.herokuapp.com" > .env.production
   
   git init
   heroku git:remote -a your-app-frontend
   heroku buildpacks:set mars/create-react-app
   git add .
   git commit -m "Deploy frontend"
   git push heroku main
   ```

## AWS Deployment

### Architecture
- EC2: Application servers
- RDS/DocumentDB: Database
- S3: Static assets
- CloudFront: CDN
- Route 53: DNS
- Load Balancer: Traffic distribution

### Steps

1. **Launch EC2 Instance**
   - Choose Ubuntu Server 22.04 LTS
   - Instance type: t2.micro (free tier) or t2.medium
   - Configure security group:
     - SSH (22)
     - HTTP (80)
     - HTTPS (443)
     - Custom TCP (5000) for backend

2. **Connect to EC2**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install PM2
   sudo npm install -g pm2
   ```

4. **Clone and Setup Application**
   ```bash
   cd /var/www
   sudo git clone your-repo-url ecommerce
   cd ecommerce
   
   # Backend setup
   cd backend
   sudo npm install --production
   sudo cp .env.example .env
   sudo nano .env  # Configure environment variables
   
   # Frontend setup
   cd ../frontend
   sudo npm install
   sudo npm run build
   ```

5. **Configure PM2**
   ```bash
   cd /var/www/ecommerce/backend
   pm2 start server.js --name ecommerce-backend
   pm2 startup
   pm2 save
   ```

6. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/ecommerce
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       # Frontend
       location / {
           root /var/www/ecommerce/frontend/build;
           try_files $uri /index.html;
       }

       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Setup SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## DigitalOcean Deployment

### Using App Platform (Easiest)

1. **Create Account**
   - Sign up at digitalocean.com
   - Get $200 credit for 60 days

2. **Create App**
   - Click "Create" → "Apps"
   - Connect GitHub repository
   - Select branch

3. **Configure Components**
   
   Backend:
   - Type: Web Service
   - Build Command: `cd backend && npm install`
   - Run Command: `node backend/server.js`
   - HTTP Port: 5000

   Frontend:
   - Type: Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/build`

4. **Add Database**
   - Add MongoDB database component
   - Or use MongoDB Atlas

5. **Configure Environment Variables**
   - Add all required variables in App Platform settings

6. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Using Droplet (VPS)

Similar to AWS EC2 deployment above.

## Vercel Deployment

### Frontend on Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add `REACT_APP_API_URL`

### Backend Options
- Deploy backend separately (Heroku, Railway, Render)
- Use Vercel Serverless Functions (requires refactoring)

## Docker Deployment

### Build Images

```bash
# Build backend
docker build -t ecommerce-backend ./backend

# Build frontend
docker build -t ecommerce-frontend ./frontend
```

### Push to Registry

```bash
# Docker Hub
docker tag ecommerce-backend username/ecommerce-backend
docker push username/ecommerce-backend

# AWS ECR
aws ecr get-login-password --region region | docker login --username AWS --password-stdin account-id.dkr.ecr.region.amazonaws.com
docker tag ecommerce-backend account-id.dkr.ecr.region.amazonaws.com/ecommerce-backend
docker push account-id.dkr.ecr.region.amazonaws.com/ecommerce-backend
```

### Deploy with Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables for Production

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_super_secure_secret_key_min_32_chars
JWT_EXPIRE=30d
STRIPE_SECRET_KEY=sk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_secure_password
CLIENT_URL=https://your-domain.com
LOG_LEVEL=error
```

### Frontend (.env.production)

```env
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
```

## Post-Deployment Tasks

### 1. Setup Monitoring

**Sentry (Error Tracking)**
```bash
npm install @sentry/node @sentry/react
```

**Google Analytics**
- Add tracking code to frontend

**Uptime Monitoring**
- UptimeRobot
- Pingdom
- StatusCake

### 2. Setup Backups

**MongoDB Atlas**
- Enable automatic backups
- Configure backup schedule

**Manual Backup Script**
```bash
#!/bin/bash
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)
```

### 3. Configure CDN

**Cloudflare**
- Add domain to Cloudflare
- Update nameservers
- Enable caching and optimization

### 4. Performance Optimization

- Enable gzip compression
- Optimize images
- Implement caching
- Use CDN for static assets
- Enable HTTP/2

### 5. Security Hardening

- Enable HTTPS only
- Configure CORS properly
- Set security headers
- Implement rate limiting
- Regular security updates
- Use environment variables for secrets

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## Domain Configuration

### DNS Settings

```
Type    Name    Value                           TTL
A       @       your-server-ip                  3600
CNAME   www     your-domain.com                 3600
CNAME   api     your-backend-domain.com         3600
```

## Troubleshooting

### Application Not Starting
- Check logs: `pm2 logs` or `heroku logs --tail`
- Verify environment variables
- Check port configuration

### Database Connection Issues
- Verify MongoDB URI
- Check network access (whitelist IPs)
- Verify credentials

### SSL Certificate Issues
- Renew certificate: `sudo certbot renew`
- Check certificate expiry
- Verify domain DNS

### Performance Issues
- Enable caching
- Optimize database queries
- Use CDN
- Scale horizontally

## Scaling Strategies

### Horizontal Scaling
- Multiple server instances
- Load balancer
- Session management (Redis)

### Vertical Scaling
- Upgrade server resources
- Optimize code
- Database indexing

### Database Scaling
- Read replicas
- Sharding
- Caching layer (Redis)

## Cost Optimization

### Free Tier Options
- Heroku: 1 dyno free
- MongoDB Atlas: 512MB free
- Vercel: Unlimited deployments
- Netlify: 100GB bandwidth

### Paid Recommendations
- **Starter**: $20-50/month
  - Heroku Hobby ($7)
  - MongoDB Atlas M10 ($57)
  - Cloudflare Free

- **Growth**: $100-200/month
  - AWS EC2 t3.medium
  - MongoDB Atlas M20
  - CloudFront CDN

## Support & Maintenance

### Regular Tasks
- [ ] Weekly: Check error logs
- [ ] Weekly: Monitor performance
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review security
- [ ] Quarterly: Database optimization
- [ ] Quarterly: Backup verification

### Monitoring Checklist
- [ ] Server uptime
- [ ] Response times
- [ ] Error rates
- [ ] Database performance
- [ ] Disk space
- [ ] SSL certificate expiry

---

## Additional Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Heroku Dev Center](https://devcenter.heroku.com/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

Good luck with your deployment! 🚀
