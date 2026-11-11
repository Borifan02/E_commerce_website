const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const logger = require('./logger');

const defaultProducts = [
  {
    name: 'Apple iPhone 15 Pro Max (256GB) - Natural Titanium',
    description: 'Forged in titanium and featuring the groundbreaking A17 Pro chip, a customizable Action button, and a more versatile Pro camera system. 6.7-inch Super Retina XDR display with ProMotion, Always-On, and Dynamic Island.',
    price: 1199.00,
    originalPrice: 1299.00,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80',
      'https://images.unsplash.com/photo-1695048133082-1a20484d2569?w=800&q=80',
      'https://images.unsplash.com/photo-1696446702305-f7166e5f1fde?w=800&q=80'
    ],
    stock: 45,
    rating: 4.8,
    numReviews: 2523,
    tags: ['smartphone', '5g', 'apple', 'premium'],
    specifications: {
      'Display': '6.7-inch Super Retina XDR',
      'Processor': 'A17 Pro chip',
      'Camera': '48MP Main | Ultra Wide | Telephoto',
      'Battery': 'Up to 29 hours video playback'
    }
  },
  {
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    description: 'Industry-leading noise cancellation optimized to you. Magnificent Sound, engineered to perfection. Crystal clear hands-free calling. Up to 30-hour battery life with quick charging.',
    price: 348.00,
    originalPrice: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    images: [
      'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
      'https://images.unsplash.com/photo-1596562080352-70678d234eb0?w=800&q=80'
    ],
    stock: 120,
    rating: 4.7,
    numReviews: 8392,
    tags: ['headphones', 'audio', 'wireless', 'noise-cancelling'],
    specifications: {
      'Battery Life': '30 hours',
      'Weight': '250g',
      'Bluetooth': '5.2',
      'Color': 'Black'
    }
  },
  {
    name: 'MacBook Pro 14" Laptop - M3 Pro Chip',
    description: 'The world’s best laptop display. Brilliant Liquid Retina XDR display with Extreme Dynamic Range. M3 Pro chip with 11-core CPU and 14-core GPU. 18GB Unified Memory, 512GB SSD Storage.',
    price: 1849.00,
    originalPrice: 1999.00,
    category: 'Electronics',
    brand: 'Apple',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80'
    ],
    stock: 15,
    rating: 4.9,
    numReviews: 445,
    tags: ['laptop', 'macbook', 'professional', 'apple'],
    specifications: {
      'Screen Size': '14.2 inches',
      'RAM': '18GB',
      'Storage': '512GB SSD',
      'Processor': 'Apple M3 Pro'
    }
  },
  {
    name: 'Samsung 65-Inch Class OLED 4K S90C Series TV',
    description: 'Samsung OLED Technology: See your favorite movies, games, and more in a whole new light. LaserSlim Design. Neural Quantum Processor with 4K Upscaling.',
    price: 1597.99,
    originalPrice: 2099.99,
    category: 'Electronics',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1593784653277-2e65928d44f8?w=800&q=80',
      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80'
    ],
    stock: 22,
    rating: 4.6,
    numReviews: 1278,
    tags: ['tv', '4k', 'oled', 'smart-tv'],
    specifications: {
      'Screen Size': '65 Inches',
      'Refresh Rate': '120Hz',
      'Resolution': '4K',
      'Technology': 'OLED'
    }
  },
  {
    name: 'Nike Air Zoom Pegasus 40 Running Shoes',
    description: 'A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals. This milestone version has the same responsiveness you love.',
    price: 129.99,
    originalPrice: 140.00,
    category: 'Clothing',
    brand: 'Nike',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80'
    ],
    stock: 75,
    rating: 4.5,
    numReviews: 3120,
    tags: ['shoes', 'running', 'nike', 'sportswear'],
    specifications: {
      'Activity': 'Running',
      'Closure': 'Lace-Up',
      'Surface': 'Road'
    }
  },
  {
    name: 'Samsung Galaxy S24 Ultra (512GB) - Titanium Gray',
    description: 'Meet Galaxy S24 Ultra with Galaxy AI. Live Translate, Circle to Search with Google, Note Assist, and photo editing with Generative Edit. 200MP camera system.',
    price: 1299.99,
    originalPrice: 1419.99,
    category: 'Electronics',
    brand: 'Samsung',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80'
    ],
    stock: 35,
    rating: 4.8,
    numReviews: 1890,
    tags: ['smartphone', 'samsung', '5g', 'ai'],
    specifications: {
      'Display': '6.8-inch Dynamic AMOLED 2X',
      'Processor': 'Snapdragon 8 Gen 3',
      'Camera': '200MP Main',
      'Battery': '5000mAh'
    }
  },
  {
    name: 'Logitech MX Master 3S Wireless Performance Mouse',
    description: 'An icon remastered. Feel every moment of your workflow with even more precision, tactility, and performance, thanks to Quiet Clicks and an 8,000 DPI track-on-glass sensor.',
    price: 99.99,
    originalPrice: 109.99,
    category: 'Electronics',
    brand: 'Logitech',
    images: [
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80'
    ],
    stock: 140,
    rating: 4.8,
    numReviews: 6540,
    tags: ['mouse', 'wireless', 'logitech', 'productivity'],
    specifications: {
      'Sensor': '8,000 DPI',
      'Battery': 'Up to 70 days',
      'Connection': 'Bluetooth & Logi Bolt'
    }
  },
  {
    name: 'Instant Pot Duo 7-in-1 Electric Pressure Cooker (6 Qt)',
    description: '7-in-1 functionality: Pressure cook, slow cook, rice cooker, yogurt maker, steamer, sauté pan and food warmer. 13 customizable Smart Programs for quick one-touch meals.',
    price: 79.95,
    originalPrice: 99.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    images: [
      'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&q=80'
    ],
    stock: 60,
    rating: 4.7,
    numReviews: 45000,
    tags: ['kitchen', 'appliance', 'cooking'],
    specifications: {
      'Capacity': '6 Quarts',
      'Material': 'Stainless Steel',
      'Power': '1000 Watts'
    }
  }
];

const defaultCoupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountAmount: 10,
    minOrderAmount: 20,
    maxDiscount: 50,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'SUPER20',
    discountType: 'percentage',
    discountAmount: 20,
    minOrderAmount: 100,
    maxDiscount: 100,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FLAT15',
    discountType: 'fixed',
    discountAmount: 15,
    minOrderAmount: 50,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

/**
 * Auto-bootstrap database on startup:
 * 1. Guarantees admin user exists (admin@ecommerce.com / admin123456)
 * 2. Promotes user's personal email to admin if present
 * 3. Populates product catalog if empty
 * 4. Populates coupons if empty
 */
exports.bootstrapDatabase = async () => {
  try {
    // 1. Ensure Admin User exists
    let admin = await User.findOne({ email: 'admin@ecommerce.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@ecommerce.com',
        password: 'admin123456',
        role: 'admin',
        isEmailVerified: true,
      });
      logger.info('✅ Auto-Bootstrap: Default admin created (admin@ecommerce.com / admin123456)');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      await admin.save();
    }

    // Also support admin@example.com (common legacy demo login)
    let legacyAdmin = await User.findOne({ email: 'admin@example.com' });
    if (!legacyAdmin) {
      await User.create({
        name: 'Demo Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        isEmailVerified: true,
      });
      logger.info('✅ Auto-Bootstrap: Legacy demo admin created (admin@example.com / admin123)');
    } else if (legacyAdmin.role !== 'admin') {
      legacyAdmin.role = 'admin';
      await legacyAdmin.save();
    }

    // Promote developer's account if it exists
    const devUser = await User.findOne({ email: 'dabasaborifan@gmail.com' });
    if (devUser && devUser.role !== 'admin') {
      devUser.role = 'admin';
      await devUser.save();
      logger.info('✅ Auto-Bootstrap: Promoted dabasaborifan@gmail.com to Admin');
    }

    // 2. Ensure Products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(defaultProducts);
      logger.info(`✅ Auto-Bootstrap: Seeded ${defaultProducts.length} initial catalog products`);
    }

    // 3. Ensure Coupons exist
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.insertMany(defaultCoupons);
      logger.info(`✅ Auto-Bootstrap: Seeded ${defaultCoupons.length} promotional coupons`);
    }
  } catch (error) {
    logger.error('Database bootstrap error:', error.message);
  }
};
