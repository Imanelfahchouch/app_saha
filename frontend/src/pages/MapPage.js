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
        if (props.setFilteredEtablissements) {
          props.setFilteredEtablissements(data);
        }
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

        let { latitude, longitude, accuracy } = pos.coords;

        const posText = `📍 Ta position : ${latitude.toFixed(5)}, ${longitude.toFixed(5)} (±${Math.round(accuracy)}m)`;
        console.log(posText);

        if (props.showToast) {
          props.showToast(posText, "info");
        }

        if (accuracy > 5000) {
          console.log("⚠️ Position PC imprécise → Correction Taza");
          latitude = 34.2133;
          longitude = -4.0100;
        }

        const userPos = { lat: latitude, lng: longitude };

        setUserLocation(userPos);
        setMapCenter(userPos);
        setZoom(14);

        try {
          const res = await fetch(
            `http://localhost:8000/api/etablissements/nearby?lat=${latitude}&lng=${longitude}&radius=5000`
          );

          if (!res.ok) throw new Error('Erreur API');

          const data = await res.json();

          console.log(`✅ ${data.length} établissement(s) trouvé(s) autour de toi`);

          setNearbyEstablishments(data);

          if (props.setFilteredEtablissements) {
            props.setFilteredEtablissements(data);
          }

          if (props.showToast) {
            props.showToast(`✅ ${data.length} établissement(s) proche(s)`, "success");
          }

        } catch (err) {
          console.error(err);

          setNearMeError('Impossible de charger les établissements proches');

          if (props.showToast) {
            props.showToast("Erreur chargement", "error");
          }

        } finally {
          setNearMeLoading(false);
        }
      },
      (err) => {
        setNearMeError(err.code === 1 ? 'Accès refusé' : 'Position introuvable');
        setNearMeLoading(false);
        setIsNearMeActive(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [props.setFilteredEtablissements, props.showToast]);

  const handleResetNearMe = () => {
    setIsNearMeActive(false);
    setUserLocation(null);
    setNearMeError(null);

    setMapCenter({ lat: 33.5731, lng: -7.5898 });
    setZoom(6);

    fetch('http://localhost:8000/api/etablissements')
      .then(res => res.json())
      .then(data => {
        setAllEstablishments(data);

        if (props.setFilteredEtablissements) {
          props.setFilteredEtablissements(data);
        }
      });
  };

  // ✅ Géocodage ville (Nominatim)
  const handleCitySearchOSM = async (cityName) => {
    if (!cityName.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName + ', Maroc')}&limit=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );

      const data = await response.json();

      if (data?.[0]?.lat && data?.[0]?.lon) {
        setMapCenter({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });

        setZoom(13);
      }

    } catch (err) {
      console.error('❌ Erreur géocodage:', err);
    }
  };

  const dataToShow = isNearMeActive
    ? nearbyEstablishments
    : allEstablishments;

  // ✅ Zoom auto sur résultats
  useEffect(() => {
    if (dataToShow?.[0]) {
      setMapCenter({
        lat: dataToShow[0].latitude,
        lng: dataToShow[0].longitude
      });

      setZoom(
        dataToShow.length === 1
          ? 16
          : dataToShow.length <= 5
          ? 14
          : 13
      );
    }
  }, [
    dataToShow,
    props.activeFilters,
    props.searchQuery,
    props.activeStatusFilter
  ]);

  // ✅ Recherche ville via texte
  useEffect(() => {
    const villes = [
      'rabat',
      'casablanca',
      'fes',
      'marrakech',
      'tanger',
      'agadir',
      'meknes',
      'oujda',
      'taza'
    ];

    const query = props.searchQuery?.toLowerCase().trim();

    if (query && villes.some(v => query.includes(v))) {
      handleCitySearchOSM(
        villes.find(v => query.includes(v))
      );
    }
  }, [props.searchQuery]);

  return (
    <>
      <div className="py-4" style={{ background: "#fff" }}>
        <div className="container">
          <h3 className="section-title mb-4">
            <i className="bi bi-map-fill text-primary me-2" />
            Carte Interactive
          </h3>

          <div
            className="search-container"
            style={{ marginTop: 0, marginBottom: "1.5rem" }}
          >
            <div className="row g-3 align-items-center">

              <div className="col-lg-5">
                <div className="position-relative">
                  <i
                    className="bi bi-search position-absolute"
                    style={{
                      left: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--gray-500)",
                      fontSize: "1.1rem"
                    }}
                  />

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
                  value={props.activeStatusFilter}
                  onChange={e => props.setActiveStatusFilter(e.target.value)}
                >
                  <option value="all">🕐 Tous</option>
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
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Localisation...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-crosshair me-2" />
                      Near Me
                    </>
                  )}
                </button>
              </div>

              <div className="col-lg-2">
                <button
                  className="btn-search w-100"
                  onClick={() => props.setSearchQuery('')}
                >
                  <i className="bi bi-x-circle me-2" />
                  Effacer
                </button>
              </div>

            </div>

            <div className="filter-pills">
              {["pharmacie", "clinique", "hopital"].map(type => (
                <button
                  key={type}
                  className={`filter-pill ${props.activeFilters.includes(type) ? "active" : ""}`}
                  onClick={() => props.handleFilterToggle(type)}
                >
                  <i className={`bi ${typeIcons[type]} me-1`} />
                  {typeLabels[type]}
                </button>
              ))}
            </div>

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
              <div
                className="alert alert-danger mt-2 py-2"
                style={{ fontSize: "0.85rem", marginBottom: 0 }}
              >
                <i className="bi bi-exclamation-triangle me-2" />
                {nearMeError}
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
              Résultats :
              <span style={{ color: "var(--primary)" }}>
                {" "}{dataToShow.length}
              </span>{" "}
              établissement(s)
            </h6>

            <button
              className="btn btn-sm btn-outline-primary rounded-pill"
              onClick={() => props.setCurrentPage("list")}
            >
              Voir en liste
              <i className="bi bi-list-ul ms-1" />
            </button>
          </div>

          <div className="row g-3">

            {dataToShow.length === 0 && isNearMeActive ? (
              <div className="col-12 text-center py-4 text-muted">
                Aucun établissement trouvé dans ce rayon (5km).
              </div>
            ) : (
              dataToShow.map(e => (
                <div className="col-md-4" key={e.id}>
                  <div
                    className="card border-0 shadow-sm"
                    style={{ borderRadius: 14, cursor: "pointer" }}
                    onClick={() => props.openDetail(e)}
                  >
                    <div className="card-body p-3">

                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6
                          style={{
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            margin: 0
                          }}
                        >
                          {e.nom}
                        </h6>

                        <span
                          className={`badge ${typeBadge[e.type]} rounded-pill`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {typeLabels[e.type]}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--gray-500)"
                        }}
                      >
                        <i className="bi bi-geo-alt-fill text-primary me-1" />
                        {e.adresse}
                      </div>

                      {e.distance && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--primary)",
                            marginTop: 2
                          }}
                        >
                          <i className="bi bi-signpost-2 me-1" />
                          {Math.round(e.distance)} m
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <StarRating rating={e.rating} size="sm" />

                        <span
                          className={`badge ${
                            e.etat === "ouvert"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          } rounded-pill`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {e.etat}
                        </span>
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