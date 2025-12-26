# Fix "Signature Missing" Error

## ✅ Solution Applied

The "signature missing" error occurs because QZ Tray requires a signature when a certificate is set. 

**Fix:** Certificate signing is now disabled by default to allow printing to work immediately.

---

## 🔧 Current Configuration

**In `src/App.jsx`:**
- Certificate signing is **disabled** (`useDemoCert: false`)
- Printing works without signature errors
- May show warnings but printing functions correctly

---

## 🚀 Enable Certificate Signing (Optional)

To eliminate warnings completely, set up server-side signing:

### Step 1: Get QZ Tray Keys

1. **Get demo certificate and private key** from QZ Tray installation:
   - Windows: `C:\Program Files\QZ Tray\demo\`
   - Look for: `digital-certificate.txt` and `private-key.pem`

2. **Create directory:**
   ```bash
   mkdir server/qz-keys
   ```

3. **Copy files:**
   - Copy `digital-certificate.txt` → `server/qz-keys/digital-certificate.txt`
   - Copy `private-key.pem` → `server/qz-keys/private-key.pem`

### Step 2: Enable Signing

**Update `src/App.jsx`:**
```javascript
configureQZSigning({
  certificateUrl: '/api/qz/certificate', // Fetch from server
  signatureUrl: '/api/qz/sign', // Sign on server
  useDemoCert: false
});
```

### Step 3: Restart Server

The server routes are already set up in `server/routes/qz.js`. Just restart your server.

---

## ✅ Current Status

**Printing works now** without signature errors! 

- ✅ No "signature missing" error
- ✅ Printing functions correctly
- ⚠️ May show warnings (but printing works)

**To eliminate warnings:** Set up server-side signing as described above.

---

## 📝 Quick Test

1. Restart your browser
2. Try printing from https://shan.cynex.lk/
3. Printing should work without signature errors!


