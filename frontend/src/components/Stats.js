import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; 

export default function Stats() {
  const [realStats, setRealStats] = useState({
    total: 0,
    pharmacies: 0,
    hopitaux: 0,
    cliniques: 0,
    verified_reviews: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("📡 Fetch des stats depuis le backend...");
    
    fetch('http://localhost:8000/api/stats')
      .then(res => {
        console.log("📥 Réponse reçue:", res.status);
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("✅ Stats reçues:", data);
        setRealStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Erreur fetch stats:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const fmt = (n) => {
    const num = parseInt(n) || 0;
    return num > 0 ? `${num.toLocaleString()}+` : '0';
  };

  const stats = [
    { icon: "bi-building",    num: fmt(realStats.total),                      label: "Établissements",      bg: "var(--primary)" },
    { icon: "bi-capsule",     num: fmt(realStats.pharmacies),                 label: "Pharmacies",          bg: "var(--success-green)" },
    { icon: "bi-hospital",    num: fmt((realStats.hopitaux || 0) + (realStats.cliniques || 0)), label: "Hôpitaux & Cliniques", bg: "var(--danger-red)" },
    { icon: "bi-star-fill",   num: fmt(realStats.verified_reviews),           label: "Avis vérifiés",       bg: "var(--warning-orange)" }
  ];

  if (loading) {
    return (
      <section className="py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2 text-muted">Chargement des statistiques...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-5">
        <div className="container">
          <div className="alert alert-danger text-center">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Erreur de chargement: {error}
            <br />
            <small>Vérifie que le backend tourne sur http://localhost:8000</small>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5">
      <div className="container">
        <div className="row g-4">
          {stats.map((s, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ delay: i * 0.1 }} 
                viewport={{ once: true }}
              >
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: s.bg }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <div className="stat-number">{s.num}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}