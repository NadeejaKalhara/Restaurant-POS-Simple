# 🍽️ Restaurant POS System - Sri Lanka

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

A fully featured, modern Restaurant Point of Sale (POS) system designed specifically for Sri Lankan restaurants with LKR currency support, comprehensive discount management, and a beautiful UI with light/dark theme support.

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Client Setup Guide](#-client-setup-guide) 👥
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

### Core Functionality
- ✅ **Complete POS System** - Full-featured point of sale terminal for restaurant operations
- ✅ **Menu Management** - Add, edit, delete menu items with categories and availability control
- ✅ **Order Processing** - Create and manage orders with table numbers and item quantities
- ✅ **Order History** - Track all orders with detailed history and revenue analytics
- ✅ **Discount System** - Advanced discount management with percentage and fixed amount discounts
- ✅ **User Authentication** - Secure JWT-based authentication with role-based access control
- ✅ **Admin Panel** - Comprehensive admin interface for managing all aspects of the system

### User Experience
- 🎨 **Light/Dark Theme** - Toggle between themes with persistent storage
- 📱 **Mobile Responsive** - Fully optimized for mobile devices and tablets
- 💰 **LKR Currency** - All prices displayed in Sri Lankan Rupees (Rs.)
- 🎯 **Intuitive UI** - Modern, clean interface built with Tailwind CSS
- ⚡ **Fast Performance** - Optimized with React Query for efficient data fetching
- 🔔 **Toast Notifications** - User-friendly notifications for all actions

### Discount Features
- **Percentage Discounts** - Apply percentage-based discounts (e.g., 10% off)
- **Fixed Amount Discounts** - Apply fixed amount discounts (e.g., Rs. 500 off)
- **Minimum Purchase** - Set minimum purchase requirements
- **Maximum Discount Limit** - Cap maximum discount for percentage discounts
- **Usage Limits** - Control how many times a discount can be used
- **Expiration Dates** - Set expiration dates for time-limited discounts
- **Active/Inactive Status** - Enable or disable discounts as needed

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **TanStack Query (React Query)** - Server state management
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **Vite** - Fast build tool and dev server
- **Sonner** - Toast notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Development Tools
- **Concurrently** - Run multiple commands
- **Nodemon** - Auto-restart server
- **Vite** - Fast HMR development

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher) or **yarn**
- **MongoDB** (v6.0 or higher) - [Install MongoDB](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud-hosted)

---

## 🚀 Installation

### Option 1: Easy Installer (Recommended for Non-Technical Users) ⭐

1. **Download and run the installer** (`Restaurant POS Installer Setup.exe`)
2. **Follow the on-screen instructions**
3. The installer will automatically:
   - Check for Node.js (prompts to install if missing)
   - Install all dependencies
   - Create configuration file
   - Create desktop shortcut

📘 **[Complete Installer Guide →](INSTALLER_GUIDE.md)**

### Option 2: Manual Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/restaurant-pos-sri-lanka.git
cd restaurant-pos-sri-lanka
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
# For MongoDB Atlas, use:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant-pos

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API Configuration
VITE_API_URL=http://localhost:5000/api
```

**⚠️ Important:** 
- Change `JWT_SECRET` to a strong random string in production
- Never commit `.env` file to version control
- For MongoDB Atlas, replace the connection string with your cluster URL

### 4. Start MongoDB

**Local MongoDB:**
```bash
# On Windows
net start MongoDB

# On macOS (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

**Or use MongoDB Atlas** (cloud-hosted, no local installation needed)

### 5. Run the Application

**Development Mode** (runs both server and client):
```bash
npm run dev
```

**Or run separately:**

Terminal 1 - Backend Server:
```bash
npm run dev:server
```

Terminal 2 - Frontend Client:
```bash
npm run dev:client
```

### 6. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

---

## ⚙️ Configuration

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Backend server port | `5000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/restaurant-pos` | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `VITE_API_URL` | API base URL for frontend | `http://localhost:5000/api` | Yes |

### Production Build

```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview

# Start production server
npm start
```

---

## 👥 Client Setup Guide

For restaurant staff and end-users setting up the POS system with receipt printing:

