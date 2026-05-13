import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// ✅ Icônes Leaflet par défaut
let DefaultIcon = L.icon({ 
  iconUrl, 
  shadowUrl: iconShadow, 
  iconSize: [25, 41], 
  iconAnchor: [12, 41],
  popupAnchor: [0, -41] 
});
L.Marker.prototype.options.icon = DefaultIcon;

// ✅ Icônes PERSONNALISÉES par type d'établissement
const getCustomIcon = (type) => {
  const colors = {
    pharmacie: '#22c55e',  // Vert
    clinique: '#3b82f6',   // Bleu
    hopital: '#ef4444'     // Rouge
  };
  
  const icons = {
    pharmacie: '💊',
    clinique: '🏥',
    hopital: ''
  };
  
  const color = colors[type] || '#3b82f6';
  const icon = icons[type] || '🏥';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 18px;
          line-height: 1;
          margin-top: 4px;
          margin-left: 2px;
        ">${icon}</div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// ✅ Icône Utilisateur (point bleu pulsant)
const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="position:relative;width:24px;height:24px;">
    <div style="width:24px;height:24px;background:#0ea5e9;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(14,165,233,0.5);z-index:2;position:relative;"></div>
    <div style="position:absolute;top:0;left:0;width:24px;height:24px;border:2px solid #0ea5e9;border-radius:50%;animation:pulse 2s infinite;opacity:0.6;"></div>
    <style>@keyframes pulse{0%{transform:scale(0.8);opacity:0.8}70%{transform:scale(2);opacity:0}100%{transform:scale(2);opacity:0}}</style>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const DEFAULT_CENTER = { lat: 33.5731, lng: -7.5898 };
const containerStyle = { 
  height: '600px', 
  width: '100%', 
  borderRadius: '20px', 
  zIndex: 1, 
  boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)', 
  overflow: 'hidden', 
  border: '1px solid rgba(0,0,0,0.08)' 
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    if (map && center && zoom) map.flyTo([center.lat, center.lng], zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

function RouteLine({ start, end, travelMode, onRouteCalculated }) {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!start?.lat || !end?.lat) return;
    setLoading(true);
    const fetchRoute = async () => {
      try {
        const profile = travelMode === 'walking' ? 'foot' : travelMode === 'cycling' ? 'bike' : 'driving';
        const url = `https://router.project-osrm.org/route/v1/${profile}/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&steps=true`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) {
          const r = data.routes[0];
          setRouteData({
            coords: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
            distance: (r.distance / 1000).toFixed(1),
            duration: Math.round(r.duration / 60),
            steps: r.legs[0].steps.map(s => ({
              instruction: s.maneuver.instruction,
              distance: s.distance,
              type: s.maneuver.type,
              modifier: s.maneuver.modifier
            }))
          });
          if (onRouteCalculated) onRouteCalculated({ 
            distance: (r.distance/1000).toFixed(1), 
            duration: Math.round(r.duration/60), 
            steps: routeData?.steps || [] 
          });
        }
      } catch (e) { console.error('Erreur OSRM:', e); }
      finally { setLoading(false); }
    };
    fetchRoute();
  }, [start, end, travelMode, onRouteCalculated]);

  if (loading || !routeData) return null;

  const colors = { driving: '#0ea5e9', walking: '#22c55e', cycling: '#f59e0b' };
  return (
    <Polyline 
      positions={routeData.coords} 
      color={colors[travelMode] || '#0ea5e9'} 
      weight={5} 
      opacity={0.9} 
      dashArray="10, 8" 
      lineCap="round" 
    />
  );
}

