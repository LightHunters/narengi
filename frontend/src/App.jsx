import React, { useState, useEffect } from 'react';
import './App.css';
import MapLibreMap from './components/MapLibreMap';
import SearchBar from './components/SearchBar';
import { searchCafes } from './services/api';

function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [places, setPlaces] = useState([]);
  
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const initialPlaces = await searchCafes('');
        if (initialPlaces && initialPlaces.length > 0) {
          setPlaces(initialPlaces);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  const handleSelectPlace = (place) => {
    setSelectedPlace(place);
    setPlaces(prev => {
      if (prev.find(p => p.id === place.id)) return prev;
      return [...prev, place];
    });
  };

  const handleResultsUpdate = (newPlaces) => {
    setPlaces(newPlaces);
  };

  return (
    <div className="app-container">
      <div className="map-container">
        <MapLibreMap
          center={{ lat: 35.6892, lng: 51.3890 }} // Tehran
          zoom={12}
          selectedPlace={selectedPlace}
          places={places}
        />
      </div>
      <div className="search-container">
        <SearchBar 
          onSelectPlace={handleSelectPlace} 
          onResultsUpdate={handleResultsUpdate}
        />
      </div>
    </div>
  );
}

export default App;
