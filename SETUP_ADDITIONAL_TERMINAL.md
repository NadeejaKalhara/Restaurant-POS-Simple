# Setting Up QZ Tray on Additional Terminals

This guide explains how to set up QZ Tray certificate signing on additional terminals/PCs.

## Quick Setup

### Option 1: Automated Setup (Recommended)

**The script automatically downloads certificate files from Supabase storage!**

1. **Run the setup script** (no manual file copying needed):
   ```powershell
   .\setup-additional-terminal.ps1
   ```
   
   The script will:
   - ✅ Automatically download certificate files from Supabase
   - ✅ Extract the zip file
   - ✅ Copy files to `server\qz-keys\`
   - ✅ Set proper permissions
   - ✅ Verify configuration

2. **Restart your browser** and test printing.

**Note:** If download fails, the script will fall back to checking local certificate files.

### Option 2: Manual Setup

1. **Copy certificate files** to the new terminal:
   - Place them in: `server\qz-keys\`
   - Files needed:
     - `digital-certificate.txt`
     - `private-key.pem`

2. **Verify App.jsx configuration**:
   ```javascript
   configureQZSigning({
     certificateUrl: '/api/qz/certificate',
     signatureUrl: '/api/qz/sign',
     useDemoCert: false
   });
   ```

3. **Make sure your server is running** and accessible from this terminal.

4. **Restart your browser** and test printing.

## Important Notes

### ✅ Sharing Certificates is OK

- **Yes, you can use the same certificate files** on multiple terminals
- All terminals connecting to the same server can share the same certificate
- The server handles the signing, so the certificate is just for authentication

### 🔒 Security Considerations

- The certificate files are used for authentication, not encryption
- Since signing happens on the server, sharing certificates is safe
- For maximum security, you could generate separate certificates per terminal, but it's not necessary

### 🌐 Network Requirements

- Each terminal must be able to reach your server at:
  - `https://shan.cynex.lk/api/qz/certificate`
  - `https://shan.cynex.lk/api/qz/sign`
- Make sure the server is accessible from all terminals

## Troubleshooting

### Certificate Not Found Error

- Verify files are in `server\qz-keys\` directory
- Check file names are exactly: `digital-certificate.txt` and `private-key.pem`
- Restart your server after copying files

### Signature Missing Error

- Verify App.jsx is configured with `certificateUrl` and `signatureUrl`
- Check that your server is running and accessible
- Check browser console for network errors

### QZ Tray Not Connecting

- Make sure QZ Tray is installed and running on the new terminal
- Check QZ Tray is listening on port 8181
- Verify firewall isn't blocking QZ Tray

## Files Needed

**Certificate files are automatically downloaded** from Supabase storage:
- `digital-certificate.txt`
- `private-key.pem`

**Application code** (already in your repo):
- `src/App.jsx` (with certificate signing configured)
- `src/utils/qzPrint.js` (QZ Tray utilities)
- `server/routes/qz.js` (server signing routes)

**No manual file copying needed!** The script handles everything automatically.

## Quick Checklist

- [ ] Certificate files copied to `server\qz-keys\`
- [ ] App.jsx configured with certificate URLs
- [ ] Server is running and accessible
- [ ] QZ Tray is installed and running
- [ ] Browser restarted
- [ ] Test printing works

## Alternative: Network Share

If you have multiple terminals on the same network, you could:

1. **Store certificates on a network share**:
   - Share `server\qz-keys\` from your main server
   - Point all terminals to the shared location

2. **Update server route** to use network path:
   ```javascript
   const KEYS_DIR = '\\\\server\\qz-keys';
   ```

However, **local copies are recommended** for better reliability.

