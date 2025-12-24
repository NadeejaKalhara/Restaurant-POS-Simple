# 🚀 Deployment Guide

## Quick Deploy Commands

### One-Command Deploy
```bash
./deploy.sh
```

### Manual Deploy Steps
```bash
# 1. Update repository
git pull origin main

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Start production server
npm start
```

## PM2 Deployment (Recommended)

### Install PM2 (if not installed)
```bash
npm install -g pm2
```

### Deploy with PM2
```bash
# Using the deploy script (automatically uses PM2 if available)
./deploy.sh

# Or manually with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Run this once to enable PM2 on system startup
```

### PM2 Management Commands
```bash
# View status
pm2 status

# View logs
pm2 logs restaurant-pos

# Restart application
pm2 restart restaurant-pos

# Stop application
pm2 stop restaurant-pos

# Delete from PM2
pm2 delete restaurant-pos

# Monitor (real-time)
pm2 monit
```

## Environment Configuration

Make sure your `.env` file is configured:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ALLOWED_ORIGINS=https://yourdomain.com
```

## Deployment Checklist

- [ ] Repository updated (`git pull`)
- [ ] Dependencies installed (`npm install`)
- [ ] Application built (`npm run build`)
- [ ] Environment variables configured (`.env`)
- [ ] MongoDB connection verified
- [ ] Server started (PM2 or `npm start`)
- [ ] Firewall ports configured (if needed)
- [ ] SSL/HTTPS configured (for production)

## Production URLs

- **API Server**: `http://localhost:5000` (or your configured port)
- **Frontend**: Served from `dist/` folder after build

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### PM2 Not Starting
```bash
# Check PM2 logs
pm2 logs restaurant-pos --lines 50

# Restart PM2 daemon
pm2 kill
pm2 resurrect
```

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Quick Links

- **Deploy Script**: `./deploy.sh`
- **Update & Build**: `./update-and-build.sh`
- **PM2 Config**: `ecosystem.config.js`
- **Quick Reference**: `QUICK-UPDATE.md`

