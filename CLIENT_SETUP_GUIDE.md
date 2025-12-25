# Quick Setup Guide - POS Printing

Simple step-by-step guide to set up automatic receipt printing with your XP k200L printer.

---

## ✅ What You Need

- XP k200L printer (80mm thermal paper)
- Windows computer
- USB cable

---

## 🚀 Setup Steps (5 Minutes)

### Step 1: Install Printer (2 minutes)

1. Connect XP k200L printer to computer via USB
2. Turn on printer
3. Windows will auto-detect it
4. **Test**: Go to Settings > Printers > Right-click XP k200L > "Print test page"

✅ **Done when**: Test page prints successfully

---

### Step 2: Install QZ Tray (2 minutes)

1. **Download**: Go to [https://qz.io/download/](https://qz.io/download/)
2. **Install**: Run the downloaded file and follow the installer
3. **Check**: Look for QZ Tray icon in system tray (bottom-right corner)

✅ **Done when**: You see QZ Tray icon in system tray

---

### Step 3: Fix Certificate Issue (IMPORTANT)

**If you see "Untrusted website" or "Invalid certificate" error:**

📘 **Need simpler instructions?** See [HOW_TO_GET_CERTIFICATE.md](HOW_TO_GET_CERTIFICATE.md) for step-by-step visual guide.

#### Method 1: Get and Install QZ Tray Certificate (Recommended)

**Part A: Get the Certificate from QZ Tray**

1. **Right-click QZ Tray icon** in system tray (bottom-right corner)
2. Select **"Options"** or **"Settings"**
3. Look for **"Security"** or **"Certificates"** tab and click it
4. You'll see one of these options:
   - **"Generate Certificate"** button - Click this
   - **"Create Certificate"** button - Click this
   - **"Export Certificate"** button - Click this if certificate already exists
5. **Save the certificate file:**
   - Choose a location (Desktop is easiest)
   - File will be saved as `.p12`, `.crt`, or `.cer`
   - Remember where you saved it!

**Part B: Install the Certificate in Windows**

1. **Find the certificate file** you just saved
2. **Double-click the certificate file** (`.p12`, `.crt`, or `.cer`)
3. **Certificate Import Wizard opens:**
   - Click **"Next"**
   - If asked for password, leave blank or enter the password you set
   - Click **"Next"**
4. **Select certificate store:**
   - Choose **"Place all certificates in the following store"**
   - Click **"Browse"** button
   - Select **"Trusted Root Certification Authorities"**
   - Click **"OK"**
   - Click **"Next"**
5. **Finish installation:**
   - Click **"Finish"**
   - Click **"Yes"** to the security warning (this is safe - it's your QZ Tray certificate)
   - You should see "The import was successful"
6. **Restart QZ Tray:**
   - Right-click QZ Tray icon → **"Exit"**
   - Open QZ Tray again from Start Menu
7. **Test:** Try printing from your POS system - the "Allow" button should work now!

**Alternative: If you can't find "Generate Certificate" button:**

1. Right-click QZ Tray icon → **"Options"**
2. Look for **"Advanced"** or **"About"** tab
3. Some versions have certificate in: `C:\Users\YourName\.qz\cert\` folder
4. Or check QZ Tray installation folder for certificate files

#### Method 2: Use Localhost (Easier - No Certificate Needed)

If your POS system can be accessed via `localhost` or `127.0.0.1`:
- Open POS at `http://localhost:3000` (or your local port)
- QZ Tray works without certificates on localhost
- No certificate installation needed!

✅ **Done when**: Certificate is installed OR using localhost

---

### Step 4: Connect to POS (1 minute)

1. Open your POS system in browser
2. When you print, QZ Tray will ask for permission
3. Click **"Allow"** or **"Yes"** (button should work now)
4. Try printing a test receipt

✅ **Done when**: Receipts print automatically without print dialog

---

## 🧪 Test It

1. Create a test order in POS
2. Complete checkout
3. **Expected**: Receipt prints automatically on XP k200L

---

## ⚠️ Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| **"Untrusted website" / "Invalid certificate"** | **See Step 3 above** - Install QZ Tray certificate |
| **"Allow" button is disabled** | Install certificate first (Step 3), then restart QZ Tray |
| Receipts don't print | Check if QZ Tray icon is in system tray |
| Print dialog appears | QZ Tray not running - restart it |
| Wrong printer | Set XP k200L as default in Windows Settings > Printers |
| "QZ Tray not available" | Make sure QZ Tray is installed and running |

---

## 📝 Daily Checklist

**Before starting work:**
- [ ] Printer is ON
- [ ] QZ Tray is running (check system tray)
- [ ] POS system is open

**If printing stops:**
1. Restart QZ Tray (right-click icon → Exit, then open again)
2. Check printer is online (Windows Settings > Printers)
3. Restart computer if needed

---

## 💡 Tips

- **No browser print popup needed** - Once QZ Tray is set up, receipts print automatically
- **Certificate issue?** - Follow Step 3 carefully to install QZ Tray certificate
- **Keep QZ Tray running** - It must stay open in the background
- **Auto-start**: Right-click QZ Tray → Options → Enable "Start with Windows"
- **Default printer**: Set XP k200L as default in Windows for best results
- **Using localhost?** - If accessing via `localhost` or `127.0.0.1`, certificate is not required

---

## 📞 Need Help?

**Before contacting support, check:**
- [ ] QZ Tray is running (system tray icon visible)
- [ ] Printer is ON and connected
- [ ] Printer appears in Windows printer list
- [ ] Test page prints from Windows

**Support:**
- QZ Tray: [qz.io/support](https://qz.io/support/)
- Check printer manual for hardware issues

---

**That's it! You're ready to print receipts automatically.** 🎉
