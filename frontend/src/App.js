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
  // États de navigation et filtres
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  
  // États pour les modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  
  // États utilisateur
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  
  // États UI
  const [toast, setToast] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(false);
  
  // États pour les données
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  const [realEtablissements, setRealEtablissements] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 33.5, lng: -7.0 });
  
  // États formulaire auth
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  
  // États pour les avis
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  
  const mapRef = useRef(null);

  // ✅ FONCTION TOAST CENTRALE (à passer aux composants enfants)
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 🚀 Chargement des données depuis le backend
  useEffect(() => {
    fetch('http://localhost:8000/api/etablissements')
      .then(res => {
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("📦 Données reçues :", data.length, "établissements");
        setRealEtablissements(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("❌ Échec fetch :", err);
        setIsLoading(false);
        showToast("Impossible de contacter le serveur", "error");
      });
  }, []);

  // Filtrage des établissements
  const filteredEtablissements = realEtablissements.filter((e) => {
    const matchSearch = e.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        e.adresse.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = activeFilters.length === 0 || activeFilters.includes(e.type);
    const matchStatus = activeStatusFilter === "all" || e.etat === activeStatusFilter;
    return matchSearch && matchType && matchStatus;
  });

  // Handlers
  const handleFilterToggle = (type) => 
    setActiveFilters(prev => prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]);

  const handleNearMe = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          showToast("📍 Localisation détectée !", "success");
          setGeoLoading(false);
        },
        () => {
          setMapCenter({ lat: 33.5731, lng: -7.5898 });
          showToast("📍 Casablanca (par défaut)", "info");
          setGeoLoading(false);
        }
      );
    } else {
      showToast("Géolocalisation non supportée", "error");
      setGeoLoading(false);
    }
  };

  const handleLogin = () => {
    if (!loginEmail || !loginPass) return showToast("Remplissez tous les champs", "error");
    setIsLoggedIn(true);
    setUserName(loginEmail.split("@")[0]);
    setShowAuthModal(false);
    showToast("✅ Connexion réussie !", "success");
  };

  const handleRegister = () => {
    if (!regName || !regEmail || !regPass) return showToast("Remplissez tous les champs", "error");
    setIsLoggedIn(true);
    setUserName(regName);
    setShowAuthModal(false);
    showToast("✅ Compte créé ! Bienvenue 🎉", "success");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    showToast("👋 Déconnexion réussie", "info");
  };

  const openDetail = (etab) => {
    console.log("🔍 Ouverture détail pour ID:", etab.id);
    setSelectedEtablissement(etab);
    setShowDetailModal(true);
    setUserRating(0);
    setReviewText("");
  };

  const getMarkerPosition = (e) => {
    const w = mapRef.current?.clientWidth || 800;
    const h = mapRef.current?.clientHeight || 500;
    return { 
      x: ((e.longitude + 13) / 12) * (w - 60) + 20, 
      y: ((36 - e.latitude) / 6) * (h - 60) + 20 
    };
  };

  const renderPage = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: "center", padding: "50px", color: "#666" }}>
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Chargement des établissements...</p>
        </div>
      );
    }

    const common = { 
      searchQuery, setSearchQuery, 
      activeFilters, setActiveFilters,
      activeStatusFilter, setActiveStatusFilter, 
      filteredEtablissements, handleFilterToggle, 
      handleNearMe, geoLoading, mapCenter, mapRef, 
      getMarkerPosition, hoveredMarker, setHoveredMarker, 
      openDetail, isLoggedIn, userName, setShowAuthModal 
    };
    
    switch(currentPage) {
      case "home": 
        return <HomePage {...common} setCurrentPage={setCurrentPage} />;
      case "map": 
        return <MapPage {...common} setCurrentPage={setCurrentPage} />;
      case "list": 
        return <ListPage {...common} />;
      default: 
        return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8f9fa" }}>
      
      {/* Navbar */}
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        isLoggedIn={isLoggedIn} 
        userName={userName} 
        setShowAuthModal={setShowAuthModal} 
        handleLogout={handleLogout} 
      />
      
      {/* Contenu principal */}
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      
      {/* Footer */}
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
    // ✅ Re-fetch la liste complète pour mettre à jour les notes/compteurs à l'extérieur
    fetch('http://localhost:8000/api/etablissements')
      .then(res => res.json()).then(setRealEtablissements);
  }}
/>
      
      
      {/* Modal Auth */}
      <AuthModal 
        show={showAuthModal} 
        setShow={setShowAuthModal} 
        authTab={authTab} 
        setAuthTab={setAuthTab} 
        loginEmail={loginEmail} 
        setLoginEmail={setLoginEmail} 
        loginPass={loginPass} 
        setLoginPass={setLoginPass} 
        handleLogin={handleLogin} 
        regName={regName} 
        setRegName={setRegName} 
        regEmail={regEmail} 
        setRegEmail={setRegEmail} 
        regPass={regPass} 
        setRegPass={setRegPass} 
        handleRegister={handleRegister} 
      />
      
      {/* Toast notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      
    </div>
  );
}