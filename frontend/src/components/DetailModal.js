import React from 'react';
import { mockReviews } from '../data/mockData.js';
import { typeBg, typeBadge, typeIcons, typeLabels } from '../data/mockData.js';
import StarRating from './StarRating.js';

export default function DetailModal({ show, setShow, selected, isLoggedIn, setShowAuth, userRating, setUserRating, reviewText, setReviewText, handleSubmitReview }) {
  if (!selected) return null;
  return (
    <div className={`modal fade ${show ? "show" : ""}`} style={{ display: show ? "block" : "none" }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-saha">
        <div className="modal-content">
          <div className="modal-header"><button type="button" className="btn-close" onClick={() => setShow(false)} /></div>
          <div className="modal-body-custom" style={{ paddingTop: 0 }}>
            <div className={`modal-hero-img ${typeBg[selected.type]}`}><i className={`bi ${typeIcons[selected.type]}`} /></div>
            <h3 className="mb-1" style={{ fontWeight: 700, color: "var(--dark)" }}>{selected.nom}</h3>
            <span className={`badge rounded-pill ${typeBadge[selected.type]} mb-3`}>{typeLabels[selected.type]}</span>
            <span className={`badge rounded-pill ${selected.etat === "ouvert" ? "bg-success" : "bg-danger"} mb-3 ms-2`}>{selected.etat === "ouvert" ? "🟢 Ouvert" : "🔴 Fermé"}</span>
            <div className="row g-3 mb-4">
              {[{ icon: "bi-geo-alt-fill", label: "Adresse", val: selected.adresse }, { icon: "bi-clock-fill", label: "Horaires", val: selected.horaire }, { icon: "bi-telephone-fill", label: "Téléphone", val: selected.telephone }, { icon: "bi-star-fill", label: "Note", val: `${selected.rating}/5 (${selected.reviews} avis)`, extra: { color: "var(--gold)" } }].map((r, i) => <div className="col-md-6" key={i}><div className="info-row"><div className="info-icon"><i className={`bi ${r.icon}`} style={r.extra || {}} /></div><div><div className="info-label">{r.label}</div><div className="info-value">{r.val}</div></div></div></div>)}
            </div>
            <h5 className="mb-3" style={{ fontWeight: 700 }}><i className="bi bi-chat-square-text text-primary me-2" />Avis des utilisateurs</h5>
            <div style={{ maxHeight: 250, overflowY: "auto", paddingRight: 8 }} className="mb-4">
              {mockReviews.map(r => <div key={r.id} className="review-card"><div className="review-header"><div className="d-flex align-items-center gap-2"><div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.8rem" }}>{r.user.charAt(0)}</div><div><div className="reviewer-name">{r.user}</div><StarRating rating={r.rating} size="sm" /></div></div><span className="review-date">{r.date}</span></div><div className="review-text">{r.text}</div></div>)}
            </div>
            {isLoggedIn ? (
              <div style={{ background: "var(--gray-100)", borderRadius: 12, padding: "1rem" }}>
                <h6 style={{ fontWeight: 600, marginBottom: 8 }}><i className="bi bi-pencil-square text-primary me-2" />Ajouter un avis</h6>
                <div className="mb-2"><StarRating rating={userRating} interactive onChange={setUserRating} size="lg" /></div>
                <textarea className="form-control form-control-custom mb-2" rows={2} placeholder="Partagez votre expérience..." value={reviewText} onChange={e => setReviewText(e.target.value)} />
                <button className="btn btn-submit" onClick={handleSubmitReview}><i className="bi bi-send me-2" />Publier l'avis</button>
              </div>
            ) : <div className="text-center py-3" style={{ background: "var(--gray-100)", borderRadius: 12 }}><p style={{ color: "var(--gray-500)", marginBottom: 8 }}>Connectez-vous pour laisser un avis</p><button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => { setShow(false); setShowAuth(true); }}><i className="bi bi-person-fill me-1" />Connexion</button></div>}
          </div>
        </div>
      </div>
      {show && <div className="modal-backdrop fade show" onClick={() => setShow(false)} />}
    </div>
  );
}