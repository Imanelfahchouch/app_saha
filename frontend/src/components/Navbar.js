import React from 'react';

export default function Navbar({ currentPage, setCurrentPage, isLoggedIn, userName, setShowAuthModal, handleLogout }) {
  const navItems = [{ key: "home", icon: "bi-house-fill", label: "Accueil" }, { key: "map", icon: "bi-map-fill", label: "Carte" }, { key: "list", icon: "bi-list-ul", label: "Établissements" }];
  return (
    <nav className="navbar navbar-expand-lg navbar-saha">
      <div className="container">
        <a className="navbar-brand brand-logo" href="#" onClick={() => setCurrentPage("home")}>SA<span>HA</span></a>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" style={{ filter: "brightness(10)" }}><span className="navbar-toggler-icon" /></button>
        <div className="collapse navbar-collapse" id="navContent">
          <ul className="navbar-nav mx-auto gap-1">
            {navItems.map(item => <li className="nav-item" key={item.key}><a className={`nav-link ${currentPage === item.key ? "active" : ""}`} href="#" onClick={e => { e.preventDefault(); setCurrentPage(item.key); }}><i className={`bi ${item.icon} me-1`} />{item.label}</a></li>)}
          </ul>
          <div className="d-flex gap-2 align-items-center">
            {isLoggedIn ? (
              <div className="dropdown">
                <button className="btn btn-auth dropdown-toggle" data-bs-toggle="dropdown" style={{ display: "flex", alignItems: "center", gap: 8 }}><i className="bi bi-person-circle" style={{ fontSize: "1.2rem" }} /><span>{userName}</span></button>
                <ul className="dropdown-menu dropdown-menu-end mt-2" style={{ borderRadius: 12, boxShadow: "var(--shadow-lg)", border: "none" }}>
                  <li><a className="dropdown-item py-2 text-danger" href="#" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2" />Déconnexion</a></li>
                </ul>
              </div>
            ) : <button className="btn btn-auth" onClick={() => setShowAuthModal(true)}><i className="bi bi-person-fill me-1" /> Connexion</button>}
          </div>
        </div>
      </div>
    </nav>
  );
}
