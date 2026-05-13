import React, { useState, useRef, useEffect } from "react";
import Navbar from './components/Navbar.js';
import HomePage from './pages/HomePage.js';
import MapPage from './pages/MapPage.js';
import ListPage from './pages/ListPage.js';
import DetailModal from './components/DetailModal.js';
import AuthModal from './components/AuthModal.js';
import Toast from './components/Toast.js';
import { AnimatePresence } from 'framer-motion';
import Footer from './components/Footer.js';

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  const [realEtablissements, setRealEtablissements] = useState([]);
  
  // ✅ NOUVEAU : Référence pour contrôler la carte depuis n'importe où
  const [mapControls, setMapControls] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch('http://localhost:8000/api/etablissements')
      .then(res => res.json())
      .then(data => {
        setRealEtablissements(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("❌ Échec fetch:", err);
        setIsLoading(false);
        showToast("Impossible de contacter le serveur", "error");
      });
  }, []);

  const handleFilterToggle = (type) => 
    setActiveFilters(prev => prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    showToast("👋 Déconnexion réussie", "info");
  };

  const openDetail = (etab) => {
    setSelectedEtablissement(etab);
    setShowDetailModal(true);
  };

  // ✅ Fonction pour dire à la carte d'aller quelque part
  const handleGoToMapLocation = (lat, lng) => {
    // Si on n'est pas sur la page carte, on y va d'abord
    if (currentPage !== 'map') {
      setCurrentPage('map');
      // Petit délai pour laisser le temps à la page de monter et d'enregistrer les contrôles
      setTimeout(() => {
        if (mapControls) mapControls.goToLocation(lat, lng);
      }, 100);
    } else {
      // Si on est déjà sur la carte
      if (mapControls) mapControls.goToLocation(lat, lng);
    }
  };

  const commonProps = {
    activeFilters,
    setActiveFilters,
    activeStatusFilter,
    setActiveStatusFilter,
    handleFilterToggle,
    allEtablissements: realEtablissements,
    openDetail,
    isLoggedIn,
    userName,
    setShowAuthModal,
    showToast,
    isLoading,
    // ✅ Passe la fonction de contrôle à MapPage
    onMapControlReady: setMapControls
  };
  
  const renderPage = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Chargement...</p>
        </div>
      );
    }
    
    switch(currentPage) {
      case "home": 
        return <HomePage {...commonProps} setCurrentPage={setCurrentPage} />;
      case "map": 
        return <MapPage {...commonProps} setCurrentPage={setCurrentPage} />;
      case "list": 
        // ✅ Passe la fonction goToMapLocation à ListPage
        return <ListPage {...commonProps} setCurrentPage={setCurrentPage} onGoToMap={handleGoToMapLocation} />;
      default: 
        return <HomePage {...commonProps} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        setShowAuthModal={setShowAuthModal} 
        handleLogout={handleLogout} 
      />
      
      <main style={{ flex: 1 }}>{renderPage()}</main>
      
      <Footer />
      
      <DetailModal 
        show={showDetailModal}
        setShow={setShowDetailModal}
        selectedId={selectedEtablissement?.id}
        isLoggedIn={isLoggedIn}
        setShowAuth={setShowAuthModal}
        userId={1}
        showToast={showToast}
        onReviewPosted={() => {
          fetch('http://localhost:8000/api/etablissements')
            .then(res => res.json())
            .then(setRealEtablissements);
        }}
      />
      
      <AuthModal 
        show={showAuthModal}
        setShow={setShowAuthModal}
        onAuthSuccess={(user) => {
          setIsLoggedIn(true);
          setUserName(user.nom);
        }}
        showToast={showToast}
      />
      
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}