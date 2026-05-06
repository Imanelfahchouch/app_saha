import React from 'react';
import { mockReviews } from '../data/mockData.js';
import { typeBg, typeBadge, typeIcons, typeLabels } from '../data/mockData.js';
import StarRating from './StarRating.js';

export default function DetailModal({ 
  show, setShow, selected, 
  isLoggedIn, setShowAuth, 
  userRating, setUserRating, 
  reviewText, setReviewText, 
  handleSubmitReview 
}) {
  // Si aucun établissement n'est sélectionné ou si la modale est fermée, on n'affiche rien
  if (!show || !selected) return null;

  return (
    <>
      {/* Backdrop (fond gris) */}
      <div className="modal-backdrop fade show" style={{ zIndex: 1040, pointerEvents: 'auto' }} onClick={() => setShow(false)} />
      
      {/* Contenu de la modale */}
      <div className="modal fade show" style={{ display: 'block', zIndex: 1050, pointerEvents: 'none' }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-saha" style={{ pointerEvents: 'auto' }}>
          <div className="modal-content">
            
            {/* En-tête */}
            <div className="modal-header">
              <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
            </div>
            
            <div className="modal-body-custom" style={{ paddingTop: 0 }}>
              
              {/* Image / Icône principale */}
              <div className={`modal-hero-img ${typeBg[selected.type]}`}>
                <i className={`bi ${typeIcons[selected.type]}`} />
              </div>
              
              {/* Titre et badges */}
              <h3 className="mb-1" style={{ fontWeight: 700, color: "var(--dark)" }}>{selected.nom}</h3>
              <span className={`badge rounded-pill ${typeBadge[selected.type]} mb-3`}>{typeLabels[selected.type]}</span>
              <span className={`badge rounded-pill ${selected.etat === "ouvert" ? "bg-success" : "bg-danger"} mb-3 ms-2`}>
                {selected.etat === "ouvert" ? "🟢 Ouvert" : "🔴 Fermé"}
              </span>

              {/* Informations (Adresse, Horaire, Tél, Note) */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="info-row">
                    <div className="info-icon"><i className="bi bi-geo-alt-fill" /></div>
                    <div>
                      <div className="info-label">Adresse</div>
                      <div className="info-value">{selected.adresse}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-row">
                    <div className="info-icon"><i className="bi bi-clock-fill" /></div>
                    <div>
                      <div className="info-label">Horaires</div>
                      <div className="info-value">{selected.horaire}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-row">
                    <div className="info-icon"><i className="bi bi-telephone-fill" /></div>
                    <div>
                      <div className="info-label">Téléphone</div>
                      <div className="info-value">{selected.telephone}</div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="info-row">
                    <div className="info-icon"><i className="bi bi-star-fill" style={{ color: "var(--gold)" }} /></div>
                    <div>
                      <div className="info-label">Note moyenne</div>
                      <div className="info-value">{selected.rating}/5 ({selected.reviews} avis)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section des Avis existants */}
              <h5 className="mb-3" style={{ fontWeight: 700 }}>
                <i className="bi bi-chat-square-text text-primary me-2" />Avis des utilisateurs
              </h5>
              <div style={{ maxHeight: 250, overflowY: "auto", paddingRight: 8 }} className="mb-4">
                {mockReviews.map((r) => (
                  <div key={r.id} className="review-card">
                    <div className="review-header">
                      <div className="d-flex align-items-center gap-2">
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.8rem" }}>
                          {r.user.charAt(0)}
                        </div>
                        <div>
                          <div className="reviewer-name">{r.user}</div>
                          <StarRating rating={r.rating} size="sm" />
                        </div>
                      </div>
                      <span className="review-date">{r.date}</span>
                    </div>
                    <div className="review-text">{r.text}</div>
                  </div>
                ))}
              </div>

              {/*  ZONE DE COMMENTAIRE (Ajouter un avis) */}
              {isLoggedIn ? (
                <div style={{ background: "var(--gray-100)", borderRadius: 12, padding: "1rem" }}>
                  <h6 style={{ fontWeight: 600, marginBottom: 8 }}>
                    <i className="bi bi-pencil-square text-primary me-2" />Ajouter votre avis
                  </h6>
                  
                  {/* Note par étoiles */}
                  <div className="mb-2">
                    <label className="form-label-custom mb-1">Votre note :</label>
                    <StarRating rating={userRating} interactive onChange={setUserRating} size="lg" />
                  </div>
                  
                  {/* Texte du commentaire */}
                  <textarea
                    className="form-control form-control-custom mb-2"
                    rows={3}
                    placeholder="Partagez votre expérience sur le service..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  />
                  
                  {/* Bouton valider */}
                  <button className="btn btn-submit" onClick={handleSubmitReview}>
                    <i className="bi bi-send me-2" />Publier l'avis
                  </button>
                </div>
              ) : (
                // Message si non connecté
                <div className="text-center py-3" style={{ background: "var(--gray-100)", borderRadius: 12 }}>
                  <p style={{ color: "var(--gray-500)", marginBottom: 8 }}>Connectez-vous pour laisser un avis</p>
                  <button className="btn btn-primary btn-sm rounded-pill px-4" onClick={() => { setShow(false); setShowAuth(true); }}>
                    <i className="bi bi-person-fill me-1" />Connexion
                  </button>
                </div>
              )}
              {/* FIN ZONE DE COMMENTAIRE */}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
