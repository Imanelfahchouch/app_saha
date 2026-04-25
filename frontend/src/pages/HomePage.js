import React from 'react';
import Hero from '../components/Hero.js';
import Stats from '../components/Stats.js';
import Map from '../components/Map.js';
import EstablishmentCard from '../components/EstablishmentCard.js';

export default function HomePage(props) {
  return (
    <>
      <Hero {...props} />
      <Stats />
      <Map {...props} />
      <section className="py-5"><div className="container"><div className="d-flex justify-content-between align-items-center mb-4"><h3 className="section-title mb-0"><i className="bi bi-list-ul text-primary me-2" />Établissements <span style={{ color: "var(--gray-500)", fontWeight: 400, fontSize: "0.9em" }}>({props.filteredEtablissements.length})</span></h3></div>
      <div className="row g-4">{props.filteredEtablissements.map(e => <div className="col-md-6 col-lg-4 col-xl-3" key={e.id}><EstablishmentCard e={e} openDetail={props.openDetail} /></div>)}</div></div></section>
    </>
  );
}