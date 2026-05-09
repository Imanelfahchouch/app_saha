import React, { useState, useEffect, useCallback } from 'react';
import Map from '../components/Map.js';
import { typeIcons, typeLabels, typeBadge } from '../data/mockData.js';
import StarRating from '../components/StarRating.js';

export default function MapPage(props) {
  const [userLocation, setUserLocation] = useState(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [nearbyEstablishments, setNearbyEstablishments] = useState([]);
  
  const [allEstablishments, setAllEstablishments] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 33.5731, lng: -7.5898 });
  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    fetch('http://localhost:8000/api/etablissements')
      .then(res => res.json())
      .then(data => {
        setAllEstablishments(data);
        if (props.setFilteredEtablissements) props.setFilteredEtablissements(data);
      })
      .catch(err => console.error('Erreur chargement:', err));
  }, []);

  const handleNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      setNearMeError('Géolocalisation non supportée');
      return;
    }

    setNearMeLoading(true);
    setNearMeError(null);
    setIsNearMeActive(true);
    setNearbyEstablishments([]);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        
        setUserLocation({ lat, lng });
        setMapCenter({ lat, lng });
        setZoom(15); 

        try {
          const res = await fetch(`http://localhost:8000/api/etablissements/nearby?lat=${lat}&lng=${lng}&radius=5000`);
          if (!res.ok) throw new Error('Erreur API');
          const data = await res.json();
          
          setNearbyEstablishments(data);
          if (props.setFilteredEtablissements) props.setFilteredEtablissements(data);
        } catch (err) {
          setNearMeError('Erreur lors du chargement des lieux proches');
        } finally {
          setNearMeLoading(false);
        }
      },
      (err) => {
        setNearMeError(err.code === 1 ? 'Accès refusé' : 'Position introuvable');
        setNearMeLoading(false);
        setIsNearMeActive(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [props]);

  const handleResetNearMe = () => {
    setIsNearMeActive(false);
    setUserLocation(null);
    setMapCenter({ lat: 33.5731, lng: -7.5898 });
    setZoom(6);
    if (props.setFilteredEtablissements) props.setFilteredEtablissements(allEstablishments);
  };

  const dataToShow = isNearMeActive ? nearbyEstablishments : allEstablishments;

  return (
    <>
      <div className="py-4" style={{ background: "#fff" }}>
        <div className="container">
          <h3 className="section-title mb-4"><i className="bi bi-map-fill text-primary me-2" />Carte Interactive</h3>
          
          <div className="search-container" style={{ marginTop: 0, marginBottom: "1.5rem" }}>
            <div className="row g-3 align-items-center">
              <div className="col-lg-5">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", fontSize: "1.1rem" }} />
                  <input type="text" className="search-input-custom" style={{ paddingLeft: 44 }} placeholder="Rechercher par nom ou ville..." value={props.searchQuery} onChange={e => props.setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="col-lg-2">
                <button className="btn-near-me w-100" onClick={handleNearMe} disabled={nearMeLoading} style={{ background: isNearMeActive ? 'var(--primary)' : undefined, borderColor: isNearMeActive ? 'var(--primary)' : undefined }}>
                  {nearMeLoading ? <><span className="spinner-border spinner-border-sm me-2" />Localisation...</> : <><i className="bi bi-crosshair me-2" />Near Me</>}
                </button>
              </div>
              <div className="col-lg-2">
                <button className="btn-search w-100" onClick={() => props.setSearchQuery('')}><i className="bi bi-x-circle me-2" />Effacer</button>
              </div>
            </div>
            
            <div className="filter-pills">
              {["pharmacie", "clinique", "hopital"].map(type => (
                <button key={type} className={`filter-pill ${props.activeFilters.includes(type) ? "active" : ""}`} onClick={() => props.handleFilterToggle(type)}>
                  <i className={`bi ${typeIcons[type]} me-1`} />{typeLabels[type]}
                </button>
              ))}
            </div>

            {isNearMeActive && (
              <button onClick={handleResetNearMe} className="btn btn-sm btn-link text-primary mt-2 p-0" style={{ fontSize: "0.85rem" }}>
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

      <Map 
        {...props} 
        filteredEtablissements={dataToShow}
        userLocation={userLocation}
        mapCenter={mapCenter}
        zoom={zoom}
      />

      <div className="py-4">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 style={{ fontWeight: 600, color: "var(--gray-700)" }}>
              Résultats : <span style={{ color: "var(--primary)" }}>{dataToShow.length}</span> établissement(s)
            </h6>
          </div>
          <div className="row g-3">
            {dataToShow.length === 0 && isNearMeActive ? (
               <div className="col-12 text-center py-4 text-muted">
                 Aucun établissement trouvé dans ce rayon (5km).
               </div>
            ) : (
              dataToShow.map(e => (
                <div className="col-md-4" key={e.id}>
                  <div className="card border-0 shadow-sm" style={{ borderRadius: 14, cursor: "pointer" }} onClick={() => props.openDetail(e)}>
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{e.nom}</h6>
                        <span className={`badge ${typeBadge[e.type]} rounded-pill`} style={{ fontSize: "0.7rem" }}>{typeLabels[e.type]}</span>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}><i className="bi bi-geo-alt-fill text-primary me-1" />{e.adresse}</div>
                      {e.distance && <div style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: 2 }}><i className="bi bi-signpost-2 me-1" />{Math.round(e.distance)} m</div>}
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <StarRating rating={e.rating} size="sm" />
                        <span className={`badge ${e.etat === "ouvert" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} rounded-pill`} style={{ fontSize: "0.7rem" }}>{e.etat}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}