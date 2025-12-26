# Quick Setup - QZ Tray Certificate Signing

Easiest way to set up certificate signing and eliminate all warnings.

---

## 🚀 One-Click Setup

### Option 1: Run Batch File (Easiest)

**Double-click:** `setup-qz-signing.bat`

This will:
1. ✅ Find QZ Tray installation
2. ✅ Copy certificate and private key files
3. ✅ Create `server/qz-keys/` directory
4. ✅ Update `src/App.jsx` configuration
5. ✅ Set proper file permissions

---

### Option 2: Run PowerShell Script

**Right-click** `setup-qz-signing.ps1` → **"Run with PowerShell"**

**OR** open PowerShell and run:
```powershell
cd C:\Users\elkal\resturantPOS
.\setup-qz-signing.ps1
```

---

## 📋 What the Script Does

1. **Finds QZ Tray demo folder**
   - Checks: `C:\Program Files\QZ Tray\demo`
   - Checks: `C:\Program Files (x86)\QZ Tray\demo`
   - Or asks for custom path

2. **Copies files:**
   - `digital-certificate.txt` → `server/qz-keys/digital-certificate.txt`
   - `private-key.pem` → `server/qz-keys/private-key.pem`

3. **Updates configuration:**
   - Modifies `src/App.jsx` to enable certificate signing
   - Sets `certificateUrl` and `signatureUrl`

4. **Sets permissions:**
   - Secures private key file

---

## ✅ After Running Script

1. **Restart your server:**
   ```bash
   npm run dev:server
   # or
   npm start
   ```

2. **Restart your browser**

3. **Test printing:**
   - Go to https://shan.cynex.lk/
   - Try printing a receipt
   - **No warnings!** ✅

---

## 🔍 Manual Setup (If Script Fails)

### Step 1: Find QZ Tray Demo Files

1. Open File Explorer
2. Go to: `C:\Program Files\QZ Tray\demo`
3. Look for:
   - `digital-certificate.txt`
   - `private-key.pem`

### Step 2: Create Directory

```bash
mkdir server\qz-keys
```

### Step 3: Copy Files

Copy both files to: `server\qz-keys\`

### Step 4: Update App.jsx

Edit `src/App.jsx` and change:
```javascript
configureQZSigning({
  useDemoCert: false, // Change this
  certificateUrl: '/api/qz/certificate', // Add this
  signatureUrl: '/api/qz/sign', // Add this
});
```

### Step 5: Restart Server

Restart your Node.js server.

---

## 🆘 Troubleshooting

### "QZ Tray demo folder not found"

**Solution:**
- Make sure QZ Tray is installed
- Check: `C:\Program Files\QZ Tray\demo`
- Or provide custom path when script asks

### "Files not copied"

**Solution:**
- Run PowerShell as Administrator
- Check if files exist in QZ Tray demo folder
- Manually copy files to `server/qz-keys/`

### "App.jsx not updated"

**Solution:**
- Manually edit `src/App.jsx`
- Update `configureQZSigning()` call
- See manual setup instructions above

---

## ✅ Verification

After setup, check:

- [ ] Files exist in `server/qz-keys/`
- [ ] `digital-certificate.txt` is present
- [ ] `private-key.pem` is present
- [ ] `src/App.jsx` has `signatureUrl` configured
- [ ] Server is restarted
- [ ] Browser is restarted

---

**That's it! Certificate signing is now set up and warnings are eliminated.** 🎉


