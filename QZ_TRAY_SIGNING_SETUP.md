# QZ Tray Certificate Signing Setup

Proper way to set up QZ Tray to eliminate "untrusted website" warnings using certificate signing.

---

## 🎯 What is Certificate Signing?

Instead of installing a self-signed certificate, QZ Tray uses **certificate signing** to verify messages. This is the recommended method and eliminates warning dialogs completely.

**Benefits:**
- ✅ No "untrusted website" warnings
- ✅ No "Allow" button issues
- ✅ More secure than self-signed certificates
- ✅ Proper QZ Tray way (recommended by QZ Tray)

---

## 📋 Current Setup

Your POS system is now configured to use **QZ Tray Demo Certificate** by default. This works immediately without any setup!

**Demo Certificate:**
- Included in the code
- Works out of the box
- No installation needed
- Perfect for testing

---

## 🚀 Production Setup (Recommended)

For production, set up **server-side signing** for better security:

### Step 1: Generate Signing Keys

1. **Get QZ Tray demo certificate** (already included in code)
2. **Or generate your own** through QZ Tray portal (Premium Support customers)

### Step 2: Set Up Server-Side Signing

Create API endpoints on your server:

**Certificate Endpoint** (`/api/qz/certificate`):
```javascript
// server/routes/qz.js
router.get('/certificate', (req, res) => {
  // Return certificate content
  const certificate = fs.readFileSync('path/to/digital-certificate.txt', 'utf8');
  res.setHeader('Content-Type', 'text/plain');
  res.send(certificate);
});
```

**Signature Endpoint** (`/api/qz/sign`):
```javascript
// Requires: crypto, fs modules
router.get('/sign', (req, res) => {
  const toSign = req.query.request;
  const privateKey = fs.readFileSync('path/to/private-key.pem', 'utf8');
  
  // Sign the message using SHA512
  const signature = crypto.createSign('SHA512')
    .update(toSign)
    .sign(privateKey, 'base64');
  
  res.setHeader('Content-Type', 'text/plain');
  res.send(signature);
});
```

### Step 3: Update Client Code

In `src/App.jsx`, update the configuration:

```javascript
configureQZSigning({
  certificateUrl: '/api/qz/certificate', // Fetch from server
  signatureUrl: '/api/qz/sign', // Sign on server
  useDemoCert: false // Don't use demo cert
});
```

---

## ✅ Current Status

**Your system is using:** QZ Tray Demo Certificate (works immediately)

**To upgrade to production:**
1. Set up server-side signing endpoints
2. Update `configureQZSigning()` in `src/App.jsx`
3. Deploy and test

---

## 📝 Demo Certificate (Included)

The demo certificate is already included in `src/utils/qzPrint.js`:

```
-----BEGIN CERTIFICATE-----
MIIECzCCAvOgAwIBAgIGAZtViVA9MA0GCSqGSIb3DQEBCwUAMIGiMQswCQYDVQQG
...
-----END CERTIFICATE-----
```

This certificate:
- ✅ Works immediately
- ✅ No installation needed
- ✅ No warnings (when properly signed)
- ✅ Perfect for testing

---

## 🔧 How It Works

1. **Certificate Promise**: QZ Tray loads the certificate (demo or from server)
2. **Signature Promise**: Messages are signed (server-side recommended)
3. **Verification**: QZ Tray verifies signatures automatically
4. **No Warnings**: Properly signed messages show no warnings

---

## 📚 References

- [QZ Tray Signing Documentation](https://qz.io/docs/)
- [QZ Tray Demo Certificate](https://qz.io/docs/#signing-examples)

---

## 🎯 Summary

**Current Setup:**
- ✅ Using QZ Tray Demo Certificate
- ✅ Works immediately
- ✅ No installation needed
- ✅ No "Allow" button issues

**For Production:**
- Set up server-side signing
- More secure
- Better for multiple clients

**Your system is ready to use!** The demo certificate eliminates warnings and works out of the box. 🎉
