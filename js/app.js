/* ============================================================
   Blach AI Training Hub — interactions
   - localStorage progress (videos watched + tools explored)
   - lazy YouTube embeds (privacy-enhanced nocookie)
   - Blach-branded confetti cannons
   - scroll reveals + milestone toasts
   ============================================================ */
(function () {
  "use strict";

  var STORAGE_KEY = "blach-ai-training:v1";
  var BRAND_COLORS = ["#0076BB", "#00AEEF", "#009CA6", "#F5A800", "#80BC00", "#FE5000", "#FFFFFF"];

  /* ---------- progress state ---------- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { videos: {}, tools: {}, celebrated: false };
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  var state = loadState();

  /* ---------- confetti engine ---------- */
  var canvas = document.getElementById("confetti-canvas");
  var ctx = canvas.getContext("2d");
  var particles = [];
  var rafId = null;

  function sizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  function spawnBurst(x, y, count, spread, power) {
    for (var i = 0; i < count; i++) {
      var angle = (-Math.PI / 2) + (Math.random() - 0.5) * spread;
      var speed = power * (0.55 + Math.random() * 0.7);
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 7,
        color: BRAND_COLORS[(Math.random() * BRAND_COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.35,
        life: 1,
        decay: 0.006 + Math.random() * 0.01,
        shape: Math.random() < 0.5 ? "rect" : "circle"
      });
    }
    if (!rafId) tick();
  }

  /* fire from two bottom corners like cannons, toward the center */
  function confettiCannons() {
    var h = window.innerHeight, w = window.innerWidth;
    // left cannon angled right, right cannon angled left
    fireAngled(0, h, count(90), -Math.PI / 4, 17);
    fireAngled(w, h, count(90), -3 * Math.PI / 4, 17);
    // a center pop
    spawnBurst(w / 2, h * 0.62, count(60), Math.PI * 0.9, 14);
  }
  function count(n) { return Math.min(n, 120); }

  function fireAngled(x, y, n, baseAngle, power) {
    for (var i = 0; i < n; i++) {
      var angle = baseAngle + (Math.random() - 0.5) * 0.6;
      var speed = power * (0.6 + Math.random() * 0.7);
      particles.push({
        x: x, y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 6 + Math.random() * 8,
        color: BRAND_COLORS[(Math.random() * BRAND_COLORS.length) | 0],
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4,
        life: 1, decay: 0.005 + Math.random() * 0.008,
        shape: Math.random() < 0.5 ? "rect" : "circle"
      });
    }
    if (!rafId) tick();
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var gravity = 0.28, drag = 0.992;
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += gravity; p.vx *= drag; p.vy *= drag;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= p.decay;
      if (p.life <= 0 || p.y > window.innerHeight + 40) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
    if (particles.length) { rafId = requestAnimationFrame(tick); }
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); rafId = null; }
  }

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastEl = document.getElementById("toast");
  var toastTimer = null;
  function toast(emoji, msg) {
    toastEl.innerHTML = '<span class="emoji">' + emoji + '</span>' + msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 3400);
  }

  /* ---------- progress meter ---------- */
  var videoCards = Array.prototype.slice.call(document.querySelectorAll(".video-card"));
  var toolCards = Array.prototype.slice.call(document.querySelectorAll(".tool-card:not(.promo)"));
  var TOTAL = videoCards.length + toolCards.length;

  var ring = document.querySelector(".nav-progress .fg");
  var ringLen = ring ? (2 * Math.PI * 15) : 0;
  if (ring) { ring.style.strokeDasharray = ringLen; ring.style.strokeDashoffset = ringLen; }
  var navPct = document.querySelector(".nav-progress .pct");
  var barFill = document.querySelector(".progress-bar-fill");
  var countEl = document.querySelector(".pb-count");
  var subEl = document.querySelector(".pb-sub-dynamic");

  function done() {
    var v = Object.keys(state.videos).filter(function (k) { return state.videos[k]; }).length;
    var t = Object.keys(state.tools).filter(function (k) { return state.tools[k]; }).length;
    return v + t;
  }

  function updateMeter(animate) {
    var d = done();
    var pct = TOTAL ? Math.round((d / TOTAL) * 100) : 0;
    if (ring) ring.style.strokeDashoffset = ringLen * (1 - d / TOTAL);
    if (navPct) navPct.textContent = pct + "%";
    if (barFill) barFill.style.width = pct + "%";
    if (countEl) countEl.textContent = d + "/" + TOTAL;
    if (subEl) {
      subEl.textContent = pct === 0 ? "Pick a video below to get started — your progress saves automatically."
        : pct === 100 ? "You completed every video and explored every tool. You're a Claude pro! 🎉"
        : "Nicely done — " + (TOTAL - d) + " to go. Keep exploring!";
    }
    return pct;
  }

  function checkMilestones(prevPct, newPct) {
    if (reduceMotion) return;
    if (newPct === 100 && !state.celebrated) {
      state.celebrated = true; saveState();
      confettiCannons();
      setTimeout(confettiCannons, 600);
      toast("🏆", "100% complete — you finished the whole Getting Started hub!");
    }
  }

  /* ---------- videos ---------- */
  function markVideo(card, watched) {
    var id = card.getAttribute("data-id");
    var prev = updateMeter();
    state.videos[id] = watched;
    card.classList.toggle("watched", watched);
    var btn = card.querySelector(".mark-btn .label");
    if (btn) btn.textContent = watched ? "Completed" : "Mark complete";
    saveState();
    var now = updateMeter(true);
    if (watched && !reduceMotion) {
      var r = card.getBoundingClientRect();
      spawnBurst(r.left + r.width / 2, r.top + r.height * 0.4, 70, Math.PI * 0.8, 13);
    }
    checkMilestones(prev, now);
  }

  function loadVideo(card) {
    if (card.getAttribute("data-loaded")) return;
    var media = card.querySelector(".vc-media");
    var id = card.getAttribute("data-id");
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube-nocookie.com/embed/" + id + "?rel=0&modestbranding=1&autoplay=1";
    iframe.title = card.getAttribute("data-title") || "Training video";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    media.innerHTML = "";
    media.appendChild(iframe);
    card.setAttribute("data-loaded", "1");
    // starting a video counts as completing it for progress purposes
    if (!state.videos[id]) markVideo(card, true);
  }

  videoCards.forEach(function (card) {
    var id = card.getAttribute("data-id");
    if (state.videos[id]) {
      card.classList.add("watched");
      var lbl = card.querySelector(".mark-btn .label");
      if (lbl) lbl.textContent = "Completed";
    }
    var media = card.querySelector(".vc-media");
    media.addEventListener("click", function () { loadVideo(card); });
    var btn = card.querySelector(".mark-btn");
    if (btn) btn.addEventListener("click", function (e) {
      e.stopPropagation();
      markVideo(card, !card.classList.contains("watched"));
    });
  });

  /* ---------- tools ---------- */
  function markTool(card, explored) {
    var key = card.getAttribute("data-key");
    var prev = updateMeter();
    state.tools[key] = explored;
    card.classList.toggle("explored", explored);
    var lbl = card.querySelector(".tool-explore .label");
    if (lbl) lbl.textContent = explored ? "Explored" : "Tap to mark explored";
    saveState();
    var now = updateMeter(true);
    if (explored && !reduceMotion) {
      var r = card.getBoundingClientRect();
      spawnBurst(r.left + r.width / 2, r.top + r.height * 0.3, 45, Math.PI * 0.7, 11);
    }
    checkMilestones(prev, now);
  }

  toolCards.forEach(function (card) {
    var key = card.getAttribute("data-key");
    if (state.tools[key]) {
      card.classList.add("explored");
      var lbl = card.querySelector(".tool-explore .label");
      if (lbl) lbl.textContent = "Explored";
    }
    card.addEventListener("click", function () {
      markTool(card, !card.classList.contains("explored"));
    });
  });

  /* ---------- celebrate button (hero) ---------- */
  var celebrateBtn = document.getElementById("celebrate");
  if (celebrateBtn) celebrateBtn.addEventListener("click", function () {
    if (!reduceMotion) confettiCannons();
  });

  /* ---------- reset progress ---------- */
  var resetBtn = document.getElementById("reset-progress");
  if (resetBtn) resetBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (!confirm("Reset your training progress on this device?")) return;
    state = { videos: {}, tools: {}, celebrated: false };
    saveState();
    videoCards.forEach(function (c) {
      c.classList.remove("watched");
      var l = c.querySelector(".mark-btn .label"); if (l) l.textContent = "Mark complete";
    });
    toolCards.forEach(function (c) {
      c.classList.remove("explored");
      var l = c.querySelector(".tool-explore .label"); if (l) l.textContent = "Tap to mark explored";
    });
    updateMeter(true);
    toast("↺", "Progress reset — fresh start!");
  });

  /* ---------- scroll reveals ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* initial paint */
  updateMeter(false);
})();
