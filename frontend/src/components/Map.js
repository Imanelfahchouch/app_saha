import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };
const DEFAULT_ZOOM = 6;

const containerStyle = {
  height: '500px',
  width: '100%',
  borderRadius: '16px',
  zIndex: 1,
  marginBottom: '2rem'
};

const mapOptions = {};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    if (map && center && zoom) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function Map({ filteredEtablissements, userLocation, mapCenter, zoom }) {
  return (
    <section className="py-4" style={{ background: "#fff" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0">
            <i className="bi bi-map-fill text-primary me-2" />
            Carte Interactive
          </h3>

          <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>
            <i className="bi bi-geo-alt-fill text-danger me-1" />
            Maroc — {filteredEtablissements?.length || 0} résultats
          </span>
        </div>

        <div style={containerStyle}>
          <MapContainer
            center={[(mapCenter || DEFAULT_CENTER).lat, (mapCenter || DEFAULT_CENTER).lng]}
            zoom={zoom !== undefined ? zoom : DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%', borderRadius: '16px', zIndex: 1 }}
            {...mapOptions}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={mapCenter} zoom={zoom} />

            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={L.divIcon({
                  className: 'user-location-marker',
                  html: `<div style="
                    width: 20px;
                    height: 20px;
                    background: #0EA5E9;
                    border: 3px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    animation: pulse 2s infinite;
                  "></div>
                  <style>
                    @keyframes pulse {
                      0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
                      70% { box-shadow: 0 0 0 10px rgba(14, 165, 233, 0); }
                      100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
                    }
                  </style>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })}
              >
                <Popup>
                  <strong>📍 Votre position</strong>
                </Popup>
              </Marker>
            )}

            {filteredEtablissements?.map(etab => (
              <Marker
                key={etab.id}
                position={[etab.latitude, etab.longitude]}
              >
                <Popup>
                  <b>{etab.nom}</b><br />
                  {etab.adresse}<br />
                  {etab.distance ? `${Math.round(etab.distance)} m` : ''}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </section>
  );
}