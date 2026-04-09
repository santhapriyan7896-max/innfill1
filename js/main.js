/* =============================================
   INNFILL.IN — 3D Animations & Interactions
   Uses Three.js (CDN) + Vanilla JS
   ============================================= */

// ── Navbar scroll effect ──────────────────────
(function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Mobile Menu ───────────────────────────────
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn  = document.getElementById('mobile-menu-close');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => mobileMenu.classList.add('open'));
  closeBtn?.addEventListener('click', () => mobileMenu.classList.remove('open'));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));
})();

// ── Scroll Reveal ─────────────────────────────
(function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

// ── Animated Counter ──────────────────────────
(function initCounters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el    = e.target;
      const end   = parseFloat(el.dataset.count);
      const suffix= el.dataset.suffix || '';
      const dur   = 2000;
      const step  = 16;
      let current = 0;
      const increment = end / (dur / step);
      const tick = () => {
        current = Math.min(current + increment, end);
        el.textContent = (Number.isInteger(end) ? Math.floor(current) : current.toFixed(1)) + suffix;
        if (current < end) requestAnimationFrame(tick);
      };
      tick();
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(el => io.observe(el));
})();

// ── FAQ Accordion ─────────────────────────────
(function initFAQ() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-question');
    const a = item.querySelector('.faq-answer');
    if (!q || !a) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-answer').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
})();