📘 **[Complete Client Setup Guide →](CLIENT_SETUP_GUIDE.md)**

This guide includes:
- ✅ Step-by-step QZ Tray installation
- ✅ XP k200L printer setup (80mm thermal)
- ✅ Connection configuration
- ✅ Testing procedures
- ✅ Troubleshooting common issues
- ✅ Daily operations checklist

**Quick Start:**
1. Install QZ Tray from [qz.io/download](https://qz.io/download/)
2. Connect and install your XP k200L printer
3. Grant certificate permission when prompted
4. Start printing receipts automatically!

---

## 📖 Usage

### First Time Setup

1. **Register an Account**
   - Navigate to the registration page
   - Create your first admin account
   - Default role is `cashier`, but you can modify the database to set `role: 'admin'`

2. **Login**
   - Use your credentials to log in
   - You'll be redirected to the home page

3. **Access POS Terminal**
   - Click "POS Terminal" from the home page
   - Start taking orders!

4. **Access Admin Panel** (Admin role required)
   - Click "Admin Panel" from the home page
   - Manage menu items, view orders, and create discounts

### POS Terminal Features

- **Browse Menu**: View menu items organized by categories (Appetizers, Mains, Drinks, Desserts)
- **Add to Cart**: Click items to add them to your order
- **Modify Quantities**: Adjust item quantities in the cart
- **Apply Discounts**: Enter discount codes to apply discounts
- **Set Table Number**: Assign table numbers to orders
- **Process Orders**: Complete orders and generate receipts
- **Print KOT**: Print Kitchen Order Tickets

### Admin Panel Features

#### Menu Management
- **Add Items**: Create new menu items with name, price, category, and description
- **Edit Items**: Update existing menu items
- **Delete Items**: Remove items from the menu
- **Toggle Availability**: Mark items as available/unavailable
- **Categories**: Organize items into categories

#### Order History
- **View All Orders**: See complete order history
- **Filter by Date**: View orders for specific dates
- **Order Details**: See detailed information about each order
- **Revenue Tracking**: Monitor daily and total revenue

#### Discount Management
- **Create Discounts**: Set up new discount codes
- **Configure Rules**: Set minimum purchase, maximum discount, usage limits
- **Set Expiration**: Add expiration dates to discounts
- **Activate/Deactivate**: Enable or disable discounts
- **Track Usage**: Monitor discount usage counts

---

## 📡 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "cashier"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Menu Endpoints

#### Get All Menu Items
```http
GET /api/menu
```

#### Get Single Menu Item
```http
GET /api/menu/:id
```

#### Create Menu Item
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chicken Curry",
  "price": 850,
  "category": "Mains",
  "description": "Spicy chicken curry with rice",
  "available": true
}
```

#### Update Menu Item
```http
PUT /api/menu/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chicken Curry",
  "price": 900,
  "available": true
}
```

#### Delete Menu Item
```http
DELETE /api/menu/:id
Authorization: Bearer <token>
```

### Order Endpoints

#### Get All Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Get Single Order
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "menuItem": "menu_item_id",
      "quantity": 2,
      "price": 850
    }
  ],
  "tableNumber": "5",
  "discountCode": "SAVE10",
  "subtotal": 1700,
  "discount": 170,
  "total": 1530
}
```

#### Update Order Status
```http
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "completed"
}
```

### Discount Endpoints

#### Get All Discounts
```http
GET /api/discounts
Authorization: Bearer <token>
```

#### Get Active Discounts
```http
GET /api/discounts/active
```

#### Validate Discount Code
```http
POST /api/discounts/validate
Content-Type: application/json

{
  "code": "SAVE10",
  "subtotal": 2000
}
```

#### Create Discount
```http
POST /api/discounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "SAVE10",
  "type": "percentage",
  "value": 10,
  "minPurchase": 1000,
  "maxDiscount": 500,
  "usageLimit": 100,
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "active": true
}
```

#### Update Discount
```http
PUT /api/discounts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "active": false
}
```

#### Delete Discount
```http
DELETE /api/discounts/:id
Authorization: Bearer <token>
```

