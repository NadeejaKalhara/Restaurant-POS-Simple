# Restaurant POS System - Production Setup

## Security Configuration

### ✅ Completed Security Measures

1. **Authentication System**
   - JWT-based authentication implemented
   - All admin routes protected with `authenticate` and `authorize` middleware
   - Role-based access control (admin, staff, cashier)
   - Public routes: GET menu items, GET active discounts, POST validate discount

2. **MongoDB Security**
   - Authorization enabled
   - Bound to localhost only (127.0.0.1)
   - Database user created with read/write permissions
   - Admin user created for database management
   - Password stored securely in .env file

3. **Network Security**
   - Server bound to localhost only (127.0.0.1:5000)
   - Nginx reverse proxy handles external connections
   - Firewall configured (UFW) - only ports 22, 80, 443 open
   - Direct IP access blocked via Nginx default server block

4. **SSL/TLS**
   - Let's Encrypt certificate installed via certbot
   - Automatic renewal configured
   - HTTPS enforced with HTTP to HTTPS redirect
   - Security headers configured (HSTS, X-Frame-Options, etc.)

5. **CORS Protection**
   - Only allows requests from https://shan.cynex.lk
   - Credentials enabled for authenticated requests

## Services

- **MongoDB**: Running on 127.0.0.1:27017 (secured)
- **Node.js API**: Running on 127.0.0.1:5000 (systemd service)
- **Nginx**: Reverse proxy on ports 80/443
- **Frontend**: Served from /root/Restaurant-POS-Simple/dist

## Access

- **Domain**: https://shan.cynex.lk
- **API**: https://shan.cynex.lk/api
- **Direct IP access**: Blocked

## Environment Variables

Located in `/root/Restaurant-POS-Simple/.env`:
- MONGODB_URI: Connection string with authentication
- JWT_SECRET: Secure random token
- ALLOWED_ORIGINS: https://shan.cynex.lk

## Service Management

```bash
# Restaurant POS API
systemctl status restaurant-pos
systemctl restart restaurant-pos
journalctl -u restaurant-pos -f

# MongoDB
systemctl status mongod
systemctl restart mongod

# Nginx
systemctl status nginx
systemctl reload nginx
nginx -t  # Test configuration
```

## Creating Initial Admin User

To create the first admin user, use the API:

```bash
curl -X POST https://shan.cynex.lk/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "fullName": "System Administrator",
    "role": "admin"
  }'
```

Then login to get a JWT token for authenticated requests.

## MongoDB Credentials

- Admin User: restaurant_admin
- Database User: restaurant_user
- Password: Stored in .env file (MONGODB_PASSWORD)

## Firewall Status

```bash
ufw status verbose
```

Only ports 22 (SSH), 80 (HTTP), and 443 (HTTPS) are open.

## SSL Certificate

- Certificate: /etc/letsencrypt/live/shan.cynex.lk/fullchain.pem
- Private Key: /etc/letsencrypt/live/shan.cynex.lk/privkey.pem
- Auto-renewal: Enabled via certbot timer

## Logs

- Application: `journalctl -u restaurant-pos -f`
- Nginx: `/var/log/nginx/access.log` and `/var/log/nginx/error.log`
- MongoDB: `/var/log/mongodb/mongod.log`
