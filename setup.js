const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up E-commerce MERN Stack Application...\n');

// Create necessary directories
const directories = [
  'backend/uploads',
  'frontend/public',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/store',
  'frontend/src/utils'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Create .env file for backend if it doesn't exist
const envPath = 'backend/.env';
if (!fs.existsSync(envPath)) {
  const envContent = `NODE_ENV=development
PORT=5000
MONGODB_URI="mongodb+srv://dabasaborifan_db_user:Avjqz1lwZWukQnYH@cluster0.waerydc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
JWT_SECRET=JWT_SECRET=mysupersecretkey123456789

JWT_EXPIRE=30d
STRIPE_SECRET_KEY=your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created backend/.env file');
}

console.log('\n📋 Setup Instructions:');
console.log('1. Install backend dependencies: cd backend && npm install');
console.log('2. Install frontend dependencies: cd frontend && npm install');
console.log('3. Set up MongoDB (local or MongoDB Atlas)');
console.log('4. Update backend/.env with your configuration');
console.log('5. Start the development servers: npm run dev');
console.log('\n🎉 Setup complete! Happy coding!');
