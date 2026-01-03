const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const Cafe = require('../models/Cafe');
const cafesData = require('../seed/cafes.json');
let importedCafes = [];
try {
  importedCafes = require('../seed/imported_cafes.json');
} catch (e) {
  // console.log('No imported cafes found');
}

const router = express.Router();

router.get('/', async (req, res) => {
  const { query } = req.query;
  const useGoogle = process.env.USE_GOOGLE_PLACES === 'true';
  const useOSM = process.env.USE_OSM === 'true';

  // Allow empty query to return initial data (imported cafes)
  if (!query) {
    if (importedCafes.length > 0) {
        return res.json({ results: importedCafes.slice(0, 50) });
    }
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // 1. Search in Imported Data (High Priority)
    const lowerQuery = query.toLowerCase();
    const localResults = importedCafes.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) || 
        c.address.toLowerCase().includes(lowerQuery) ||
        (c.category && c.category.toLowerCase().includes(lowerQuery))
    ).slice(0, 20);

    if (localResults.length > 0) {
        return res.json({ results: localResults });
    }

    if (useGoogle) {
      // ... Google Logic ...
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        return res.status(500).json({ error: 'Google Maps API Key not configured' });
      }

      let searchQuery = query;
      if (!searchQuery.toLowerCase().includes('tehran')) {
        searchQuery += ' in Tehran';
      }

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/textsearch/json`,
        {
          params: {
            query: searchQuery,
            key: process.env.GOOGLE_MAPS_API_KEY,
            location: '35.6892,51.3890',
            radius: 50000 
          }
        }
      );

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error('Google API Error:', response.data);
        return res.status(502).json({ error: 'Error fetching from Google Places' });
      }

      const results = response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        rating: place.rating || 0,
        place_id: place.place_id
      }));

      return res.json({ results });

    } else if (useOSM) {
      // OpenStreetMap (Nominatim) Search
      // Note: Nominatim usage policy requires a valid User-Agent
      const searchQuery = query.toLowerCase().includes('tehran') ? query : `${query} in Tehran`;
      
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchQuery,
          format: 'json',
          addressdetails: 1,
          limit: 10,
          viewbox: '51.0,35.5,51.7,35.9', // Rough bounding box for Tehran
          bounded: 1,
          'accept-language': 'fa' // Prioritize Persian results
        },
        headers: {
          'User-Agent': 'CafiSearch-App/1.0'
        }
      });

      const results = response.data.map(place => ({
        id: place.place_id.toString(),
        name: place.name || place.display_name.split(',')[0],
        address: place.display_name,
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        rating: 4.5, // Mock rating as OSM doesn't provide ratings standardly
        place_id: place.place_id.toString()
      }));

      return res.json({ results });

    } else {
      // Offline/Seed mode
      // Check if MongoDB is connected
      if (mongoose.connection.readyState === 1) {
        try {
          const regex = new RegExp(query, 'i');
          const cafes = await Cafe.find({
            $or: [
              { name: regex },
              { address: regex }
            ]
          }).limit(10);
    
          const results = cafes.map(cafe => ({
            id: cafe._id,
            name: cafe.name,
            address: cafe.address,
            lat: cafe.lat,
            lng: cafe.lng,
            rating: cafe.rating,
            place_id: cafe.place_id
          }));
          return res.json({ results });
        } catch (dbError) {
          console.error('Database Query Error, falling back to JSON:', dbError);
          // Fallback to JSON below
        }
      }
      
      // Fallback: Filter in-memory JSON
      const lowerQuery = query.toLowerCase();
      const filtered = cafesData.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) || 
        c.address.toLowerCase().includes(lowerQuery)
      ).slice(0, 10);

      return res.json({ results: filtered });
    }
  } catch (error) {
    console.error('Search Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
