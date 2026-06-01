@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --primary: #10b981;
    --primary-dark: #059669;
    --secondary: #3b82f6;
    --text: #1f2937;
    --text-light: #6b7280;
    --bg: #ffffff;
    --bg-alt: #f9fafb;
    --border: #e5e7eb;
    --shadow: rgba(0, 0, 0, 0.1);
}

/* ── HTML class utilities ── */
html.white { background-color: #ffffff; }
html.antialiased,
html.antialiased * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
html.smooth { scroll-behavior: smooth; }
html.flexbox body { display: flex; flex-direction: column; min-height: 100vh; }
html.responsive img { max-width: 100%; height: auto; }
html.no-js .spinner { display: none; }
html.js .no-js-msg { display: none; }

/* ── Base ── */
body {
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
    overflow-x: hidden;
}

/* ── Scroll reveal animations ── */
.scroll-reveal {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.scroll-reveal.active {
    opacity: 1;
    transform: translateY(0);
}
.scroll-reveal-left {
    opacity: 0;
    transform: translateX(-50px);
    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.scroll-reveal-left.active {
    opacity: 1;
    transform: translateX(0);
}
.scroll-reveal-right {
    opacity: 0;
    transform: translateX(50px);
    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.scroll-reveal-right.active {
    opacity: 1;
    transform: translateX(0);
}

/* ── Header ── */
header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    z-index: 1000;
    transition: all 0.3s ease;
}
.header-scrolled {
    box-shadow: 0 4px 20px var(--shadow);
}
.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}
.logo {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5em;
    font-weight: 700;
    color: var(--primary);
    text-decoration: none;
}
.nav-links {
    display: flex;
    gap: 30px;
    list-style: none;
}
.nav-link {
    color: var(--text);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    transition: color 0.3s ease;
}
.nav-link:hover,
.nav-link.active { color: var(--primary); }
.nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary);
    transition: width 0.3s ease;
}
.nav-link:hover::after,
.nav-link.active::after { width: 100%; }

/* ── Hero ── */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
    color: white;
    position: relative;
    overflow: hidden;
}
.hero-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.3;
}
.hero-content {
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
}
.hero-profile-small {
    width: 200px;
    height: 200px;
    border-radius: 10%;
    object-fit: cover;
    border: 4px solid rgba(255, 255, 255, 0.3);
    margin-bottom: 20px;
    opacity: 0;
    animation: slideUp 1s ease 0.3s forwards;
}
.hero-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 800;
    margin-bottom: 1rem;
    opacity: 0;
    animation: slideUp 1s ease 0.5s forwards;
}
.hero-subtitle {
    font-size: clamp(1.2rem, 2.5vw, 1.5rem);
    font-weight: 300;
    margin-bottom: 2rem;
    opacity: 0;
    animation: slideUp 1s ease 0.7s forwards;
}
.hero-cta {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 15px 30px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    opacity: 0;
    animation: slideUp 1s ease 0.9s forwards;
}
.hero-cta:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
}

/* ── Sections ── */
.section { padding: 80px 0; position: relative; }
#about   { background: var(--bg-alt); }
#portfolio, #contact { background: var(--bg); }

.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }

.section-header  { text-align: center; margin-bottom: 60px; }
.section-title   { font-size: clamp(2rem, 4vw, 3rem); font-weight: 700; color: var(--text); margin-bottom: 1rem; }
.section-subtitle { font-size: 1.2rem; color: var(--text-light); max-width: 600px; margin: 0 auto; }

/* ── Portfolio grid ── */
.portfolio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-top: 60px;
    margin-bottom: 60px;
}
.project-card {
    background: var(--bg);
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 30px var(--shadow);
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.project-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
}
.project-image {
    height: 200px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 3rem;
    font-weight: 700;
}
.project-content  { padding: 30px; }
.project-title    { font-size: 1.5rem; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.project-description { color: var(--text-light); margin-bottom: 20px; line-height: 1.6; }
.project-tech     { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.tech-tag {
    background: linear-gradient(45deg, var(--primary), var(--secondary));
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
}
.project-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;
}
.project-link:hover { color: var(--primary-dark); }

/* ── Contact ── */
.contact-content { text-align: center; max-width: 600px; margin: 0 auto; }
.closed-banner {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 12px;
    padding: 16px 24px;
    margin-bottom: 30px;
    color: #92400e;
    font-weight: 500;
}
.contact-links {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 40px;
    flex-wrap: wrap;
    opacity: 0.4;
    pointer-events: none;
}
.contact-link {
    display: flex;
    align-items: center;
    gap: 10px;
    background: var(--bg);
    padding: 20px 30px;
    border-radius: 15px;
    text-decoration: none;
    color: var(--text);
    box-shadow: 0 5px 20px var(--shadow);
    transition: all 0.3s ease;
}
.contact-link:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

/* ── Loading spinner ── */
.loading {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
}
.loading.hidden { opacity: 0; pointer-events: none; }
.spinner {
    width: 50px; height: 50px;
    border: 3px solid var(--border);
    border-top: 3px solid var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 768px) {
    .nav-links { gap: 20px; }
    .section { padding: 60px 0; }
    .portfolio-grid { grid-template-columns: 1fr; }
    .contact-links { flex-direction: column; align-items: center; }
}

/* ── IE fallbacks (duplicated from conditional comment for safety) ── */
.hero-cta { display: inline-flex; }
