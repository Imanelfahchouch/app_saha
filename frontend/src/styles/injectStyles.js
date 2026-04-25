// Bootstrap CSS
const bootstrapLink = document.createElement("link");
bootstrapLink.rel = "stylesheet";
bootstrapLink.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css";
document.head.appendChild(bootstrapLink);

// Bootstrap Icons
const bootstrapIconLink = document.createElement("link");
bootstrapIconLink.rel = "stylesheet";
bootstrapIconLink.href = "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css";
document.head.appendChild(bootstrapIconLink);

// Google Fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/index.min.css";
document.head.appendChild(fontLink);

const fontPoppins = document.createElement("link");
fontPoppins.rel = "stylesheet";
fontPoppins.href = "https://cdn.jsdelivr.net/npm/@fontsource/poppins@5.0.16/index.min.css";
document.head.appendChild(fontPoppins);

// Custom CSS
const style = document.createElement("style");
style.textContent = `
  :root {
    --primary: #0077B6;
    --primary-dark: #005A8C;
    --primary-light: #90E0EF;
    --accent: #00B4D8;
    --success-green: #2DC653;
    --danger-red: #EF476F;
    --warning-orange: #FF8C42;
    --gold: #FFD60A;
    --dark: #1B2A4A;
    --gray-100: #F8F9FA;
    --gray-200: #E9ECEF;
    --gray-300: #DEE2E6;
    --gray-500: #ADB5BD;
    --gray-700: #495057;
    --gray-900: #212529;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
    --shadow-lg: 0 8px 30px rgba(0,0,0,0.12);
    --shadow-xl: 0 12px 40px rgba(0,0,0,0.15);
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', sans-serif;
    background: var(--gray-100);
    color: var(--gray-900);
    overflow-x: hidden;
  }
  h1, h2, h3, h4, h5, h6 { font-family: 'Poppins', sans-serif; }

  /* Navbar */
  .navbar-saha {
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    padding: 0.8rem 0;
    box-shadow: 0 4px 20px rgba(0,119,182,0.3);
    position: sticky;
    top: 0;
    z-index: 1050;
    backdrop-filter: blur(10px);
  }
  .navbar-saha .nav-link {
    color: rgba(255,255,255,0.85) !important;
    font-weight: 500;
    font-size: 0.95rem;
    padding: 0.5rem 1rem !important;
    border-radius: var(--radius-sm);
    transition: all 0.3s ease;
  }
  .navbar-saha .nav-link:hover,
  .navbar-saha .nav-link.active {
    color: #fff !important;
    background: rgba(255,255,255,0.15);
  }
  .brand-logo {
    font-family: 'Poppins', sans-serif;
    font-weight: 800;
    font-size: 1.8rem;
    color: #fff !important;
    letter-spacing: -0.5px;
  }
  .brand-logo span { color: var(--gold); }
  .btn-auth {
    background: rgba(255,255,255,0.2);
    border: 2px solid rgba(255,255,255,0.5);
    color: #fff !important;
    border-radius: var(--radius-md);
    padding: 0.5rem 1.5rem !important;
    font-weight: 600;
    transition: all 0.3s ease;
  }
  .btn-auth:hover {
    background: #fff;
    color: var(--primary) !important;
    border-color: #fff;
  }

  /* Hero Section */
  .hero-section {
    background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 40%, var(--accent) 100%);
    padding: 4rem 0 3rem;
    position: relative;
    overflow: hidden;
  }
  .hero-section::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(144,224,239,0.3) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero-section::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(255,214,10,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .hero-title {
    font-size: 2.8rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }
  .hero-subtitle {
    font-size: 1.15rem;
    color: rgba(255,255,255,0.85);
    font-weight: 400;
  }

  /* Search Box */
  .search-container {
    background: #fff;
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    box-shadow: var(--shadow-xl);
    margin-top: 2rem;
    position: relative;
    z-index: 2;
  }
  .search-input-custom {
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: 0.85rem 1rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    width: 100%;
  }
  .search-input-custom:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0,119,182,0.15);
    outline: none;
  }
  .btn-search {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border: none;
    color: #fff;
    border-radius: var(--radius-md);
    padding: 0.85rem 2rem;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  .btn-search:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,119,182,0.4);
    color: #fff;
  }
  .btn-near-me {
    background: linear-gradient(135deg, var(--success-green), #1DB954);
    border: none;
    color: #fff;
    border-radius: var(--radius-md);
    padding: 0.85rem 2rem;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    white-space: nowrap;
  }
  .btn-near-me:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45,198,83,0.4);
    color: #fff;
  }

  /* Filter Pills */
  .filter-pills {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--gray-200);
  }
  .filter-pill {
    border: 2px solid var(--gray-200);
    background: #fff;
    color: var(--gray-700);
    border-radius: 50px;
    padding: 0.45rem 1.2rem;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  .filter-pill:hover { border-color: var(--primary); color: var(--primary); }
  .filter-pill.active {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }

  /* Map Container */
  .map-container {
    background: var(--gray-200);
    border-radius: var(--radius-lg);
    height: 500px;
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    margin-top: 2rem;
  }
  .map-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,119,182,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,119,182,0.05) 1px, transparent 1px);
    background-size: 40px 40px;
  }
  .map-marker {
    position: absolute;
    width: 44px;
    height: 44px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 10px rgba(0,0,0,0.3);
    z-index: 10;
  }
  .map-marker:hover {
    transform: rotate(-45deg) scale(1.2);
    z-index: 20;
  }
  .map-marker .marker-icon {
    transform: rotate(45deg);
    font-size: 18px;
    color: #fff;
  }
  .marker-pharmacie { background: var(--success-green); }
  .marker-clinique { background: var(--primary); }
  .marker-hopital { background: var(--danger-red); }
  .marker-pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    animation: pulse-marker 2s infinite;
  }
  @keyframes pulse-marker {
    0% { transform: scale(1); opacity: 0.5; }
    100% { transform: scale(1.8); opacity: 0; }
  }

  /* Establishment Cards */
  .establishment-card {
    background: #fff;
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
    border: none;
    height: 100%;
  }
  .establishment-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-xl);
  }
  .card-type-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 0.3rem 0.8rem;
    border-radius: 50px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fff;
    z-index: 5;
  }
  .badge-pharmacie { background: var(--success-green); }
  .badge-clinique { background: var(--primary); }
  .badge-hopital { background: var(--danger-red); }
  .card-status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 0.3rem 0.8rem;
    border-radius: 50px;
    font-size: 0.7rem;
    font-weight: 600;
    z-index: 5;
  }
  .status-ouvert {
    background: rgba(45,198,83,0.15);
    color: var(--success-green);
  }
  .status-ferme {
    background: rgba(239,71,111,0.15);
    color: var(--danger-red);
  }
  .card-img-wrapper {
    height: 160px;
    overflow: hidden;
    position: relative;
  }
  .card-img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: #fff;
  }
  .bg-pharmacie { background: linear-gradient(135deg, #2DC653, #1DB954); }
  .bg-clinique { background: linear-gradient(135deg, #0077B6, #00B4D8); }
  .bg-hopital { background: linear-gradient(135deg, #EF476F, #FF6B6B); }

  .card-body-custom {
    padding: 1.2rem;
  }
  .card-title-custom {
    font-weight: 700;
    font-size: 1.05rem;
    margin-bottom: 0.3rem;
    color: var(--dark);
  }
  .card-address {
    font-size: 0.85rem;
    color: var(--gray-500);
    margin-bottom: 0.8rem;
  }
  .star-rating {
    display: flex;
    align-items: center;
    gap: 2px;
    margin-bottom: 0.5rem;
  }
  .star { color: var(--gray-300); font-size: 0.95rem; }
  .star.filled { color: var(--gold); }
  .rating-text { font-size: 0.8rem; color: var(--gray-500); margin-left: 4px; }
  .card-footer-custom {
    padding: 0.8rem 1.2rem;
    border-top: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .btn-details {
    background: transparent;
    border: 2px solid var(--primary);
    color: var(--primary);
    border-radius: var(--radius-sm);
    padding: 0.4rem 1rem;
    font-weight: 600;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }
  .btn-details:hover {
    background: var(--primary);
    color: #fff;
  }

  /* Detail Modal */
  .modal-saha .modal-content {
    border: none;
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-xl);
  }
  .modal-saha .modal-header {
    border: none;
    padding: 1.5rem 1.5rem 0;
    position: relative;
  }
  .modal-saha .modal-header .btn-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    z-index: 10;
    background-size: 1rem;
  }
  .modal-hero-img {
    height: 200px;
    width: 100%;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 4rem;
    color: #fff;
    margin-bottom: 1.5rem;
  }
  .modal-body-custom { padding: 0 1.5rem 1.5rem; }
  .info-row {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 0.7rem 0;
    border-bottom: 1px solid var(--gray-200);
  }
  .info-icon {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(0,119,182,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary);
    flex-shrink: 0;
  }
  .info-label { font-size: 0.8rem; color: var(--gray-500); }
  .info-value { font-weight: 600; font-size: 0.95rem; color: var(--dark); }

  /* Review Section */
  .review-card {
    background: var(--gray-100);
    border-radius: var(--radius-md);
    padding: 1rem;
    margin-bottom: 0.8rem;
  }
  .review-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .reviewer-name { font-weight: 600; font-size: 0.9rem; }
  .review-date { font-size: 0.75rem; color: var(--gray-500); }
  .review-text { font-size: 0.9rem; color: var(--gray-700); line-height: 1.5; }

  /* Contribution Form */
  .form-control-custom {
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-md);
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    transition: all 0.3s ease;
  }
  .form-control-custom:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(0,119,182,0.15);
    outline: none;
  }
  .form-label-custom {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--dark);
    margin-bottom: 0.4rem;
  }
  .btn-submit {
    background: linear-gradient(135deg, var(--primary), var(--accent));
    border: none;
    color: #fff;
    border-radius: var(--radius-md);
    padding: 0.85rem 2rem;
    font-weight: 600;
    transition: all 0.3s ease;
    width: 100%;
  }
  .btn-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,119,182,0.4);
    color: #fff;
  }

  /* Auth Modal */
  .auth-tabs {
    display: flex;
    background: var(--gray-100);
    border-radius: var(--radius-md);
    padding: 4px;
    margin-bottom: 1.5rem;
  }
  .auth-tab {
    flex: 1;
    text-align: center;
    padding: 0.6rem;
    border-radius: var(--radius-sm);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    border: none;
    background: transparent;
    color: var(--gray-500);
  }
  .auth-tab.active {
    background: #fff;
    color: var(--primary);
    box-shadow: var(--shadow-sm);
  }

  /* Stats Section */
  .stat-card {
    background: #fff;
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    text-align: center;
    box-shadow: var(--shadow-md);
    transition: all 0.3s ease;
  }
  .stat-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin: 0 auto 1rem;
    color: #fff;
  }
  .stat-number {
    font-family: 'Poppins', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    color: var(--dark);
  }
  .stat-label { font-size: 0.85rem; color: var(--gray-500); font-weight: 500; }

  /* Footer */
  .footer-saha {
    background: var(--dark);
    color: rgba(255,255,255,0.7);
    padding: 3rem 0 1.5rem;
  }
  .footer-title {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    color: #fff;
    margin-bottom: 1rem;
  }
  .footer-link {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    display: block;
    padding: 0.3rem 0;
  }
  .footer-link:hover { color: var(--primary-light); padding-left: 5px; }
  .footer-bottom {
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 1.5rem;
    margin-top: 2rem;
    text-align: center;
    font-size: 0.85rem;
  }

  .section-title {
    font-weight: 700;
    color: var(--dark);
    position: relative;
    display: inline-block;
  }
  .section-title::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    border-radius: 2px;
  }
  .interactive-rating { cursor: pointer; }
  .interactive-rating .star { transition: all 0.2s ease; }
  .interactive-rating .star:hover { transform: scale(1.3); }

  .toast-saha {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: #fff;
    border-radius: var(--radius-md);
    padding: 1rem 1.5rem;
    box-shadow: var(--shadow-xl);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.8rem;
    max-width: 380px;
  }
  .toast-icon { font-size: 1.3rem; }
  .toast-success { border-left: 4px solid var(--success-green); }
  .toast-error { border-left: 4px solid var(--danger-red); }
  .toast-info { border-left: 4px solid var(--primary); }

  @media (max-width: 768px) {
    .hero-title { font-size: 2rem; }
    .map-container { height: 350px; }
    .search-container { padding: 1rem; }
  }
`;
document.head.appendChild(style);