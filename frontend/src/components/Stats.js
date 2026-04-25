import React from 'react';
import { motion } from 'framer-motion';

export default function Stats() {
  const stats = [{ icon: "bi-building", num: "2,450+", label: "Établissements", bg: "var(--primary)" }, { icon: "bi-capsule", num: "1,200+", label: "Pharmacies", bg: "var(--success-green)" }, { icon: "bi-hospital", num: "380+", label: "Hôpitaux & Cliniques", bg: "var(--danger-red)" }, { icon: "bi-star-fill", num: "12K+", label: "Avis vérifiés", bg: "var(--warning-orange)" }];
  return (
    <section className="py-5"><div className="container"><div className="row g-4">
      {stats.map((s, i) => <div className="col-6 col-lg-3" key={i}><motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}><div className="stat-card"><div className="stat-icon" style={{ background: s.bg }}><i className={`bi ${s.icon}`} /></div><div className="stat-number">{s.num}</div><div className="stat-label">{s.label}</div></div></motion.div></div>)}
    </div></div></section>
  );
}