import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// ✅ Fix icônes Leaflet (obligatoire dans React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ✅ Icônes par type (identiques à ton code Google Maps)
const typeIcons = { pharmacie: '💊', clinique: '🏥', hopital: '🏨' };

// ✅ Composant pour mettre à jour le centre/zoom dynamiquement
function MapUpdater({ center, zoom }) {
  const map = useMap();
  if (center) {
    map.setView([center.lat, center.lng], zoom !== undefined ? zoom : map.getZoom());
  }
  return null;
}

export default function Map({ filteredEtablissements, openDetail, userLocation, mapCenter, zoom }) {
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // ✅ Style identique à ton GoogleMap containerStyle
  const containerStyle = useMemo(() => ({
    width: '100%',
    height: '500px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
  }), []);

  const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };
  const DEFAULT_ZOOM = 6;

  // ✅ Options de carte (équivalentes à Google Maps)
  const mapOptions = useMemo(() => ({
    zoomControl: true,
    attributionControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    dragging: true
  }), []);

  return (
    <section className="py-4" style={{ background: "#fff" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0">
            <i className="bi bi-map-fill text-primary me-2" />Carte Interactive
          </h3>
          <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
            <i className="bi bi-geo-alt-fill text-danger me-1" />Maroc — {filteredEtablissements?.length || 0} résultats
          </span>
        </div>
    
        {/* ✅ Conteneur avec le MÊME style que GoogleMap */}
        <div style={containerStyle}>
          <MapContainer 
            center={[ (mapCenter || DEFAULT_CENTER).lat, (mapCenter || DEFAULT_CENTER).lng ]}
            zoom={zoom !== undefined ? zoom : DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%', borderRadius: '16px', zIndex: 1 }}
            {...mapOptions}
          >
            <MapUpdater center={mapCenter} zoom={zoom} />
            
            {/* ✅ Tuiles OpenStreetMap (gratuit, sans clé API) */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* ✅ Marqueur position utilisateur (MÊME style que Google Maps) */}
            {userLocation && (
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                title="Votre position"
                icon={L.divIcon({
                  className: 'custom-user-marker',
                  html: `<div style="
                    width: 32px; height: 32px; 
                    background: #0EA5E9; 
                    border: 3px solid #fff; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                  "></div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 16]
                })}
              />
            )}

            {/* ✅ Marqueurs établissements (MÊME rendu que Google Maps) */}
            {filteredEtablissements?.map((etab) => {
              const isHovered = hoveredMarker === etab.id;
              const isSelected = selectedMarker?.id === etab.id;
              
              return (
                <Marker
                  key={etab.id}
                  position={[etab.latitude, etab.longitude]}
                  // ✅ Label avec icône type (identique à Google Maps)
                  icon={L.divIcon({
                    className: 'custom-type-marker',
                    html: `<div style="
                      font-size: 14px;
                      background: ${isHovered || isSelected ? '#0EA5E9' : 'transparent'};
                      border-radius: 50%;
                      width: 28px; height: 28px;
                      display: flex; align-items: center; justify-content: center;
                      color: white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    ">${typeIcons[etab.type] || '📍'}</div>`,
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                  })}
                  // ✅ Events hover/click (identiques à Google Maps)
                  eventHandlers={{
                    mouseover: () => setHoveredMarker(etab.id),
                    mouseout: () => setHoveredMarker(null),
                    click: () => setSelectedMarker(etab)
                  }}
                >
                  {/* ✅ Popup avec MÊME contenu et style que InfoWindow Google */}
                  {(isHovered || isSelected) && (
                    <Popup 
                      closeButton={true}
                      autoClose={true}
                      closeOnClick={false}
                      offset={[0, -10]}
                    >
                      <div style={{ padding: '5px', maxWidth: '220px', fontFamily: 'inherit' }}>
                        <h6 style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#1B2A4A' }}>{etab.nom}</h6>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{etab.adresse}</p>
                        {etab.telephone && <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>📞 {etab.telephone}</p>}
                        <button 
                          style={{ 
                            marginTop: '8px', 
                            background: '#0077B6', 
                            color: 'white', 
                            border: 'none', 
                            padding: '5px 10px', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            fontSize: '0.8rem' 
                          }}
                          onClick={() => { 
                            setSelectedMarker(null); 
                            setHoveredMarker(null);
                            openDetail?.(etab); 
                          }}
                        >
                          Voir détails
                        </button>
                      </div>
                    </Popup>
                  )}
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}