import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center, zoom }) {
  const map = useMap();
  const isFirst = useRef(true); // ← empêche le flyTo au 1er rendu

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (map && center && zoom) {
      map.flyTo([center.lat, center.lng], zoom, { duration: 1.5 });
    }
  }, [center, zoom, map]);

  return null;
}

export default function Map({ filteredEtablissements, userLocation, mapCenter, zoom }) {
  // ← SUPPRIMER mapKey et le key={mapKey} sur MapContainer
  return (
    <div style={{ height: '500px', width: '100%', borderRadius: '16px', zIndex: 1, marginBottom: '2rem' }}>
      <MapContainer
        center={[33.5731, -7.5898]}  // position initiale fixe
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <MapUpdater center={mapCenter} zoom={zoom} /> {/* ← gère le flyTo */}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup><b>Votre position</b></Popup>
          </Marker>
        )}

        {filteredEtablissements?.map(etab => (
          <Marker key={etab.id} position={[etab.latitude, etab.longitude]}>
            <Popup>
              <b>{etab.nom}</b><br />
              {etab.adresse}<br />
              {etab.distance ? `${Math.round(etab.distance)} m` : ''}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}