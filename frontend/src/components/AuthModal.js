import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal({ show, setShow, authTab, setAuthTab, loginEmail, setLoginEmail, loginPass, setLoginPass, handleLogin, regName, setRegName, regEmail, setRegEmail, regPass, setRegPass, handleRegister }) {
  const firstInputRef = useRef(null);

  // Force le focus sur le premier champ à l'ouverture
  useEffect(() => {
    if (show && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 150);
    }
  }, [show, authTab]);

  if (!show) return null;

  return (
    <>
      {/* 1. Backdrop séparé avec z-index et pointer-events corrects */}
      <div 
        className="modal-backdrop fade show" 
        style={{ zIndex: 1040, pointerEvents: 'auto' }}
        onClick={() => setShow(false)} 
      />
      
      {/* 2. Modale au-dessus du backdrop */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', zIndex: 1050, pointerEvents: 'none' }} 
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-saha" style={{ pointerEvents: 'auto' }}>
          <div className="modal-content">
            <div className="modal-header">
              <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
            </div>
            
            <div className="modal-body" style={{ padding: "0 2rem 2rem" }}>
              <div className="text-center mb-4">
                <h3 className="mb-1" style={{ fontFamily: "Poppins", fontWeight: 800 }}>
                  SA<span style={{ color: "var(--primary)" }}>HA</span>
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
                  {authTab === "login" ? "Bon retour parmi nous !" : "Créez votre compte gratuitement"}
                </p>
              </div>

              <div className="auth-tabs">
                <button className={`auth-tab ${authTab === "login" ? "active" : ""}`} onClick={() => setAuthTab("login")}>Connexion</button>
                <button className={`auth-tab ${authTab === "register" ? "active" : ""}`} onClick={() => setAuthTab("register")}>Inscription</button>
              </div>

              <AnimatePresence mode="wait">
                {authTab === "login" ? (
                  <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                    <div className="mb-3">
                      <label className="form-label-custom">Adresse email</label>
                      <div className="position-relative">
                        <i className="bi bi-envelope position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
                        <input 
                          ref={firstInputRef}
                          type="email" 
                          className="form-control-custom" 
                          style={{ paddingLeft: 42 }} 
                          placeholder="votre@email.com" 
                          value={loginEmail} 
                          onChange={e => setLoginEmail(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Mot de passe</label>
                      <div className="position-relative">
                        <i className="bi bi-lock position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
                        <input 
                          type="password" 
                          className="form-control-custom" 
                          style={{ paddingLeft: 42 }} 
                          placeholder="••••••••" 
                          value={loginPass} 
                          onChange={e => setLoginPass(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>Se souvenir de moi</label>
                      </div>
                      <a href="#" style={{ fontSize: "0.85rem", color: "var(--primary)", textDecoration: "none" }}>Mot de passe oublié ?</a>
                    </div>
                    <button className="btn btn-submit mb-3" onClick={handleLogin}>
                      <i className="bi bi-box-arrow-in-right me-2" />Se connecter
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="mb-3">
                      <label className="form-label-custom">Nom complet</label>
                      <div className="position-relative">
                        <i className="bi bi-person position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
                        <input 
                          type="text" 
                          className="form-control-custom" 
                          style={{ paddingLeft: 42 }} 
                          placeholder="Votre nom" 
                          value={regName} 
                          onChange={e => setRegName(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Adresse email</label>
                      <div className="position-relative">
                        <i className="bi bi-envelope position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
                        <input 
                          type="email" 
                          className="form-control-custom" 
                          style={{ paddingLeft: 42 }} 
                          placeholder="votre@email.com" 
                          value={regEmail} 
                          onChange={e => setRegEmail(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label-custom">Mot de passe</label>
                      <div className="position-relative">
                        <i className="bi bi-lock position-absolute" style={{ left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--gray-500)" }} />
                        <input 
                          type="password" 
                          className="form-control-custom" 
                          style={{ paddingLeft: 42 }} 
                          placeholder="Minimum 8 caractères" 
                          value={regPass} 
                          onChange={e => setRegPass(e.target.value)} 
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="terms" />
                        <label className="form-check-label" htmlFor="terms" style={{ fontSize: "0.85rem", color: "var(--gray-500)" }}>
                          J'accepte les <a href="#" style={{ color: "var(--primary)" }}>conditions d'utilisation</a>
                        </label>
                      </div>
                    </div>
                    <button className="btn btn-submit mb-3" onClick={handleRegister}>
                      <i className="bi bi-person-plus me-2" />Créer mon compte
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-center">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <hr className="flex-grow-1" style={{ borderColor: "var(--gray-200)" }} />
                  <span style={{ fontSize: "0.8rem", color: "var(--gray-500)" }}>ou continuer avec</span>
                  <hr className="flex-grow-1" style={{ borderColor: "var(--gray-200)" }} />
                </div>
                <div className="d-flex justify-content-center gap-2">
                  <button className="btn btn-outline-light rounded-pill px-4" style={{ color: "var(--gray-700)", borderColor: "var(--gray-200)" }}>
                    <i className="bi bi-google me-2" />Google
                  </button>
                  <button className="btn btn-outline-light rounded-pill px-4" style={{ color: "var(--gray-700)", borderColor: "var(--gray-200)" }}>
                    <i className="bi bi-facebook me-2" />Facebook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
