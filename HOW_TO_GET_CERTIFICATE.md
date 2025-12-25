# How to Get QZ Tray Certificate - Simple Guide

Quick guide to get and install the QZ Tray certificate to fix "Untrusted website" error.

**For production site:** https://shan.cynex.lk/

## ⚠️ Important: Two Different Certificates

**Your website SSL certificate (Let's Encrypt) ≠ QZ Tray certificate**

- **Website SSL Certificate**: Used for HTTPS encryption (already working on https://shan.cynex.lk/)
- **QZ Tray Certificate**: Required separately for QZ Tray to communicate securely with your browser
- **You need BOTH**: Website SSL for HTTPS + QZ Tray certificate for printing

**Your website's SSL certificate will NOT work for QZ Tray** - you must generate/install the QZ Tray certificate separately.

---

## 🎯 Quick Steps (3 Minutes)

### Step 1: Open QZ Tray Settings

1. **Find QZ Tray icon** in your system tray (bottom-right corner, near clock)
2. **Right-click** the QZ Tray icon
3. Click **"Options"** or **"Settings"**

---

### Step 2: Generate/Export Certificate

1. In the QZ Tray window, look for tabs at the top
2. Click **"Security"** tab (or **"Certificates"** tab)
3. You'll see one of these buttons - click it:
   - ✅ **"Generate Certificate"** (if you see this) - **Click this for first time setup**
   - ✅ **"Create Certificate"** (if you see this) - **Same as Generate**
   - ✅ **"Export Certificate"** (if certificate already exists)

4. **Save the certificate file:**
   - Click **"Save"** or **"Browse"**
   - Choose **Desktop** (easiest location)
   - **File name:** You can name it `qz-certificate.p12` or `shan-cynex-cert.p12`
   - Click **"Save"**
   - File will be saved as `.p12`, `.crt`, or `.cer` format
   - **Remember where you saved it!**

**Note:** This certificate works for all HTTPS sites including https://shan.cynex.lk/

---

### Step 3: Install Certificate in Windows

1. **Go to your Desktop**
2. **Find the certificate file** you just saved (`.p12`, `.crt`, or `.cer` file)
3. **Double-click** the certificate file
4. **Certificate Import Wizard appears:**
   - Click **"Next"**
   - Click **"Next"** again
   - Select **"Place all certificates in the following store"**
   - Click **"Browse"**
   - Select **"Trusted Root Certification Authorities"**
   - Click **"OK"**
   - Click **"Next"**
   - Click **"Finish"**
   - Click **"Yes"** to security warning
   - You'll see: ✅ **"The import was successful"**

---

### Step 4: Restart QZ Tray

1. **Right-click** QZ Tray icon → Click **"Exit"**
2. **Open QZ Tray again** from Start Menu
3. **Done!** ✅

---

## 🔍 Can't Find the Button?

### Option A: Check Certificate Folder

1. Open **File Explorer**
2. Go to: `C:\Users\YourUsername\.qz\cert\`
   - Replace `YourUsername` with your Windows username
3. Look for certificate files (`.p12`, `.crt`, `.cer`)
4. If you find one, double-click it and follow Step 3 above

### Option B: Check QZ Tray Installation Folder

1. Open **File Explorer**
2. Go to: `C:\Program Files\QZ Tray\` (or `C:\Program Files (x86)\QZ Tray\`)
3. Look for certificate files
4. If you find one, double-click it and follow Step 3 above

### Option C: Certificate File Location

If you can't find the button, the certificate might already exist:

**Windows Certificate Location:**
- `C:\Users\YourUsername\.qz\cert\` folder
- Look for files: `auth-default.json`, `certificate.p12`, or similar

**To export existing certificate:**
1. Right-click QZ Tray → Options → Security tab
2. Look for **"Export"** or **"Save Certificate"** button
3. Save it to Desktop

**Note for https://shan.cynex.lk/:** 
- You need the certificate installed for HTTPS sites
- Localhost doesn't require certificate, but production HTTPS sites do

---

## ✅ Test It

1. Open your POS system at **https://shan.cynex.lk/**
2. Try to print a receipt
3. QZ Tray will ask for permission
4. **"Allow" button should work now!** ✅
5. Click **"Allow"** - receipt should print automatically

**Important:** Make sure you're accessing the site via HTTPS (https://shan.cynex.lk/) not HTTP

---

## 🆘 Still Having Issues?

**Check these:**
- [ ] QZ Tray is running (icon visible in system tray)
- [ ] Certificate file was saved successfully
- [ ] Certificate was installed to "Trusted Root Certification Authorities"
- [ ] QZ Tray was restarted after installing certificate
- [ ] You clicked "Yes" to the security warning

**If "Allow" button is still disabled:**
1. Make sure certificate is installed correctly (repeat Step 3)
2. Restart QZ Tray again
3. Try restarting your computer
4. Or use localhost method (no certificate needed)

---

**That's it! Once the certificate is installed, printing will work automatically.** 🎉

