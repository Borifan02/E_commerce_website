# E-commerce MERN Stack Application

A full-stack e-commerce website built with MongoDB, Express.js, React.js, and Node.js.

## Features

- 🛍️ Product catalog with search and filtering
- 👤 User authentication and authorization
- 🛒 Shopping cart functionality
- 💳 Payment processing with Stripe
- 📱 Responsive design
- 🔐 Admin dashboard for product management
- 📦 Order management system

## Tech Stack

- **Frontend**: React.js, Redux Toolkit, Material-UI, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Payment**: Stripe
- **File Upload**: Multer

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Stripe account (for payments)

### Quick Setup

1. Clone the repository
2. Run the setup script:
   ```bash
   node setup.js
   ```

3. Install dependencies:
   ```bash
   npm run install-all
   ```

4. Set up environment variables:
   - Update `backend/.env` with your configuration
   - Set your MongoDB connection string
   - Add your JWT secret key
   - Configure Stripe keys (optional for development)
   - Copy `frontend/env.example` to `frontend/.env` and add your Stripe publishable key

5. Start the development servers:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Manual Setup

If you prefer to set up manually:

1. Install backend dependencies:
   ```bash
   cd backend && npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend && npm install
   ```

3. Create `backend/.env` file with your configuration
4. Start MongoDB service
5. Run `npm run dev` from the root directory

## Project Structure

```
ecommerce-mern/
├── backend/          # Express.js server
│   ├── controllers/  # Route controllers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Custom middleware
│   └── utils/        # Utility functions
├── frontend/         # React.js client
│   ├── public/       # Static files
│   ├── src/          # Source code
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── store/       # Redux store
│   │   └── utils/       # Utility functions
└── package.json      # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
