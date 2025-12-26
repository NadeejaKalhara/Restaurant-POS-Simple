# Generate QZ Tray Certificate - Step by Step

Complete guide to generate and install QZ Tray certificate for https://shan.cynex.lk/

---

## 🎯 Step-by-Step Instructions

### Step 1: Open QZ Tray

1. **Look for QZ Tray icon** in your system tray (bottom-right corner, near the clock)
   - If you don't see it, QZ Tray might not be running
   - Open QZ Tray from Start Menu if needed

2. **Right-click** the QZ Tray icon

3. Click **"Options"** or **"Settings"**

---

### Step 2: Navigate to Security/Certificates Tab

1. In the QZ Tray Options window, look for tabs at the top
2. Click on **"Security"** tab
   - Some versions might say **"Certificates"** tab
   - If you don't see these tabs, look for **"Advanced"** tab

---

### Step 3: Generate Certificate

1. In the Security/Certificates tab, you'll see certificate options

2. **If you see "Generate Certificate" button:**
   - ✅ Click **"Generate Certificate"**
   - This is for first-time setup

3. **If you see "Create Certificate" button:**
   - ✅ Click **"Create Certificate"**
   - Same as Generate Certificate

4. **If you see "Export Certificate" button:**
   - This means certificate already exists
   - Click **"Export Certificate"** to save it
   - Then skip to Step 4 (Install Certificate)

---

### Step 4: Save Certificate File

1. **Certificate Generation Dialog appears:**
   - You may be asked to set a password (optional)
   - You can leave password blank or set one (remember it if you set one)

2. **Save the certificate:**
   - Click **"Browse"** or **"Save As"**
   - Navigate to **Desktop** (easiest location)
   - **File name:** Enter `qz-certificate.p12` or `shan-cynex-cert.p12`
   - **File type:** Should be `.p12` (PKCS#12 format)
   - Click **"Save"**

3. **Confirm:**
   - You should see a success message
   - The certificate file is now saved on your Desktop

---

### Step 5: Install Certificate in Windows

1. **Go to your Desktop**

2. **Find the certificate file** you just saved
   - It will be named `qz-certificate.p12` (or whatever you named it)
   - File extension: `.p12`, `.crt`, or `.cer`

3. **Double-click the certificate file**

4. **Certificate Import Wizard opens:**
   - Click **"Next"**

5. **File to Import:**
   - The file path should already be filled in
   - If asked for password, enter the password you set (or leave blank)
   - Click **"Next"**

6. **Certificate Store:**
   - Select **"Place all certificates in the following store"**
   - Click **"Browse"** button
   - Select **"Trusted Root Certification Authorities"**
   - Click **"OK"**
   - Click **"Next"**

7. **Complete the Import:**
   - Click **"Finish"**
   - Windows will show a security warning
   - Click **"Yes"** (this is safe - it's your QZ Tray certificate)
   - You should see: ✅ **"The import was successful"**

---

### Step 6: Restart QZ Tray

1. **Right-click** QZ Tray icon in system tray
2. Click **"Exit"** or **"Quit"**
3. **Open QZ Tray again** from Start Menu
4. Wait for QZ Tray to fully start (icon appears in system tray)

---

### Step 7: Test Certificate

1. **Open your POS system:**
   - Go to **https://shan.cynex.lk/**
   - Make sure you're using HTTPS (not HTTP)

2. **Try to print a receipt:**
   - Create a test order
   - Complete checkout
   - QZ Tray will ask for permission

3. **Check the "Allow" button:**
   - ✅ If "Allow" button is **enabled** → Certificate is working!
   - ❌ If "Allow" button is **disabled** → See troubleshooting below

4. **Click "Allow"** and verify receipt prints automatically

---

## 🔍 Troubleshooting

### Problem: Can't Find "Generate Certificate" Button

**Solution:**
1. Check if certificate already exists:
   - Go to: `C:\Users\YourUsername\.qz\cert\`
   - Look for certificate files
   - If found, use "Export Certificate" instead

2. Check QZ Tray version:
   - Right-click QZ Tray → About
   - Some older versions have different UI
   - Update QZ Tray to latest version if needed

3. Try Advanced tab:
   - Some versions have certificate options in "Advanced" tab

### Problem: "Allow" Button Still Disabled After Installation

**Solutions:**
1. **Verify certificate installation:**
   - Press `Win + R`
   - Type: `certmgr.msc` and press Enter
   - Go to: Trusted Root Certification Authorities → Certificates
   - Look for QZ Tray certificate
   - If not there, repeat Step 5 (Install Certificate)

2. **Restart QZ Tray:**
   - Exit QZ Tray completely
   - Restart it from Start Menu

3. **Restart browser:**
   - Close all browser windows
   - Reopen browser
   - Try again

4. **Restart computer:**
   - Sometimes Windows needs a restart to recognize new certificates

### Problem: Certificate Import Fails

**Solutions:**
1. **Run as Administrator:**
   - Right-click certificate file
   - Select "Run as administrator"
   - Try importing again

2. **Check file format:**
   - Make sure file is `.p12`, `.crt`, or `.cer`
   - If it's a different format, regenerate it

3. **Check password:**
   - If you set a password, make sure you enter it correctly
   - Try leaving password blank if you didn't set one

---

## ✅ Verification Checklist

After generating and installing certificate, verify:

- [ ] Certificate file saved successfully (on Desktop)
- [ ] Certificate imported to "Trusted Root Certification Authorities"
- [ ] QZ Tray restarted after installation
- [ ] Browser restarted (if needed)
- [ ] Accessing site via HTTPS (https://shan.cynex.lk/)
- [ ] "Allow" button is enabled when QZ Tray prompts
- [ ] Receipt prints automatically after clicking "Allow"

---

## 📝 Quick Reference

**Certificate File Location:** Desktop (or wherever you saved it)  
**Certificate Store:** Trusted Root Certification Authorities  
**File Format:** `.p12` (PKCS#12)  
**Password:** Optional (can be left blank)  

---

## 🆘 Still Having Issues?

1. **Check QZ Tray is running** (icon in system tray)
2. **Verify certificate is installed** (certmgr.msc)
3. **Check browser console** (F12) for error messages
4. **Try different browser** (Chrome, Firefox, Edge)
5. **Contact support** with error messages

---

**Once certificate is installed, printing will work automatically!** 🎉


