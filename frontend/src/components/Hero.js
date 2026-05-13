import React from 'react';
import { motion } from 'framer-motion';
import { typeIcons, typeLabels } from '../data/mockData.js';

export default function Hero({ 
  searchQuery, setSearchQuery, 
  activeStatusFilter, setActiveStatusFilter, 
  activeFilters, handleFilterToggle, 
  handleNearMe, geoLoading, 
  setCurrentPage, 
  showNearMe = true 
}) {
  return (
    <section className="hero-section">
      <div className="container position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center">
          <div className="col-lg-7">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="badge rounded-pill mb-3 px-3 py-2" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontWeight: 500, fontSize: "0.85rem" }}>
                <i className="bi bi-geo-alt-fill me-1" /> Plateforme de santé au Maroc
              </span>
              <h1 className="hero-title mb-3">
                Trouvez votre<br />établissement de<br />santé <span style={{ color: "var(--gold)" }}>rapidement</span>
              </h1>
              <p className="hero-subtitle mb-4">
                Pharmacies, cliniques et hôpitaux — localisez, comparez et contribuez à améliorer l'accès aux soins au Maroc.
              </p>
            </motion.div>
          </div>
          <div className="col-lg-5 d-none d-lg-block">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <svg width="320" height="280" viewBox="0 0 320 280" fill="none">
                  <rect x="40" y="40" width="240" height="200" rx="16" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <rect x="60" y="60" width="200" height="160" rx="8" fill="rgba(255,255,255,0.08)" />
                  <circle cx="120" cy="120" r="20" fill="var(--success-green)" opacity="0.8" />
                  <circle cx="200" cy="100" r="16" fill="var(--primary)" opacity="0.8" />
                  <circle cx="160" cy="170" r="18" fill="var(--danger-red)" opacity="0.8" />
                  <circle cx="230" cy="160" r="14" fill="var(--warning-orange)" opacity="0.8" />
                  <circle cx="90" cy="170" r="12" fill="var(--primary-light)" opacity="0.8" />
                  <path d="M120 120 L200 100 L160 170 Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
                  <circle cx="160" cy="140" r="6" fill="#fff" />
                  <line x1="160" y1="146" x2="160" y2="180" stroke="#fff" strokeWidth="2" />
                </svg>
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <div className="search-container">
            <div className="row g-3 align-items-center">
              
              {/* 🔍 Champ de recherche : toujours 6 colonnes */}
              <div className="col-lg-6">
                <div className="position-relative">
                  <i className="bi bi-search position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)", fontSize: "1.1rem" }} />
                  <input type="text" className="search-input-custom" style={{ paddingLeft: 44 }} placeholder="Rechercher par nom ou ville..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {/* 🕐 Filtre Statut : prend l'espace restant (4 ou 6 colonnes) */}
              <div className={`col-lg-${showNearMe ? 4 : 6}`}>
                <select className="search-input-custom w-100" style={{ cursor: "pointer" }} value={activeStatusFilter} onChange={e => setActiveStatusFilter(e.target.value)}>
                  <option value="all">🕐 Tous les statuts</option>
                  <option value="ouvert">🟢 Ouvert</option>
                  <option value="ferme">🔴 Fermé</option>
                </select>
              </div>

              {/* 📍 Bouton Near Me : conditionnel, 2 colonnes si affiché */}
              {showNearMe && (
                <div className="col-lg-2">
                  <button className="btn-near-me w-100" onClick={handleNearMe} disabled={geoLoading}>
                    {geoLoading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />...</>
                    ) : (
                      <><i className="bi bi-crosshair me-2" />Near Me</>
                    )}
                  </button>
                </div>
              )}

            </div>

            {/* Filtres par type (en dessous) */}
            <div className="filter-pills">
              <span style={{ fontSize: "0.8rem", color: "var(--gray-500)", fontWeight: 500, marginRight: 4 }}>
                <i className="bi bi-funnel me-1" />Filtres :
              </span>
              {["pharmacie", "clinique", "hopital"].map(type => (
                <button 
                  key={type} 
                  className={`filter-pill ${activeFilters.includes(type) ? "active" : ""}`} 
                  onClick={() => handleFilterToggle(type)}
                >
                  <i className={`bi ${typeIcons[type]} me-1`} />{typeLabels[type]}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}