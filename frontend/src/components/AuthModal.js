import React, { useState } from 'react';
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

export default function AuthModal({ show, setShow, onAuthSuccess, showToast }) {
  const [authTab, setAuthTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ nom: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  if (!show) return null;

  const handleChange = (form, setForm) => (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (form, isLogin) => {
    const newErrors = {};
    if (!isLogin && !form.nom?.trim()) newErrors.nom = 'Nom requis';
    if (!form.email?.trim()) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email invalide';
    if (!form.password) newErrors.password = 'Mot de passe requis';
    else if (form.password.length < 6) newErrors.password = 'Minimum 6 caractères';
    if (!isLogin && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isLogin = authTab === 'login';
    const form = isLogin ? loginForm : registerForm;
    
    if (!validate(form, isLogin)) return;
    
    try {
      setLoading(true);
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      
      // ✅ Payload aligné avec FastAPI : 'mot_de_passe' pour register, form-data pour login
      let payload;
      if (isLogin) {
        // Login utilise OAuth2PasswordRequestForm → enctype application/x-www-form-urlencoded
        payload = new URLSearchParams();
        payload.append('username', loginForm.email);  // ← OAuth2 attend 'username' pour l'email
        payload.append('password', loginForm.password);
      } else {
        // Register utilise JSON → application/json
        payload = {
          nom: registerForm.nom,
          email: registerForm.email,
          mot_de_passe: registerForm.password.slice(0, 72)  // ← Tronque à 72 chars pour bcrypt
        };
      }

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: isLogin 
          ? { 'Content-Type': 'application/x-www-form-urlencoded' }
          : { 'Content-Type': 'application/json' },
        body: isLogin ? payload : JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || data.message || 'Erreur serveur');
      }

      // ✅ Sauvegarde du token JWT
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }

      // ✅ Notification au parent
      if (onAuthSuccess && data.user) {
        onAuthSuccess(data.user);
      }

      showToast(isLogin ? '✅ Connexion réussie !' : '✅ Compte créé !', 'success');
      
      // Reset + fermeture
      setLoginForm({ email: '', password: '' });
      setRegisterForm({ nom: '', email: '', password: '', confirmPassword: '' });
      setShow(false);
      
    } catch (err) {
      console.error('Auth error:', err);
      setErrors({ submit: err.message || 'Une erreur est survenue' });
      showToast('❌ ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1040, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShow(false)} />
      <div className="modal fade show" style={{ display: 'block', zIndex: 1050 }} tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-3">
            <div className="modal-header border-0 pb-0">
              <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Fermer" />
            </div>
            <div className="modal-body pt-0 px-4 pb-4">
              <div className="d-flex rounded-pill bg-light p-1 mb-4" style={{ maxWidth: '300px', margin: '0 auto' }}>
                <button className={`flex-fill py-2 rounded-pill text-sm fw-medium ${authTab === 'login' ? 'bg-white shadow text-primary' : 'text-muted'}`} onClick={() => { setAuthTab('login'); setErrors({}); }}>Connexion</button>
                <button className={`flex-fill py-2 rounded-pill text-sm fw-medium ${authTab === 'register' ? 'bg-white shadow text-primary' : 'text-muted'}`} onClick={() => { setAuthTab('register'); setErrors({}); }}>Inscription</button>
              </div>
              {errors.submit && <div className="alert alert-danger py-2 mb-3 small">{errors.submit}</div>}
              <form onSubmit={handleSubmit} className="space-y-3">
                {authTab === 'register' && (
                  <div>
                    <label className="small text-muted mb-1">Nom complet</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0"><User size={16} className="text-muted" /></span>
                      <input type="text" name="nom" value={registerForm.nom} onChange={handleChange(registerForm, setRegisterForm)} className={`form-control border-start-0 ${errors.nom ? 'is-invalid' : ''}`} placeholder="Votre nom" />
                    </div>
                    {errors.nom && <div className="invalid-feedback d-block small">{errors.nom}</div>}
                  </div>
                )}
                <div>
                  <label className="small text-muted mb-1">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Mail size={16} className="text-muted" /></span>
                    <input type="email" name="email" value={authTab === 'login' ? loginForm.email : registerForm.email} onChange={handleChange(authTab === 'login' ? loginForm : registerForm, authTab === 'login' ? setLoginForm : setRegisterForm)} className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`} placeholder="vous@exemple.com" />
                  </div>
                  {errors.email && <div className="invalid-feedback d-block small">{errors.email}</div>}
                </div>
                <div>
                  <label className="small text-muted mb-1">Mot de passe</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0"><Lock size={16} className="text-muted" /></span>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={authTab === 'login' ? loginForm.password : registerForm.password} onChange={handleChange(authTab === 'login' ? loginForm : registerForm, authTab === 'login' ? setLoginForm : setRegisterForm)} className={`form-control border-start-0 ${errors.password ? 'is-invalid' : ''}`} placeholder="••••••••" />
                    <button type="button" className="btn btn-outline-secondary border-start-0" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  {errors.password && <div className="invalid-feedback d-block small">{errors.password}</div>}
                </div>
                {authTab === 'register' && (
                  <div>
                    <label className="small text-muted mb-1">Confirmer le mot de passe</label>
                    <input type="password" name="confirmPassword" value={registerForm.confirmPassword} onChange={handleChange(registerForm, setRegisterForm)} className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="••••••••" />
                    {errors.confirmPassword && <div className="invalid-feedback d-block small">{errors.confirmPassword}</div>}
                  </div>
                )}
                <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Traitement...</> : authTab === 'login' ? 'Se connecter' : "S'inscrire"}
                </button>
              </form>
              <div className="text-center mt-4 pt-3 border-top">
                <small className="text-muted">
                  {authTab === 'login' ? "Pas encore de compte ? " : "Déjà un compte ? "}
                  <button className="btn btn-link p-0 text-primary fw-medium" onClick={() => { setAuthTab(authTab === 'login' ? 'register' : 'login'); setErrors({}); }}>
                    {authTab === 'login' ? "Créer un compte" : "Se connecter"}
                  </button>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}