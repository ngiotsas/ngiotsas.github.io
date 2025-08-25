// Discord-style console warning - execute immediately
// ES6 version with template literals
console.log('%c🛑 STOP!', 'color: red; font-size: 50px; font-weight: bold;');
console.log(`%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a feature or "fix" something, it is a scam and could harm your computer or steal your data.`, 'color: red; font-size: 16px; font-weight: bold;');
console.log(`%cDo not paste code from untrusted sources!`, 'color: red; font-size: 18px; font-weight: bold;');
console.log(`%cIf you must paste code, type "allow pasting" below to continue.`, 'color: orange; font-size: 14px;');
console.log('%c────────────────────────────────────────────────────────────────', 'color: red;');

// Loading screen
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 1000);
});

// Smooth scrolling and URL management
function updateURL(sectionId) {
    const url = new URL(window.location);
    url.searchParams.set('section', sectionId);
    window.history.replaceState({}, '', url);
}

function getActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + window.innerHeight / 2;
    
    let activeSection = 'home';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionBottom = sectionTop + sectionHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            activeSection = section.id;
        }
    });
    
    return activeSection;
}

function updateActiveNavLink(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
        }
    });
}

function scrollToSection(sectionId, behavior = 'smooth') {
    const target = document.getElementById(sectionId);
    if (target) {
        const offsetTop = target.offsetTop;
        window.scrollTo({
            top: offsetTop,
            behavior: behavior
        });
    }
}

// Scroll event listener
let ticking = false;
function onScroll() {
    if (!ticking) {
        requestAnimationFrame(() => {
            // Update header style
            const header = document.getElementById('header');
            if (window.scrollY > 50) {
                header.classList.add('header-scrolled');
            } else {
                header.classList.remove('header-scrolled');
            }
            
            // Update active section
            const activeSection = getActiveSection();
            updateActiveNavLink(activeSection);
            updateURL(activeSection);
            
            // Reveal animations
            revealElements();
            
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll);

// Navigation click handlers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        scrollToSection(targetId);
        updateURL(targetId);
        updateActiveNavLink(targetId);
    });
});

// Scroll reveal animations
function revealElements() {
    const reveals = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
    
    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

// Initialize URL on page load
function initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    
    if (section && section !== 'home') {
        setTimeout(() => {
            scrollToSection(section, 'auto');
            updateActiveNavLink(section);
        }, 1200);
    } else {
        // Default to home
        updateActiveNavLink('home');
        updateURL('home');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeFromURL();
    revealElements();
});

// Handle browser back/forward
window.addEventListener('popstate', (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section') || 'home';
    
    scrollToSection(section);
    updateActiveNavLink(section);
});

// Intersection Observer for more efficient scroll detection
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const sectionObserver = new IntersectionObserver((entries) => {
    let mostVisibleSection = null;
    let maxRatio = 0;
    
    entries.forEach(entry => {
        if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisibleSection = entry.target.id;
        }
    });
    
    if (mostVisibleSection && maxRatio > 0.3) {
        updateActiveNavLink(mostVisibleSection);
        updateURL(mostVisibleSection);
    }
}, observerOptions);

// Observe all sections
document.querySelectorAll('section[id]').forEach(section => {
    sectionObserver.observe(section);
});

// Optimize animations with Intersection Observer
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
    animationObserver.observe(el);
});