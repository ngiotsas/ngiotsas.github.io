// NikOS — a Windows 10 (1709) look-alike that is really an about page with extra steps.
// No framework, no build step: same rules as the rest of the site. Icons in icons/*.png come
// from an icon pack; the NikOS logo and the window/tray glyphs are drawn inline below.
(function () {
  'use strict';

  // ---------- helpers ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const isNarrow = () => innerWidth <= 720;
  const TOUCH = matchMedia('(pointer:coarse)').matches;
  const desktopH = () => innerHeight - 40;

  function mkStore(kind) {
    return {
      get(k, d) { try { const v = window[kind].getItem('nikos:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
      set(k, v) { try { window[kind].setItem('nikos:' + k, JSON.stringify(v)); } catch (e) { /* private mode: just forget */ } }
    };
  }
  const store = mkStore('localStorage');
  const session = mkStore('sessionStorage');

  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const c of kids.flat()) if (c != null) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  }

  function openUrl(url) {
    if (url.startsWith('../')) location.href = url;
    else window.open(url, '_blank', 'noopener');
  }

  // ---------- icons ----------
  const PNG = ['bin', 'bookmarks', 'cmd', 'docs', 'drive', 'explorer', 'folder', 'gear', 'globe', 'info', 'mail',
    'net', 'notepad', 'pc', 'plant', 'shield', 'toolbox', 'txt', 'user', 'warn'];
  const SVG = {
    logo: '<path d="M7 26V6h4l11 13V6h3.5v20h-4L10.5 13v13z" fill="currentColor"/>'
  };
  function icon(name) {
    if (PNG.includes(name)) return `<img class="ic" src="icons/${name}.png" alt="" draggable="false">`;
    return `<svg class="ic" viewBox="0 0 32 32" aria-hidden="true">${SVG[name] || SVG.logo}</svg>`;
  }
  // thin line glyphs, like Segoe MDL2 Assets
  const L = {
    search: '<circle cx="9.5" cy="6.5" r="5"/><path d="M6 10.2L1.5 14.7"/>',
    // 1709 Task View: one window with the edges of its neighbours peeking out (1803 swapped it for the Timeline filmstrip)
    taskview: '<rect x="4.5" y="3.5" width="7" height="9"/><path d="M1.5 5.5v5M14.5 5.5v5"/>',
    up: '<path d="M3 10.5l5-5 5 5"/>',
    net: '<rect x="1.5" y="2.5" width="13" height="9"/><path d="M8 11.5v3M4.5 14.5h7"/>',
    vol: '<path d="M2 6h3l4-3v10l-4-3H2z"/><path d="M11 5.5c1 1.4 1 3.6 0 5M13 3.5c2 2.5 2 6.5 0 9"/>',
    ac: '<path d="M1.5 2.5h13v9h-7l-3 3v-3h-3z"/>',
    menu: '<path d="M1 4h14M1 8h14M1 12h14"/>',
    power: '<path d="M8 1.5v6"/><path d="M4.6 3.8a6 6 0 1 0 6.8 0"/>',
    doc: '<path d="M3.5 1.5h6l3 3v10h-9z"/><path d="M9.5 1.5v3h3"/>',
    gear: '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/><circle cx="8" cy="8" r="4.5"/>',
    back: '<path d="M14 8H2M7 3L2 8l5 5"/>',
    fwd: '<path d="M2 8h12M9 3l5 5-5 5"/>',
    upf: '<path d="M8 14V2M3 7l5-5 5 5"/>',
    home: '<path d="M1.5 8l6.5-6.5L14.5 8M3.5 6.5v8h3.5v-4h2v4h3.5v-8"/>',
    globe: '<circle cx="8" cy="8" r="6.5"/><path d="M1.5 8h13M8 1.5c-3 3.5-3 9.5 0 13M8 1.5c3 3.5 3 9.5 0 13"/>',
    brush: '<path d="M14.5 1.5L7 9"/><path d="M6.5 8c-2 0-3 1.2-3 3 0 1.5-1 2.5-2 3 3 .5 6-.5 6.5-3.5z"/>',
    apps: '<path d="M2 3h2M6 3h8M2 8h2M6 8h8M2 13h2M6 13h8"/>',
    lock: '<rect x="3" y="7.5" width="10" height="7"/><path d="M5 7.5V5a3 3 0 0 1 6 0v2.5"/>',
    update: '<path d="M13.5 6A6 6 0 0 0 2.6 5M2.5 10a6 6 0 0 0 10.9 1"/><path d="M2.5 1.5V5H6M13.5 14.5V11H10"/>',
    user: '<circle cx="8" cy="5" r="3"/><path d="M2 15c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/>',
    moon: '<path d="M12.5 10.5A5.5 5.5 0 0 1 5.5 3.5a5.5 5.5 0 1 0 7 7z"/>',
    sun: '<circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/>',
    tablet: '<rect x="2.5" y="1.5" width="11" height="13" rx="1"/><path d="M7 12.5h2"/>',
    pin: '<path d="M8 14.5s5-4.6 5-8.5a5 5 0 0 0-10 0c0 3.9 5 8.5 5 8.5z"/><circle cx="8" cy="6" r="1.8"/>',
    cast: '<rect x="1.5" y="2.5" width="13" height="9"/><path d="M5 14.5h6"/>',
    access: '<circle cx="8" cy="2.8" r="1.3"/><path d="M2.5 5.5L8 6.5l5.5-1M8 6.5v3l-2.5 5M8 9.5l2.5 5"/>'
  };
  const li = n => `<svg class="li" viewBox="0 0 16 16" aria-hidden="true">${L[n]}</svg>`;
  const GLYPH = {
    min: '<svg viewBox="0 0 10 10"><path d="M0 5.5h10"/></svg>',
    max: '<svg viewBox="0 0 10 10"><rect x=".5" y=".5" width="9" height="9"/></svg>',
    restore: '<svg viewBox="0 0 10 10"><rect x=".5" y="2.5" width="7" height="7"/><path d="M2.5 2.5V.5h7v7h-2"/></svg>',
    close: '<svg viewBox="0 0 10 10"><path d="M0 0l10 10M10 0L0 10"/></svg>'
  };

  // ---------- content (all of it lifted from the main site) ----------
  const DAD = '<a href="https://v.giotsas.com" target="_blank" rel="noopener">Vasilis</a>';

  const PROJECTS = [
    { name: 'giotsastech.com', url: 'https://giotsastech.com', icon: 'globe',
      desc: 'Managed hosting and IT services, run with my dad, Vasilis — web hosting, domain registration, app development, and enterprise-grade connectivity for EU clients.',
      tags: ['hosting', 'it-services', 'enterprise'], note: 'thank me family-member for building it!' },
    { name: 'AS207135', url: 'https://ipinfo.io/AS207135', icon: 'net',
      desc: "Autonomous system I run with my dad, Vasilis, under RIPE NCC — IPv6 blocks with RPKI validation, because trusting the internet's routing table blindly felt reckless.",
      tags: ['bgp', 'ripe-ncc', 'rpki', 'ipv6'], note: 'with Vasilis (Dad)' },
    { name: 'erhomai.gr', url: 'https://erhomai.gr', icon: 'globe',
      desc: "Έρχομαι — real-time OASA bus-arrival times for Athens, because the official app wasn't cutting it. Express backend, React/Vite frontend, MapLibre doing the actual map work.",
      tags: ['express', 'react', 'vite', 'maplibre'], note: 'solved my commute' },
    { name: 'greek-news-trust', url: 'https://ngiotsas.github.io/greek-news-trust/', icon: 'globe',
      desc: 'A GitHub Pages project looking at trust and transparency signals across Greek news outlets — trying to make media literacy a little more measurable instead of just a talking point.',
      tags: ['github-pages', 'media-literacy', 'greek'], note: 'a public-interest itch' },
    { name: 'georgegiotsas.com', url: 'https://georgegiotsas.com', icon: 'globe',
      desc: "An author's portfolio site — books and writing. Currently is rebuilt, so this is fresh.",
      tags: ['new-design'], note: 'for family' },
    { name: 'cactusgames.giotsas.tech', url: 'https://cactusgames.giotsas.tech', icon: 'globe',
      desc: 'A public site, or should I say "site" for a games website.',
      tags: ['coming-"soon"'], note: 'for the neighfriemdsbors' },
    { name: 'nick.giotsas', url: '../', icon: 'globe',
      desc: 'Hand-built, no framework, no build step — because a portfolio about infrastructure should probably not need a CDN to load its own text.',
      tags: ['html', 'css', 'vanilla-js'], note: 'the normal version of this' },
    { name: 'NikOS', url: null, icon: 'pc',
      desc: "A Windows 10 1709 look-alike that's really an about page with extra steps. Same rules as the main site: no framework, no build step.",
      tags: ['html', 'css', 'vanilla-js', 'nostalgia'], note: "you're in it", rows: [['Location', 'you are here']] }
  ];

  const TOOLBOX = [
    ['Hardware', 'MacBook Pro 16" (Nov 2023)', 'daily driver'],
    ['Hardware', 'Xiaomi phone', 'daily driver'],
    ['Hardware', 'Lenovo ThinkPad T440', 'has no business still running, doing duty as a "server". ThinkPads, am I right?'],
    ['Editor & Agents', 'VS Code', 'I think you know what that is'],
    ['Editor & Agents', 'Claude Code', 'writing code'],
    ['Editor & Agents', 'OpenCode (oc)', 'writing code'],
    ['Editor & Agents', 'Lovable', 'for when I want to do the AI roulette'],
    ['Remote & Servers', 'AnyDesk', 'reaching in'],
    ['Domains, DNS, Security', 'Cloudflare', 'names & records'],
    ['Domains, DNS, Security', 'Papaki.gr', 'names & records'],
    ['Domains, DNS, Security', 'Porkbun', 'names & records'],
    ['Domains, DNS, Security', 'Spaceship', 'names & records'],
    ['Domains, DNS, Security', 'DNSimple', 'names & records'],
    ['Hosting', 'GitHub Pages', 'where this lives'],
    ['Hosting', 'cPanel', 'old, ugly, and I will defend it anyway'],
    ['Hosting', 'Vercel', 'for anything that just needs to ship and I am bored to use CF. And I end up using CF.']
  ];

  const SUBS = [['r/PBSOD', '5/5'], ['r/ThinkPad', '5/5'], ['r/ThinkCat', '5/5'], ['r/GreeceDevs', '4.5/5'], ['r/vibecoding', '4/5']];
  const BOOKMARKS = ['lvwebsite.com', 'accessibility-widget.pages.dev', 'ninite.com', 'tronic.gr', 'pcx.gr', 'maps.google.com'];

  const TXT = {
    'about.txt':
`Most days start the same way: waking up, then a quick check of whatever DNS record broke overnight, then a genuinely embarrassing number of hours spent poking at AI agents to see what they'll do if I give them a little more rope.

I've been hooked on agentic engineering for a while now — not the hype version, the actual "why did it just decide to delete that file" version. Watching a system plan, use tools, and occasionally outsmart itself never really gets old, and it's the part of the day I'd do for free.

When that gets to be too much screen, I go stand in the garden (or balcony). It's a small one, nothing fancy, but it's the one thing in my life that doesn't respond well to a restart — you plant something, you wait, and the internet has no opinion about it either way.

Somewhere in between all of that is a cat who has never once respected an uptime requirement. Keyboards, laptops, whatever's warm — if it's in use, it's now a cat bed.

So that's the honest version: DNS by day, agents by obsession, a garden to stay sane, and a cat who runs the place either way.
`,
    'quirks.txt':
`quirks.txt — known issues, won't fix
=====================================

- I run my own piece of the internet, AS207135, with my dad, Vasilis (v.giotsas.com).
  GiotsasTech too.
- First thing every morning: find out which DNS record broke overnight.
- I argue with AI agents about why they deleted a file. Results so far: inconclusive.
- I call myself an agentic engineer, not a vibe coder. I still browse r/vibecoding.
- My "server" is a Lenovo ThinkPad T440 that has no business still running.
- I will defend cPanel. Old, ugly, defended anyway.
- I open Vercel when I'm bored of Cloudflare. I end up using Cloudflare.
- I've probably explained why your mail lands in spam more times than I'd like to admit.
- I built a bus-arrivals app (erhomai.gr) because the official one wasn't cutting it.
- The cat has root. Chair, keyboard, laptop: all reassigned.
- The garden is the only thing I run that can't be restarted.
- A friend asked if he could "hog" some IPs. I still don't know what "hog" means.
  I prepared a document anyway. Explanations welcome via Mail.
- r/PBSOD is rated 5/5. Try not to click DO NOT CLICK.exe.
`,
    'whatever.txt':
`whatever.txt
============

This is the one part with no structure imposed on it. So this website is probably gonna be your first version of you even seeing the site... and I hope. The old one was ugly, but it "did its job".

Anyway. Sun Sept. 20, 2026. A friend of mine asked me if he can "hog" (guys what does hog mean, please send me an email explaining what that is) some IPs from AS207135 (which I run with my dad, Vasilis) so I prepared a document.

Check back — this section is meant to change more often than the rest of the site.
`,
    'osi-stack.txt':
`What I actually touch (OSI, roughly)
====================================

L1-3  routing     Network & Numbers
                  BGP · RIPE NCC · ASN & IPv6 allocation · RPKI · route filtering
                  — AS207135, which I run with my dad, Vasilis

L7    mail        Email Infrastructure
                  SPF · DKIM · DMARC · BIMI/VMC · MTA-STS

L7    ops         Server & Identity
                  cPanel/WHM · Linux hosting · Microsoft 365 · Entra ID — the pager-duty layer

L7    apps        Web Development
                  PHP · MySQL · HTML/CSS/JS · WordPress

—     data        Spreadsheet Wizardry
                  Advanced Microsoft Access · relational schemas

—     obsession   Agentic Engineering
                  LLM agents, tool-calling, autonomy loops — the thing I'd do even if nobody paid me
`
  };

  const FACTS = [
    ['Like what you see?', 'I run AS207135, my own piece of the internet, with my dad, Vasilis.'],
    ['Did you know?', 'The cat has never once respected an uptime requirement.'],
    ['Fun fact', 'My "server" is a ThinkPad T440 that has no business still running.'],
    ['Daily routine', 'Wake up. Check which DNS record broke overnight. Argue with an AI agent.'],
    ['Hot take', 'cPanel is old and ugly and I will defend it anyway.']
  ];

  // ---------- File Explorer folders ----------
  const txtItem = name => ({ name, kind: 'txt', icon: 'txt', text: TXT[name], desc: 'Text Document' });
  const FOLDERS = {
    pc: { name: 'This PC', icon: 'pc', desc: 'Everything on NICK-PC, give or take what the AI agent deleted.', items: () => [
      { name: 'Documents', kind: 'folder', icon: 'docs', to: 'docs' },
      { name: 'Projects', kind: 'folder', icon: 'folder', to: 'projects' },
      { name: 'Toolbox', kind: 'folder', icon: 'toolbox', to: 'toolbox' },
      { name: 'Subreddits', kind: 'folder', icon: 'folder', to: 'subs' },
      { name: 'Bookmarks', kind: 'folder', icon: 'bookmarks', to: 'bookmarks' },
      { name: 'NikOS (C:)', kind: 'info', icon: 'drive', desc: 'Local Disk. 207,135 MB free of a number I made up.', rows: [['File system', 'NTFS (Nick\'s Totally Fine System)'], ['Cat hair', 'present']] }
    ] },
    docs: { name: 'Documents', icon: 'docs', desc: 'The text version of me.', items: () => Object.keys(TXT).map(txtItem) },
    projects: { name: 'Projects', icon: 'folder', desc: 'Things I kept coming back to on evenings and weekends until they turned into real projects.',
      items: () => PROJECTS.map(p => ({ ...p, kind: p.url ? 'url' : 'info' })) },
    toolbox: { name: 'Toolbox', icon: 'toolbox', desc: "Not sponsored by anyone. Just what's open, plugged in, or SSH'd into on a given day.",
      items: () => TOOLBOX.map(([g, n, note]) => ({ name: n, kind: 'info', icon: g === 'Hardware' ? 'pc' : 'toolbox', desc: g, note })) },
    subs: { name: 'Subreddits', icon: 'folder', desc: "Where I actually spend my scrolling time. Yes, I still browse r/vibecoding even though I'd call myself an agentic engineer.",
      items: () => SUBS.map(([n, r]) => ({ name: n, kind: 'url', icon: 'globe', url: 'https://reddit.com/' + n, desc: 'Rating: ' + r })) },
    bookmarks: { name: 'Bookmarks', icon: 'bookmarks', desc: 'Not mine — just a handful I keep coming back to.',
      items: () => BOOKMARKS.map(n => ({ name: n, kind: 'url', icon: 'globe', url: 'https://' + n + '/' })) },
    bin: { name: 'Recycle Bin', icon: 'bin', desc: 'Things that are gone but not forgotten.', bin: true, items: () => [
      { name: 'Tasklyte', kind: 'info', icon: 'folder', desc: "A task manager, vibe-coded from scratch because every existing one had a feature I didn't want and was missing the one I did.",
        rows: [['Original location', 'C:\\Projects'], ['Deleted by', 'me (abandoned)']], note: 'a weekend build' },
      { name: 'old-website', kind: 'info', icon: 'folder', desc: 'The previous nick.giotsas. It was ugly, but it "did its job".',
        rows: [['Original location', 'C:\\Projects'], ['Deleted by', 'me, with relief']] },
      { name: 'important_file.txt', kind: 'info', icon: 'txt', desc: 'No idea what was in it. That is sort of the point.',
        rows: [['Original location', 'C:\\Users\\nick'], ['Deleted by', 'an AI agent'], ['Reason', 'it seemed like a good idea at the time']], note: "I'm still arguing with it about this." }
    ] }
  };
  const NAV = ['pc', 'docs', 'projects', 'toolbox', 'subs', 'bookmarks', null, 'bin'];

  // ---------- window manager ----------
  const W = { list: [], z: 100, focused: null, seq: 0, desk: 1, desks: [1] };
  const here = () => W.list.filter(r => r.desk === W.desk);

  function createWindow(app, o) {
    o = o || {};
    const rec = { id: ++W.seq, app: app.id, title: o.title || app.title, desk: W.desk };
    const win = h('div', { class: 'win', role: 'dialog', 'aria-label': rec.title });
    const tTitle = h('span', { class: 'ttitle' }, rec.title);
    const bMin = h('button', { class: 'wbtn', title: 'Minimize', 'aria-label': 'Minimize', html: GLYPH.min });
    const bMax = h('button', { class: 'wbtn', title: 'Maximize', 'aria-label': 'Maximize', html: GLYPH.max });
    const bClose = h('button', { class: 'wbtn close', title: 'Close', 'aria-label': 'Close', html: GLYPH.close });
    const bar = h('div', { class: 'titlebar' }, h('span', { class: 'ticon', html: icon(o.icon || app.icon) }), tTitle, bMin, bMax, bClose);
    const body = h('div', { class: 'wbody' });
    win.append(bar, body);

    const dh = desktopH();
    const w = Math.min(o.w || app.w || 640, innerWidth - 16);
    const ht = Math.min(o.h || app.h || 440, dh - 16);
    const n = W.list.length % 7;
    const left = Math.max(8, Math.min((innerWidth - w) / 2 - 90 + n * 30, innerWidth - w - 8));
    const top = Math.max(8, Math.min((dh - ht) / 2 - 50 + n * 30, dh - ht - 8));
    Object.assign(win.style, { left: left + 'px', top: top + 'px', width: w + 'px', height: ht + 'px' });
    if (isNarrow()) win.classList.add('max');

    Object.assign(rec, {
      win, body, bar, bMax,
      setTitle(t) { rec.title = t; tTitle.textContent = t; win.setAttribute('aria-label', t); updateTaskbar(); }
    });
    bMin.addEventListener('click', () => minimize(rec));
    bMax.addEventListener('click', () => setMax(rec, !win.classList.contains('max')));
    bClose.addEventListener('click', () => closeWin(rec));
    bar.addEventListener('dblclick', e => { if (!e.target.closest('.wbtn')) setMax(rec, !win.classList.contains('max')); });
    win.addEventListener('pointerdown', () => { if (W.focused !== rec) focusWin(rec); }, true);
    makeDraggable(rec);

    $('#windows').append(win);
    W.list.push(rec);
    focusWin(rec);
    return rec;
  }

  function setMax(rec, on) {
    if (isNarrow() && !on) return;
    rec.win.classList.toggle('max', on);
    rec.bMax.innerHTML = on ? GLYPH.restore : GLYPH.max;
    rec.bMax.title = on ? 'Restore Down' : 'Maximize';
  }

  function focusWin(rec) {
    rec.win.style.zIndex = ++W.z;
    W.list.forEach(r => r.win.classList.toggle('inactive', r !== rec));
    W.focused = rec;
    updateTaskbar();
  }

  function topVisible() {
    return here().filter(r => !r.win.classList.contains('minimized'))
      .sort((a, b) => b.win.style.zIndex - a.win.style.zIndex)[0];
  }

  function minimize(rec) {
    rec.win.classList.add('minimized');
    if (W.focused === rec) {
      W.focused = null;
      W.list.forEach(r => r.win.classList.add('inactive'));
      const next = topVisible();
      if (next) focusWin(next); else updateTaskbar();
    }
  }

  function restore(rec) {
    rec.win.classList.remove('minimized');
    focusWin(rec);
  }

  function closeWin(rec) {
    if (rec.onclose) rec.onclose();
    rec.win.remove();
    W.list = W.list.filter(r => r !== rec);
    if (W.focused === rec) {
      W.focused = null;
      const next = topVisible();
      if (next) { focusWin(next); return; }
    }
    updateTaskbar();
  }

  function closeAll() { W.list.slice().forEach(closeWin); }

  function makeDraggable(rec) {
    const { bar, win } = rec;
    let s = null;
    bar.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.wbtn') || isNarrow()) return;
      s = { x: e.clientX, y: e.clientY, l: win.offsetLeft, t: win.offsetTop, pend: win.classList.contains('max') };
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove', e => {
      if (!s) return;
      if (s.pend) {
        // dragging a maximized window restores it under the pointer, like the real thing
        if (Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return;
        setMax(rec, false);
        const w = win.offsetWidth;
        s = { x: e.clientX, y: e.clientY, l: Math.max(0, Math.min(e.clientX - w / 2, innerWidth - w)), t: 0, pend: false };
      }
      win.style.left = (s.l + e.clientX - s.x) + 'px';
      win.style.top = Math.max(0, Math.min(desktopH() - 32, s.t + e.clientY - s.y)) + 'px';
    });
    bar.addEventListener('pointerup', e => {
      if (!s) return;
      const moved = !s.pend;
      s = null;
      if (!moved) return;
      // Aero snap: top edge maximizes, side edges tile
      if (e.clientY <= 1) setMax(rec, true);
      else if (e.clientX <= 1 || e.clientX >= innerWidth - 2) {
        const half = Math.floor(innerWidth / 2);
        Object.assign(win.style, { left: (e.clientX <= 1 ? 0 : innerWidth - half) + 'px', top: '0px', width: half + 'px', height: desktopH() + 'px' });
      }
    });
    bar.addEventListener('pointercancel', () => { s = null; });
  }

  // ---------- taskbar ----------
  const PINNED = ['explorer', 'settings', 'cmd', 'mail'];

  function updateTaskbar() {
    const wrap = $('#tb-apps');
    const running = [...new Set(here().map(r => r.app))];
    const ids = PINNED.concat(running.filter(a => !PINNED.includes(a)));
    $$('.tbtn', wrap).forEach(b => { if (!ids.includes(b.dataset.app)) b.remove(); });
    ids.forEach(id => {
      let b = wrap.querySelector(`[data-app="${id}"]`);
      if (!b) {
        b = h('button', { class: 'tbtn reveal', 'data-app': id, 'aria-label': APPS[id].title, html: icon(APPS[id].icon) });
        b.addEventListener('click', () => taskClick(id));
        wrap.append(b);
      }
      const wins = here().filter(r => r.app === id);
      b.classList.toggle('running', wins.length > 0);
      b.classList.toggle('active', !!W.focused && W.focused.app === id);
      b.title = wins.length === 1 ? wins[0].title : APPS[id].title;
    });
  }

  function taskClick(id) {
    closePanels();
    const wins = here().filter(r => r.app === id);
    if (!wins.length) { openApp(id); return; }
    if (wins.length === 1) {
      const r = wins[0];
      if (W.focused === r && !r.win.classList.contains('minimized')) minimize(r); else restore(r);
      return;
    }
    const i = wins.indexOf(W.focused);
    restore(wins[(i + 1) % wins.length]);
  }

  // ---------- apps ----------
  const APPS = {
    explorer: { title: 'File Explorer', icon: 'explorer', w: 900, h: 540, render: renderExplorer },
    settings: { title: 'Settings', icon: 'gear', w: 900, h: 600, singleton: true, render: renderSettings },
    cmd: { title: 'Command Prompt', icon: 'cmd', w: 740, h: 440, render: renderCmd },
    notepad: { title: 'Notepad', icon: 'notepad', w: 660, h: 480, render: renderNotepad },
    mail: { title: 'Mail', icon: 'mail', w: 940, h: 580, singleton: true, render: renderMail },
    garden: { title: 'Garden', icon: 'plant', w: 420, h: 520, singleton: true, render: renderGarden }
  };
  Object.keys(APPS).forEach(k => { APPS[k].id = k; });

  function openApp(id, arg) {
    closePanels();
    const app = APPS[id];
    if (app.singleton) {
      const ex = W.list.find(r => r.app === id);
      if (ex) { restore(ex); if (ex.onArg && arg) ex.onArg(arg); return ex; }
    }
    const rec = createWindow(app);
    app.render(rec, arg);
    return rec;
  }

  // things you can launch from the desktop, Start and search
  const LAUNCH = [
    { name: 'About Nick', icon: 'user', go: () => openApp('settings', 'about'), kw: 'whoami me info' },
    { name: 'Command Prompt', icon: 'cmd', go: () => openApp('cmd'), kw: 'cmd terminal shell' },
    { name: 'DO NOT CLICK.exe', icon: 'warn', go: () => bsod(), kw: 'crash bsod' },
    { name: 'File Explorer', icon: 'explorer', go: () => openApp('explorer', 'pc'), kw: 'files this pc' },
    { name: 'Garden', icon: 'plant', go: () => openApp('garden'), kw: 'plant water' },
    { name: 'GitHub', icon: 'globe', go: () => openUrl('https://github.com/ngiotsas'), kw: 'code ngiotsas' },
    { name: 'Mail', icon: 'mail', go: () => openApp('mail'), kw: 'contact email' },
    { name: 'nick.giotsas', icon: 'globe', go: () => openUrl('../'), kw: 'website home back' },
    { name: 'Notepad', icon: 'notepad', go: () => openApp('notepad'), kw: 'text' },
    { name: 'Projects', icon: 'folder', go: () => openApp('explorer', 'projects'), kw: 'work portfolio' },
    { name: 'quirks.txt', icon: 'txt', go: () => openTxt('quirks.txt'), kw: 'quirks fun' },
    { name: 'Recycle Bin', icon: 'bin', go: () => openApp('explorer', 'bin'), kw: 'trash deleted' },
    { name: 'Settings', icon: 'gear', go: () => openApp('settings'), kw: 'control panel' }
  ];
  const launch = name => LAUNCH.find(l => l.name === name);

  function openTxt(name) { openApp('notepad', { name, text: TXT[name] }); }

  // ----- File Explorer -----
  function renderExplorer(rec, start) {
    const hist = [];
    let cur = null, sel = null, filter = '';
    rec.body.innerHTML = `
      <div class="ribbon"><span class="file">File</span><span>Home</span><span>Share</span><span>View</span></div>
      <div class="addr">
        <button class="bk" title="Back" aria-label="Back">${li('back')}</button>
        <button title="Forward" disabled aria-label="Forward">${li('fwd')}</button>
        <button class="upb" title="Up" aria-label="Up">${li('upf')}</button>
        <div class="path"></div>
        <input class="find" placeholder="Search" aria-label="Search folder">
      </div>
      <div class="exp"><div class="navp"></div><div class="items" tabindex="0"></div><div class="details selectable"></div></div>
      <div class="status"></div>`;
    const q = s => $(s, rec.body);
    const nav = q('.navp'), itemsEl = q('.items'), det = q('.details');

    NAV.forEach(k => {
      if (!k) { nav.append(h('div', { class: 'sep' })); return; }
      const b = h('button', { 'data-k': k, html: icon(FOLDERS[k].icon) + esc(FOLDERS[k].name) });
      b.addEventListener('click', () => go(k));
      nav.append(b);
    });
    q('.bk').addEventListener('click', () => { if (hist.length) go(hist.pop(), false); });
    q('.upb').addEventListener('click', () => { if (cur !== 'pc') go('pc'); });
    q('.find').addEventListener('input', e => { filter = e.target.value.toLowerCase(); draw(); });

    function go(key, push) {
      if (push !== false && cur && cur !== key) hist.push(cur);
      cur = key; sel = null; filter = ''; q('.find').value = '';
      draw();
    }
    rec.onArg = k => go(k);

    function list() { return FOLDERS[cur].items().filter(i => !filter || i.name.toLowerCase().includes(filter)); }

    function draw() {
      const f = FOLDERS[cur];
      rec.setTitle(f.name);
      const crumbs = cur === 'pc' || cur === 'bin' ? esc(f.name) : `This PC &nbsp;›&nbsp; ${esc(f.name)}`;
      q('.path').innerHTML = icon(f.icon) + crumbs;
      q('.bk').disabled = !hist.length;
      q('.upb').disabled = cur === 'pc';
      $$('button', nav).forEach(b => b.classList.toggle('on', b.dataset.k === cur));
      const items = list();
      itemsEl.innerHTML = '';
      if (!items.length) itemsEl.append(h('div', { class: 'empty' }, 'This folder is empty.'));
      items.forEach(it => {
        const b = h('button', { class: 'item' + (sel === it.name ? ' sel' : ''), html: icon(it.icon) + `<span>${esc(it.name)}</span>` });
        b.addEventListener('click', () => { sel = it.name; $$('.item', itemsEl).forEach(x => x.classList.toggle('sel', x === b)); details(it); if (TOUCH) openItem(it); });
        b.addEventListener('dblclick', () => openItem(it));
        itemsEl.append(b);
      });
      const s = items.find(i => i.name === sel);
      s ? details(s) : folderDetails(f, items.length);
      q('.status').textContent = items.length + (items.length === 1 ? ' item' : ' items');
    }

    function folderDetails(f, n) {
      det.innerHTML = `<div class="big">${icon(f.icon)}</div><h3>${esc(f.name)}</h3><div class="dtype">${n} items</div><p>${esc(f.desc)}</p>`;
      if (f.bin) {
        const empty = h('button', { class: 'btn' }, 'Empty Recycle Bin');
        empty.addEventListener('click', () => toast('Recycle Bin', "Can't empty it. The AI agent's lawyer says these are evidence.", 'bin'));
        const rest = h('button', { class: 'btn' }, 'Restore all items');
        rest.addEventListener('click', () => toast('Recycle Bin', 'Restoring Tasklyte would mean finishing Tasklyte. No.', 'bin'));
        det.append(empty, rest);
      }
    }

    function details(it) {
      // toolbox entries carry only a group name, which reads best as the subtitle
      const short = it.kind === 'info' && !it.rows;
      const type = short ? it.desc : { folder: 'File folder', txt: 'Text Document', url: 'Internet Shortcut', info: 'Item' }[it.kind];
      const rows = (it.rows || []).concat(it.url ? [['URL', it.url === '../' ? 'nick.giotsas (main site)' : it.url]] : []);
      det.innerHTML = `<div class="big">${icon(it.icon)}</div><h3>${esc(it.name)}</h3>
        <div class="dtype">${esc(type)}</div>
        ${it.desc && !short && it.kind !== 'txt' ? `<p>${esc(it.desc)}</p>` : ''}
        ${it.tags ? `<div>${it.tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
        ${it.note ? `<p class="dnote">“${esc(it.note)}”</p>` : ''}
        ${rows.length ? `<dl>${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : ''}`;
      if (it.kind !== 'info') {
        const b = h('button', { class: 'btn primary' }, it.kind === 'url' ? 'Open site' : 'Open');
        b.addEventListener('click', () => openItem(it));
        det.append(b);
      }
    }

    function openItem(it) {
      if (it.kind === 'folder') go(it.to);
      else if (it.kind === 'txt') openTxt(it.name);
      else if (it.kind === 'url') openUrl(it.url);
    }

    go(start || 'pc');
  }

  // ----- Settings -----
  const ACCENTS = ['#0078d7', '#0063b1', '#8764b8', '#881798', '#c30052', '#e81123', '#ca5010', '#ff8c00',
    '#986f0b', '#107c10', '#00b294', '#038387', '#2d7d9a', '#515c6b', '#4c4a48', '#69797e'];
  const SETTINGS = [
    ['home', 'Home', 'home'],
    ['about', 'About', 'net'],
    ['network', 'Network & Internet', 'globe'],
    ['personalization', 'Personalization', 'brush'],
    ['apps', 'Apps & features', 'apps'],
    ['privacy', 'Privacy', 'lock'],
    ['update', 'Update & Security', 'update']
  ];

  function renderSettings(rec, start) {
    rec.body.innerHTML = `<div class="set"><div class="set-side"><h2>Settings</h2>
      <input class="sfind" placeholder="Find a setting" aria-label="Find a setting"></div><div class="set-main selectable"></div></div>`;
    const side = $('.set-side', rec.body), main = $('.set-main', rec.body);
    SETTINGS.forEach(([k, label, ic]) => {
      const b = h('button', { 'data-k': k, html: li(ic) + esc(label) });
      b.addEventListener('click', () => show(k));
      side.append(b);
    });
    $('.sfind', side).addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const v = e.target.value.toLowerCase();
      const hit = SETTINGS.find(([k, l]) => (k + l).toLowerCase().includes(v));
      if (hit) show(hit[0]); else toast('Settings', `No setting called "${e.target.value}". Have you tried turning it off and on again?`, 'gear');
    });

    function show(k) {
      $$('button', side).forEach(b => b.classList.toggle('on', b.dataset.k === k));
      main.scrollTop = 0;
      main.innerHTML = PAGES[k]();
      rec.setTitle(k === 'home' ? 'Settings' : 'Settings — ' + SETTINGS.find(s => s[0] === k)[1]);
      wire(k);
    }
    rec.onArg = show;

    const PAGES = {
      home: () => `<h1>NikOS Settings</h1><div class="home-grid">${[
        ['about', 'net', 'System', 'About this PC, and who owns it'],
        ['network', 'globe', 'Network & Internet', 'AS207135, GiotsasTech'],
        ['personalization', 'brush', 'Personalization', 'Background, colors'],
        ['apps', 'apps', 'Apps', "What's actually in my toolbox"],
        ['privacy', 'lock', 'Privacy', 'Cat permissions'],
        ['update', 'update', 'Update & Security', 'Version 1803: postponed']
      ].map(([k, ic, t, d]) => `<button data-go="${k}">${li(ic)}<span>${t}<small>${d}</small></span></button>`).join('')}</div>`,

      about: () => `<h1>About</h1>
        <div class="shield"><span class="ok">✓</span><div>Your PC is monitored and protected.<br><small>Mostly by the cat.</small></div></div>
        <h2>Device specifications</h2>
        <dl class="spec">
          <dt>Device name</dt><dd>NICK-PC</dd>
          <dt>Owner</dt><dd>Nick Giotsas</dd>
          <dt>Processor</dt><dd>Agentic engineering, running hot</dd>
          <dt>Installed RAM</dt><dd>Enough for DNS, mail, servers, websites, uhm and whatever</dd>
          <dt>Device ID</dt><dd>AS207135</dd>
          <dt>System type</dt><dd>Human, x64-based, operated by a cat</dd>
          <dt>Pen and touch</dt><dd>Touch is reserved for the cat</dd>
        </dl>
        <p style="margin-top:14px"><button class="btn" data-act="rename">Rename this PC</button></p>
        <h2>NikOS specifications</h2>
        <dl class="spec">
          <dt>Edition</dt><dd>NikOS Pro</dd>
          <dt>Version</dt><dd>1709 (Fall Creators Update — the good one)</dd>
          <dt>OS build</dt><dd>16299.207135</dd>
          <dt>Co-maintainer</dt><dd>${DAD} (Dad) — AS207135 and GiotsasTech</dd>
        </dl>
        <h2>The honest version</h2>
        <p>I build and run the unglamorous stuff that makes the internet work — DNS zones that don't lie, mail that authenticates, servers that stay up, websites that load, uhm and whatever.</p>
        <p>Then I go argue with an AI agent about why it deleted a file, water something in the garden, and lose my chair to the cat. In that order, most days.</p>
        <h2>Related settings</h2>
        <p><a href="#" data-act="quirks">Read quirks.txt</a><br><a href="#" data-act="mail">Contact me</a><br>
        <a href="https://github.com/ngiotsas" target="_blank" rel="noopener">GitHub</a><br><a href="../">Back to the normal site</a></p>`,

      network: () => `<h1>Network & Internet</h1>
        <h2>Network status</h2>
        <div class="netdiag"><div class="node">${icon('pc')}NICK-PC</div><div class="wire"></div>
          <div class="node">${icon('net')}AS207135</div><div class="wire"></div><div class="node">${icon('globe')}Internet</div></div>
        <p><b>You're connected to the Internet.</b> Actually, you're part of it.</p>
        <dl class="spec">
          <dt>Autonomous system</dt><dd>AS207135</dd>
          <dt>Run by</dt><dd>Me and my dad, ${DAD}</dd>
          <dt>Registry</dt><dd>RIPE NCC</dd>
          <dt>Address family</dt><dd>IPv6</dd>
          <dt>Route origin</dt><dd>RPKI-validated, because trusting the routing table blindly felt reckless</dd>
        </dl>
        <p style="margin-top:14px"><a class="btn primary" style="text-decoration:none;display:inline-block" href="https://ipinfo.io/AS207135" target="_blank" rel="noopener">View AS207135 on ipinfo.io</a></p>
        <h2>Also run with my dad</h2>
        <p><a href="https://giotsastech.com" target="_blank" rel="noopener">GiotsasTech</a> — managed hosting and IT services: web hosting, domain registration, app development, and enterprise-grade connectivity for EU clients.</p>
        <h2>Layers I touch</h2>
        <p>BGP · RIPE NCC · RPKI · route filtering · SPF · DKIM · DMARC · BIMI/VMC · MTA-STS · cPanel/WHM · Microsoft 365 · Entra ID</p>`,

      personalization: () => {
        const cur = store.get('accent', '#0078d7');
        const beams = store.get('beams', false);
        return `<h1>Personalization</h1>
        <h2>Background</h2>
        <div class="wp-prev"><div class="wallpaper"></div></div>
        <p><label><input type="radio" name="wp" value="hero" ${beams ? '' : 'checked'}> Hero (the classic)</label><br>
        <label><input type="radio" name="wp" value="beams" ${beams ? 'checked' : ''}> NikOS light beams (follows your accent color)</label></p>
        <h2>Choose your accent color</h2>
        <div class="swatches">${ACCENTS.map(c => `<button data-accent="${c}" class="${c === cur ? 'on' : ''}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div>
        <h2>More options</h2>
        <span class="tog-l">Transparency effects</span>
        <div class="tog"><button class="sw ${store.get('transparency', true) ? 'on' : ''}" data-act="transparency" aria-label="Transparency effects"></button><span>${store.get('transparency', true) ? 'On' : 'Off'}</span></div>`;
      },

      apps: () => `<h1>Apps & features</h1><p>Not sponsored by anyone. This is just what's open, plugged in, or SSH'd into on a given day.</p>
        <div class="applist-s">${TOOLBOX.map(([g, n, note]) => `<div><span class="aicon">${icon(g === 'Hardware' ? 'pc' : 'toolbox')}</span><span>${esc(n)}<small>${esc(note)}</small></span><em>${esc(g)}</em></div>`).join('')}</div>`,

      privacy: () => `<h1>Privacy</h1><p class="managed">*Some settings are managed by your cat.</p>
        ${[
          ['Let apps use my camera', false, false],
          ['Let AI agents delete files without asking', false, false],
          ['Let the garden be offline', true, false],
          ['Let the cat use my chair', true, true],
          ['Let the cat use my keyboard', true, true]
        ].map(([l, on, locked]) => `<span class="tog-l">${l}</span><div class="tog"><button class="sw ${on ? 'on' : ''}" ${locked ? 'disabled title="Managed by your cat"' : 'data-act="flip"'} aria-label="${l}"></button><span>${on ? 'On' : 'Off'}</span></div>`).join('')}`,

      update: () => `<h1>NikOS Update</h1>
        <div class="shield"><span class="ok">✓</span><div><b class="upd-s">You're up to date</b><br><small class="upd-t">Last checked: whenever the cat walked across the keyboard</small></div></div>
        <p><button class="btn" data-act="check">Check for updates</button></p>
        <h2>Feature update to NikOS, version 1803</h2>
        <p>Status: postponed indefinitely. It has Timeline. 1709 doesn't need Timeline.</p>
        <h2>Update history</h2>
        <dl class="spec">
          <dt>16299.207135</dt><dd>Added note that AS207135 and GiotsasTech are run with my dad, Vasilis</dd>
          <dt>16299.15</dt><dd>Moved the chair. The cat moved it back.</dd>
          <dt>16299.1</dt><dd>Replaced the old ugly website. It did its job.</dd>
        </dl>`
    };

    function wire(k) {
      $$('[data-go]', main).forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
      $$('[data-act]', main).forEach(b => b.addEventListener('click', e => {
        const act = b.dataset.act;
        if (b.tagName === 'A') e.preventDefault();
        if (act === 'rename') toast('Settings', "No. It's NICK-PC. It has always been NICK-PC.", 'gear');
        if (act === 'quirks') openTxt('quirks.txt');
        if (act === 'mail') openApp('mail', 'compose');
        if (act === 'flip') { b.classList.toggle('on'); b.nextElementSibling.textContent = b.classList.contains('on') ? 'On' : 'Off'; }
        if (act === 'transparency') {
          const on = !store.get('transparency', true);
          store.set('transparency', on); applyLook(); show('personalization');
        }
        if (act === 'check') {
          $('.upd-s', main).textContent = 'Checking for updates…';
          setTimeout(() => { $('.upd-s', main).textContent = "You're up to date"; $('.upd-t', main).textContent = 'Last checked: just now. Nothing to see here.'; }, 1800);
        }
      }));
      if (k === 'personalization') {
        $$('[data-accent]', main).forEach(b => b.addEventListener('click', () => { store.set('accent', b.dataset.accent); applyLook(); show('personalization'); }));
        $$('input[name=wp]', main).forEach(r => r.addEventListener('change', () => { store.set('beams', r.value === 'beams'); applyLook(); }));
      }
    }

    show(start || 'home');
  }

  // ----- Command Prompt -----
  const PROMPT = 'C:\\Users\\nick>';
  function renderCmd(rec) {
    const out = h('div', { class: 'cmd selectable' });
    const input = h('input', { 'aria-label': 'Command', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off' });
    const line = h('div', { class: 'line' }, h('span', null, PROMPT), input);
    out.append(h('div', null, 'NikOS [Version 10.0.16299.207135]\n(c) 2017 Nick Giotsas. Some rights reserved, the cat has the rest.\n\nType "help" to see what I can do.\n\n'), line);
    rec.body.append(out);
    const hist = [];
    let hi = 0, busy = false;

    const print = (t = '') => { line.before(h('div', null, t)); out.scrollTop = out.scrollHeight; };
    const wait = ms => new Promise(r => setTimeout(r, ms));
    out.addEventListener('click', () => { if (!String(getSelection())) input.focus(); });
    setTimeout(() => input.focus(), 50);

    input.addEventListener('keydown', async e => {
      if (e.key === 'ArrowUp' && hi > 0) { input.value = hist[--hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
      if (e.key !== 'Enter' || busy) return;
      const raw = input.value.trim();
      input.value = '';
      print(PROMPT + raw);
      if (raw) { hist.push(raw); hi = hist.length; }
      busy = true; line.style.visibility = 'hidden';
      try { await run(raw); } finally { busy = false; line.style.visibility = ''; print(); input.focus(); }
    });

    async function run(raw) {
      if (!raw) return;
      const [cmd0, ...args] = raw.split(/\s+/);
      const cmd = cmd0.toLowerCase();
      const arg = args.join(' ');
      switch (cmd) {
        case 'help':
          print(`For more information on a specific command, don't. Just try it.

WHOAMI     Who's at the keyboard (when the cat isn't)
DIR        List my documents
TYPE       Show a document, e.g. "type quirks.txt"
IPCONFIG   Show network configuration
WHOIS      Look up AS207135
PING       Ping something. Try "ping cat"
TRACERT    Trace the route through my projects
NEOFETCH   The toolbox, in one screen
START      Open an app: start explorer | settings | mail | notepad | garden
WATER      Water the garden
CAT        Summon the cat
VER        Show the NikOS version
DATE       Today
CLS        Clear the screen
EXIT       Close this window
CRASH      Please don't`);
          break;
        case 'whoami':
          print('nick-pc\\nick\n\nNick Giotsas — DNS by day, agents by obsession, a garden to stay sane,\nand a cat who runs the place either way.'); break;
        case 'ver': print('NikOS [Version 10.0.16299.207135]'); break;
        case 'cls': $$('div', out).forEach(d => { if (d !== line) d.remove(); }); break;
        case 'exit': closeWin(rec); break;
        case 'date': case 'time': print(new Date().toString()); break;
        case 'echo': print(arg); break;
        case 'cd': print("You're already where you need to be."); break;
        case 'dir': case 'ls':
          print(` Volume in drive C is NikOS
 Directory of C:\\Users\\nick\n`);
          Object.keys(TXT).forEach(n => print(`20/09/2026  09:41    ${String(TXT[n].length).padStart(10)} ${n}`));
          print(`20/09/2026  09:41    <DIR>          Projects\n20/09/2026  09:41    <DIR>          Toolbox\n               ${Object.keys(TXT).length} File(s)\n               2 Dir(s)  one cat bed`);
          if (cmd === 'ls') print("\n(This is cmd. It's DIR here. I let it slide.)");
          break;
        case 'type': case 'cat':
          if (cmd === 'cat' && !arg) { print('Meow.'); spawnCat(true); break; }
          if (TXT[arg.toLowerCase()]) print(TXT[arg.toLowerCase()]);
          else print('The system cannot find the file specified.\nTry: ' + Object.keys(TXT).join(', '));
          break;
        case 'ipconfig':
          print(`NikOS IP Configuration

Ethernet adapter AS207135:

   Connection-specific DNS Suffix  . : giotsas.com
   IPv6 Address. . . . . . . . . . . : 2001:db8:207:135::1
                                       (documentation prefix — the real ones are on ipinfo.io/AS207135)
   Autonomous System . . . . . . . . : AS207135
   Operated by . . . . . . . . . . . : Nick & Vasilis (Dad) — v.giotsas.com
   RPKI. . . . . . . . . . . . . . . : Valid
   Default Gateway . . . . . . . . . : the cat (sitting on the router)`);
          break;
        case 'whois':
          if (arg && !/207135/.test(arg)) { print(`whois: I only really care about AS207135. Try "whois as207135".`); break; }
          print(`aut-num:        AS207135
source:         RIPE
address-family: IPv6
rpki:           valid
operated-by:    Nick Giotsas
operated-by:    Vasilis (Dad) — https://v.giotsas.com
also-runs:      GiotsasTech — https://giotsastech.com
remarks:        A friend asked to "hog" some IPs. A document was prepared.
more-info:      https://ipinfo.io/AS207135`);
          break;
        case 'ping': {
          const host = arg || 'nick.giotsas';
          if (/cat/i.test(host)) {
            print(`\nPinging ${host} with 32 bytes of data:`);
            for (let i = 0; i < 4; i++) { await wait(700); print('Request timed out.'); }
            print('\nThe cat does not respond to pings. The cat responds to food.');
            break;
          }
          print(`\nPinging ${host} [2001:db8:207:135::1] with 32 bytes of data:`);
          const times = [];
          for (let i = 0; i < 4; i++) { await wait(450); const t = Math.round(rand(3, 24)); times.push(t); print(`Reply from 2001:db8:207:135::1: time=${t}ms`); }
          print(`\nPing statistics: Sent = 4, Received = 4, Lost = 0 (0% loss).\nAverage = ${Math.round(times.reduce((a, b) => a + b) / 4)}ms. It's not DNS. (It's always DNS.)`);
          break;
        }
        case 'tracert': case 'traceroute':
          print('\nTracing route to portfolio.giotsas.com over a maximum of 30 hops:\n');
          for (let i = 0; i < PROJECTS.length; i++) {
            await wait(300);
            print(`  ${String(i + 1).padStart(2)}    ${PROJECTS[i].name.padEnd(26)} ${PROJECTS[i].note}`);
          }
          print('\nTrace complete. Open "Projects" for the long version.');
          break;
        case 'neofetch': case 'systeminfo':
          print(`   ██      ██     nick@NICK-PC
   ████    ██     ------------
   ██ ██   ██     OS: NikOS Pro 1709 (build 16299.207135)
   ██  ██  ██     Host: MacBook Pro 16" (Nov 2023)
   ██   ██ ██     Server: ThinkPad T440 (has no business still running)
   ██    ████     Phone: Xiaomi
   ██      ██     Editor: VS Code · Claude Code · OpenCode · Lovable
                  DNS: Cloudflare · Papaki.gr · Porkbun · Spaceship · DNSimple
                  Hosting: Cloudflare · GH Pages · cPanel · Vercel
                  ASN: AS207135 (with Vasilis, Dad)
                  Uptime: since forever
                  Cat: yes`);
          break;
        case 'start': {
          const map = { explorer: 'explorer', settings: 'settings', mail: 'mail', notepad: 'notepad', garden: 'garden', cmd: 'cmd' };
          const a = map[arg.toLowerCase()];
          if (a) openApp(a); else if (/^https?:/.test(arg)) openUrl(arg);
          else print('NikOS cannot find \'' + arg + '\'. Try: ' + Object.keys(map).join(', '));
          break;
        }
        case 'water': print(waterGarden().msg); break;
        case 'sudo': print(`'sudo' is not recognized as an internal or external command,\noperable program or batch file.\n\n(This is NikOS. We say please here.)`); break;
        case 'please': print('Since you asked nicely: no.'); break;
        case 'del': case 'rm': case 'erase': case 'rmdir': case 'rd':
          print('Access is denied.\nAn AI agent already tried that once. See: Recycle Bin.'); break;
        case 'hog': print("Still don't know what it means. Explain it to me: start mail"); break;
        case 'dig': case 'nslookup': print("Non-authoritative answer:\nIt was fine yesterday."); break;
        case 'claude': print('Busy. Probably deleting a file. (Kidding. Mostly.)'); break;
        case 'shutdown': power('shutdown'); break;
        case 'crash': case 'bsod': bsod(); break;
        case 'color':
          out.style.color = { a: '#16c60c', b: '#3a96dd', c: '#e74856', e: '#f9f1a5', f: '#f2f2f2', 7: '#cccccc' }[(arg || '7').slice(-1).toLowerCase()] || '#cccccc';
          break;
        default:
          print(`'${cmd0}' is not recognized as an internal or external command,\noperable program or batch file.`);
      }
    }
  }

  // ----- Notepad -----
  function renderNotepad(rec, arg) {
    const doc = arg || { name: 'Untitled', text: '' };
    rec.setTitle(doc.name + ' - Notepad');
    const ta = h('textarea', { class: 'np-text', spellcheck: 'false', wrap: 'soft', 'aria-label': doc.name });
    ta.value = doc.text;
    const menus = {
      File: [{ label: 'New', action: () => { ta.value = ''; rec.setTitle('Untitled - Notepad'); } },
        { label: 'Save', action: () => toast('Notepad', 'Saved to C:\\nowhere. This is a website.', 'notepad') }, '-',
        { label: 'Exit', action: () => closeWin(rec) }],
      Edit: [{ label: 'Select All', action: () => { ta.focus(); ta.select(); } }],
      Format: [{ label: () => (ta.wrap === 'soft' ? '✓ ' : '') + 'Word Wrap', action: () => { ta.wrap = ta.wrap === 'soft' ? 'off' : 'soft'; } }],
      Help: [{ label: 'About Notepad', action: () => toast('Notepad', 'Notepad for NikOS. Still no dark mode. Some things are sacred.', 'notepad') }]
    };
    const bar = h('div', { class: 'np-menu' });
    Object.entries(menus).forEach(([name, items]) => {
      const b = h('button', null, name);
      b.addEventListener('click', () => { const r = b.getBoundingClientRect(); showMenu(r.left, r.bottom, items.map(i => i === '-' ? i : { ...i, label: typeof i.label === 'function' ? i.label() : i.label })); });
      bar.append(b);
    });
    rec.body.append(bar, ta);
  }

  // ----- Mail -----
  const MAILS = [
    { from: 'A friend', subj: 'can I hog some IPs?', date: '20/09/2026', body: 'hey, can I "hog" some IPs from AS207135?\n\n—\n\nNote from Nick: I still don\'t know what "hog" means. I prepared a document anyway. If you know, hit "New mail" and explain it to me.' },
    { from: 'DNS Monitor', subj: 'A record broke overnight', date: 'Today', body: 'Good morning.\n\nSomething you configured perfectly yesterday is wrong today. Nobody touched it. Have a nice day.' },
    { from: 'The Cat', subj: 're: your chair', date: 'Today', body: "it's my chair now.\nalso the keyboard. also the laptop. it was warm.\n\n— management" },
    { from: 'NikOS Update', subj: 'Version 1803 is ready (now with Timeline!)', date: 'Yesterday', body: 'A feature update is available.\n\nStatus: postponed. 1709 forever.' },
    { from: 'The Garden', subj: 'something needs water', date: 'Yesterday', body: "Probably. Open the Garden app.\n\nThe internet has no opinion about this either way." }
  ];
  function renderMail(rec, arg) {
    const read = store.get('mailread', []);
    rec.body.innerHTML = `<div class="mail"><div class="mfold">
      <button class="new">+&nbsp; New mail</button>
      <button class="on">Inbox <span class="cnt"></span></button><button>Sent</button><button>Drafts</button></div>
      <div class="mlist"><div class="mh">Inbox</div></div><div class="mread selectable"></div></div>`;
    const list = $('.mlist', rec.body), pane = $('.mread', rec.body);
    const count = () => { $('.cnt', rec.body).textContent = MAILS.filter((m, i) => !read.includes(i)).length || ''; };
    MAILS.forEach((m, i) => {
      const b = h('button', { class: 'mitem' + (read.includes(i) ? '' : ' unread'), html:
        `<div class="from">${esc(m.from)}<small>${esc(m.date)}</small></div><div class="subj">${esc(m.subj)}</div><div class="prev">${esc(m.body.split('\n')[0])}</div>` });
      b.addEventListener('click', () => {
        $$('.mitem', list).forEach(x => x.classList.toggle('sel', x === b));
        b.classList.remove('unread');
        if (!read.includes(i)) { read.push(i); store.set('mailread', read); count(); }
        pane.innerHTML = `<h2>${esc(m.subj)}</h2><div class="meta">From: <b>${esc(m.from)}</b> · ${esc(m.date)}</div><div class="body">${esc(m.body)}</div>`;
      });
      list.append(b);
    });
    $$('.mfold button:not(.new):not(.on)', rec.body).forEach(b => b.addEventListener('click', () => {
      pane.innerHTML = `<h2>${esc(b.textContent)}</h2><p>Empty. Everything I send goes straight from my head to someone's spam folder. I'd know — I explain SPF for a living.</p>`;
    }));
    $('.new', rec.body).addEventListener('click', compose);
    $('.mfold .on', rec.body).addEventListener('click', () => { pane.innerHTML = ''; });
    count();

    function compose() {
      pane.innerHTML = `<h2>New message</h2>
        <form class="compose" action="https://formspree.io/f/mvkavbqr" method="POST" target="_blank">
          <label>To</label><input value="Nick Giotsas" disabled>
          <label for="m-name">Your name</label><input id="m-name" name="name" required autocomplete="name">
          <label for="m-email">Your email</label><input id="m-email" name="email" type="email" required autocomplete="email">
          <label for="m-msg">Message</label><textarea id="m-msg" name="message" required placeholder="e.g. what does &quot;hog&quot; mean"></textarea>
          <button class="btn primary" type="submit">Send</button>
        </form>`;
      $('form', pane).addEventListener('submit', () => setTimeout(() => {
        toast('Mail', 'Sent. Goes straight to my inbox. No newsletter, no spam.', 'mail');
        pane.innerHTML = '<h2>Sent</h2><p>Thanks — I read these.</p>';
      }, 50));
      $('#m-name', pane).focus();
    }
    rec.onArg = a => { if (a === 'compose') compose(); };
    if (arg === 'compose') compose();
    else list.querySelector('.mitem').click();
  }

  // ----- Garden -----
  const STAGES = [
    ['🟫', 'Soil. Something is planted. Allegedly.'],
    ['🌱', 'A sprout! The internet has no opinion about it.'],
    ['🌿', 'Leaves. Look at that.'],
    ['🪴', 'A proper plant now.'],
    ['🌷', 'It flowered. No restart required.'],
    ['🌻', 'Full bloom. The least engineered thing on this PC.']
  ];
  function waterGarden() {
    const g = store.get('garden', { stage: 0, last: 0, waters: 0 });
    const now = Date.now();
    let msg, grew = false;
    if (now - g.last < 15000) msg = "Easy. It's already wet. Plants don't do retries.";
    else if (g.stage >= STAGES.length - 1) msg = "It's fully grown. You can stop now. (Replant to start over.)";
    else { g.stage++; grew = true; msg = STAGES[g.stage][1]; }
    g.last = now; g.waters++;
    store.set('garden', g);
    $$('.garden').forEach(el => el.dispatchEvent(new CustomEvent('refresh', { detail: { msg, grew } })));
    return { msg, grew };
  }
  function renderGarden(rec) {
    rec.body.innerHTML = `<div class="garden"><div class="plant"></div><div class="g-msg"></div>
      <div><button class="btn primary wbtn-water">💧 Water</button> <button class="btn replant">Replant</button></div>
      <div class="g-meta"></div></div>`;
    const el = $('.garden', rec.body);
    const draw = (msg, grew) => {
      const g = store.get('garden', { stage: 0, last: 0, waters: 0 });
      $('.plant', el).textContent = STAGES[g.stage][0];
      $('.g-msg', el).textContent = msg || STAGES[g.stage][1];
      $('.g-meta', el).textContent = `Watered ${g.waters} time${g.waters === 1 ? '' : 's'}` + (g.last ? ' · last: ' + new Date(g.last).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');
      if (grew) { const p = $('.plant', el); p.classList.add('grow'); setTimeout(() => p.classList.remove('grow'), 400); }
    };
    el.addEventListener('refresh', e => {
      draw(e.detail.msg, e.detail.grew);
      for (let i = 0; i < 6; i++) {
        const d = h('span', { class: 'drop', style: `left:${rand(35, 65)}%;animation-delay:${i * 0.08}s` }, '💧');
        el.append(d); setTimeout(() => d.remove(), 1200);
      }
    });
    $('.wbtn-water', el).addEventListener('click', waterGarden);
    $('.replant', el).addEventListener('click', () => { store.set('garden', { stage: 0, last: 0, waters: 0 }); draw('Replanted. Back to waiting.'); });
    draw();
  }

  // ---------- menus ----------
  function showMenu(x, y, items, dark) {
    $$('.menu').forEach(m => m.remove());
    const m = h('div', { class: 'menu' + (dark ? ' dark' : ''), role: 'menu' });
    items.forEach(it => {
      if (it === '-') { m.append(h('hr')); return; }
      const b = h('button', { role: 'menuitem', disabled: !it.action, html: it.html || esc(it.label) });
      if (it.action) b.addEventListener('click', () => { m.remove(); it.action(); });
      m.append(b);
    });
    document.body.append(m);
    const r = m.getBoundingClientRect();
    m.style.left = Math.max(0, Math.min(x, innerWidth - r.width - 2)) + 'px';
    m.style.top = Math.max(0, Math.min(y, innerHeight - r.height - 2)) + 'px';
    return m;
  }

  // ---------- desktop ----------
  const DESKTOP = ['File Explorer', 'Recycle Bin', 'About Nick', 'Projects', 'Command Prompt', 'Mail', 'Garden', 'quirks.txt', 'nick.giotsas', 'DO NOT CLICK.exe'];
  function buildDesktop() {
    const wrap = $('#icons');
    DESKTOP.forEach(n => {
      const l = launch(n);
      const label = n === 'File Explorer' ? 'This PC' : n;
      const b = h('button', { class: 'dicon', role: 'listitem', html: icon(n === 'File Explorer' ? 'pc' : l.icon) + `<span>${esc(label)}</span>` });
      b.addEventListener('click', e => { e.stopPropagation(); $$('.dicon').forEach(x => x.classList.toggle('sel', x === b)); if (TOUCH) l.go(); });
      b.addEventListener('dblclick', () => l.go());
      b.addEventListener('keydown', e => { if (e.key === 'Enter') l.go(); });
      wrap.append(b);
    });
    $('#desktop').addEventListener('click', e => { if (!e.target.closest('.dicon')) $$('.dicon').forEach(x => x.classList.remove('sel')); });
    $('#desktop').addEventListener('contextmenu', e => {
      if (e.target.closest('.win')) return;
      e.preventDefault();
      showMenu(e.clientX, e.clientY, [
        { label: 'View' }, { label: 'Sort by' },
        { label: 'Refresh', action: () => { wrap.classList.add('blink'); setTimeout(() => wrap.classList.remove('blink'), 120); } },
        '-',
        { label: 'New folder', action: () => toast('NikOS', 'Nope. Not on my desktop.', 'folder') },
        '-',
        { label: 'Open Command Prompt here', action: () => openApp('cmd') },
        { label: 'Display settings', action: () => openApp('settings', 'about') },
        { label: 'Personalize', action: () => openApp('settings', 'personalization') },
        '-',
        { label: 'View source on GitHub', action: () => openUrl('https://github.com/ngiotsas/ngiotsas.github.io/tree/main/NikOS') }
      ]);
    });
  }

  // ---------- Start menu ----------
  function buildStart() {
    const st = $('#start');
    const rail = h('div', { class: 'rail' },
      h('div', null, h('button', { class: 'reveal', title: 'Expand', 'aria-label': 'Expand', html: li('menu') })),
      h('div', null,
        railBtn('<span class="avatar-sm">NG</span>', 'Nick Giotsas', e => {
          const r = e.currentTarget.getBoundingClientRect();
          showMenu(r.right, r.top - 100, [
            { label: 'Change account settings', action: () => openApp('settings', 'about') },
            { label: 'Lock', action: () => { closePanels(); showLock(); } },
            { label: 'Sign out', action: () => { closePanels(); closeAll(); showLock(); } }
          ], true);
        }),
        railBtn(li('doc'), 'Documents', () => openApp('explorer', 'docs')),
        railBtn(li('gear'), 'Settings', () => openApp('settings')),
        railBtn(li('power'), 'Power', e => {
          const r = e.currentTarget.getBoundingClientRect();
          showMenu(r.right, r.top - 110, [
            { html: li('moon') + ' Sleep', action: () => power('sleep') },
            { html: li('power') + ' Shut down', action: () => power('shutdown') },
            { html: li('update') + ' Restart', action: () => power('restart') }
          ], true);
        })));
    function railBtn(inner, title, fn) {
      const b = h('button', { class: 'reveal', title, 'aria-label': title, html: inner });
      b.addEventListener('click', fn);
      return b;
    }

    const list = h('div', { class: 'applist' });
    let letter = '';
    LAUNCH.forEach(l => {
      const L0 = /[a-z]/i.test(l.name[0]) ? l.name[0].toUpperCase() : '#';
      if (L0 !== letter) { letter = L0; list.append(h('div', { class: 'letter' }, letter)); }
      const b = h('button', { class: 'app reveal', html: `<span class="aicon">${icon(l.icon)}</span>${esc(l.name)}` });
      b.addEventListener('click', () => { closePanels(); l.go(); });
      list.append(b);
    });

    const tiles = h('div', { class: 'tiles' });
    const tile = (cls, inner, fn, label) => {
      const b = h('button', { class: 'tile ' + cls, html: inner, 'aria-label': label });
      b.addEventListener('click', () => { closePanels(); fn(); });
      return b;
    };
    const plain = (ic, label) => `<span class="tg">${icon(ic)}</span><span class="tl">${esc(label)}</span>`;
    const live = (a, b, label) => `<div class="faces"><div class="face">${a}</div><div class="face">${b}</div></div><span class="tl">${esc(label)}</span>`;
    tiles.append(
      h('div', { class: 'tgroup' }, 'Life at a glance'),
      h('div', { class: 'tgrid' },
        tile('wide live', live('<b>Nick Giotsas</b>DNS by day, agents by obsession.', '<b>Most days</b>Argue with an AI agent, water the garden, lose the chair to the cat.', 'About Nick'), () => openApp('settings', 'about'), 'About Nick'),
        tile('', plain('mail', 'Mail'), () => openApp('mail'), 'Mail'),
        tile('live', live('<b>AS207135</b>RIPE NCC · IPv6', '<b>with Dad</b>Vasilis', 'Network'), () => openApp('settings', 'network'), 'AS207135'),
        tile('', plain('folder', 'Projects'), () => openApp('explorer', 'projects'), 'Projects'),
        tile('', plain('plant', 'Garden'), () => openApp('garden'), 'Garden'),
        tile('wide live', live('<b>The Cat</b>Status: on my chair.', '<b>Uptime</b>Not respected.', 'Cat status'), () => spawnCat(true), 'Cat status'),
        tile('', plain('cmd', 'Command Prompt'), () => openApp('cmd'), 'Command Prompt')
      ),
      h('div', { class: 'tgroup' }, 'Play and explore'),
      h('div', { class: 'tgrid' },
        tile('', plain('globe', 'GitHub'), () => openUrl('https://github.com/ngiotsas'), 'GitHub'),
        tile('', plain('globe', 'erhomai.gr'), () => openUrl('https://erhomai.gr'), 'erhomai.gr'),
        tile('', plain('globe', 'GiotsasTech'), () => openUrl('https://giotsastech.com'), 'GiotsasTech'),
        tile('wide', plain('txt', 'quirks.txt'), () => openTxt('quirks.txt'), 'quirks.txt'),
        tile('', plain('warn', 'DO NOT CLICK'), () => bsod(), 'DO NOT CLICK')
      ));
    st.append(rail, list, tiles);
  }

  // ---------- search ----------
  function searchables() {
    return LAUNCH.map(l => ({ name: l.name, icon: l.icon, sub: 'App', go: l.go, kw: l.kw || '' }))
      .concat(PROJECTS.filter(p => p.url).map(p => ({ name: p.name, icon: p.icon, sub: 'Project — ' + p.note, go: () => openUrl(p.url), kw: p.desc + ' ' + p.tags.join(' ') })))
      .concat(Object.keys(TXT).map(n => ({ name: n, icon: 'txt', sub: 'Document', go: () => openTxt(n), kw: TXT[n] })))
      .concat([{ name: 'Network & Internet', icon: 'gear', sub: 'Settings — AS207135', go: () => openApp('settings', 'network'), kw: 'as207135 asn bgp ripe dad vasilis giotsastech' },
        { name: 'Personalization', icon: 'gear', sub: 'Settings — colors, background', go: () => openApp('settings', 'personalization'), kw: 'accent wallpaper theme color' }]);
  }
  function openSearch() {
    const p = $('#search-panel');
    if (!p.hidden) { closePanels(); return; }
    closePanels();
    p.hidden = false; $('#search').classList.add('on');
    p.innerHTML = `<div class="sp-body"></div><div class="sp-input">${li('search')}<input placeholder="Type here to search" aria-label="Search"></div>`;
    const inp = $('input', p), body = $('.sp-body', p);
    const draw = () => {
      const v = inp.value.trim().toLowerCase();
      body.innerHTML = '';
      if (!v) {
        body.append(h('div', { class: 'sp-h' }, 'Top apps'));
        const top = h('div', { class: 'sp-top' });
        ['About Nick', 'File Explorer', 'Command Prompt', 'Mail'].forEach(n => {
          const l = launch(n);
          const b = h('button', { class: 'reveal', html: icon(l.icon) + esc(n) });
          b.addEventListener('click', () => { closePanels(); l.go(); });
          top.append(b);
        });
        body.append(top, h('div', { class: 'sp-h', style: 'margin-top:16px' }, 'Try: as207135, cat, dns, garden, hog'));
        return;
      }
      const hits = searchables().filter(s => (s.name + ' ' + s.kw).toLowerCase().includes(v));
      if (!hits.length) { body.append(h('div', { class: 'sp-h' }, `No results for "${inp.value}". It's probably DNS.`)); return; }
      hits.slice(0, 9).forEach((s, i) => {
        if (i === 0) body.append(h('div', { class: 'sp-h' }, 'Best match'));
        if (i === 1) body.append(h('div', { class: 'sp-h' }, 'More results'));
        const b = h('button', { class: 'sp-item reveal' + (i === 0 ? ' best' : ''), html: `<span class="aicon">${icon(s.icon)}</span><span>${esc(s.name)}<small>${esc(s.sub)}</small></span>` });
        b.addEventListener('click', () => { closePanels(); s.go(); });
        body.append(b);
      });
    };
    inp.addEventListener('input', draw);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { const f = $('.sp-item', body); if (f) f.click(); } });
    draw();
    setTimeout(() => inp.focus(), 30);
  }

  // ---------- notifications ----------
  const NOTIFS = [];
  const QUICK = { quiet: false, night: false, catmode: false, tablet: false, location: false };
  function toast(title, body, ic) {
    NOTIFS.unshift({ title, body, icon: ic || 'logo', time: new Date() });
    $('#tray-ac').classList.add('unread');
    if (!$('#action-center').hidden) drawAC();
    if (QUICK.quiet) return;
    const t = h('div', { class: 'toast acrylic', role: 'status', html: `${icon(ic || 'logo')}<div><b>${esc(title)}</b>${esc(body)}</div>` });
    $('#toasts').append(t);
    const bye = () => { t.classList.add('out'); setTimeout(() => t.remove(), 260); };
    t.addEventListener('click', bye);
    setTimeout(bye, 6500);
    while ($('#toasts').children.length > 3) $('#toasts').firstElementChild.remove();
  }

  function drawAC() {
    const ac = $('#action-center');
    ac.innerHTML = `<div class="ac-head"><span>Notifications</span>${NOTIFS.length ? '<button class="clr">Clear all</button>' : ''}</div><div class="ac-list"></div><div class="qa"></div>`;
    const list = $('.ac-list', ac);
    if (!NOTIFS.length) list.append(h('div', { class: 'ac-empty' }, 'No new notifications'));
    NOTIFS.forEach(n => list.append(h('div', { class: 'ac-n', html: `${icon(n.icon)}<div><b>${esc(n.title)}</b>${esc(n.body)}<br><small>${n.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small></div>` })));
    const clr = $('.clr', ac);
    if (clr) clr.addEventListener('click', () => { NOTIFS.length = 0; drawAC(); });
    const qa = $('.qa', ac);
    [
      ['tablet', li('tablet'), 'Tablet mode', () => toast('Tablet mode', "Not on a MacBook. Nice try.", 'pc')],
      ['net', li('net'), 'AS207135', () => openApp('settings', 'network')],
      ['all', li('gear'), 'All settings', () => openApp('settings')],
      ['location', li('pin'), 'Location', () => toast('Location', 'Athens. Waiting for a bus. erhomai.gr says 4 minutes.', 'globe')],
      ['night', li('sun'), 'Night light', null],
      ['quiet', li('moon'), 'Quiet hours', null],
      ['catmode', '🐈', 'Cat mode', null],
      ['connect', li('cast'), 'Connect', () => toast('Connect', 'Searching for wireless displays… found: the cat, blocking the TV.', 'pc')]
    ].forEach(([k, ic, label, fn]) => {
      const b = h('button', { class: 'reveal' + (QUICK[k] ? ' on' : ''), html: `<span class="qi">${ic}</span>${label}` });
      b.addEventListener('click', () => {
        if (fn) { fn(); if (k !== 'all' && k !== 'net') return; closePanels(); return; }
        QUICK[k] = !QUICK[k];
        b.classList.toggle('on', QUICK[k]);
        if (k === 'night') $('#nightlight').classList.toggle('on', QUICK.night);
        if (k === 'catmode') { scheduleCat(); if (QUICK.catmode) spawnCat(true); }
      });
      qa.append(b);
    });
  }

  // ---------- flyouts (network / volume / clock) ----------
  function flyout(kind, btn) {
    const f = $('#flyout');
    if (!f.hidden && f.dataset.kind === kind) { closePanels(); return; }
    closePanels();
    f.dataset.kind = kind; f.hidden = false; btn.classList.add('on');
    if (kind === 'net') {
      f.innerHTML = `<div class="fo-h">Networks</div>
        <div class="fo-net">${li('net')}<div><b>AS207135</b><small>Connected, secured · IPv6 · RPKI valid</small><small>Run with my dad, Vasilis</small></div></div>
        <button class="fo-link" data-a="set">Network & Internet settings</button>
        <button class="fo-link" data-a="ipinfo">View AS207135 on ipinfo.io</button>`;
      $('[data-a=set]', f).addEventListener('click', () => openApp('settings', 'network'));
      $('[data-a=ipinfo]', f).addEventListener('click', () => openUrl('https://ipinfo.io/AS207135'));
    } else if (kind === 'vol') {
      f.innerHTML = `<div class="fo-h">Speakers</div><div class="vol">${li('vol')}<input type="range" min="0" max="100" value="100" aria-label="Volume"><b>100</b></div><div class="fo-h">The cat is louder anyway.</div>`;
      $('input', f).addEventListener('input', e => { $('b', f).textContent = e.target.value; });
    } else if (kind === 'up') {
      f.innerHTML = `<div class="fo-h">Hidden icons</div><div class="fo-h" style="color:#fff">🐈 cat.exe — running, cannot be closed<br>🌱 garden.exe — running, offline by design<br>🤖 agent.exe — about to delete something</div>`;
    } else {
      const now = new Date();
      f.innerHTML = `<div class="fo-time">${now.toLocaleTimeString('en-GB')}</div>
        <div class="fo-date">${now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div class="cal"><div class="cal-h">${now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</div><div class="cal-g"></div></div>`;
      const g = $('.cal-g', f);
      ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].forEach(d => g.append(h('span', null, d)));
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7));
      for (let i = 0; i < 42; i++) {
        const d = new Date(start); d.setDate(start.getDate() + i);
        const cls = d.getMonth() !== now.getMonth() ? 'dim' : d.getDate() === now.getDate() ? 'today' : '';
        g.append(h('span', { class: cls }, String(d.getDate())));
      }
      const tick = setInterval(() => { if (f.hidden || f.dataset.kind !== 'clock') clearInterval(tick); else $('.fo-time', f).textContent = new Date().toLocaleTimeString('en-GB'); }, 1000);
    }
    const r = btn.getBoundingClientRect();
    f.style.right = isNarrow() ? '0px' : Math.max(0, innerWidth - r.right - 40) + 'px';
  }


  // ---------- Task View (1709: windows + virtual desktops, no Timeline yet) ----------
  function switchDesk(n) {
    W.desk = n;
    W.list.forEach(r => r.win.classList.toggle('offdesk', r.desk !== n));
    W.focused = null;
    W.list.forEach(r => r.win.classList.add('inactive'));
    const top = topVisible();
    if (top) focusWin(top); else updateTaskbar();
  }

  function toggleTaskView() {
    const tv = $('#tv');
    if (!tv.hidden) { closePanels(); return; }
    closePanels();
    tv.hidden = false;
    $('#taskview').classList.add('active');
    drawTaskView();
  }

  function drawTaskView() {
    const tv = $('#tv');
    tv.innerHTML = '<div class="tv-grid"></div><div class="tv-desks"></div>';
    const grid = $('.tv-grid', tv);
    const wins = here().sort((a, b) => b.win.style.zIndex - a.win.style.zIndex);
    if (!wins.length) grid.append(h('div', { class: 'tv-empty' }, 'No open windows on this desktop. The cat closed them.'));
    const maxW = isNarrow() ? innerWidth * 0.8 : 300, maxH = isNarrow() ? 170 : 200;
    wins.forEach((r, i) => {
      // size the thumbnail from the window's real (or remembered) size
      const max = r.win.classList.contains('max');
      const w = max ? innerWidth : parseFloat(r.win.style.width) || 600;
      const ht = max ? desktopH() : parseFloat(r.win.style.height) || 400;
      const k = Math.min(maxW / w, maxH / ht);
      const clone = r.win.cloneNode(true);
      clone.classList.remove('minimized', 'offdesk', 'inactive', 'max');
      Object.assign(clone.style, { left: '0', top: '0', width: w + 'px', height: ht + 'px', transform: `scale(${k})`, transformOrigin: '0 0', animation: 'none', pointerEvents: 'none', zIndex: 'auto' });
      $$('[id]', clone).forEach(n => n.removeAttribute('id'));
      const x = h('button', { class: 'tv-x', title: 'Close', 'aria-label': 'Close ' + r.title, html: GLYPH.close });
      const card = h('div', { class: 'tv-card', role: 'button', tabindex: '0', 'aria-label': r.title, style: `animation-delay:${i * 30}ms` },
        h('div', { class: 'tv-head', html: icon(APPS[r.app].icon) + `<span>${esc(r.title)}</span>` }, x),
        h('div', { class: 'tv-thumb', style: `width:${Math.round(w * k)}px;height:${Math.round(ht * k)}px` }, clone));
      const pickIt = () => { closePanels(); restore(r); };
      card.addEventListener('click', e => { if (!e.target.closest('.tv-x')) pickIt(); });
      card.addEventListener('keydown', e => { if (e.key === 'Enter') pickIt(); if (e.key === 'Delete') x.click(); });
      x.addEventListener('click', () => { closeWin(r); drawTaskView(); });
      grid.append(card);
    });
    grid.addEventListener('click', e => { if (e.target === grid) closePanels(); });

    const desks = $('.tv-desks', tv);
    if (W.desks.length > 1) W.desks.forEach((n, i) => {
      const count = W.list.filter(r => r.desk === n).length;
      const d = h('div', { class: 'tv-desk' + (n === W.desk ? ' on' : ''), role: 'button', tabindex: '0', 'aria-label': 'Desktop ' + (i + 1) },
        h('div', { class: 'tv-dthumb' }, h('div', { class: 'wp-bg' }), h('span', null, count ? count + (count === 1 ? ' window' : ' windows') : '')),
        h('div', { class: 'tv-dname' }, 'Desktop ' + (i + 1)));
      const close = h('button', { class: 'tv-x', title: 'Close desktop', 'aria-label': 'Close desktop ' + (i + 1), html: GLYPH.close });
      close.addEventListener('click', e => {
        e.stopPropagation();
        // like Windows: closing a desktop moves its windows to the one on its left
        const into = W.desks[Math.max(0, i - 1)] === n ? W.desks[1] : W.desks[Math.max(0, i - 1)];
        W.list.forEach(r => { if (r.desk === n) r.desk = into; });
        W.desks = W.desks.filter(x => x !== n);
        switchDesk(W.desk === n ? into : W.desk);
        drawTaskView();
      });
      d.append(close);
      d.addEventListener('click', () => { switchDesk(n); drawTaskView(); });
      d.addEventListener('keydown', e => { if (e.key === 'Enter') d.click(); });
      desks.append(d);
    });
    const add = h('button', { class: 'tv-new', html: '<span>+</span> New desktop' });
    add.addEventListener('click', () => {
      if (W.desks.length >= 4) { toast('Task View', 'Four desktops is plenty. The cat only needs one to sit on.', 'pc'); return; }
      const n = Math.max(...W.desks) + 1;
      W.desks.push(n);
      drawTaskView();
    });
    desks.append(add);
    const first = $('.tv-card', grid);
    if (first) first.focus({ preventScroll: true });
  }

  function closePanels() {
    ['#start', '#search-panel', '#action-center', '#flyout', '#tv'].forEach(s => { $(s).hidden = true; });
    $('#taskview').classList.remove('active');
    $$('#start-btn, #search, .tray > button').forEach(b => b.classList.remove('on'));
    $$('.menu').forEach(m => m.remove());
  }

  // ---------- the cat ----------
  const PETS = ['You pet the cat. It tolerated it.', 'The cat accepted the pet and sat on your keyboard.',
    'Purring detected. Uptime: questionable.', 'The cat would like to remind you whose chair it is.', 'The cat blinked slowly. That is basically a hug.'];
  let catTimer = null;
  function spawnCat(force) {
    if ($('.cat') || (!force && !$('#login').hidden)) return;
    const c = h('button', { class: 'cat', title: 'the cat', 'aria-label': 'The cat. Click to pet.', style: 'border:0;background:none;padding:0' }, h('span', null, '🐈'));
    c.addEventListener('click', () => {
      const n = store.get('pets', 0) + 1;
      store.set('pets', n);
      toast('The Cat', `${pick(PETS)} (pets: ${n})`, 'user');
    });
    c.addEventListener('animationend', e => { if (e.animationName === 'catwalk') c.remove(); });
    document.body.append(c);
  }
  function scheduleCat() {
    clearTimeout(catTimer);
    catTimer = setTimeout(() => { spawnCat(); scheduleCat(); }, QUICK.catmode ? rand(6e3, 14e3) : rand(45e3, 110e3));
  }

  // ---------- look (accent, background, transparency) ----------
  function applyLook() {
    const hex = store.get('accent', '#0078d7');
    const n = parseInt(hex.slice(1), 16);
    const rgb = [n >> 16, (n >> 8) & 255, n & 255];
    const mix = (t, f) => '#' + rgb.map(c => Math.round(c + (t - c) * f).toString(16).padStart(2, '0')).join('');
    const [r, g, b] = rgb.map(c => c / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let hue = 0;
    if (d) hue = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    const root = document.documentElement.style;
    root.setProperty('--accent', hex);
    root.setProperty('--accent-rgb', rgb.join(','));
    root.setProperty('--accent-light', mix(255, 0.3));
    root.setProperty('--accent-dark', mix(0, 0.25));
    root.setProperty('--wp', String(Math.round((hue * 60 + 360) % 360)));
    document.body.classList.toggle('beams', store.get('beams', false));
    document.body.classList.toggle('no-transparency', !store.get('transparency', true));
  }

  // ---------- clock ----------
  function tickClock() {
    const now = new Date();
    $('#clock-t').textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    $('#clock-d').textContent = now.toLocaleDateString('en-GB');
    $('#clock').title = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const lt = $('.lock-time');
    if (lt) {
      lt.firstChild.textContent = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      $('.lock-date').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    }
  }

  // ---------- boot / lock / login / power ----------
  const spinner = cls => `<div class="spinner ${cls || ''}"><i></i><i></i><i></i><i></i><i></i></div>`;

  function boot() {
    const b = $('#boot');
    b.hidden = false;
    b.innerHTML = `<svg class="boot-logo" viewBox="0 0 32 32" aria-label="NikOS">${SVG.logo}</svg>${spinner()}`;
    let done = false;
    const next = () => { if (done) return; done = true; b.hidden = true; showLock(); };
    b.addEventListener('click', next, { once: true });
    setTimeout(next, 2800);
  }

  function showLock() {
    const login = $('#login'), lock = $('#lock');
    login.hidden = false;
    login.innerHTML = `<div class="wp-bg"></div><div class="login-c">
      <div class="avatar-lg">NG</div><div class="login-name">Nick Giotsas</div>
      <button class="signin">Sign in</button>
      <div class="login-note">No password. I trust you. (Don't make me regret it.)</div></div>
      <div class="login-corner"><button aria-label="Network" title="AS207135">${li('net')}</button><button aria-label="Ease of access" title="Ease of access">${li('access')}</button>
      <button aria-label="Power" title="Power" class="lpow">${li('power')}</button></div>`;
    $('.signin', login).addEventListener('click', signIn);
    $('.lpow', login).addEventListener('click', e => {
      const r = e.currentTarget.getBoundingClientRect();
      showMenu(r.left - 100, r.top - 110, [
        { html: li('moon') + ' Sleep', action: () => power('sleep') },
        { html: li('power') + ' Shut down', action: () => power('shutdown') },
        { html: li('update') + ' Restart', action: () => power('restart') }
      ], true);
    });

    const [t, f] = pick(FACTS);
    lock.hidden = false;
    lock.classList.remove('up');
    lock.innerHTML = `<div class="wp-bg"></div><div class="spot"><b>${esc(t)}</b>${esc(f)}</div>
      <div class="lock-time"><span></span><div class="lock-date"></div></div>
      <div class="lock-hint">${TOUCH ? 'Swipe up or tap' : 'Click or press any key'} to sign in</div>`;
    tickClock();
    const lift = () => {
      if (lock.classList.contains('up')) return;
      lock.classList.add('up');
      document.removeEventListener('keydown', onKey);
      setTimeout(() => { lock.hidden = true; const s = $('.signin', login); if (s) s.focus(); }, 560);
    };
    const onKey = e => { if (!lock.hidden) { e.preventDefault(); lift(); } };
    lock.onclick = lift;
    let y0 = null;
    lock.ontouchstart = e => { y0 = e.touches[0].clientY; };
    lock.ontouchmove = e => { if (y0 != null && y0 - e.touches[0].clientY > 40) lift(); };
    document.addEventListener('keydown', onKey);
  }

  let firstSignIn = true;
  function signIn() {
    const login = $('#login');
    $('.login-c', login).innerHTML = `<div class="avatar-lg">NG</div><div class="welcome" style="margin-top:28px">${spinner('inline')}Welcome</div>`;
    $('.login-corner', login).remove();
    setTimeout(() => {
      login.hidden = true;
      session.set('booted', true);
      if (firstSignIn) { firstSignIn = false; startup(); }
    }, 1400);
  }

  function startup() {
    scheduleCat();
    setTimeout(() => toast('DNS Monitor', 'A record broke overnight. Of course it did.', 'net'), 2500);
    setTimeout(() => toast('NikOS', 'Welcome to NikOS. Double-click "About Nick" to start, or poke around. Right-click works too.', 'logo'), 9000);
    setTimeout(() => toast('The Cat', 'Your chair has been reassigned.', 'user'), 30000);
    setTimeout(() => toast('NikOS Update', 'Feature update to version 1803 is available. Postponed. Forever.', 'shield'), 75000);
  }

  function power(kind) {
    closePanels();
    const off = $('#off');
    if (kind === 'sleep') {
      off.hidden = false; off.className = 'sleep';
      off.innerHTML = 'zzz… (click to wake)';
      off.onclick = () => { off.hidden = true; off.onclick = null; showLock(); };
      return;
    }
    const login = $('#login');
    login.hidden = false; $('#lock').hidden = true;
    login.innerHTML = `<div class="wp-bg"></div><div class="login-c"><div class="shutting">${spinner('inline')}${kind === 'restart' ? 'Restarting' : 'Shutting down'}</div></div>`;
    setTimeout(() => {
      closeAll();
      $$('.cat').forEach(c => c.remove());
      if (kind === 'restart') { login.hidden = true; boot(); return; }
      session.set('booted', false);
      off.hidden = false; off.className = '';
      off.onclick = null;
      off.innerHTML = `<div>It's now safe to turn off your computer.</div><div class="row"><button class="pw">Power on</button><a href="../">Back to nick.giotsas</a></div>`;
      $('.pw', off).addEventListener('click', () => { off.hidden = true; boot(); });
    }, 1800);
  }

  // ---------- BSOD (for r/PBSOD) ----------
  const STOP = ['CAT_SAT_ON_KEYBOARD', 'AGENT_DELETED_THE_WRONG_FILE', 'DNS_RECORD_BROKE_OVERNIGHT', 'GARDEN_NOT_WATERED', 'CPANEL_DEFENDED_TOO_HARD', 'HOG_NOT_DEFINED'];
  function bsod() {
    closePanels();
    const s = $('#bsod');
    s.hidden = false;
    s.innerHTML = `<div class="sad">:(</div>
      <div class="bmsg">Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</div>
      <div class="bmsg" style="margin-top:28px"><span class="pct">0</span>% complete</div>
      <div class="bfoot"><canvas width="25" height="25"></canvas><div>For more information about this issue and possible fixes, visit r/PBSOD<br><br>
      If you call a support person, give them this info:<br>Stop code: ${pick(STOP)}</div></div>`;
    const cv = $('canvas', s), cx = cv.getContext('2d');
    cx.fillStyle = '#fff'; cx.fillRect(0, 0, 25, 25); cx.fillStyle = '#0078d7';
    for (let y = 0; y < 25; y++) for (let x = 0; x < 25; x++) if (Math.random() < 0.45) cx.fillRect(x, y, 1, 1);
    [[0, 0], [18, 0], [0, 18]].forEach(([x, y]) => { cx.fillRect(x, y, 7, 7); cx.fillStyle = '#fff'; cx.fillRect(x + 1, y + 1, 5, 5); cx.fillStyle = '#0078d7'; cx.fillRect(x + 2, y + 2, 3, 3); });
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + Math.round(rand(3, 17)));
      $('.pct', s).textContent = p;
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => { s.hidden = true; closeAll(); $$('.cat').forEach(c => c.remove()); boot(); }, 900);
      }
    }, 450);
  }

  // ---------- wiring ----------
  function init() {
    applyLook();
    $('#start-btn').innerHTML = `<svg viewBox="0 0 32 32" aria-hidden="true">${SVG.logo}</svg>`;
    $('#search').innerHTML = `${li('search')}<span>Type here to search</span>`;
    $('#taskview').innerHTML = li('taskview');
    $('#tray-up').innerHTML = li('up');
    $('#tray-net').innerHTML = li('net');
    $('#tray-vol').innerHTML = li('vol');
    $('#tray-ac').innerHTML = li('ac');

    buildDesktop();
    buildStart();
    updateTaskbar();
    tickClock();
    setInterval(tickClock, 10000);

    $('#start-btn').addEventListener('click', () => {
      const s = $('#start');
      const open = s.hidden;
      closePanels();
      if (open) { s.hidden = false; $('#start-btn').classList.add('on'); }
    });
    $('#search').addEventListener('click', openSearch);
    $('#search').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSearch(); } });
    $('#taskview').addEventListener('click', toggleTaskView);
    $('#tray-net').addEventListener('click', e => flyout('net', e.currentTarget));
    $('#tray-vol').addEventListener('click', e => flyout('vol', e.currentTarget));
    $('#tray-up').addEventListener('click', e => flyout('up', e.currentTarget));
    $('#clock').addEventListener('click', e => flyout('clock', e.currentTarget));
    $('#tray-ac').addEventListener('click', e => {
      const ac = $('#action-center');
      const open = ac.hidden;
      closePanels();
      if (!open) return;
      ac.hidden = false; e.currentTarget.classList.add('on'); e.currentTarget.classList.remove('unread');
      drawAC();
    });
    $('#show-desktop').addEventListener('click', () => { closePanels(); here().forEach(minimize); });

    // clicking anywhere else closes open panels and menus
    document.addEventListener('pointerdown', e => {
      const t = e.target;
      if (!t.closest('.menu')) $$('.menu').forEach(m => m.remove());
      if (t.closest('#start, #start-btn, #search-panel, #search, #action-center, #tray-ac, #flyout, .tray > button, .menu, .toast, #tv, #taskview')) return;
      ['#start', '#search-panel', '#action-center', '#flyout'].forEach(s => { if (!$(s).hidden) closePanels(); });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closePanels();
      if (e.key === 'Escape' && e.ctrlKey) $('#start-btn').click();
    });
    // Fluent "reveal" highlight that follows the pointer
    document.addEventListener('pointermove', e => {
      const r = e.target.closest && e.target.closest('.reveal');
      if (!r) return;
      const b = r.getBoundingClientRect();
      r.style.setProperty('--rx', (e.clientX - b.left) + 'px');
      r.style.setProperty('--ry', (e.clientY - b.top) + 'px');
    });
    // keep NikOS's own right-click menus; let text fields keep the browser's
    document.addEventListener('contextmenu', e => {
      if (!e.target.closest('input, textarea, .selectable, #desktop')) e.preventDefault();
    });

    if (session.get('booted', false)) { firstSignIn = false; scheduleCat(); }
    else boot();
  }

  init();
})();
