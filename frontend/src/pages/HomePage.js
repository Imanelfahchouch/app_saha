import React, { useState, useMemo } from 'react';
import Hero from '../components/Hero.js';
import Stats from '../components/Stats.js';
import EstablishmentCard from '../components/EstablishmentCard.js';

export default function HomePage(props) {
  // ✅ État de recherche LOCAL à l'accueil (n'affecte PAS les autres pages)
  const [homeSearchQuery, setHomeSearchQuery] = useState('');

  // ✅ Filtrage LOCAL pour l'accueil uniquement
  const filteredForHome = useMemo(() => {
    return (props.allEtablissements || []).filter(e => {
      const matchSearch = !homeSearchQuery.trim() || 
        e.nom.toLowerCase().includes(homeSearchQuery.toLowerCase()) || 
        e.adresse.toLowerCase().includes(homeSearchQuery.toLowerCase());
      const matchType = props.activeFilters?.length === 0 || props.activeFilters?.includes(e.type);
      const matchStatus = !props.activeStatusFilter || props.activeStatusFilter === 'all' || e.etat === props.activeStatusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [props.allEtablissements, homeSearchQuery, props.activeFilters, props.activeStatusFilter]);

  return (
    <>
      {/* ✅ Passe la recherche LOCALE au Hero de l'accueil */}
      <Hero 
        {...props} 
        showNearMe={false}
        searchQuery={homeSearchQuery}
        setSearchQuery={setHomeSearchQuery}
      />
      
      <Stats />
      
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="section-title mb-0">
              <i className="bi bi-list-ul text-primary me-2" />
              Établissements 
              <span style={{ color: "var(--gray-500)", fontWeight: 400, fontSize: "0.9em" }}>
                ({filteredForHome.length})
              </span>
            </h3>
          </div>
          
          {filteredForHome.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-4 text-muted mb-3 d-block"></i>
              <p className="text-muted">Aucun établissement ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filteredForHome.map(e => (
                <div className="col-md-6 col-lg-4 col-xl-3" key={e.id}>
                  <EstablishmentCard e={e} openDetail={props.openDetail} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}