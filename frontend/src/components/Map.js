import React, { useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { typeIcons, typeLabels } from '../data/mockData.js';

// ⚠️ REMPLACE CECI PAR TA VRAIE CLÉ API GOOGLE/ ⚠️ REMPLACE CECI PAR TA VRAIE CLÉ API GOOGLE
const GOOGLE_MAPS_API_KEY = 'https://data.gov.ma/data/api/3/action/package_show?id=la-liste-des-hopitaux'; 

// Style de la carte pour qu'elle prenne toute la place
const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
};

// Centrage par défaut sur le Maroc (Casablanca)
const center = {
  lat: 33.5731,
  lng: -7.5898
};

export default function Map({ filteredEtablissements, hoveredMarker, setHoveredMarker, openDetail }) {
  
  // Chargement de l'API Google
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places'] // Utile pour la recherche future
  });

  // Mémorisation des options pour éviter les re-renders inutiles
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    styles: [
      {
        "featureType": "poi",
        "elementType": "labels",
        "stylers": [{ "visibility": "off" }] // Cache les points d'intérêt par défaut de Google pour un look plus propre
      }
    ]
  }), []);

  const onLoad = useCallback(function callback(map) {
    // Tu peux manipuler l'objet map ici si besoin (ex: bornes limites)
  }, []);

  const onUnmount = useCallback(function callback(map) {
    // Nettoyage
  }, []);

  // Affichage si l'API ne charge pas
  if (loadError) return <div style={{ padding: 20, textAlign: 'center' }}>❌ Erreur de chargement Google Maps. Vérifie ta clé API.</div>;
  if (!isLoaded) return <div style={{ padding: 20, textAlign: 'center' }}>Chargement de la carte...</div>;

  return (
    <section className="py-4" style={{ background: "#fff" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0">
            <i className="bi bi-map-fill text-primary me-2" />Carte Interactive
          </h3>
          <div className="d-flex gap-2 align-items-center">
            <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
              <i className="bi bi-geo-alt-fill text-danger me-1" />Maroc — {filteredEtablissements.length} résultats
            </span>
          </div>
        </div>

        {/* VRAIE GOOGLE MAP */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={6}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Marqueurs dynamiques */}
          {filteredEtablissements.map((etab) => (
            <Marker
              key={etab.id}
              position={{ lat: etab.latitude, lng: etab.longitude }}
              // Icône personnalisée selon le type (optionnel, ici on utilise le marker par défaut avec un label)
              label={{
                text: etab.type === 'pharmacie' ? '💊' : etab.type === 'clinique' ? '🏥' : '🏨',
                color: 'white',
                fontSize: '14px',
                className: 'custom-marker-label'
              }}
              onMouseOver={() => setHoveredMarker(etab.id)}
              onMouseOut={() => setHoveredMarker(null)}
              onClick={() => openDetail(etab)}
              animation={hoveredMarker === etab.id ? window.google.maps.Animation.BOUNCE : undefined}
            >
              {/* InfoWindow qui s'ouvre au survol ou au clic */}
              {hoveredMarker === etab.id && (
                <InfoWindow onCloseClick={() => setHoveredMarker(null)}>
                  <div style={{ padding: '5px', maxWidth: '200px' }}>
                    <h6 style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#1B2A4A' }}>{etab.nom}</h6>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{etab.adresse}</p>
                    <button 
                      style={{ marginTop: '8px', background: '#0077B6', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      onClick={() => openDetail(etab)}
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