# Quick Update & Build Commands

## One-Liner Commands

### Update and Build (Full Process)
```bash
git pull origin main && npm install && npm run build
```

### Update Only
```bash
git pull origin main
```

### Build Only
```bash
npm run build
```

### Update, Install Dependencies, and Build
```bash
./update-and-build.sh
```

## Development Commands

### Start Development Server (Frontend + Backend)
```bash
npm run dev
```

### Start Backend Only
```bash
npm run dev:server
```

### Start Frontend Only
```bash
npm run dev:client
```

## Production Commands

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Start Production Server
```bash
npm start
```

## Deployment Commands

### Quick Deploy (Update + Build + Start)
```bash
./deploy.sh
# or
npm run deploy
```

### Deploy with PM2
```bash
pm2 start ecosystem.config.js
pm2 save
```

## Quick Reference

| Action | Command |
|--------|---------|
| **🚀 Deploy** | `./deploy.sh` or `npm run deploy` |
| **Update & Build** | `./update-and-build.sh` |
| **Update Repo** | `git pull origin main` |
| **Install Deps** | `npm install` |
| **Build System** | `npm run build` |
| **Start Dev** | `npm run dev` |
| **Start Prod** | `npm start` |
| **PM2 Start** | `pm2 start ecosystem.config.js` |
| **PM2 Status** | `pm2 status` |
| **PM2 Logs** | `pm2 logs restaurant-pos` |

## Documentation

- **Deployment Guide**: See `DEPLOY.md` for detailed deployment instructions
- **Quick Update**: This file (`QUICK-UPDATE.md`)

