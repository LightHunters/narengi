import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';
import { searchCafes } from '../services/api';
import './SearchBar.css';

const SearchBar = ({ onSelectPlace, onResultsUpdate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  // Create a debounced search function
  const debouncedSearch = useRef(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setResults([]);
        onResultsUpdate([]);
        setLoading(false);
        return;
      }

      try {
        const data = await searchCafes(searchQuery);
        setResults(data);
        onResultsUpdate(data);
      } catch (error) {
        console.error("Search failed", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setLoading(true);
    debouncedSearch(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        // Select first if none selected but enter pressed? Or just do nothing?
        // Let's select the first one for convenience if user just typed and hit enter
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setResults([]);
    }
  };

  const handleSelect = (place) => {
    setQuery(place.name); 
    // For RTL languages like Persian, we might want to ensure the input text direction is correct,
    // though browser usually handles it.
    
    onSelectPlace(place);
    setResults([]); 
  };

  return (
    <div className="search-bar-wrapper" dir="rtl">
      <div className="input-container">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="جستجوی کافه در تهران..."
          className="search-input"
          style={{ fontFamily: 'Vazir, Tahoma, sans-serif' }}
        />
        {loading && <div className="spinner" style={{ left: '12px', right: 'auto' }}></div>}
      </div>
      
      {results.length > 0 && (
        <ul className="results-list">
          {results.slice(0, 6).map((place, index) => (
            <li
              key={place.id}
              className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(place)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="place-name" style={{ fontFamily: 'Vazir, sans-serif' }}>{place.name}</div>
              <div className="place-address" style={{ fontFamily: 'Vazir, sans-serif' }}>{place.address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