function TurnByTurnPanel({ routeInfo, destination, travelMode, onClose }) {
  if (!routeInfo || !destination) return null;

  const modeLabels = { 
    driving: '🚗 Voiture', 
    walking: '🚶 Marche', 
    cycling: '🚲 Vélo' 
  };
  
  const modeColors = { 
    driving: '#0ea5e9', 
    walking: '#22c55e', 
    cycling: '#f59e0b' 
  };
  
  const color = modeColors[travelMode] || '#0ea5e9';

  // ✅ Calcul temps estimé RÉALISTE selon le mode
  const getRealisticDuration = () => {
    const distance = parseFloat(routeInfo.distance); // en km
    
    if (travelMode === 'walking') {
      // Vitesse marche : ~5 km/h
      const minutes = Math.round((distance / 5) * 60);
      return `${minutes} min`;
    } else if (travelMode === 'cycling') {
      // Vitesse vélo : ~15 km/h
      const minutes = Math.round((distance / 15) * 60);
      return `${minutes} min`;
    } else {
      // Voiture : ~50 km/h en ville
      const minutes = Math.round((distance / 50) * 60);
      return `${minutes} min`;
    }
  };

  const realisticTime = getRealisticDuration();

  const getIcon = (type, mod) => {
    if (type === 'arrive') return 'bi-flag-fill text-success';
    if (type === 'depart') return 'bi-play-fill text-primary';
    if (mod?.includes('left')) return 'bi-arrow-left';
    if (mod?.includes('right')) return 'bi-arrow-right';
    if (mod?.includes('straight')) return 'bi-arrow-up';
    if (type === 'roundabout') return 'bi-arrow-repeat';
    return 'bi-arrow-up-right';
  };

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '16px', 
      padding: '20px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', 
      border: '1px solid #e2e8f0', 
      marginTop: '20px',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
            {modeLabels[travelMode]} - Vers <strong>{destination.nom}</strong>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
            {routeInfo.distance} km • ~<strong>{realisticTime}</strong>
          </div>
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '8px 12px', 
            cursor: 'pointer', 
            color: '#64748b',
            transition: 'all 0.2s'
          }}
          onMouseOver={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#64748b'; }}
        >
          <i className="bi bi-x-lg" />
        </button>
      </div>

      <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '12px' }}>
          🧭 Itinéraire détaillé :
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {routeInfo.steps.map((step, i) => (
            <li key={i} style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '12px', 
              padding: '10px 0', 
              borderBottom: i < routeInfo.steps.length - 1 ? '1px dashed #e2e8f0' : 'none' 
            }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#f1f5f9', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0 
              }}>
                <i className={`bi ${getIcon(step.type, step.modifier)} ${step.type === 'arrive' ? 'text-success' : 'text-primary'}`} style={{ fontSize: '1rem' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.3 }}>
                  {step.instruction}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                  {step.distance > 1000 ? `${(step.distance/1000).toFixed(1)} km` : `${Math.round(step.distance)} m`}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ✅ COMPOSANT PRINCIPAL
