import React from 'react';
import { motion } from 'framer-motion';
import { typeBg, typeBadge, typeIcons, typeLabels } from '../data/mockData.js';
import StarRating from './StarRating.js';

export default function EstablishmentCard({ e, openDetail }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} viewport={{ once: true }} className="establishment-card">
      <div className="card-img-wrapper">
        <div className={`card-img-placeholder ${typeBg[e.type]}`}><i className={`bi ${typeIcons[e.type]}`} /></div>
        <span className={`card-type-badge ${typeBadge[e.type]}`}>{typeLabels[e.type]}</span>
        <span className={`card-status ${e.etat === "ouvert" ? "status-ouvert" : "status-ferme"}`}><i className="bi bi-circle-fill me-1" style={{ fontSize: 6 }} />{e.etat === "ouvert" ? "Ouvert" : "Fermé"}</span>
      </div>
      <div className="card-body-custom">
        <h5 className="card-title-custom">{e.nom}</h5>
        <div className="card-address"><i className="bi bi-geo-alt-fill text-primary me-1" />{e.adresse}</div>
        <div className="star-rating"><StarRating rating={e.rating} size="sm" /><span className="rating-text">({e.reviews} avis)</span></div>
        <div style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}><i className="bi bi-clock me-1" />{e.horaire}</div>
      </div>
      <div className="card-footer-custom">
        <span style={{ fontSize: "0.75rem", color: "var(--gray-500)" }}><i className="bi bi-telephone me-1" />{e.telephone}</span>
        <button className="btn-details" onClick={() => openDetail(e)}>Voir détails <i className="bi bi-arrow-right ms-1" /></button>
      </div>
    </motion.div>
  );
}