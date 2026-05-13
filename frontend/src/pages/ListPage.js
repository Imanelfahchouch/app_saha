import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { typeBg, typeBadge, typeIcons, typeLabels } from '../data/mockData.js';
import StarRating from '../components/StarRating.js';

export default function ListPage({ 
  allEtablissements,
  activeFilters, 
  setActiveFilters,
  activeStatusFilter, 
  setActiveStatusFilter,
  handleFilterToggle,
  openDetail,
  setCurrentPage,
  onGoToMap
}) {
  const [listSearchQuery, setListSearchQuery] = useState('');

  const filteredForList = useMemo(() => {
    return (allEtablissements || []).filter(e => {
      const matchSearch = !listSearchQuery.trim() || 
        e.nom.toLowerCase().includes(listSearchQuery.toLowerCase()) || 
        e.adresse.toLowerCase().includes(listSearchQuery.toLowerCase());
      const matchType = activeFilters?.length === 0 || activeFilters?.includes(e.type);
      const matchStatus = !activeStatusFilter || activeStatusFilter === 'all' || e.etat === activeStatusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [allEtablissements, listSearchQuery, activeFilters, activeStatusFilter]);

  return (
    <>
      <div className="py-4" style={{ background: "#fff" }}>
        <div className="container">
          <h3 className="section-title mb-0">
            <i className="bi bi-list-ul text-primary me-2" />Tous les Établissements
          </h3>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          
          <div className="col-lg-3">
            <div className="card border-0 shadow-sm" style={{ borderRadius: 16, position: "sticky", top: 100 }}>
              <div className="card-body p-4">
                <h6 style={{ fontWeight: 700, marginBottom: "1rem" }}>
                  <i className="bi bi-funnel me-2 text-primary" />Filtres
                </h6>
                
                <div className="mb-3">
                  <label className="form-label-custom">Recherche</label>
                  <input 
                    type="text" 
                    className="form-control-custom" 
                    placeholder="Nom, ville..." 
                    value={listSearchQuery} 
                    onChange={e => setListSearchQuery(e.target.value)} 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label-custom">Type</label>
                  <div className="d-flex flex-column gap-2">
                    {["pharmacie", "clinique", "hopital"].map(t => (
                      <label key={t} className="d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          checked={activeFilters?.includes(t)} 
                          onChange={() => handleFilterToggle?.(t)} 
                        />
                        <i className={`bi ${typeIcons[t]}`} />
                        <span style={{ fontSize: "0.9rem" }}>{typeLabels[t]}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label-custom">Statut</label>
                  <select 
                    className="form-control-custom" 
                    value={activeStatusFilter || 'all'} 
                    onChange={e => setActiveStatusFilter?.(e.target.value)}
                  >
                    <option value="all">Tous</option>
                    <option value="ouvert">Ouvert</option>
                    <option value="ferme">Fermé</option>
                  </select>
                </div>
                
                <button 
                  className="btn btn-outline-secondary w-100 btn-sm rounded-pill" 
                  onClick={() => { 
                    setListSearchQuery(""); 
                    setActiveFilters?.([]); 
                    setActiveStatusFilter?.("all"); 
                  }}
                >
                  <i className="bi bi-arrow-counterclockwise me-1" />Réinitialiser
                </button>
              </div>
            </div>
          </div>

          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>{filteredForList.length} résultat(s)</span>
            </div>
            
            {filteredForList.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search" style={{ fontSize: "3rem", color: "var(--gray-300)" }} />
                <h5 className="mt-3" style={{ color: "var(--gray-500)" }}>Aucun résultat</h5>
              </div>
            ) : (
              <div className="row g-3">
                {filteredForList.map((e, i) => (
                  <div className="col-md-6" key={e.id}>
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: "hidden", height: "100%" }}>
                        <div className="card-body p-3">
                          <div className="d-flex gap-3">
                            <div className={`d-flex align-items-center justify-content-center ${typeBg[e.type]}`} style={{ width: 60, height: 60, borderRadius: 12, flexShrink: 0 }}>
                              <i className={`bi ${typeIcons[e.type]}`} style={{ fontSize: "1.5rem", color: "#fff" }} />
                            </div>
                            <div className="flex-grow-1">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 style={{ fontWeight: 700, fontSize: "0.95rem", margin: 0 }}>{e.nom}</h6>
                                <span className={`badge ${e.etat === "ouvert" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} rounded-pill`} style={{ fontSize: "0.65rem" }}>{e.etat}</span>
                              </div>
                              <span className={`badge ${typeBadge[e.type]} rounded-pill mb-1`} style={{ fontSize: "0.65rem" }}>{typeLabels[e.type]}</span>
                              <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}><i className="bi bi-geo-alt-fill text-primary me-1" />{e.adresse}</div>
                              
                              <div className="d-flex justify-content-between align-items-center mt-2">
                                <StarRating rating={e.rating} size="sm" />
                                {/* ✅ BOUTON DÉTAILS UNIQUEMENT */}
                                <button className="btn btn-primary btn-sm rounded-pill" onClick={() => openDetail?.(e)}>
                                  Détails
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}