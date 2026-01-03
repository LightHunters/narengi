import React, { useEffect, useRef, useState } from 'react';
// maplibregl is loaded via CDN in index.html

const MapLibreMap = ({ center, zoom, selectedPlace, places }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [loaded, setLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (map.current) return;
    
    // Access maplibregl from window
    const maplibregl = window.maplibregl;
    if (!maplibregl) {
      console.error('MapLibre GL JS not loaded');
      return;
    }

    // Use a Raster style for OSM/Carto within MapLibre
    // This gives us the GL engine performance but with raster tiles
    const style = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            // CartoDB Dark Matter - Perfect for dark mode
            'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: style,
      center: [center.lng, center.lat], // MapLibre uses [lng, lat]
      zoom: zoom,
      pitch: 0, // Start with top-down
      bearing: 0
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-left');
    map.current.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'top-left'
    );

    map.current.on('load', () => {
      setLoaded(true);
    });

  }, [center.lng, center.lat, zoom]);

  // Fit bounds when places change
  useEffect(() => {
    if (!map.current || !loaded || places.length === 0 || selectedPlace) return;

    const maplibregl = window.maplibregl;
    const bounds = new maplibregl.LngLatBounds();
    let hasValidCoords = false;

    places.forEach(p => {
        if (p.lng && p.lat) {
            bounds.extend([p.lng, p.lat]);
            hasValidCoords = true;
        }
    });

    if (hasValidCoords) {
        map.current.fitBounds(bounds, { padding: 50, maxZoom: 16 });
    }
  }, [places, loaded, selectedPlace]);

  // Handle Markers
  useEffect(() => {
    if (!map.current || !loaded) return;

    const maplibregl = window.maplibregl;
    if (!maplibregl) return;

    // Remove old markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    places.forEach(place => {
      // Create custom element for marker if needed, or default
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundImage = 'url(https://upload.wikimedia.org/wikipedia/commons/8/88/Map_marker.svg)'; // Simple fallback
      el.style.backgroundSize = 'contain';
      el.style.cursor = 'pointer';

      // Popup Content
      const imagesHtml = place.images && place.images.length > 0 
        ? `<div style="display: flex; gap: 5px; overflow-x: auto; margin-bottom: 8px; padding-bottom: 5px;">
             ${place.images.slice(0, 3).map(img => `<img src="${img}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />`).join('')}
           </div>`
        : '';

      const popupHTML = `
        <div class="popup-content" style="text-align: right; direction: rtl; color: #333;">
          ${imagesHtml}
          <h3 style="margin: 0 0 5px 0; font-family: 'Vazir', sans-serif; font-size: 1.1em;">${place.name}</h3>
          <p style="margin: 0 0 8px 0; font-size: 0.9em; color: #666;">${place.address}</p>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
             <span style="background: #eee; padding: 2px 6px; border-radius: 4px; font-size: 0.85em;">⭐ ${place.rating || 'N/A'}</span>
             ${place.category ? `<span style="font-size: 0.85em; color: #888;">${place.category}</span>` : ''}
          </div>

          ${place.phone ? `<div style="margin: 4px 0; font-size: 0.9em;">📞 <a href="tel:${place.phone}" style="color: #007bff; text-decoration: none;">${place.phone}</a></div>` : ''}
          ${place.website ? `<div style="margin: 4px 0; font-size: 0.9em;">🌐 <a href="${place.website}" target="_blank" style="color: #007bff; text-decoration: none;">وب‌سایت</a></div>` : ''}
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(popupHTML);

      const marker = new maplibregl.Marker({ color: '#e74c3c' }) // Use default red marker
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map.current);
      
      markersRef.current[place.id] = marker;
    });
  }, [places, loaded]);

  // Handle FlyTo / Cinematic Effect
  useEffect(() => {
    if (!map.current || !selectedPlace) return;

    const target = [selectedPlace.lng, selectedPlace.lat];
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      map.current.jumpTo({ center: target, zoom: 16 });
    } else {
      map.current.flyTo({
        center: target,
        zoom: 17,
        pitch: 45, // Tilt for 3D effect
        bearing: 0, // Optional: rotate?
        speed: 1.2,
        curve: 1.42,
        essential: true
      });
    }

    // Open popup after fly animation
    const marker = markersRef.current[selectedPlace.id];
    if (marker) {
      setTimeout(() => {
        marker.togglePopup();
      }, 1500);
    }

  }, [selectedPlace]);

  return <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />;
};

export default MapLibreMap;
