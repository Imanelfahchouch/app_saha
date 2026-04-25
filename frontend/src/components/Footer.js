import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-saha">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4"><h4 className="brand-logo mb-3" style={{ fontSize: "1.6rem" }}>SA<span>HA</span></h4><p style={{ fontSize: "0.9rem", lineHeight: 1.7, maxWidth: 300 }}>Plateforme de géolocalisation des établissements de santé au Maroc. Trouvez pharmacies, cliniques et hôpitaux près de chez vous.</p><div className="d-flex gap-2 mt-3">{["facebook", "twitter", "instagram", "linkedin"].map(s => <a key={s} href="#" className="btn btn-sm rounded-circle" style={{ width: 36, height: 36, background: "rgba(255,255,255,0.1)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><i className={`bi bi-${s}`} /></a>)}</div></div>
          <div className="col-lg-2 col-6"><h6 className="footer-title">Navigation</h6><a href="#" className="footer-link">Accueil</a><a href="#" className="footer-link">Carte</a><a href="#" className="footer-link">Établissements</a><a href="#" className="footer-link">Contributions</a></div>
          <div className="col-lg-2 col-6"><h6 className="footer-title">Types</h6><a href="#" className="footer-link">Pharmacies</a><a href="#" className="footer-link">Cliniques</a><a href="#" className="footer-link">Hôpitaux</a><a href="#" className="footer-link">Laboratoires</a></div>
          <div className="col-lg-4"><h6 className="footer-title">Contact</h6><div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: "0.9rem" }}><i className="bi bi-geo-alt-fill text-primary" /> Casablanca, Maroc</div><div className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: "0.9rem" }}><i className="bi bi-envelope-fill text-primary" /> contact@saha.ma</div><div className="d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}><i className="bi bi-telephone-fill text-primary" /> +212 522-000000</div></div>
        </div>
        <div className="footer-bottom"><p className="mb-0">© 2026 SAHA. Tous droits réservés. Projet PFE — Développement d'une plateforme de géolocalisation des établissements de santé au Maroc.</p></div>
      </div>
    </footer>
  );
}