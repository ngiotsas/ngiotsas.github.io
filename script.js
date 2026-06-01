/* ── Console security warning ── */
console.log('%c🛑 STOP!', 'color: red; font-size: 50px; font-weight: bold;');
console.log(`%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a feature or "fix" something, it is a scam and could harm your computer or steal your data.`, 'color: red; font-size: 16px; font-weight: bold;');
console.log(`%cDo not paste code from untrusted sources!`, 'color: red; font-size: 18px; font-weight: bold;');
console.log(`%cIf you must paste code, type "allow pasting" below to continue.`, 'color: orange; font-size: 14px;');
console.log('%c────────────────────────────────────────────────────────────────', 'color: red;');

/* ── No-JS → JS class swap (run immediately) ── */
document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

/* ── Loading screen ── */
window.addEventListener('load', () => {
    const loading = document.getElementById('loading');
    setTimeout(() => {
        loading.classList.add('hidden');
    }, 1000);
});

/* ── URL management ── */
function updateURL(sectionId) {
    const url = new URL(window.location);
    url.searchParams.set('section', sectionId);
    window.history.replaceState({}, '', url);
}

/* ── Active nav link ── */
function updateActiveNavLink(activeId) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `?section=${activeId}`) {
            link.classList.add('active');
        }
    });
}

/* ── Smooth scroll to section ── */
function scrollToSection(sectionId, behavior = 'smooth') {
    const target = document.getElementById(sectionId);
    if (target) {
        window.scrollTo({ top: target.offsetTop, behavior });
    }
}

/* ── Scroll handler: header shadow + reveal ── */
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
    } else {
        header.classList.remove('header-scrolled');
    }
    revealElements();
});

/* ── Nav click handlers ── */
document.querySelectorAll('a[href^="?section="]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').replace('?section=', '');
        scrollToSection(targetId);
        updateURL(targetId);
        updateActiveNavLink(targetId);
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        scrollToSection(targetId);
        updateURL(targetId);
        updateActiveNavLink(targetId);
    });
});

/* ── Scroll reveal ── */
function revealElements() {
    document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight - 150) {
            el.classList.add('active');
        }
    });
}

/* ── Init on DOMContentLoaded ── */
document.addEventListener('DOMContentLoaded', () => {
    updateActiveNavLink('home');
    revealElements();
});
