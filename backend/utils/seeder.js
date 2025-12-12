const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const User = require('../models/User');

dotenv.config();

const products = [
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
    description: 'Industry-leading noise cancellation optimized to you. Magnificent Sound, engineered to perfection. Crystal clear hands-free calling. Up to 30-hour battery life with quick charging (3 min charge for 3 hours of playback).',
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
    description: 'The world’s best laptop display. Brilliant Liquid Retina XDR display with Extreme Dynamic Range and incredible contrast ratio. M3 Pro chip with 11-core CPU and 14-core GPU. 18GB Unified Memory, 512GB SSD Storage.',
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
    description: 'Samsung OLED Technology: See your favorite movies, games, and more in a whole new light. LaserSlim Design: This stylized, thin TV profile creates a clean look. Neural Quantum Processor with 4K Upscaling.',
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
    description: 'A springy ride for every run, the Peg’s familiar, just-for-you feel returns to help you accomplish your goals. This version has the same responsiveness and neutral support you love but with improved comfort in those sensitive areas.',
    price: 119.99,
    originalPrice: 130.00,
    category: 'Sports',
    brand: 'Nike',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'
    ],
    stock: 210,
    rating: 4.5,
    numReviews: 5234,
    tags: ['shoes', 'running', 'fitness'],
    specifications: {
      'Size': 'Various',
      'Color': 'Red/White',
      'Material': 'Mesh',
      'Sole': 'Rubber'
    }
  },
  {
    name: 'KitchenAid Artisan Series 5 Quart Stand Mixer',
    description: 'Built to take it all on with the durable and built-to-last metal construction, and 59 touchpoints around the mixer bowl for great mixing results. 5 Quart Stainless Steel Bowl with ergonomic handle.',
    price: 349.95,
    originalPrice: 449.99,
    category: 'Home & Garden',
    brand: 'KitchenAid',
    images: [
      'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?w=800&q=80',
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80'
    ],
    stock: 55,
    rating: 4.9,
    numReviews: 12456,
    tags: ['kitchen', 'baking', 'appliance'],
    specifications: {
      'Capacity': '5 Quarts',
      'Speeds': '10',
      'Color': 'Empire Red',
      'Warranty': '1 Year'
    }
  },
  {
    name: 'Harry Potter Hardcover Boxed Set: Books 1-7',
    description: 'This collectible new boxed set contains the complete bestselling Harry Potter series, books 1-7, by J.K. Rowling, brilliantly redesigned by Caldecott Medalist Brian Selznick.',
    price: 119.99,
    originalPrice: 205.93,
    category: 'Books',
    brand: 'Scholastic',
    images: [
      'https://images.unsplash.com/photo-1608889175123-8ee362201f81?w=800&q=80'
    ],
    stock: 140,
    rating: 5.0,
    numReviews: 45892,
    tags: ['books', 'fiction', 'fantasy', 'best-seller'],
    specifications: {
      'Format': 'Hardcover',
      'Language': 'English',
      'Author': 'J.K. Rowling',
      'Pages': '4167'
    }
  },
  {
    name: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    description: 'Dyson’s most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. Intelligently optimizes suction and run time. Scientific proof of deep cleaning.',
    price: 649.99,
    originalPrice: 749.99,
    category: 'Home & Garden',
    brand: 'Dyson',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80'
    ],
    stock: 34,
    rating: 4.7,
    numReviews: 2314,
    tags: ['cleaning', 'home', 'appliance', 'cordless'],
    specifications: {
      'Runtime': '60 minutes',
      'Weight': '6.8 lbs',
      'Bin Volume': '0.2 gallons',
      'Filtration': 'HEPA'
    }
  },
  {
    name: 'LEGO Star Wars Millennium Falcon Ultimate Collector Series',
    description: 'This amazing LEGO interpretation of Corellian freighter features all the details that Star Wars fans of any age could wish for, including intricate exterior detailing, upper and lower quad laser cannons, landing legs, lowering boarding ramp and a 4-minifigure cockpit with detachable canopy.',
    price: 849.95,
    category: 'Toys',
    brand: 'LEGO',
    images: [
      'https://images.unsplash.com/photo-1542407283-c28de1c8902d?w=800&q=80'
    ],
    stock: 8,
    rating: 4.9,
    numReviews: 1245,
    tags: ['toys', 'lego', 'star-wars', 'collectible'],
    specifications: {
      'Pieces': '7541',
      'Age Range': '16+',
      'Theme': 'Star Wars',
      'Material': 'Plastic'
    }
  },
  {
    name: 'Ray-Ban Classic Aviator Sunglasses',
    description: 'Currently one of the most iconic sunglass models in the world, Ray-Ban Aviator Classic sunglasses were originally designed for U.S. Aviators in 1937. Aviator Classic sunglasses are a timeless model that combines great aviator styling with exceptional quality, performance and comfort.',
    price: 163.00,
    category: 'Beauty',
    brand: 'Ray-Ban',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80'
    ],
    stock: 200,
    rating: 4.6,
    numReviews: 5678,
    tags: ['fashion', 'accessories', 'eyewear'],
    specifications: {
      'Frame Material': 'Metal',
      'Lens Color': 'Green',
      'UV Protection': 'UV400',
      'Gender': 'Unisex'
    }
  },
  {
    name: 'Nespresso VertuoPlus Coffee and Espresso Machine',
    description: 'Nespresso coffee and espresso machine brews 4 cup sizes: 5oz and 8oz Coffee, and single and double Espresso. Precision brewing: unlocks a smooth, full bodied coffee topped with a velvety layer of foam.',
    price: 127.00,
    originalPrice: 159.00,
    category: 'Home & Garden',
    brand: 'Nespresso',
    images: [
      'https://images.unsplash.com/photo-1562059390-a761a084768e?w=800&q=80'
    ],
    stock: 76,
    rating: 4.8,
    numReviews: 8902,
    tags: ['coffee', 'kitchen', 'espresso'],
    specifications: {
      'Capacity': '60 Ounces',
      'Color': 'Grey',
      'Material': 'Plastic',
      'Power': '1350 watts'
    }
  },
  {
    name: 'Kindle Paperwhite (16 GB)',
    description: 'Now with a 6.8” display and thinner borders, adjustable warm light, up to 10 weeks of battery life, and 20% faster turns. Purpose-built for reading: with a flush-front design and 300 ppi glare-free display that reads like real paper.',
    price: 149.99,
    category: 'Electronics',
    brand: 'Amazon',
    images: [
      'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&q=80'
    ],
    stock: 432,
    rating: 4.7,
    numReviews: 76543,
    tags: ['electronics', 'reading', 'kindle'],
    specifications: {
      'Display': '6.8 inch',
      'Storage': '16 GB',
      'Waterproof': 'IPX8',
      'Connectivity': 'Wi-Fi'
    }
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing products
    await Product.deleteMany();
    console.log('🗑️  Products cleared');

    // Insert sample products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} products added successfully!`);

    console.log('\n📦 Sample Products:');
    insertedProducts.slice(0, 5).forEach(p => {
      console.log(`   - ${p.name} ($${p.price})`);
    });
    console.log(`   ... and ${insertedProducts.length - 5} more products\n`);

    console.log('🎉 Data seeding completed!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start backend: npm run dev');
    console.log('   2. Start frontend: cd ../frontend && npm start');
    console.log('   3. Visit: http://localhost:3000\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();
