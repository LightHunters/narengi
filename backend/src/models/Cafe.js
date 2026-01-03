const mongoose = require('mongoose');

const CafeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  rating: { type: Number, default: 0 },
  place_id: { type: String, unique: true },
  category: String,
  phone: String,
  website: String,
  thumbnail: String,
  images: [String],
  open_hours: Object // Store as object or string depending on CSV format
});

module.exports = mongoose.model('Cafe', CafeSchema);
