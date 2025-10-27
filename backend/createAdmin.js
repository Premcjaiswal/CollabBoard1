const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

const createDefaultAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://CollabBoard:Prem2005@cluster0.cxgvpwf.mongodb.net/', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@collabboard.com' });
    
    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Create default admin
    const admin = new Admin({
      name: 'Admin',
      email: 'admin@collabboard.com',
      password: 'admin123', // This will be hashed by the pre-save hook
      role: 'admin'
    });

    await admin.save();

    console.log('✅ Default admin created successfully!');
    console.log('Email: admin@collabboard.com');
    console.log('Password: admin123');
    console.log('⚠️  PLEASE CHANGE THE PASSWORD AFTER FIRST LOGIN!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();







