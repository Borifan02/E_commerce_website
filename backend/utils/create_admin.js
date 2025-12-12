const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        const adminEmail = 'admin@example.com';
        const adminPassword = 'password123';

        // Check if admin exists
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('⚠️  Admin user already exists');
            console.log(`   Email: ${adminEmail}`);
            // In a real scenario we wouldn't print the password if we didn't set it just now, 
            // but here we assume it's the test password or we can't retrieve it.
            // We'll just update it to be sure.
            userExists.password = adminPassword;
            userExists.role = 'admin';
            await userExists.save();
            console.log('   Password reset to default: password123');
        } else {
            const user = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: adminPassword,
                role: 'admin'
            });
            console.log('🎉 Admin user created successfully!');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
