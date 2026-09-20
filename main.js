// Shared behavior for nick.giotsas.
// The header nav and footer used to be copy-pasted into every page (index/work/about/contact).
// Now each page just leaves an empty <header class="nav" data-page="..."></header> and
// <footer class="wrap"></footer>, and this file is the single place that fills them in —
// same idea as styles.css being the one shared stylesheet, just for markup instead of CSS.
(function () {
  var PAGES = [
    { key: 'home',    href: 'index.html',   label: 'home',    port: ':7'   },
    { key: 'work',    href: 'work.html',    label: 'work',    port: ':443' },
    { key: 'about',   href: 'about.html',   label: 'about',   port: ':22'  },
    { key: 'contact', href: 'contact.html', label: 'contact', port: ':25'  }
  ];

  function buildHeaderHTML(activeKey) {
    var links = PAGES.map(function (p) {
      var cls = p.key === activeKey ? ' class="active"' : '';
      return '<a href="' + p.href + '" data-nav="' + p.key + '"' + cls + '>' +
        '<span class="port">' + p.port + '</span> ' + p.label + '</a>';
    }).join('\n      ');

    return (
      '<div class="wrap nav-inner">\n' +
      '    <a class="brand" href="index.html" data-nav="home">nick<span class="dot">.</span>giotsas</a>\n' +
      '    <nav class="links">\n      ' + links + '\n    </nav>\n' +
      '  </div>'
    );
  }

  var FOOTER_HTML =
    '<span>© <span id="year"></span> Nick Giotsas — served over TLS, mostly.</span>\n' +
    '  <span>uptime: since forever</span>';

  try {
    var header = document.querySelector('header.nav');
    if (header) {
      var activeKey = header.getAttribute('data-page') || 'home';
      header.innerHTML = buildHeaderHTML(activeKey);
    }
  } catch (e) {
    /* no-op: worst case the page has no nav bar */
  }

  try {
    var footer = document.querySelector('footer.wrap');
    if (footer) footer.innerHTML = FOOTER_HTML;
  } catch (e) {
    /* no-op: worst case the page has no footer */
  }

  try {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  } catch (e) {
    /* no-op: footer just shows nothing if this fails */
  }
})();
