import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import './App.css';
import L from 'leaflet';
import ImageSlider from './ImageSlider';

const apiBaseUrl = "http://51.195.222.251:8000"; // update if necessary

// Fix default icon issue with React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// MapView component – uses custom icon based on category.
const MapView = memo(({ center, onMarkerClick, selectedRoute, spots }) => (
  <MapContainer center={center} zoom={13} minZoom={12} style={{ height: '100%', width: '100%' }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
    <MarkerClusterGroup>
      {spots.map((spot, index) => {
        const customIcon = spot.category && spot.category.icon_url
          ? L.icon({
              iconUrl: spot.category.icon_url,
              iconSize: [30, 30],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30],
            })
          : L.icon({
              iconUrl: require('leaflet/dist/images/marker-icon.png'),
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              shadowUrl: require('leaflet/dist/images/marker-shadow.png')
            });
        return (
          <Marker
            key={spot.id || index}
            position={[spot.lat, spot.lng]}
            icon={customIcon}
            eventHandlers={{ click: () => onMarkerClick(spot) }}
          />
        );
      })}
    </MarkerClusterGroup>
    {selectedRoute && <Polyline positions={selectedRoute.coordinates} color="blue" />}
  </MapContainer>
));

// AnimatedSidebarContent – uses ImageSlider and displays spot details.
const AnimatedSidebarContent = memo(({ spot }) => {
  const nodeRef = useRef(null);
  return (
    <SwitchTransition mode="out-in">
      <CSSTransition key={spot.id || spot.name} nodeRef={nodeRef} timeout={300} classNames="sidebar-content">
        <div ref={nodeRef} className="sidebar-content">
          <ImageSlider images={spot.images} />
          <h3 className="sidebar-title">{spot.name}</h3>
          <p className="sidebar-description">{spot.description}</p>
          <p className="sidebar-category">Category: {spot.category ? spot.category.name : 'None'}</p>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
});

// RouteSelector remains unchanged.
const RouteSelector = memo(({ routes, onChange }) => (
  <div className="route-selector">
    <select onChange={onChange} defaultValue="">
      <option value="">Select a tourist route</option>
      {routes.map((route, index) => (
        <option key={route.id || index} value={route.name}>
          {route.name}
        </option>
      ))}
    </select>
  </div>
));

// CategoryFilter lets users choose a category.
const CategoryFilter = memo(({ categories, onChange }) => (
  <div className="category-filter">
    <select onChange={onChange} defaultValue="">
      <option value="">All Categories</option>
      {categories.map(cat => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  </div>
));

function App() {
  const [spots, setSpots] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const sidebarRef = useRef(null);
  const center = useMemo(() => [48.291, 25.936], []);

  // Fetch spots, routes, and categories from Django API.
  useEffect(() => {
    fetch(`${apiBaseUrl}/api/spots/`)
      .then(res => res.json())
      .then(data => setSpots(data))
      .catch(err => console.error('Error fetching spots:', err));
  }, []);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/routes/`)
      .then(res => res.json())
      .then(data => setRoutes(data))
      .catch(err => console.error('Error fetching routes:', err));
  }, []);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/categories/`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error fetching categories:', err));
  }, []);

  // Filter spots based on selected category.
  const filteredSpots = useMemo(() => {
    if (!selectedCategory) return spots;
    return spots.filter(spot => spot.category && spot.category.id === parseInt(selectedCategory));
  }, [spots, selectedCategory]);

  const handleMarkerClick = useCallback(spot => setSelectedSpot(spot), []);
  const handleClose = useCallback(() => setSelectedSpot(null), []);
  const handleRouteChange = useCallback(e => {
    const routeName = e.target.value;
    const route = routes.find(r => r.name === routeName);
    setSelectedRoute(route || null);
  }, [routes]);
  const handleCategoryChange = useCallback(e => {
    setSelectedCategory(e.target.value);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      <MapView center={center} onMarkerClick={handleMarkerClick} selectedRoute={selectedRoute} spots={filteredSpots} />
      <RouteSelector routes={routes} onChange={handleRouteChange} />
      <CategoryFilter categories={categories} onChange={handleCategoryChange} />
      <div ref={sidebarRef} className={`sidebar ${selectedSpot ? 'active' : ''}`}>
        <button className="close-button" onClick={handleClose}>×</button>
        {selectedSpot && <AnimatedSidebarContent spot={selectedSpot} />}
      </div>
    </div>
  );
}

export default App;
