import React, { useState, useRef } from "react";
import { mockEtablissements } from './data/mockData.js';
import Navbar from './components/Navbar.js';
import HomePage from './pages/HomePage.js';
import MapPage from './pages/MapPage.js';
import ListPage from './pages/ListPage.js';
import ContributionsPage from './pages/ContributionsPage.js';
import DetailModal from './components/DetailModal.js';
import AuthModal from './components/AuthModal.js';
import ContributionModal from './components/ContributionModal.js';
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
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [authTab, setAuthTab] = useState("login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [toast, setToast] = useState(null);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [contribType, setContribType] = useState("ajout");
  const [contribDesc, setContribDesc] = useState("");
  const [selectedEstablishmentForContrib, setSelectedEstablishmentForContrib] = useState("");
  const [geoLoading, setGeoLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 33.5, lng: -7.0 });
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const mapRef = useRef(null);

  const filteredEtablissements = mockEtablissements.filter((e) => {
    const matchSearch = e.nom.toLowerCase().includes(searchQuery.toLowerCase()) || e.adresse.toLowerCase().includes(searchQuery.toLowerCase());
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
  const handleSubmitContribution = () => { if (!contribDesc.trim()) return showToast("Veuillez décrire votre contribution", "error"); if (contribType === "modification" && !selectedEstablishmentForContrib) return showToast("Veuillez sélectionner un établissement", "error"); showToast("Contribution soumise en attente de validation ✅", "success"); setContribDesc(""); setSelectedEstablishmentForContrib(""); setShowContributionModal(false); };

  const getMarkerPosition = (e) => {
    const w = mapRef.current?.clientWidth || 800, h = mapRef.current?.clientHeight || 500;
    return { x: ((e.longitude + 13) / 12) * (w - 60) + 20, y: ((36 - e.latitude) / 6) * (h - 60) + 20 };
  };

  const renderPage = () => {
    const common = { searchQuery, setSearchQuery, activeFilters, activeStatusFilter, filteredEtablissements, handleFilterToggle, handleNearMe, geoLoading, mapCenter, mapRef, getMarkerPosition, hoveredMarker, setHoveredMarker, openDetail, isLoggedIn, userName, setShowAuthModal };
    switch(currentPage) {
      case "home": return <HomePage {...common} setCurrentPage={setCurrentPage} />;
      case "map": return <MapPage {...common} setCurrentPage={setCurrentPage} />;
      case "list": return <ListPage {...common} />;
      case "contributions": return <ContributionsPage isLoggedIn={isLoggedIn} setShowAuthModal={setShowAuthModal} setShowContributionModal={setShowContributionModal} />;
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
      <ContributionModal show={showContributionModal} setShow={setShowContributionModal} contribType={contribType} setContribType={setContribType} contribDesc={contribDesc} setContribDesc={setContribDesc} selectedEstablishment={selectedEstablishmentForContrib} setSelectedEstablishment={setSelectedEstablishmentForContrib} mockEtablissements={mockEtablissements} handleSubmitContribution={handleSubmitContribution} />
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>
    </div>
  );
}