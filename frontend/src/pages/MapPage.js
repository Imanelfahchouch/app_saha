import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map.js';
import { typeIcons, typeLabels, typeBadge } from '../data/mockData.js';
import StarRating from '../components/StarRating.js';

export default function MapPage(props) {
  // États Near Me (ajoutés)
  const [userLocation, setUserLocation] = useState(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [localEstablishments, setLocalEstablishments] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 33.5731, lng: -7.5898 });
  const [zoom, setZoom] = useState(6);

  // 1️⃣ Chargement initial depuis le backend
  useEffect(() => {
    fetch('http://localhost:8000/api/etablissements')
      .then(res => res.json())
      .then(data => {
        setLocalEstablishments(data);
        // Met à jour le prop parent si la fonction existe
        if (props.setFilteredEtablissements) {
          props.setFilteredEtablissements(data);
        }
      })
      .catch(err => console.error('Erreur chargement:', err));
  }, []);

  // 2️⃣ Fonction Near Me
  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setNearMeError('Géolocalisation non supportée');
      return;
    }

    setNearMeLoading(true);
    setNearMeError(null);
    setIsNearMeActive(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const res = await fetch(
            `http://localhost:8000/api/etablissements/nearby?lat=${latitude}&lng=${longitude}&radius=5000`
          );
          if (!res.ok) throw new Error('Erreur API');
          const data = await res.json();
          
          setLocalEstablishments(data);
          if (props.setFilteredEtablissements) {
            props.setFilteredEtablissements(data);
          }
        } catch (err) {
          console.error(err);
          setNearMeError('Impossible de charger les établissements proches');
        } finally {
          setNearMeLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setNearMeError(err.code === 1 ? 'Accès refusé' : 'Position introuvable');
        setNearMeLoading(false);
        setIsNearMeActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [props]);

  // 3️⃣ Reset Near Me
  const handleResetNearMe = () => {
    setIsNearMeActive(false);
    setUserLocation(null);
    setNearMeError(null);
    fetch('http://localhost:8000/api/etablissements')
      .then(res => res.json())
      .then(data => {
        setLocalEstablishments(data);
        if (props.setFilteredEtablissements) {
          props.setFilteredEtablissements(data);
        }
      });
  };

  // ✅ AJOUT : Fonction de géocodage OpenStreetMap (Nominatim) - GRATUIT, sans clé API
  const handleCitySearchOSM = async (cityName) => {
    if (!cityName.trim()) return;
    
    try {
      // API Nominatim d'OpenStreetMap (gratuit, sans authentification)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName + ', Maroc')}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await response.json();
      
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log(`📍 Centrage OSM sur ${cityName}:`, lat, lon);
        setMapCenter({ lat, lng: lon });
        setZoom(13); // Zoom ville
      } else {
        console.warn('⚠️ Ville non trouvée via Nominatim:', cityName);
      }
    } catch (err) {
      console.error('❌ Erreur géocodage OSM:', err);
    }
  };
  

  const handleCitySearch = async (cityName) => {
    if (!cityName.trim()) return;
    
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: `${cityName}, Maroc` }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          setMapCenter({ lat: location.lat(), lng: location.lng() });
          setZoom(13);
        } else {
          console.error('Géocodage échoué:', status);
        }
      });
    } catch (err) {
      console.error('Erreur géocodage:', err);
    }
  };

  // Données à passer au composant Map (priorité aux données locales si Near Me actif)
  const establishmentsToUse = localEstablishments.length > 0 ? localEstablishments : props.filteredEtablissements;

  // ✅ AJOUT : Zoom automatique sur les résultats filtrés
    // ✅ ZOOM AUTOMATIQUE IMMÉDIAT (Déclenché dès que les filtres/recherche changent)
  useEffect(() => {
    if (establishmentsToUse?.length > 0) {
      setMapCenter({ 
        lat: establishmentsToUse[0].latitude, 
        lng: establishmentsToUse[0].longitude 
      });
      setZoom(establishmentsToUse.length === 1 ? 16 : establishmentsToUse.length <= 5 ? 14 : 13);
    }
  }, [establishmentsToUse, props.activeFilters, props.searchQuery, props.activeStatusFilter]);

  // ✅ Effet pour centrer la carte sur une ville connue (MODIFICATION MINIMALE : extraction de ville depuis "hopital de rabat")
  useEffect(() => {
    const villes = ['rabat', 'casablanca', 'fes', 'marrakech', 'tanger', 'agadir', 'meknes', 'oujda', 'taza'];
    const query = props.searchQuery?.toLowerCase().trim();
    
    if (query) {
      // ✅ Extraction de la ville depuis une requête comme "hopital de rabat" ou "pharmacie casablanca"
      let cityFound = null;
      for (const ville of villes) {
        if (query.includes(ville)) {
          cityFound = ville;
          break;
        }
      }
      
      if (cityFound) {
        // ✅ Utilise OSM (gratuit) au lieu de Google Maps
        handleCitySearchOSM(cityFound);
      }
    }
  }, [props.searchQuery]);

  return (
    <>
      <div className="py-4" style={{ background: "#fff" }}>
        <div className="container">
          <h3 className="section-title mb-4">
            <i className="bi bi-map-fill text-primary me-2" />Carte Interactive
          </h3>
          
          {/* Barre de recherche + Near Me */}
          <div className="search-container" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
            <div className="row g-3 align-items-center">
              <div className="col-lg-5">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", fontSize: "1.1rem" }} />
                  <input 
                    type="text" 
                    className="search-input-custom" 
                    style={{ paddingLeft: 44 }} 
                    placeholder="Rechercher par nom ou ville..." 
                    value={props.searchQuery} 
                    onChange={e => props.setSearchQuery(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="col-lg-3">
                <select 
                  className="search-input-custom" 
                  style={{ cursor: "pointer" }} 
                  value={props.activeStatusFilter} 
                  onChange={e => props.setActiveStatusFilter(e.target.value)}
                >
                  <option value="all">🕐 Tous les statuts</option>
                  <option value="ouvert">🟢 Ouvert</option>
                  <option value="ferme">🔴 Fermé</option>
                </select>
              </div>
              
              <div className="col-lg-2">
                <button 
                  className="btn-near-me w-100" 
                  onClick={handleNearMe} 
                  disabled={nearMeLoading || props.geoLoading}
                  style={{ 
                    background: isNearMeActive ? 'var(--primary)' : undefined,
                    borderColor: isNearMeActive ? 'var(--primary)' : undefined
                  }}
                >
                  {nearMeLoading ? (
                    <><span className="spinner-border spinner-border-sm me-2" />Localisation...</>
                  ) : (
                    <><i className="bi bi-crosshair me-2" />{isNearMeActive ? 'Near Me' : 'Near Me'}</>
                  )}
                </button>
              </div>
              
              <div className="col-lg-2">
                <button className="btn-search w-100" onClick={() => props.setSearchQuery('')}>
                  <i className="bi bi-x-circle me-2" />Effacer
                </button>
              </div>
            </div>
            
            {/* Filtres par type */}
            <div className="filter-pills">
              {["pharmacie", "clinique", "hopital"].map(type => (
                <button 
                  key={type} 
                  className={`filter-pill ${props.activeFilters.includes(type) ? "active" : ""}`} 
                  onClick={() => props.handleFilterToggle(type)}
                >
                  <i className={`bi ${typeIcons[type]} me-1`} />{typeLabels[type]}
                </button>
              ))}
            </div>
            
            {/* Messages Near Me */}
            {isNearMeActive && (
              <button 
                onClick={handleResetNearMe} 
                className="btn btn-sm btn-link text-primary mt-2 p-0"
                style={{ fontSize: "0.85rem" }}
              >
                ← Voir tous les établissements
              </button>
            )}
            {nearMeError && (
              <div className="alert alert-danger mt-2 py-2" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
                <i className="bi bi-exclamation-triangle me-2" />{nearMeError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Composant Carte - passe les données mises à jour */}
      <Map 
        {...props} 
        filteredEtablissements={establishmentsToUse}
        userLocation={userLocation}
        mapCenter={mapCenter}
        zoom={zoom}
      />

      {/* Liste des résultats */}
      <div className="py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ fontWeight: 600, color: "var(--gray-700)" }}>
              Résultats : <span style={{ color: "var(--primary)" }}>{establishmentsToUse.length}</span> établissement(s)
              {isNearMeActive && <span className="text-muted ms-2">(rayon 5km)</span>}
            </h6>
            <button className="btn btn-sm btn-outline-primary rounded-pill" onClick={() => props.setCurrentPage("list")}>
              Voir en liste <i className="bi bi-list-ul ms-1" />
            </button>
          </div>
          
          <div className="row g-3">
            {establishmentsToUse.map(e => (
              <div className="col-md-4" key={e.id}>
                <div 
                  className="card border-0 shadow-sm" 
                  style={{ borderRadius: 14, cursor: "pointer" }} 
                  onClick={() => props.openDetail(e)}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{e.nom}</h6>
                      <span className={`badge ${typeBadge[e.type]} rounded-pill`} style={{ fontSize: "0.7rem" }}>
                        {typeLabels[e.type]}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>
                      <i className="bi bi-geo-alt-fill text-primary me-1" />{e.adresse}
                    </div>
                    {e.distance && (
                      <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: 2 }}>
                        <i className="bi bi-signpost-2 me-1" />{Math.round(e.distance)} m
                      </div>
                    )}
                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <StarRating rating={e.rating} size="sm" />
                      <span className={`badge ${e.etat === "ouvert" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} rounded-pill`} style={{ fontSize: "0.7rem" }}>
                        {e.etat}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}