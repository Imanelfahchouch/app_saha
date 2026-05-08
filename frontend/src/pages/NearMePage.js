import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, AlertCircle, Filter, RefreshCw } from 'lucide-react'; // ✅ Loader2 et EstablishmentCard retirés
import { fetchNearbyEstablishments } from '../services/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY;
const DEFAULT_RADIUS = 5000;

const containerStyle = { width: '100%', height: '500px', borderRadius: '16px' };

export default function NearMePage({ mapCenter: propMapCenter }) {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GOOGLE_MAPS_API_KEY, libraries: ['places'] });
  
  const [userLocation, setUserLocation] = useState(null);
  const [establishments, setEstablishments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(DEFAULT_RADIUS);
  const [filterType, setFilterType] = useState('');
  const [selected, setSelected] = useState(null);
  const [mapCenter, setMapCenter] = useState(propMapCenter || { lat: 33.5731, lng: -7.5898 });

  // ✅ Fonction extraite et mémorisée
  const fetchNearby = useCallback(async ({ lat, lng, radius, type }) => {
    try {
      const data = await fetchNearbyEstablishments({ lat, lng, radius, type });
      setEstablishments(data);
    } catch (err) {
      setError('Erreur lors du chargement des établissements');
      console.error(err);
    }
  }, []); // ✅ Pas de dépendances externes

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const loc = { lat: latitude, lng: longitude };
        setUserLocation(loc);
        setMapCenter(loc);
        await fetchNearby({ ...loc, radius, type: filterType });
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err.code === 1 ? 'Accès refusé' : 'Position introuvable');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchNearby, radius, filterType]); // ✅ Dépendances déclarées

  const handleRefresh = useCallback(() => {
    if (userLocation) {
      fetchNearby({ ...userLocation, radius, type: filterType });
    } else {
      getUserLocation();
    }
  }, [userLocation, radius, filterType, fetchNearby, getUserLocation]);

  const filtered = establishments.filter(e => 
    !filterType || e.type === filterType
  ).sort((a, b) => a.distance - b.distance);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
  }), []);

  // ✅ useEffect avec dépendance correcte
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  if (!isLoaded) return <div className="p-8 text-center">Chargement de la carte...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">📍 Près de moi</h1>
          <p className="text-light-text">
            {userLocation 
              ? `Rayon : ${radius/1000} km — ${filtered.length} résultat${filtered.length>1?'s':''}`
              : 'Localisez-vous pour voir les établissements'}
          </p>
        </div>
        <button onClick={handleRefresh} className="btn-outline !px-4" disabled={loading}>
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Recherche...' : 'Actualiser'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-danger/15 border border-danger/30 text-danger px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={getUserLocation} className="ml-auto btn-outline !px-3 !py-1">Réessayer</button>
        </div>
      )}

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-dark-surface rounded-2xl border border-dark-border">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-light-text" />
          <select className="select-field" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="">Tous</option>
            <option value="pharmacie">Pharmacie</option>
            <option value="clinique">Clinique</option>
            <option value="hopital">Hôpital</option>
          </select>
        </div>
        <select className="select-field !min-w-[100px]" value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
          <option value={1000}>1 km</option>
          <option value={3000}>3 km</option>
          <option value={5000}>5 km</option>
          <option value={10000}>10 km</option>
        </select>
      </div>

      {/* Carte + Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-dark-border shadow-glass">
          <GoogleMap mapContainerStyle={containerStyle} center={mapCenter} zoom={13} options={mapOptions}>
            {userLocation && (
              <Marker position={userLocation} title="Vous" icon={{ path: "M0-48c-9 0-16 7-16 16 0 9 16 32 16 32s16-23 16-32c0-9-7-16-16-16z", fillColor: "#0EA5E9", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2, scale: 0.8 }} />
            )}
            {filtered.map((e) => (
              <Marker key={e.id} position={{ lat: e.latitude, lng: e.longitude }} title={e.nom} onClick={() => setSelected(e)} icon={{ path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", fillColor: "#10B981", fillOpacity: 1, strokeColor: "#fff", strokeWeight: 2, scale: 0.9 }} />
            ))}
            {selected && (
              <InfoWindow position={{ lat: selected.latitude, lng: selected.longitude }} onCloseClick={() => setSelected(null)}>
                <div className="p-2 min-w-[200px] text-dark">
                  <h4 className="font-semibold">{selected.nom}</h4>
                  <p className="text-sm text-gray-600">{selected.adresse}</p>
                  <p className="text-xs text-gray-500 mt-1">📏 {selected.distance < 1000 ? `${Math.round(selected.distance)} m` : `${(selected.distance/1000).toFixed(1)} km`}</p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        <aside className="space-y-4">
          <h3 className="text-lg font-semibold">Résultats ({filtered.length})</h3>
          {loading && !establishments.length ? (
            <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card animate-pulse"><div className="h-4 bg-dark-border rounded w-3/4 mb-2"></div></div>)}</div>
          ) : filtered.length === 0 ? (
            <p className="text-light-text italic text-center py-8">Aucun établissement trouvé.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {filtered.map((e) => (
                <div key={e.id} className="card">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-light truncate">{e.nom}</h4>
                      <p className="text-sm text-light-text capitalize">{e.type}</p>
                      <p className="text-xs text-light-text mt-1">📏 {e.distance < 1000 ? `${Math.round(e.distance)} m` : `${(e.distance/1000).toFixed(1)} km`}</p>
                    </div>
                    <span className={`badge ${e.etat === 'ouvert' ? 'badge-open' : 'badge-closed'}`}>{e.etat}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}