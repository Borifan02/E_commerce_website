const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// Import Product model with correct path
const Product = require('./backend/models/Product');

const newProducts = [
  {
    name: 'AirPods Pro (2nd Generation)',
    description: 'Up to 2x more Active Noise Cancellation. Adaptive Transparency. Personalized Spatial Audio with dynamic head tracking. MagSafe Charging Case.',
    price: 249.00,
    originalPrice: 279.00,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80'
    ],
    stock: 150,
    rating: 4.8,
    numReviews: 15234,
    tags: ['earbuds', 'wireless', 'noise-cancelling'],
    specifications: {
      'Battery Life': '6 hours (30 with case)',
      'Connectivity': 'Bluetooth 5.3',
      'Water Resistance': 'IPX4',
      'Charging': 'Lightning/MagSafe'
    }
  },
  {
    name: 'PlayStation 5 Console',
    description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback, adaptive triggers and 3D Audio.',
    price: 499.99,
    category: 'Electronics',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&q=80'
    ],
    stock: 25,
    rating: 4.9,
    numReviews: 8765,
    tags: ['gaming', 'console', 'entertainment'],
    specifications: {
      'CPU': 'AMD Zen 2',
      'GPU': 'AMD RDNA 2',
      'Storage': '825GB SSD',
      'Resolution': '4K/120fps'
    }
  },
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker',
    description: '7 appliances in 1: Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, and Warmer. 6 Quart capacity.',
    price: 79.95,
    originalPrice: 99.95,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80'
    ],
    stock: 89,
    rating: 4.7,
    numReviews: 45678,
    tags: ['kitchen', 'cooking', 'pressure-cooker'],
    specifications: {
      'Capacity': '6 Quarts',
      'Functions': '7-in-1',
      'Material': 'Stainless Steel',
      'Safety': '10+ safety features'
    }
  },
  {
    name: 'Adidas Ultraboost 22 Running Shoes',
    description: 'Made with a series of recycled materials, this upper features at least 50% recycled content. BOOST midsole for incredible energy return.',
    price: 189.95,
    category: 'Sports',
    brand: 'Adidas',
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'
    ],
    stock: 180,
    rating: 4.6,
    numReviews: 3421,
    tags: ['shoes', 'running', 'sustainable'],
    specifications: {
      'Technology': 'BOOST midsole',
      'Upper': '50% recycled materials',
      'Fit': 'Regular',
      'Surface': 'Road running'
    }
  },
  {
    name: 'Canon EOS R6 Mark II Mirrorless Camera',
    description: '24.2MP Full-Frame CMOS Sensor, DIGIC X Image Processor, 4K60p Video Recording, In-Body Image Stabilization.',
    price: 2499.00,
    category: 'Electronics',
    brand: 'Canon',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=800&q=80'
    ],
    stock: 12,
    rating: 4.9,
    numReviews: 567,
    tags: ['camera', 'photography', 'professional'],
    specifications: {
      'Sensor': '24.2MP Full-Frame',
      'Video': '4K60p',
      'ISO Range': '100-102400',
      'Stabilization': '8-stop IBIS'
    }
  }
];

const addProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    const insertedProducts = await Product.insertMany(newProducts);
    console.log(`✅ ${insertedProducts.length} new products added successfully!`);

    console.log('\n📦 New Products Added:');
    insertedProducts.forEach(p => {
      console.log(`   - ${p.name} ($${p.price})`);
    });

    console.log('\n🎉 Products added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding products:', error.message);
    process.exit(1);
  }
};

addProducts();