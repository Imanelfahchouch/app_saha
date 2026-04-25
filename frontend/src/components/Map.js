import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { typeIcons, typeLabels, typeMarker } from '../data/mockData.js';

export default function Map({ mapRef, filteredEtablissements, getMarkerPosition, hoveredMarker, setHoveredMarker, openDetail }) {
  return (
    <section className="py-4" style={{ background: "#fff" }}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="section-title mb-0"><i className="bi bi-map-fill text-primary me-2" />Carte Interactive</h3>
          <div className="d-flex gap-2 align-items-center">{["pharmacie", "clinique", "hopital"].map(t => <span key={t} className="d-flex align-items-center gap-1" style={{ fontSize: "0.75rem", color: "var(--gray-700)" }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: { pharmacie: "var(--success-green)", clinique: "var(--primary)", hopital: "var(--danger-red)" }[t] }} />{typeLabels[t]}</span>)}</div>
        </div>
        <div className="map-container" ref={mapRef}>
          <div className="map-grid" />
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}><line x1="0" y1="40%" x2="100%" y2="40%" stroke="rgba(0,119,182,0.1)" strokeWidth="2" /><line x1="30%" y1="0" x2="30%" y2="100%" stroke="rgba(0,119,182,0.1)" strokeWidth="2" /><line x1="60%" y1="0" x2="60%" y2="100%" stroke="rgba(0,119,182,0.1)" strokeWidth="2" /><line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(0,119,182,0.1)" strokeWidth="2" /><line x1="0" y1="20%" x2="100%" y2="60%" stroke="rgba(0,119,182,0.05)" strokeWidth="1" /><line x1="100%" y1="20%" x2="0" y2="60%" stroke="rgba(0,119,182,0.05)" strokeWidth="1" /></svg>
          {filteredEtablissements.map(e => {
            const pos = getMarkerPosition(e);
            return <motion.div key={e.id} className={`map-marker ${typeMarker[e.type]}`} style={{ left: pos.x, top: pos.y }} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: Math.random() * 0.5, type: "spring" }} onClick={() => openDetail(e)} onMouseEnter={() => setHoveredMarker(e.id)} onMouseLeave={() => setHoveredMarker(null)}><div className="marker-pulse" /><i className={`bi ${typeIcons[e.type]} marker-icon`} /></motion.div>;
          })}
          <AnimatePresence>
            {hoveredMarker && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ position: "absolute", left: Math.min(getMarkerPosition(filteredEtablissements.find(e => e.id === hoveredMarker)).x, 700), top: getMarkerPosition(filteredEtablissements.find(e => e.id === hoveredMarker)).y - 60, background: "#fff", borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", zIndex: 30, minWidth: 180 }}><div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--dark)" }}>{filteredEtablissements.find(e => e.id === hoveredMarker)?.nom}</div><div style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}>{filteredEtablissements.find(e => e.id === hoveredMarker)?.adresse}</div></motion.div>}
          </AnimatePresence>
          <div style={{ position: "absolute", bottom: 15, right: 15, display: "flex", flexDirection: "column", gap: 6, zIndex: 10 }}><button className="btn btn-light btn-sm shadow-sm" style={{ width: 36, height: 36, borderRadius: 8, fontSize: "1.1rem" }}>+</button><button className="btn btn-light btn-sm shadow-sm" style={{ width: 36, height: 36, borderRadius: 8, fontSize: "1.1rem" }}>−</button></div>
          <div style={{ position: "absolute", bottom: 15, left: 15, zIndex: 10 }}><span style={{ background: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: "0.7rem", color: "var(--gray-500)", boxShadow: "var(--shadow-sm)" }}><i className="bi bi-geo-alt-fill text-danger me-1" />Maroc — {filteredEtablissements.length} résultats</span></div>
        </div>
      </div>
    </section>
  );
}