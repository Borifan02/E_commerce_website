# 🛒 Professional E-Commerce Platform - MERN Stack

A full-featured, production-ready e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This project showcases modern web development practices, scalable architecture, and professional-grade features suitable for portfolio presentation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 🌟 Key Features

### Customer Features
- 🔐 **Secure Authentication** - JWT-based authentication with password reset
- 🛍️ **Product Catalog** - Advanced filtering, sorting, and search functionality
- 🛒 **Shopping Cart** - Persistent cart with real-time updates
- ❤️ **Wishlist** - Save favorite products for later
- ⭐ **Product Reviews** - Rate and review purchased products
- 💳 **Payment Integration** - Stripe payment processing
- 📦 **Order Tracking** - Real-time order status updates
- 👤 **User Profile** - Manage personal information and addresses
- 📧 **Email Notifications** - Order confirmations and updates

### Admin Features
- 📊 **Analytics Dashboard** - Sales metrics, revenue tracking, and insights
- 📦 **Order Management** - Process and track all orders
- 🏷️ **Product Management** - CRUD operations for products
- 👥 **User Management** - View and manage customer accounts
- 📈 **Sales Reports** - Detailed sales analytics and reports

### Technical Features
- 🔒 **Security** - Helmet.js, rate limiting, data sanitization
- 📝 **Logging** - Winston logger for error tracking
- 🐳 **Docker Support** - Containerized deployment
- 🚀 **Performance** - Optimized queries and caching
- 📱 **Responsive Design** - Mobile-first approach with Material-UI
- 🎨 **Modern UI/UX** - Clean, intuitive interface
- 🔄 **State Management** - Redux Toolkit for predictable state
- ✅ **Input Validation** - Express-validator for API security

## 🏗️ Architecture

```
E-commerce-Platform/
├── backend/
│   ├── config/          # Configuration files
│   ├── controllers/     # Business logic
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── store/       # Redux store
│       └── App.js       # Main component
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v7.0 or higher)
- npm or yarn
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd E_commerce_website
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Configuration**

   Create `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   CLIENT_URL=http://localhost:3000
   ```

4. **Seed Database (Optional)**
   ```bash
   cd backend
   npm run seed
   ```

5. **Start Development Servers**

   Terminal 1 - Backend:
   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: localhost:27017

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| PUT | `/api/auth/reset-password/:token` | Reset password | No |

### Product Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get single product | No |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| POST | `/api/products/:id/reviews` | Add review | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/orders` | Create order | Yes |
| GET | `/api/orders` | Get user orders | Yes |
| GET | `/api/orders/:id` | Get order details | Yes |
| PUT | `/api/orders/:id/pay` | Update to paid | Yes |
| PUT | `/api/orders/:id/cancel` | Cancel order | Yes |
| GET | `/api/orders/admin/all` | Get all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |

### Wishlist Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/wishlist` | Get wishlist | Yes |
| POST | `/api/wishlist/:productId` | Add to wishlist | Yes |
| DELETE | `/api/wishlist/:productId` | Remove from wishlist | Yes |

### Analytics Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/dashboard` | Get dashboard data | Admin |
| GET | `/api/analytics/sales` | Get sales report | Admin |

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - UI library
- **Redux Toolkit** - State management
- **Material-UI** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Stripe.js** - Payment processing
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Stripe** - Payment gateway
- **Nodemailer** - Email service
- **Winston** - Logging
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Helmet.js for security headers
- MongoDB injection prevention
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Performance Optimizations

- Database indexing for faster queries
- Image optimization
- Lazy loading components
- API response caching
- Pagination for large datasets
- Optimized MongoDB queries
- Static asset caching

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 📈 Future Enhancements

- [ ] Multi-language support (i18n)
- [ ] Advanced analytics with charts
- [ ] Product recommendations
- [ ] Social media integration
- [ ] Live chat support
- [ ] Progressive Web App (PWA)
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Inventory management
- [ ] Coupon/discount system

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Borifan Dabasa**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- LinkedIn: [your-linkedin](https://linkedin.com/in/your-profile)
- GitHub: [Borifan02](https://github.com/Borifan02)

## 🙏 Acknowledgments

- Material-UI for the component library
- Stripe for payment processing
- MongoDB for the database
- All open-source contributors

## 📞 Support

For support, email dabasaborifan@gmail.com or open an issue in the repository.

---

⭐ If you found this project helpful, please give it a star!
