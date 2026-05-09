import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || 'TA_CLE_API_ICI';
const containerStyle = { width: '100%', height: '500px', borderRadius: '16px' };

// Position initiale : Taza
const DEFAULT_CENTER = { lat: 34.2167, lng: -4.0167 };
const DEFAULT_ZOOM = 12;

export default function NearMePage() {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  // ✅ Ref directe sur l'instance Google Maps
  const mapRef = useRef(null);

  const [establishments, setEstablishments] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [filterType, setFilterType] = useState('');

  // ✅ Callback appelé quand la carte est montée — on stocke l'instance
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // ✅ Fonction pour déplacer la carte sans la remonter
  const moveMap = useCallback((lat, lng, zoom = 15) => {
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(zoom);
    }
  }, []);

  const fetchEstablishments = useCallback(async (lat, lng, rad, type) => {
    try {
      const params = new URLSearchParams();
      if (lat && lng) {
        params.append('lat', lat);
        params.append('lng', lng);
        params.append('radius', rad || 5000);
      }
      if (type) params.append('type', type);

      const res = await fetch(`http://localhost:8000/api/etablissements?${params.toString()}`);
      if (!res.ok) throw new Error('Erreur réseau');
      const data = await res.json();

      console.log('✅ Établissements reçus:', data.length);
      setEstablishments(data);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    }
  }, []);

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée par votre navigateur');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('📍 Position GPS:', latitude, longitude);

        const userLoc = { lat: latitude, lng: longitude };
        setUserLocation(userLoc);

        // ✅ Déplacer la carte via la ref — pas via setState
        moveMap(latitude, longitude, 15);

        // ✅ Charger les établissements proches
        await fetchEstablishments(latitude, longitude, radius, filterType);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur géolocalisation:', err);
        setError(
          err.code === 1
            ? 'Accès à la position refusé. Autorisez la géolocalisation dans votre navigateur.'
            : 'Position introuvable. Réessayez.'
        );
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleRefresh = () => {
    if (userLocation) {
      fetchEstablishments(userLocation.lat, userLocation.lng, radius, filterType);
    } else {
      fetchEstablishments();
    }
  };

  // ✅ Re-fetch quand le rayon ou le type change (si position déjà connue)
  useEffect(() => {
    if (userLocation) {
      fetchEstablishments(userLocation.lat, userLocation.lng, radius, filterType);
    }
  }, [radius, filterType]);

  if (loadError) return (
    <div className="p-8 text-center text-red-600">
      Erreur de chargement Google Maps. Vérifiez votre clé API.
    </div>
  );
  if (!isLoaded) return (
    <div className="p-8 text-center text-gray-500">Chargement de la carte...</div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">

      {/* Header + Contrôles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Près de moi</h1>
          <p className="text-gray-500 text-sm">
            {userLocation
              ? `Position: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)} • Rayon: ${radius / 1000} km • ${establishments.length} résultat(s)`
              : 'Cliquez sur le bouton pour localiser les établissements autour de vous'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          >
            <option value={1000}>1 km</option>
            <option value={3000}>3 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Tous les types</option>
            <option value="hopital">Hôpital</option>
            <option value="pharmacie">Pharmacie</option>
            <option value="clinique">Clinique</option>
          </select>
          <button
            onClick={handleNearMe}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Localisation...' : 'Près de moi'}
          </button>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Actualiser
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>{error}</span>
          <button onClick={handleNearMe} className="ml-auto text-sm underline font-medium">
            Réessayer
          </button>
        </div>
      )}

      {/* Carte + Liste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CARTE — onLoad stocke la ref, pas de re-render pour center/zoom */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={DEFAULT_CENTER}       // ✅ valeur fixe — ne change jamais
            zoom={DEFAULT_ZOOM}           // ✅ valeur fixe — ne provoque pas de re-render
            onLoad={onMapLoad}            // ✅ stocke l'instance dans mapRef
            options={{
              zoomControl: true,
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Marqueur position utilisateur */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="Votre position"
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 10,
                  fillColor: '#2563eb',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                }}
              />
            )}

            {/* Marqueurs établissements */}
            {establishments.map((e) => (
              <Marker
                key={e.id}
                position={{ lat: e.latitude, lng: e.longitude }}
                title={e.nom}
                onClick={() => setSelected(e)}
                icon={{
                  url:
                    e.type === 'pharmacie'
                      ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                      : e.type === 'hopital'
                      ? 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                      : 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                }}
              />
            ))}

            {/* InfoWindow au clic */}
            {selected && (
              <InfoWindow
                position={{ lat: selected.latitude, lng: selected.longitude }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ minWidth: 200, padding: 4 }}>
                  <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{selected.nom}</h4>
                  <p style={{ fontSize: 13, color: '#555', marginBottom: 2 }}>{selected.adresse}</p>
                  <p style={{ fontSize: 12, color: '#888', textTransform: 'capitalize' }}>{selected.type}</p>
                  {selected.distance && (
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', marginTop: 6 }}>
                      {selected.distance < 1000
                        ? `${Math.round(selected.distance)} m`
                        : `${(selected.distance / 1000).toFixed(1)} km`}
                    </p>
                  )}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </div>

        {/* LISTE */}
        <aside className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            Résultats ({establishments.length})
          </h3>

          {loading && establishments.length === 0 ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : establishments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-600 font-medium mb-2">Aucun établissement trouvé</p>
              <p className="text-sm text-gray-500 mb-4">Essayez d'élargir le rayon de recherche</p>
              <button
                onClick={() => setRadius((r) => Math.min(r + 5000, 30000))}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Élargir le rayon (+5 km)
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {establishments.map((e) => (
                <div
                  key={e.id}
                  onClick={() => {
                    setSelected(e);
                    moveMap(e.latitude, e.longitude, 16); // ✅ zoom sur l'établissement cliqué
                  }}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{e.nom}</h4>
                      <p className="text-xs text-gray-500 capitalize mt-1">{e.type}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{e.adresse}</p>
                      {e.distance && (
                        <p className="text-xs font-bold text-blue-600 mt-1">
                          {e.distance < 1000
                            ? `${Math.round(e.distance)} m`
                            : `${(e.distance / 1000).toFixed(1)} km`}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                        e.etat === 'ouvert'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {e.etat === 'ouvert' ? 'Ouvert' : 'Fermé'}
                    </span>
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
