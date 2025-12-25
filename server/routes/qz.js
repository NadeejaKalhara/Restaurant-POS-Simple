import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * QZ Tray Certificate Signing Routes
 * 
 * To use these routes:
 * 1. Get QZ Tray demo certificate and private key from QZ Tray installation
 * 2. Place them in server/qz-keys/ directory:
 *    - digital-certificate.txt
 *    - private-key.pem
 * 3. Update configureQZSigning() in src/App.jsx to use these endpoints
 */

// Path to QZ Tray keys (create this directory and add your keys)
const KEYS_DIR = path.join(__dirname, '../qz-keys');
const CERT_FILE = path.join(KEYS_DIR, 'digital-certificate.txt');
const KEY_FILE = path.join(KEYS_DIR, 'private-key.pem');

/**
 * GET /api/qz/certificate
 * Returns the QZ Tray certificate
 */
router.get('/certificate', (req, res) => {
  try {
    if (fs.existsSync(CERT_FILE)) {
      const certificate = fs.readFileSync(CERT_FILE, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(certificate);
    } else {
      res.status(404).send('Certificate file not found. Please place digital-certificate.txt in server/qz-keys/ directory.');
    }
  } catch (error) {
    console.error('Error reading certificate:', error);
    res.status(500).send('Error reading certificate file');
  }
});

/**
 * GET /api/qz/sign
 * Signs a message using the private key
 * Query parameter: request (the message to sign)
 */
router.get('/sign', (req, res) => {
  try {
    const toSign = req.query.request;
    
    if (!toSign) {
      return res.status(400).send('Missing request parameter');
    }

    if (!fs.existsSync(KEY_FILE)) {
      return res.status(404).send('Private key file not found. Please place private-key.pem in server/qz-keys/ directory.');
    }

    const privateKey = fs.readFileSync(KEY_FILE, 'utf8');
    
    // Sign the message using SHA512
    const signature = crypto.createSign('SHA512')
      .update(toSign)
      .sign(privateKey, 'base64');
    
    res.setHeader('Content-Type', 'text/plain');
    res.send(signature);
  } catch (error) {
    console.error('Error signing message:', error);
    res.status(500).send('Error signing message');
  }
});

export default router;

