const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cafe = require('../models/Cafe');
const cafes = require('./cafes.json');

dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      // Fallback for local dev if not in .env yet, though .env should be present
      console.log('MONGODB_URI not found in env, assuming mongodb://localhost:27017/cafisearch');
    }
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cafisearch';
    
    await mongoose.connect(uri);
    console.log('MongoDB connected');

    await Cafe.deleteMany({});
    console.log('Cleared existing cafes');

    await Cafe.insertMany(cafes);
    console.log(`Seeded ${cafes.length} cafes`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
