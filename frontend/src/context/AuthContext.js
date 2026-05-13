// Ajoute cette fonction dans ton AuthContext
const requestPasswordReset = async (email) => {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erreur');
  return data;
};

const resetPassword = async (token, newPassword) => {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Erreur');
  return data;
};

// Ajoute-les au value retourné :
const value = {
  user,
  login,
  register,
  logout,
  requestPasswordReset,  // ← Nouveau
  resetPassword,         // ← Nouveau
  loading,
  isAuthenticated: !!user,
  isAdmin: user?.role === 'admin'
};