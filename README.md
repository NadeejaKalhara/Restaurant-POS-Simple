# Restaurant POS System - Sri Lanka

A fully featured Restaurant Point of Sale (POS) system designed for Sri Lankan restaurants with LKR currency support, discount management, and modern UI with light/dark theme support.

## Features

- ✅ **MongoDB Backend** - Robust database with Mongoose ODM
- ✅ **LKR Currency** - All prices displayed in Sri Lankan Rupees (Rs.)
- ✅ **Discount System** - Percentage and fixed amount discounts with validation
- ✅ **Light/Dark Theme** - Toggle between themes with persistent storage
- ✅ **Mobile Responsive** - Fully optimized for mobile devices
- ✅ **Menu Management** - Add, edit, delete menu items with categories
- ✅ **Order Processing** - Complete order management with table numbers
- ✅ **Order History** - View and track all orders
- ✅ **Admin Panel** - Comprehensive admin interface

## Tech Stack

### Frontend
- React 18
- React Router
- TanStack Query (React Query)
- Tailwind CSS
- Framer Motion
- Vite
- Sonner (Toast notifications)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled

## Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd resturantPOS
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/restaurant-pos
VITE_API_URL=http://localhost:5000/api
```

4. **Start MongoDB**
Make sure MongoDB is running on your system. If using MongoDB Atlas, update the `MONGODB_URI` in `.env`.

5. **Run the application**
```bash
# Development mode (runs both server and client)
npm run dev

# Or run separately:
npm run dev:server  # Backend server on port 5000
npm run dev:client   # Frontend on port 3000
```

## Usage

### Accessing the Application

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see the home page with two options:
   - **POS Terminal** - For taking orders
   - **Admin Panel** - For managing menu, orders, and discounts

### POS Terminal

- Browse menu items by category
- Add items to cart
- Apply discount codes
- Set table numbers
- Process orders

### Admin Panel

#### Menu Management
- Add new menu items with name, price, category, and availability
- Edit existing items
- Delete items
- Categories: Appetizers, Mains, Drinks, Desserts

#### Order History
- View all orders sorted by date
- See order details including items, totals, and status
- Track today's orders and revenue

#### Discount Management
- Create discount codes (percentage or fixed amount)
- Set minimum purchase requirements
- Set maximum discount limits (for percentage discounts)
- Set usage limits
- Set expiration dates
- Activate/deactivate discounts

## API Endpoints

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PATCH /api/orders/:id/status` - Update order status

### Discounts
- `GET /api/discounts` - Get all discounts
- `GET /api/discounts/active` - Get active discounts
- `POST /api/discounts/validate` - Validate discount code
- `POST /api/discounts` - Create discount
- `PUT /api/discounts/:id` - Update discount
- `DELETE /api/discounts/:id` - Delete discount
- `POST /api/discounts/:id/use` - Increment usage count

## Project Structure

```
resturantPOS/
├── server/
│   ├── index.js           # Express server
│   ├── models/            # MongoDB models
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Discount.js
│   └── routes/           # API routes
│       ├── menu.js
│       ├── orders.js
│       └── discounts.js
├── src/
│   ├── api/
│   │   └── client.js     # API client
│   ├── components/
│   │   ├── admin/        # Admin components
│   │   ├── pos/          # POS components
│   │   └── ui/           # UI components
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   ├── pages/            # Page components
│   ├── utils/            # Utility functions
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

## Features in Detail

### Discount System
- **Percentage Discounts**: Apply a percentage off (e.g., 10% off)
- **Fixed Amount Discounts**: Apply a fixed amount off (e.g., Rs. 500 off)
- **Minimum Purchase**: Require minimum purchase amount
- **Maximum Discount**: Limit maximum discount for percentage discounts
- **Usage Limits**: Set how many times a discount can be used
- **Expiration**: Set expiration dates for discounts

### Theme System
- Light and dark themes
- Theme preference saved in localStorage
- Smooth transitions between themes
- Accessible color contrasts

### Mobile Responsiveness
- Responsive grid layouts
- Touch-friendly buttons
- Optimized for small screens
- Horizontal scrolling for tables on mobile

## Development

### Adding New Features

1. **Backend**: Add routes in `server/routes/` and models in `server/models/`
2. **Frontend**: Add components in `src/components/` and pages in `src/pages/`
3. **API Client**: Update `src/api/client.js` with new endpoints

### Code Style

- Use functional components with hooks
- Follow React best practices
- Use Tailwind CSS for styling
- Maintain consistent naming conventions

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue on the repository.

