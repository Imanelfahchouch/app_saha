import React, { useState, useMemo, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;

// ✅ FIX : Déclarer libraries EN DEHORS du composant (référence stable)
const MAP_LIBRARIES = ['places'];

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
};

const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };
const DEFAULT_ZOOM = 6;

const typeIcons = { pharmacie: '💊', clinique: '🏥', hopital: '🏨' };

export default function Map({ filteredEtablissements, openDetail, userLocation, mapCenter, zoom }) {
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // ✅ FIX : Utiliser la constante MAP_LIBRARIES (même référence à chaque render)
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: MAP_LIBRARIES
  });

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
  }), []);

  const onLoad = useCallback(() => {}, []);
  const onUnmount = useCallback(() => {}, []);

  if (loadError) return <div className="p-5 text-center text-danger">❌ Erreur Google Maps</div>;
  if (!isLoaded) return <div className="p-5 text-center">Chargement de la carte...</div>;

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
    
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={mapCenter || DEFAULT_CENTER}
          zoom={zoom || DEFAULT_ZOOM}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {userLocation && (
            <Marker 
              position={userLocation} 
              title="Votre position"
              icon={{
                path: "M0-48c-9 0-16 7-16 16 0 9 16 32 16 32s16-23 16-32c0-9-7-16-16-16z",
                fillColor: "#0EA5E9",
                fillOpacity: 1,
                strokeColor: "#fff", 
                strokeWeight: 2,
                scale: 0.8
              }}
            />
          )}

          {filteredEtablissements?.map((etab) => (
            <Marker
              key={etab.id}
              position={{ lat: etab.latitude, lng: etab.longitude }}
              label={{
                text: typeIcons[etab.type] || '📍',
                color: 'white',
                fontSize: '14px'
              }}
              onMouseOver={() => setHoveredMarker(etab.id)}
              onMouseOut={() => setHoveredMarker(null)}
              onClick={() => setSelectedMarker(etab)}
              animation={hoveredMarker === etab.id ? window.google?.maps?.Animation?.BOUNCE : undefined}
            >
              {(hoveredMarker === etab.id || selectedMarker?.id === etab.id) && (
                <InfoWindow onCloseClick={() => { setHoveredMarker(null); setSelectedMarker(null); }}>
                  <div style={{ padding: '5px', maxWidth: '220px' }}>
                    <h6 style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#1B2A4A' }}>{etab.nom}</h6>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{etab.adresse}</p>
                    {etab.telephone && <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>📞 {etab.telephone}</p>}
                    <button 
                      style={{ marginTop: '8px', background: '#0077B6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => { setSelectedMarker(null); openDetail?.(etab); }}
                    >
                      Voir détails
                    </button>
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
        </GoogleMap>
      </div>
    </section>
  );
}