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

const apiBaseUrl = "http://51.195.222.251:8000";

// Fix default icon issue with React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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
              shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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
    {selectedRoute && <Polyline positions={selectedRoute.coordinates} color="#c04722" />}
  </MapContainer>
));

const AnimatedSidebarContent = memo(({ spot }) => {
  const nodeRef = useRef(null);
  return (
    <SwitchTransition mode="out-in">
      <CSSTransition
        key={spot.id || spot.name}
        nodeRef={nodeRef}
        timeout={300}
        classNames="sidebar-content"
      >
        <div ref={nodeRef} className="sidebar-content">
          <div className="sidebar-slider">
            <ImageSlider images={spot.images} />
          </div>
          <h3 className="sidebar-title">{spot.name}</h3>
          <div className="sidebar-details">
            <p className="sidebar-description">{spot.description}</p>
          </div>
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
});

const RouteDropdown = ({ routes, selectedRoute, onSelect }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(prev => !prev);
  return (
    <div className="route-dropdown">
      <button className="route-dropdown-button" onClick={toggleOpen}>
        {selectedRoute ? selectedRoute.name : "Select a route"}
        <span className="dropdown-arrow">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`route-dropdown-list ${open ? 'open' : ''}`}>
        <div className="route-dropdown-item" onClick={() => { onSelect(null); setOpen(false); }}>
          None
        </div>
        {routes.map((route, index) => (
          <div
            key={route.id || index}
            className="route-dropdown-item"
            onClick={() => { onSelect(route); setOpen(false); }}
          >
            {route.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryDropdown = ({ categories, selectedCategory, onSelect }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => setOpen(prev => !prev);
  const selectedLabel = selectedCategory
    ? categories.find(cat => cat.id === selectedCategory)?.name
    : "All Categories";
  return (
    <div className="category-dropdown">
      <button className="category-dropdown-button" onClick={toggleOpen}>
        {selectedLabel}
        <span className="dropdown-arrow">{open ? '▲' : '▼'}</span>
      </button>
      <div className={`category-dropdown-list ${open ? 'open' : ''}`}>
        <div className="category-dropdown-item" onClick={() => { onSelect(null); setOpen(false); }}>
          All Categories
        </div>
        {categories.map(cat => (
          <div key={cat.id} className="category-dropdown-item" onClick={() => { onSelect(cat.id); setOpen(false); }}>
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
};

const BurgerMenu = memo(({ open, routes, selectedRoute, onRouteSelect, onCategorySelect, categories, selectedCategory }) => (
  <div className={`burger-menu ${open ? 'active' : ''}`}>
    <div className="burger-content">
      <div className="burger-section">
        <label className="burger-label">Tourist Routes</label>
        <RouteDropdown routes={routes} selectedRoute={selectedRoute} onSelect={onRouteSelect} />
      </div>
      <div className="burger-section">
        <label className="burger-label">Categories</label>
        <CategoryDropdown categories={categories} selectedCategory={selectedCategory} onSelect={onCategorySelect} />
      </div>
    </div>
  </div>
));

function App() {
  const [spots, setSpots] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const center = useMemo(() => [48.291, 25.936], []);

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

  const filteredSpots = useMemo(() => {
    if (!selectedCategory) return spots;
    return spots.filter(spot => spot.category && spot.category.id === parseInt(selectedCategory));
  }, [spots, selectedCategory]);

  const handleMarkerClick = useCallback(spot => setSelectedSpot(spot), []);
  const handleClose = useCallback(() => setSelectedSpot(null), []);
  const handleRouteSelect = useCallback(route => {
    setSelectedRoute(route);
  }, []);
  const handleCategorySelect = useCallback(catId => {
    setSelectedCategory(catId);
  }, []);
  const toggleMenu = useCallback(() => setMenuOpen(prev => !prev), []);

  return (
    <div className="app-container">
      <MapView center={center} onMarkerClick={handleMarkerClick} selectedRoute={selectedRoute} spots={filteredSpots} />
      <BurgerMenu
        open={menuOpen}
        routes={routes}
        selectedRoute={selectedRoute}
        onRouteSelect={handleRouteSelect}
        onCategorySelect={handleCategorySelect}
        categories={categories}
        selectedCategory={selectedCategory}
      />
      <button className={`burger-toggle ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
        <span className="burger-line"></span>
      </button>
      <div className={`sidebar ${selectedSpot ? 'active' : ''}`}>
        <button className="close-button" onClick={handleClose}>×</button>
        {selectedSpot && <AnimatedSidebarContent spot={selectedSpot} />}
      </div>
    </div>
  );
}

export default App;
