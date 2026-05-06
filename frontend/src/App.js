import React, { useState, useRef, useEffect } from "react";
// Note: On n'importe plus mockEtablissements car on utilise le Backend
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
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState("all");
  const [selectedEtablissement, setSelectedEtablissement] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [toast, setToast] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 33.5, lng: -7.0 });
  
  // États pour la connexion Backend
  const [realEtablissements, setRealEtablissements] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Pour gérer le chargement
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  
  const mapRef = useRef(null);

  // 🚀 CHARGEMENT DES DONNÉES DEPUIS LE BACKEND AU DÉMARRAGE
  useEffect(() => {
  fetch('http://localhost:8000/api/etablissements')
    .then(res => {
      if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      console.log(" Données reçues du backend :", data);
      setRealEtablissements(data);
      setIsLoading(false);
    })
    .catch(err => {
      console.error("❌ Échec fetch backend :", err);
      setIsLoading(false);
      showToast("Backend injoignable", "error");
    });
}, []);
  const filteredEtablissements = realEtablissements.filter((e) => {
  const matchSearch = e.nom.toLowerCase().includes(searchQuery.toLowerCase()) || e.adresse.toLowerCase().includes(searchQuery.toLowerCase());
  // ✅ CORRECTION : activeFilters vide = tout afficher
  const matchType = activeFilters.length === 0 || activeFilters.includes(e.type);
  const matchStatus = activeStatusFilter === "all" || e.etat === activeStatusFilter;
  return matchSearch && matchType && matchStatus;
});

  const handleFilterToggle = (type) => setActiveFilters(prev => prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]);
  const showToast = (message, type) => setToast({ message, type });

  const handleNearMe = () => {
    setGeoLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        showToast("Localisation détectée avec succès !", "success"); setGeoLoading(false);
      }, () => { setMapCenter({ lat: 33.5731, lng: -7.5898 }); showToast("Localisation par défaut : Casablanca", "info"); setGeoLoading(false); });
    } else { showToast("Géolocalisation non supportée", "error"); setGeoLoading(false); }
  };

  const handleLogin = () => { if (!loginEmail || !loginPass) return showToast("Veuillez remplir tous les champs", "error"); setIsLoggedIn(true); setUserName(loginEmail.split("@")[0]); setShowAuthModal(false); showToast("Connexion réussie ! Bienvenue 🎉", "success"); };
  const handleRegister = () => { if (!regName || !regEmail || !regPass) return showToast("Veuillez remplir tous les champs", "error"); setIsLoggedIn(true); setUserName(regName); setShowAuthModal(false); showToast("Compte créé avec succès ! Bienvenue 🎉", "success"); };
  const handleLogout = () => { setIsLoggedIn(false); setUserName(""); showToast("Déconnexion réussie", "info"); };
  const openDetail = (e) => { setSelectedEtablissement(e); setShowDetailModal(true); setUserRating(0); setReviewText(""); };
  const handleSubmitReview = () => { if (userRating === 0) return showToast("Veuillez donner une note", "error"); showToast("Avis soumis avec succès ! Merci 🙏", "success"); setUserRating(0); setReviewText(""); };

  const getMarkerPosition = (e) => {
    const w = mapRef.current?.clientWidth || 800, h = mapRef.current?.clientHeight || 500;
    return { x: ((e.longitude + 13) / 12) * (w - 60) + 20, y: ((36 - e.latitude) / 6) * (h - 60) + 20 };
  };

  const renderPage = () => {
    // Si on charge encore, on affiche un petit message ou rien
    if (isLoading) return <div style={{ textAlign: "center", padding: "50px" }}>Chargement des établissements...</div>;

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
      case "home": return <HomePage {...common} setCurrentPage={setCurrentPage} />;
      case "map": return <MapPage {...common} setCurrentPage={setCurrentPage} />;
      case "list": return <ListPage {...common} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} isLoggedIn={isLoggedIn} userName={userName} setShowAuthModal={setShowAuthModal} handleLogout={handleLogout} />
      <main style={{ flex: 1 }}>{renderPage()}</main>
      <Footer />
      <DetailModal show={showDetailModal} setShow={setShowDetailModal} selected={selectedEtablissement} isLoggedIn={isLoggedIn} setShowAuth={setShowAuthModal} userRating={userRating} setUserRating={setUserRating} reviewText={reviewText} setReviewText={setReviewText} handleSubmitReview={handleSubmitReview} />
      <AuthModal show={showAuthModal} setShow={setShowAuthModal} authTab={authTab} setAuthTab={setAuthTab} loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPass={loginPass} setLoginPass={setLoginPass} handleLogin={handleLogin} regName={regName} setRegName={setRegName} regEmail={regEmail} setRegEmail={setRegEmail} regPass={regPass} setRegPass={setRegPass} handleRegister={handleRegister} />
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}