#### Use Discount (Increment Usage)
```http
POST /api/discounts/:id/use
Authorization: Bearer <token>
```

---

## 📁 Project Structure

```
restaurant-pos-sri-lanka/
├── server/                      # Backend server
│   ├── index.js                 # Express server entry point
│   ├── middleware/              # Custom middleware
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/                  # MongoDB models
│   │   ├── User.js              # User model
│   │   ├── MenuItem.js          # Menu item model
│   │   ├── Order.js             # Order model
│   │   ├── Discount.js          # Discount model
│   │   └── Counter.js           # Counter model (for auto-increment)
│   └── routes/                  # API routes
│       ├── auth.js              # Authentication routes
│       ├── menu.js              # Menu routes
│       ├── orders.js            # Order routes
│       └── discounts.js         # Discount routes
│
├── src/                         # Frontend source code
│   ├── api/                     # API client
│   │   └── client.js            # Axios/fetch configuration
│   ├── components/              # React components
│   │   ├── admin/               # Admin components
│   │   │   ├── MenuManager.jsx  # Menu management UI
│   │   │   ├── OrderHistory.jsx # Order history UI
│   │   │   └── DiscountManager.jsx # Discount management UI
│   │   ├── pos/                 # POS components
│   │   │   ├── MenuGrid.jsx     # Menu display grid
│   │   │   ├── OrderPanel.jsx   # Order cart panel
│   │   │   ├── Receipt.jsx      # Receipt component
│   │   │   └── KOTReceipt.jsx   # Kitchen Order Ticket
│   │   ├── ui/                  # Reusable UI components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   └── ...
│   │   └── ProtectedRoute.jsx   # Route protection component
│   ├── contexts/                # React contexts
│   │   ├── AuthContext.jsx      # Authentication context
│   │   └── ThemeContext.jsx     # Theme context
│   ├── pages/                   # Page components
│   │   ├── home.jsx             # Home page
│   │   ├── Login.jsx            # Login page
│   │   ├── Register.jsx         # Registration page
│   │   ├── POSTerminal.jsx      # POS terminal page
│   │   └── admin.jsx            # Admin panel page
│   ├── utils/                   # Utility functions
│   │   ├── currency.js          # Currency formatting
│   │   └── index.js             # General utilities
│   ├── lib/                     # Library utilities
│   │   └── utils.js             # Helper functions
│   ├── App.jsx                  # Main App component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
│
├── .env                         # Environment variables (not in git)
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
└── README.md                    # This file
```

---

## 🔧 Development

### Adding New Features

1. **Backend Features**
   - Add new models in `server/models/`
   - Create routes in `server/routes/`
   - Update API client in `src/api/client.js`

2. **Frontend Features**
   - Create components in `src/components/`
   - Add pages in `src/pages/`
   - Update routing in `src/App.jsx`

### Code Style Guidelines

- Use **functional components** with React hooks
- Follow **React best practices** and patterns
- Use **Tailwind CSS** for all styling
- Maintain **consistent naming conventions** (camelCase for variables, PascalCase for components)
- Write **descriptive commit messages**
- Add **comments** for complex logic

### Available Scripts

```bash
# Development
npm run dev              # Run both server and client
npm run dev:server       # Run backend server only
npm run dev:client       # Run frontend client only

# Production
npm run build           # Build frontend for production
npm run preview         # Preview production build
npm start               # Start production server
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow the existing code style
- Write clear commit messages
- Add comments for complex code
- Test your changes thoroughly
- Update documentation if needed

### Reporting Issues

If you find a bug or have a suggestion, please [open an issue](https://github.com/yourusername/restaurant-pos-sri-lanka/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support

- **Documentation**: Check this README and code comments
- **Issues**: [GitHub Issues](https://github.com/yourusername/restaurant-pos-sri-lanka/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/restaurant-pos-sri-lanka/discussions)

---

## 🙏 Acknowledgments

- Built with ❤️ for Sri Lankan restaurants
- Thanks to all the open-source libraries that made this possible
- Special thanks to the React and Express.js communities

---

<div align="center">

**Made with ❤️ for Sri Lankan Restaurants**

⭐ Star this repo if you find it helpful!

</div>