export default function Map({ filteredEtablissements, userLocation, mapCenter, zoom, onRouteSelect }) {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('driving');

  const handleGetDirections = (etab, mode = 'driving') => {
    if (!userLocation?.lat) {
      alert('📍 Activez "Near Me" d\'abord pour calculer un itinéraire.');
      return;
    }
    setSelectedDestination({ lat: etab.latitude, lng: etab.longitude, nom: etab.nom, type: etab.type });
    setTravelMode(mode);
    setRouteInfo(null);
    if (onRouteSelect) onRouteSelect({ ...etab, travelMode: mode });
  };

  // ✅ Affichage de TOUS les types (pharmacie, clinique, hopital)
  const establishmentMarkers = useMemo(() => {
    if (!filteredEtablissements || filteredEtablissements.length === 0) return null;
    
    return filteredEtablissements.map(etab => {
      // ✅ Utiliser l'icône personnalisée selon le type
      const customIcon = getCustomIcon(etab.type);
      
      return (
        <Marker 
          key={`etab-${etab.id}`} 
          position={[etab.latitude, etab.longitude]}
          icon={customIcon}
        >
          <Popup minWidth={280} maxWidth={320}>
            <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', padding: '8px 4px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: '2px solid #f1f5f9'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: etab.type === 'pharmacie' ? '#dcfce7' : 
                             etab.type === 'clinique' ? '#dbeafe' : '#fee2e2',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {etab.type === 'pharmacie' ? '💊' : etab.type === 'clinique' ? '🏥' : '🚑'}
                </div>
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: '1.05rem', color: '#1e293b', display: 'block', marginBottom: '4px' }}>
                    {etab.nom}
                  </strong>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '3px 8px', 
                    borderRadius: '999px',
                    background: etab.type === 'pharmacie' ? '#22c55e' : 
                               etab.type === 'clinique' ? '#3b82f6' : '#ef4444',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                  }}>
                    {etab.type}
                  </span>
                </div>
              </div>
              
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <i className="bi bi-geo-alt-fill" style={{ color: '#0ea5e9', marginTop: '3px', fontSize: '1rem' }} />
                <span>{etab.adresse}</span>
              </div>
              
              {etab.distance && (
                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#0ea5e9', 
                  fontWeight: 600,
                  marginBottom: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  background: '#f0f9ff',
                  borderRadius: '8px'
                }}>
                  <i className="bi bi-signpost-2" />
                  {Math.round(etab.distance)} m
                </div>
              )}
              
              {/* ✅ BOUTONS TOUJOURS VISIBLES dans le popup */}
              {userLocation && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    onClick={() => handleGetDirections(etab, 'driving')}
                    style={{ 
                      flex: 1, 
                      padding: '10px 14px', 
                      background: '#0ea5e9', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontSize: '0.9rem', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)'
                    }}
                    onMouseOver={e => { 
                      e.currentTarget.style.background = '#0284c7';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.4)';
                    }}
                    onMouseOut={e => { 
                      e.currentTarget.style.background = '#0ea5e9';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                    }}
                  >
                    <i className="bi bi-car-front-fill" style={{ fontSize: '1.1rem' }} />
                    Voiture
                  </button>
                  <button
                    onClick={() => handleGetDirections(etab, 'walking')}
                    style={{ 
                      flex: 1, 
                      padding: '10px 14px', 
                      background: '#22c55e', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontSize: '0.9rem', 
                      fontWeight: 600, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                    onMouseOver={e => { 
                      e.currentTarget.style.background = '#16a34a';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.4)';
                    }}
                    onMouseOut={e => { 
                      e.currentTarget.style.background = '#22c55e';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
                    }}
                  >
                    <i className="bi bi-walk" style={{ fontSize: '1.1rem' }} />
                    Marche
                  </button>
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [filteredEtablissements, userLocation]);

  return (
    <section className="py-4" style={{ background: "#f8fafc" }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="bi bi-map-fill" style={{ color: '#0ea5e9' }} /> 
            Carte Interactive
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Légende des couleurs */}
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} /> Pharmacie
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }} /> Clinique
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} /> Hôpital
              </span>
            </div>
            <span style={{ fontSize: '0.85rem', color: '#64748b', padding: '6px 12px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <i className="bi bi-geo-alt-fill" style={{ color: '#ef4444', marginRight: '6px' }} /> 
              Maroc • {filteredEtablissements?.length || 0} résultats
            </span>
          </div>
        </div>

        <div style={containerStyle}>
          <MapContainer 
            center={[(mapCenter || DEFAULT_CENTER).lat, (mapCenter || DEFAULT_CENTER).lng]} 
            zoom={zoom || 6} 
            style={{ height: '100%', width: '100%', borderRadius: '20px' }} 
            scrollWheelZoom={true}
            zoomControl={true}
          >
            <TileLayer 
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' 
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
            />
            <MapUpdater center={mapCenter} zoom={zoom} />
            
            {userLocation?.lat && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <strong>📍 Votre position</strong>
                </Popup>
              </Marker>
            )}
            
            {/* ✅ TOUS les établissements s'affichent (pharmacie + clinique + hopital) */}
            {establishmentMarkers}
            
            {userLocation?.lat && selectedDestination && (
              <RouteLine 
                start={userLocation} 
                end={selectedDestination} 
                travelMode={travelMode} 
                onRouteCalculated={setRouteInfo} 
              />
            )}
          </MapContainer>
        </div>

        {/* Panneau d'indications */}
        <TurnByTurnPanel 
          routeInfo={routeInfo} 
          destination={selectedDestination} 
          travelMode={travelMode} 
          onClose={() => { setSelectedDestination(null); setRouteInfo(null); }} 
        />
      </div>
    </section>
  );
}