// ── 3D Card Tilt ──────────────────────────────
(function initTilt() {
  document.querySelectorAll('.feature-card, .testimonial-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width  / 2;
      const cy = r.height / 2;
      const rotX =  ((y - cy) / cy) * -10;
      const rotY =  ((x - cx) / cx) *  10;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
      card.style.setProperty('--mx', `${(x/r.width)*100}%`);
      card.style.setProperty('--my', `${(y/r.height)*100}%`);
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── Testimonial Auto-scroll ───────────────────
(function initTestimonials() {
  const track = document.querySelector('.testimonials-track');
  const dots  = document.querySelectorAll('.testimonial-dot');
  if (!track || !dots.length) return;
  let current = 0;
  const cards = track.querySelectorAll('.testimonial-card');

  const goTo = (idx) => {
    current = idx;
    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  };

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
  const auto = setInterval(() => goTo((current + 1) % cards.length), 4500);
  track.addEventListener('mouseenter', () => clearInterval(auto));
})();

// ─────────────────────────────────────────────
//  THREE.JS — HERO 3D SCENE
// ─────────────────────────────────────────────
function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 28;

  // ── Particles ──
  const pGeo  = new THREE.BufferGeometry();
  const pCount = 1200;
  const pPos  = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 80;
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat  = new THREE.PointsMaterial({
    color: 0x3B82F6, size: 0.15, transparent: true, opacity: 0.6,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── Central Torus Knot ──
  const torusGeo = new THREE.TorusKnotGeometry(4.5, 1.2, 160, 24, 2, 3);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0x3B82F6, wireframe: true, opacity: 0.35, transparent: true,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  scene.add(torus);

  // ── Icosahedron ──
  const icoGeo = new THREE.IcosahedronGeometry(6.5, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0x06B6D4, wireframe: true, opacity: 0.15, transparent: true,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // ── Floating Spheres ──
  const spheres = [];
  const sColors = [0x3B82F6, 0x06B6D4, 0x8B5CF6, 0x60A5FA];
  for (let i = 0; i < 18; i++) {
    const sg = new THREE.SphereGeometry(Math.random() * 0.5 + 0.15, 8, 8);
    const sm = new THREE.MeshStandardMaterial({
      color: sColors[i % sColors.length], transparent: true, opacity: Math.random() * 0.5 + 0.25,
    });
    const s = new THREE.Mesh(sg, sm);
    s.position.set((Math.random()-0.5)*30, (Math.random()-0.5)*20, (Math.random()-0.5)*15);
    s.userData = { speed: Math.random() * 0.008 + 0.003, amp: Math.random() * 3 + 1, phase: Math.random() * Math.PI * 2 };
    scene.add(s); spheres.push(s);
  }

  // ── Ring ──
  const ringGeo = new THREE.TorusGeometry(10, 0.06, 8, 80);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x3B82F6, transparent: true, opacity: 0.2 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.8;
  scene.add(ring);

  const ring2 = ring.clone();
  ring2.scale.setScalar(1.5);
  ring2.rotation.x = Math.PI / 2;
  ring2.rotation.y = Math.PI / 4;
  scene.add(ring2);

  // ── Lights ──
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const pl1 = new THREE.PointLight(0x3B82F6, 2, 50); pl1.position.set(10, 10, 10); scene.add(pl1);
  const pl2 = new THREE.PointLight(0x06B6D4, 1.5, 50); pl2.position.set(-10, -5, 10); scene.add(pl2);

  // ── Mouse tracking ──
  let mx = 0, my = 0;
  window.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ──
  const onResize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);

  // ── Animate ──
  let t = 0;
  const animate = () => {
    requestAnimationFrame(animate);
    t += 0.008;

    torus.rotation.x = t * 0.5;
    torus.rotation.y = t * 0.3;
    ico.rotation.x   = -t * 0.2;
    ico.rotation.z   =  t * 0.15;
    ring.rotation.z  =  t * 0.12;
    ring2.rotation.z = -t * 0.08;
    particles.rotation.y = t * 0.04;
    particles.rotation.x = t * 0.02;

    spheres.forEach(s => {
      s.position.y += Math.sin(t * s.userData.speed * 60 + s.userData.phase) * 0.01 * s.userData.amp;
      s.rotation.x += 0.01; s.rotation.y += 0.012;
    });

    // Smooth follow mouse
    scene.rotation.y += (mx * 0.18 - scene.rotation.y) * 0.04;
    scene.rotation.x += (-my * 0.10 - scene.rotation.x) * 0.04;

    renderer.render(scene, camera);
  };
  animate();
}

// ─────────────────────────────────────────────
//  CANVAS 2D — FREELANCER SPOTLIGHT ANIMATION
//  Shows a freelancer profile discovered by
//  orbiting client inquiry chips
// ─────────────────────────────────────────────
function initFreelancerSpotlight(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const resize = () => {
    canvas.width  = canvas.clientWidth  * Math.min(window.devicePixelRatio, 2);
    canvas.height = canvas.clientHeight * Math.min(window.devicePixelRatio, 2);
  };
  resize();
  window.addEventListener('resize', resize);

  const ctx = canvas.getContext('2d');
  let t = 0;

  const clients = [
    { label: 'TechCorp', angle: 0,    dist: 0.30, phase: 0 },
    { label: 'StartupX', angle: 1.7,  dist: 0.28, phase: 1.4 },
    { label: 'BuildCo',  angle: 3.5,  dist: 0.31, phase: 2.8 },
    { label: 'DesignHub',angle: 5.1,  dist: 0.29, phase: 4.2 },
  ];

  const dots = Array.from({ length: 48 }, () => ({
    angle: Math.random() * Math.PI * 2,
    dist:  0.18 + Math.random() * 0.12,
    size:  1.5 + Math.random() * 2.5,
    speed: (Math.random() * 0.008 + 0.004) * (Math.random() > 0.5 ? 1 : -1),
    alpha: Math.random() * 0.5 + 0.25,
    blue:  Math.random() > 0.4,
  }));

  function hex(color, alpha255) {
    return color + Math.round(alpha255).toString(16).padStart(2, '0');
  }

  function roundRect(cx2, cy2, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(cx2 - w / 2, cy2 - h / 2, w, h, r);
  }

  function animate() {
    requestAnimationFrame(animate);
    t += 0.016;

    const W  = canvas.width,  H  = canvas.height;
    const CX = W / 2,         CY = H / 2;
    const SC = Math.min(W, H); // scale reference

    ctx.clearRect(0, 0, W, H);

    // Background radial glow
    const bgG = ctx.createRadialGradient(CX, CY, 0, CX, CY, SC * 0.45);
    bgG.addColorStop(0,   'rgba(59,130,246,0.06)');
    bgG.addColorStop(1,   'transparent');
    ctx.fillStyle = bgG;
    ctx.fillRect(0, 0, W, H);

    // Pulse rings
    for (let i = 0; i < 4; i++) {
      const base = SC * (0.17 + i * 0.07);
      const r    = base + ((t * 18 + i * 30) % (SC * 0.07));
      const a    = Math.max(0, 0.18 - (r - base) / (SC * 0.07) * 0.18);
      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(59,130,246,${a.toFixed(3)})`;
      ctx.lineWidth   = 1.2;
      ctx.stroke();
    }

    // Orbiting particle dots
    dots.forEach(d => {
      d.angle   += d.speed;
      const r    = SC * d.dist;
      const dx   = CX + Math.cos(d.angle) * r;
      const dy   = CY + Math.sin(d.angle) * r * 0.55;
      const pulse = (Math.sin(t * 3 + d.angle) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(dx, dy, d.size * (0.75 + pulse * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = d.blue
        ? hex('#3B82F6', (d.alpha * 180 + pulse * 55))
        : hex('#06B6D4', (d.alpha * 140 + pulse * 45));
      ctx.fill();
    });

    // Orbiting client chips
    clients.forEach((c, i) => {
      const a  = c.angle + t * (i % 2 === 0 ? 0.22 : -0.18);
      const r  = SC * c.dist;
      const dx = CX + Math.cos(a) * r;
      const dy = CY + Math.sin(a) * r * 0.52 + Math.sin(t + c.phase) * SC * 0.012;

      // Dashed line to center
      ctx.save();
      ctx.setLineDash([4, 10]);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(dx, dy);
      ctx.strokeStyle = `rgba(59,130,246,${0.18 + Math.sin(t + i) * 0.07})`;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.restore();

      // Chip
      const chipW = SC * 0.21, chipH = SC * 0.068;
      ctx.save();
      ctx.globalAlpha = 0.88 + Math.sin(t * 1.5 + c.phase) * 0.08;
      ctx.shadowColor  = 'rgba(6,182,212,0.25)';
      ctx.shadowBlur   = 10;
      roundRect(dx, dy, chipW, chipH, chipH / 2);
      ctx.fillStyle   = 'rgba(13,20,38,0.92)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(6,182,212,0.35)';
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle       = '#94A3B8';
      ctx.font            = `${SC * 0.028}px Inter,sans-serif`;
      ctx.textAlign       = 'center';
      ctx.textBaseline    = 'middle';
      ctx.fillText(c.label, dx, dy);
    });

    // ── Central profile card ──
    const cardW  = SC * 0.44;
    const cardH  = SC * 0.52;
    const float  = Math.sin(t * 0.9) * SC * 0.012;
    const cardCY = CY + float;
    const glow   = 0.12 + Math.sin(t * 1.8) * 0.06;

    // Card shadow glow
    const cgG = ctx.createRadialGradient(CX, cardCY, 0, CX, cardCY, SC * 0.32);
    cgG.addColorStop(0,   `rgba(59,130,246,${glow})`);
    cgG.addColorStop(1,   'transparent');
    ctx.fillStyle = cgG;
    ctx.fillRect(0, 0, W, H);

    // Card body
    ctx.save();
    ctx.shadowColor = 'rgba(59,130,246,0.35)';
    ctx.shadowBlur  = SC * 0.06;
    roundRect(CX, cardCY, cardW, cardH, SC * 0.04);
    ctx.fillStyle   = 'rgba(15,23,42,0.96)';
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = `rgba(59,130,246,${0.45 + Math.sin(t * 2) * 0.1})`;
    ctx.lineWidth   = 1.5;
    ctx.stroke();
    ctx.restore();

    // Top gradient bar
    const barG = ctx.createLinearGradient(CX - cardW / 2, 0, CX + cardW / 2, 0);
    barG.addColorStop(0, '#3B82F6');
    barG.addColorStop(1, '#06B6D4');
    ctx.beginPath();
    ctx.roundRect(CX - cardW / 2, cardCY - cardH / 2, cardW, SC * 0.014, [SC * 0.04, SC * 0.04, 0, 0]);
    ctx.fillStyle = barG;
    ctx.fill();

    // Avatar circle
    const avY  = cardCY - cardH * 0.22;
    const avR  = SC * 0.088;
    const avG  = ctx.createRadialGradient(CX, avY, 0, CX, avY, avR);
    avG.addColorStop(0,  '#3B82F6cc');
    avG.addColorStop(1,  '#2563EB44');
    ctx.beginPath();
    ctx.arc(CX, avY, avR, 0, Math.PI * 2);
    ctx.fillStyle   = avG;
    ctx.fill();
    ctx.strokeStyle = '#3B82F688';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.fillStyle       = '#fff';
    ctx.font            = `bold ${avR * 0.7}px "Space Grotesk",sans-serif`;
    ctx.textAlign       = 'center';
    ctx.textBaseline    = 'middle';
    ctx.fillText('AR', CX, avY);

    // Name
    const nameY = cardCY + cardH * 0.02;
    ctx.fillStyle       = '#F8FAFC';
    ctx.font            = `700 ${SC * 0.038}px "Space Grotesk",sans-serif`;
    ctx.textBaseline    = 'alphabetic';
    ctx.fillText('Arjun Reddy', CX, nameY);

    // Role
    ctx.fillStyle = '#64748B';
    ctx.font      = `${SC * 0.027}px Inter,sans-serif`;
    ctx.fillText('Full-Stack Developer', CX, nameY + SC * 0.038);

    // Rating stars
    ctx.fillStyle = '#F59E0B';
    ctx.font      = `${SC * 0.027}px Inter,sans-serif`;
    ctx.fillText('★★★★★  4.9', CX, nameY + SC * 0.08);

    // Skill tags
    const skills  = ['React', 'Node.js', 'AWS'];
    const tagH    = SC * 0.055;
    const tagGap  = SC * 0.012;
    const tagY    = nameY + SC * 0.115;
    let totalW    = 0;
    const tagWidths = skills.map(s => {
      ctx.font = `${SC * 0.025}px Inter,sans-serif`;
      const tw = ctx.measureText(s).width + SC * 0.04;
      totalW  += tw + tagGap;
      return tw;
    });
    let tx = CX - (totalW - tagGap) / 2;
    skills.forEach((s, i) => {
      const tw = tagWidths[i];
      ctx.beginPath();
      ctx.roundRect(tx, tagY - tagH / 2, tw, tagH, tagH / 2);
      ctx.fillStyle   = 'rgba(59,130,246,0.18)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(59,130,246,0.3)';
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.fillStyle       = '#60A5FA';
      ctx.font            = `${SC * 0.025}px Inter,sans-serif`;
      ctx.textBaseline    = 'middle';
      ctx.fillText(s, tx + tw / 2, tagY);
      tx += tw + tagGap;
    });

    // Verified badge
    const badgeY = nameY + SC * 0.19;
    roundRect(CX, badgeY, SC * 0.22, SC * 0.055, SC * 0.028);
    ctx.fillStyle   = 'rgba(52,211,153,0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(52,211,153,0.35)';
    ctx.lineWidth   = 1;
    ctx.stroke();
    ctx.fillStyle       = '#34D399';
    ctx.font            = `600 ${SC * 0.026}px Inter,sans-serif`;
    ctx.textBaseline    = 'middle';
    ctx.fillText('✓ Verified Profile', CX, badgeY);
  }

  animate();
}

// ─────────────────────────────────────────────
//  CANVAS 2D — SMART MATCH ANIMATION
//  Shows two profiles connecting via particle
//  flow with a cycling MATCHED badge
// ─────────────────────────────────────────────
function initMatchingAnimation(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const resize = () => {
    canvas.width  = canvas.clientWidth  * Math.min(window.devicePixelRatio, 2);
    canvas.height = canvas.clientHeight * Math.min(window.devicePixelRatio, 2);
  };
  resize();
  window.addEventListener('resize', resize);

  const ctx    = canvas.getContext('2d');
  const TOTAL  = 320; // frames per full cycle
  let   frame  = 0;

  // Flowing particles along the bezier curve
  const flowParticles = Array.from({ length: 28 }, (_, i) => ({
    t:     i / 28,
    speed: 0.006 + Math.random() * 0.004,
    size:  2 + Math.random() * 3,
    alpha: 0.5 + Math.random() * 0.5,
    hue:   Math.random() > 0.5 ? '#3B82F6' : '#06B6D4',
  }));

  // Background sparkles
  const sparkles = Array.from({ length: 30 }, () => ({
    x: Math.random(), y: Math.random(),
    r: 1 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
    alpha: Math.random() * 0.4 + 0.15,
  }));

  function cubicBezier(p0, p1, p2, p3, t2) {
    const u = 1 - t2;
    return {
      x: u*u*u*p0.x + 3*u*u*t2*p1.x + 3*u*t2*t2*p2.x + t2*t2*t2*p3.x,
      y: u*u*u*p0.y + 3*u*u*t2*p1.y + 3*u*t2*t2*p2.y + t2*t2*t2*p3.y,
    };
  }

  function drawProfile(cx, cy, sc, initials, name, role, skills, color, alpha, scale = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    const cw = sc * 0.32, ch = sc * 0.52;

    // Glow
    const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, sc * 0.25);
    gl.addColorStop(0,   color + '22');
    gl.addColorStop(1,   'transparent');
    ctx.fillStyle = gl;
    ctx.fillRect(-cw, -ch, cw * 2, ch * 2);

    // Card
    ctx.shadowColor = color + '44';
    ctx.shadowBlur  = sc * 0.05;
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, ch, sc * 0.04);
    ctx.fillStyle   = 'rgba(15,23,42,0.96)';
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.strokeStyle = color + '55';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Top stripe
    const sg = ctx.createLinearGradient(-cw / 2, 0, cw / 2, 0);
    sg.addColorStop(0, color);
    sg.addColorStop(1, '#06B6D4');
    ctx.beginPath();
    ctx.roundRect(-cw / 2, -ch / 2, cw, sc * 0.012, [sc * 0.04, sc * 0.04, 0, 0]);
    ctx.fillStyle = sg;
    ctx.fill();

    // Avatar
    const avR = sc * 0.07;
    const avY = -ch * 0.25;
    const ag  = ctx.createRadialGradient(0, avY, 0, 0, avY, avR);
    ag.addColorStop(0,  color + 'cc');
    ag.addColorStop(1,  color + '33');
    ctx.beginPath();
    ctx.arc(0, avY, avR, 0, Math.PI * 2);
    ctx.fillStyle   = ag;
    ctx.fill();
    ctx.strokeStyle = color + '77';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle    = '#fff';
    ctx.font         = `bold ${avR * 0.72}px "Space Grotesk",sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 0, avY);

    // Name
    ctx.fillStyle    = '#F8FAFC';
    ctx.font         = `700 ${sc * 0.032}px "Space Grotesk",sans-serif`;
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(name, 0, -ch * 0.04);

    // Role
    ctx.fillStyle = '#64748B';
    ctx.font      = `${sc * 0.024}px Inter,sans-serif`;
    ctx.fillText(role, 0, -ch * 0.04 + sc * 0.035);

    // Skills
    const tagH = sc * 0.046, tagGap = sc * 0.01;
    let sw = 0;
    const tws = skills.map(s => { ctx.font=`${sc*0.021}px Inter,sans-serif`; const w=ctx.measureText(s).width+sc*0.032; sw+=w+tagGap; return w; });
    let tx = -sw / 2;
    const skillY = -ch * 0.04 + sc * 0.085;
    skills.forEach((s, i) => {
      ctx.beginPath();
      ctx.roundRect(tx, skillY - tagH / 2, tws[i], tagH, tagH / 2);
      ctx.fillStyle   = color + '25';
      ctx.fill();
      ctx.strokeStyle = color + '40';
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.fillStyle    = color;
      ctx.font         = `${sc*0.021}px Inter,sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.fillText(s, tx + tws[i] / 2, skillY);
      tx += tws[i] + tagGap;
    });

    ctx.restore();
  }

  function animate() {
    requestAnimationFrame(animate);
    frame = (frame + 1) % TOTAL;

    const W  = canvas.width,  H  = canvas.height;
    const CX = W / 2,         CY = H / 2;
    const SC = Math.min(W, H);
    const t2 = frame / TOTAL;  // 0→1 cycle progress

    ctx.clearRect(0, 0, W, H);

    // Background sparkles
    sparkles.forEach(s => {
      const pulse = (Math.sin(frame * 0.04 + s.phase) + 1) * 0.5;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r * (0.8 + pulse * 0.4), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59,130,246,${s.alpha * pulse})`;
      ctx.fill();
    });

    // Phase detection (0→1):
    // 0.00-0.15: profiles slide in
    // 0.15-0.45: scanning state (idle float + scan rings on both)
    // 0.45-0.70: particle flow along bezier path
    // 0.70-0.85: MATCHED badge pulses, cards glow
    // 0.85-1.00: hold & fade out ready to loop

    const P_ENTER  = 0.15;
    const P_FLOW   = 0.45;
    const P_MATCH  = 0.70;
    const P_HOLD   = 0.85;

    const lx = CX - SC * 0.28;
    const rx = CX + SC * 0.28;
    const py = CY + Math.sin(frame * 0.04) * SC * 0.012;

    // ── Profile alpha / slide-in ──
    let leftAlpha  = 1, rightAlpha = 1;
    let leftScale  = 1, rightScale = 1;
    if (t2 < P_ENTER) {
      const prog = t2 / P_ENTER;
      leftAlpha   = prog;
      rightAlpha  = prog;
      leftScale   = 0.85 + prog * 0.15;
      rightScale  = 0.85 + prog * 0.15;
    }
    if (t2 > P_HOLD) {
      const prog = (t2 - P_HOLD) / (1 - P_HOLD);
      leftAlpha   = 1 - prog * 0.4;
      rightAlpha  = 1 - prog * 0.4;
    }

    // ── Scan rings on each card (scanning phase) ──
    if (t2 >= P_ENTER && t2 < P_FLOW) {
      const scanAge = (frame % 60) / 60;
      [lx, rx].forEach(cx2 => {
        for (let i = 0; i < 3; i++) {
          const rr   = SC * (0.1 + i * 0.042) * (1 + scanAge * 0.35);
          const aa   = Math.max(0, 0.22 - scanAge * 0.25 - i * 0.06);
          ctx.beginPath();
          ctx.arc(cx2, py, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(59,130,246,${aa})`;
          ctx.lineWidth   = 1.2;
          ctx.stroke();
        }
      });
    }

    // ── LEFT profile: Freelancer ──
    drawProfile(lx, py, SC, 'AR', 'Arjun R.', 'Full-Stack Dev',
      ['React', 'Node'], '#3B82F6', leftAlpha, leftScale);

    // ── RIGHT profile: Client ──
    drawProfile(rx, py, SC, 'TC', 'TechCorp', 'Post: React App',
      ['Node', 'AWS'], '#06B6D4', rightAlpha, rightScale);

    // ── Bezier control points (S-curve between cards) ──
    const p0 = { x: lx,         y: py };
    const p1 = { x: lx + SC * 0.22, y: py - SC * 0.18 };
    const p2 = { x: rx - SC * 0.22, y: py + SC * 0.18 };
    const p3 = { x: rx,         y: py };

    // ── Flow particles ──
    if (t2 >= P_FLOW && t2 < P_MATCH) {
      const flowProg = (t2 - P_FLOW) / (P_MATCH - P_FLOW);

      // Draw the path first (dim)
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.strokeStyle = 'rgba(59,130,246,0.12)';
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Animated path reveal
      const dashLen  = Math.PI * SC * 0.5 * flowProg;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      ctx.setLineDash([dashLen, 9999]);
      ctx.strokeStyle = 'rgba(59,130,246,0.45)';
      ctx.lineWidth   = 2;
      ctx.stroke();
      ctx.setLineDash([]);

      // Particles riding the curve
      flowParticles.forEach(fp => {
        fp.t = (fp.t + fp.speed) % 1.0;
        if (fp.t > flowProg) return;
        const pos = cubicBezier(p0, p1, p2, p3, fp.t);
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, fp.size * 2.5);
        glow.addColorStop(0,   fp.hue + 'ee');
        glow.addColorStop(1,   'transparent');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, fp.size, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      });
    }

    // ── MATCHED badge ──
    if (t2 >= P_MATCH && t2 < 1.0) {
      const matchProg = Math.min(1, (t2 - P_MATCH) / 0.08);
      const pulse     = Math.sin(frame * 0.12) * 0.06 + 1;

      // Green glow on both cards
      const greenGlowA = 0.08 + (t2 >= P_HOLD ? -(t2 - P_HOLD) / (1 - P_HOLD) * 0.08 : 0);
      [lx, rx].forEach(cx2 => {
        const gg = ctx.createRadialGradient(cx2, py, 0, cx2, py, SC * 0.22);
        gg.addColorStop(0,   `rgba(52,211,153,${greenGlowA * 2})`);
        gg.addColorStop(1,   'transparent');
        ctx.fillStyle = gg;
        ctx.fillRect(0, 0, W, H);
      });

      // Connecting line (solid)
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
      const lineG = ctx.createLinearGradient(lx, 0, rx, 0);
      lineG.addColorStop(0, '#3B82F6');
      lineG.addColorStop(1, '#06B6D4');
      ctx.strokeStyle = lineG;
      ctx.lineWidth   = 2;
      ctx.globalAlpha = matchProg * (t2 >= P_HOLD ? 1 - (t2 - P_HOLD) / (1 - P_HOLD) : 1);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Badge
      const badgeW = SC * 0.36 * matchProg * pulse;
      const badgeH = SC * 0.1  * matchProg * pulse;
      if (badgeW > 4) {
        ctx.save();
        ctx.globalAlpha = matchProg * (t2 >= P_HOLD ? 1 - (t2 - P_HOLD) / (1 - P_HOLD) : 1);
        ctx.shadowColor  = 'rgba(52,211,153,0.6)';
        ctx.shadowBlur   = SC * 0.04;
        ctx.beginPath();
        ctx.roundRect(CX - badgeW / 2, py - badgeH / 2, badgeW, badgeH, badgeH / 2);
        const bg2 = ctx.createLinearGradient(CX - badgeW / 2, 0, CX + badgeW / 2, 0);
        bg2.addColorStop(0, 'rgba(52,211,153,0.2)');
        bg2.addColorStop(1, 'rgba(6,182,212,0.2)');
        ctx.fillStyle   = bg2;
        ctx.fill();
        ctx.strokeStyle = 'rgba(52,211,153,0.7)';
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        ctx.shadowBlur  = 0;

        ctx.fillStyle    = '#34D399';
        ctx.font         = `700 ${badgeH * 0.42}px "Space Grotesk",sans-serif`;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓ 94% Match — Connected!', CX, py);
        ctx.restore();
      }
    }
  }

  animate();
}

// ─────────────────────────────────────────────
//  THREE.JS — CTA BACKGROUND SCENE
// ─────────────────────────────────────────────
function initCtaScene() {
  const canvas = document.getElementById('cta-canvas');
  if (!canvas || typeof THREE === 'undefined') return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setClearColor(0x000000, 0);
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth/canvas.clientHeight, 0.1, 100);
  camera.position.z = 20;
  const pg  = new THREE.BufferGeometry();
  const pp  = new Float32Array(600*3);
  for (let i=0;i<600*3;i++) pp[i]=(Math.random()-0.5)*60;
  pg.setAttribute('position', new THREE.BufferAttribute(pp,3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({color:0x3B82F6,size:0.12,transparent:true,opacity:0.5}));
  scene.add(pts);
  const rings = [];
  for(let i=0;i<4;i++){
    const rg = new THREE.TorusGeometry(4+i*2,0.04,8,60);
    const rm = new THREE.MeshBasicMaterial({color:0x3B82F6,transparent:true,opacity:0.1+i*0.04});
    const r = new THREE.Mesh(rg,rm);
    r.rotation.x = Math.random()*Math.PI; r.rotation.y = Math.random()*Math.PI;
    scene.add(r); rings.push(r);
  }
  window.addEventListener('resize',()=>{renderer.setSize(canvas.clientWidth,canvas.clientHeight);camera.aspect=canvas.clientWidth/canvas.clientHeight;camera.updateProjectionMatrix();});
  let t=0;
  const animate=()=>{requestAnimationFrame(animate);t+=0.007;pts.rotation.y=t*0.04;rings.forEach((r,i)=>{r.rotation.x=t*(0.1+i*0.03);r.rotation.z=t*(0.08+i*0.02);});renderer.render(scene,camera);};
  animate();
}

// ─────────────────────────────────────────────
//  INIT ALL SCENES ON DOM READY
// ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // Canvas 2D animations (no Three.js dependency)
  initFreelancerSpotlight('freelancer-canvas');
  initMatchingAnimation('client-canvas');

  // Wait for Three.js to load for hero + CTA
  const waitForThree = setInterval(() => {
    if (typeof THREE !== 'undefined') {
      clearInterval(waitForThree);
      initHeroScene();
      initCtaScene();
    }
  }, 100);
});
