# Thermal Printer Server - Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   or double-click `start-server.bat`

3. **Server runs on:** http://localhost:3001

4. **Your Vite app will automatically use it!**

## How It Works

The Vite app (`src/utils/print.js`) automatically detects and uses the local printer server:

1. App checks for local server at `http://localhost:3001`
2. If available → Uses local printer server ✅
3. If not available → Falls back to QZ Tray
4. If neither available → Shows error

## Testing

### Test Server Status
Open browser: http://localhost:3001/health

Should return:
```json
{
  "status": "ok",
  "service": "thermal-printer-server",
  "timestamp": "..."
}
```

### Test Print from Browser Console
```javascript
fetch('http://localhost:3001/print/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ printerName: 'XP-76C' })
})
.then(r => r.json())
.then(console.log);
```

## Integration with Vite App

The app is already configured! Just:

1. Start the server: `npm start` in `thermal-printer-script` folder
2. Open your Vite app
3. Print receipts - they'll automatically use the local server

## Configuration

### Change Port
Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change 3001 to your port
```

Edit `src/utils/localPrint.js`:
```javascript
const API_BASE_URL = 'http://localhost:3001'; // Change to match
```

### Set Default Printer
The app will use the printer name from settings, or you can set it in the print request.

## Troubleshooting

### Server Won't Start
- Check if port 3001 is already in use
- Run as Administrator
- Check Node.js is installed: `node --version`

### App Can't Connect
- Make sure server is running
- Check browser console for CORS errors
- Verify URL: http://localhost:3001/health

### Print Jobs Fail
- Check printer is online
- Verify printer name is correct (case-sensitive)
- Check Windows Print Queue for errors
- Try printing test page: `node print.js test "Printer Name"`

## Production Deployment

1. **Run server as Windows Service** (use `node-windows` or `pm2`)
2. **Set up auto-start** on system boot
3. **Configure firewall** to allow localhost connections
4. **Monitor logs** for errors

## Files

- `server.js` - Express server (HTTP API)
- `print.js` - Printing functions
- `start-server.bat` - Windows batch file to start server
- `package.json` - Dependencies

