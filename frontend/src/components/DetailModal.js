import React, { useState, useEffect } from 'react';
import StarRating from './StarRating.js';
import { typeBg, typeBadge, typeIcons, typeLabels } from '../data/mockData.js';

export default function DetailModal({ 
  show, setShow, selectedId, isLoggedIn, setShowAuth, userId, showToast, onReviewPosted 
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (show && selectedId) {
      setLoading(true);
      fetch(`http://localhost:8000/api/etablissements/${selectedId}`)
        .then(res => res.json())
        .then(d => { 
          console.log("✅ Données API:", d);
          setData(d); 
          setLoading(false); 
        })
        .catch(err => { console.error("❌ Erreur:", err); setLoading(false); });
    }
  }, [show, selectedId]);

  useEffect(() => {
    if (!show) { setData(null); setUserRating(0); setReviewText(""); }
  }, [show]);

  const handleSubmitReview = () => {
    if (userRating === 0) return showToast("Veuillez donner une note ⭐", "error");
    if (!reviewText.trim()) return showToast("Veuillez écrire un commentaire", "error");
    setSubmitting(true);
    fetch('http://localhost:8000/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etab_id: selectedId, rating: userRating, comment: reviewText })
    })
    .then(res => res.json())
    .then(() => {
      showToast("✅ Avis publié !", "success");
      setUserRating(0); setReviewText("");
      if (onReviewPosted) onReviewPosted();
      return fetch(`http://localhost:8000/api/etablissements/${selectedId}`);
    })
    .then(res => res.json()).then(setData)
    .finally(() => setSubmitting(false));
  };

  if (!show || !selectedId || loading || !data) return null;

  // ✅ SIMPLIFICATION MAXIMALE : on utilise data.X directement dans le JSX
  const type = data.type || 'hopital';

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={() => setShow(false)} />
      <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header border-0">
              <button className="btn-close" onClick={() => setShow(false)} />
            </div>
            <div className="modal-body pt-0" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
              
              {/* Hero */}
              <div className={`text-center py-4 rounded-3 ${typeBg[type] || 'bg-primary'} mb-4`}>
                <i className={`bi ${typeIcons[type] || 'bi-hospital'} display-4 text-white`} />
              </div>
              
              {/* Titre */}
              <h3 className="fw-bold mb-2">{data.nom}</h3>
              <span className={`badge rounded-pill ${typeBadge[type] || 'bg-secondary'} mb-3`}>
                {typeLabels[type] || type}
              </span>

              {/* ✅ INFOS - Utilisation DIRECTE de data.phone, data.hours, etc. */}
              <div className="row g-3 mb-4">
                
                {/* Adresse */}
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-geo-alt-fill text-primary fs-5 mb-2 d-block" />
                    <small className="text-muted d-block">Adresse</small>
                    <strong className="small">{data.adresse || 'Non renseignée'}</strong>
                  </div>
                </div>
                
                {/* ✅ Horaires - data.hours DIRECTEMENT */}
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-clock-fill text-warning fs-5 mb-2 d-block" />
                    <small className="text-muted d-block">Horaires</small>
                    <strong className="small">
                      {data.hours && data.hours.trim() ? data.hours : 'Non renseignés'}
                    </strong>
                  </div>
                </div>
                
                {/* ✅ Téléphone - data.phone DIRECTEMENT + lien cliquable */}
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-telephone-fill text-success fs-5 mb-2 d-block" />
                    <small className="text-muted d-block">Téléphone</small>
                    {data.phone && data.phone.trim() ? (
                      <a href={`tel:${data.phone}`} className="small text-decoration-none fw-bold">
                        {data.phone}
                      </a>
                    ) : (
                      <span className="small text-muted">Non renseigné</span>
                    )}
                  </div>
                </div>
                
                {/* ✅ Site web - data.website DIRECTEMENT */}
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <i className="bi bi-globe text-info fs-5 mb-2 d-block" />
                    <small className="text-muted d-block">Site web</small>
                    {data.website && data.website.trim() && data.website !== '#' ? (
                      <a href={data.website} target="_blank" rel="noopener" className="small text-decoration-none fw-bold text-truncate d-block">
                        {data.website.replace('https://www.', '').replace('http://', '')}
                      </a>
                    ) : (
                      <span className="small text-muted">Non renseigné</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="d-flex align-items-center mb-4 p-3 bg-primary bg-opacity-10 rounded-3">
                <div>
                  <div className="fw-bold fs-5">{(data.rating || 0) > 0 ? data.rating : 'Pas encore'}/5</div>
                  <StarRating rating={(data.rating || 0) > 0 ? data.rating : 0} size="sm" />
                  <small className="text-muted">{data.reviews_count || 0} avis</small>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h5 className="fw-bold mb-2">À propos</h5>
                <p className="text-muted small">{data.description || 'Aucune description disponible.'}</p>
              </div>

              {/* Avis */}
              <h5 className="fw-bold mb-3">
                <i className="bi bi-chat-square-text text-primary me-2" />Avis des utilisateurs
              </h5>
              <div className="mb-4">
                {(!data.recent_reviews || data.recent_reviews.length === 0) ? (
                  <p className="text-muted small">Aucun avis pour le moment.</p>
                ) : (
                  data.recent_reviews.map(rev => (
                    <div key={rev.id} className="card mb-2 border-0 shadow-sm">
                      <div className="card-body py-2 px-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <strong className="small">{rev.user}</strong>
                            <StarRating rating={rev.rating} size="xs" />
                          </div>
                          <small className="text-muted">{rev.date}</small>
                        </div>
                        <p className="small mb-0 mt-1 text-secondary">{rev.comment}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Formulaire avis */}
              {isLoggedIn ? (
                <div className="bg-light p-3 rounded-3">
                  <h6 className="fw-bold mb-2">Partager votre expérience</h6>
                  <div className="mb-2">
                    <label className="small text-muted mb-1 d-block">Votre note :</label>
                    <StarRating rating={userRating} interactive onChange={setUserRating} size="lg" />
                  </div>
                  <textarea className="form-control form-control-sm mb-2" rows={2} placeholder="Décrivez votre visite..." value={reviewText} onChange={e => setReviewText(e.target.value)} disabled={submitting} />
                  <button className="btn btn-primary btn-sm w-100" onClick={handleSubmitReview} disabled={submitting || userRating === 0}>
                    {submitting ? 'Publication...' : 'Publier'}
                  </button>
                </div>
              ) : (
                <div className="text-center p-3 bg-light rounded-3">
                  <p className="small text-muted mb-2">Connectez-vous pour laisser un avis</p>
                  <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={() => { setShow(false); setShowAuth(true); }}>
                    <i className="bi bi-person me-1" /> Se connecter
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}