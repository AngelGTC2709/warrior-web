(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Tema claro / oscuro ---------- */
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } }
  };
  const saved = store.get("wk-theme");
  if (saved === "dark" || saved === "light") root.dataset.theme = saved;
  $("#themeBtn").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = isDark ? "light" : "dark";
    store.set("wk-theme", root.dataset.theme);
  });

  /* ---------- Menú móvil ---------- */
  const menuBtn = $("#menuBtn"), links = $("#navLinks");
  menuBtn.addEventListener("click", () => {
    const open = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    menuBtn.setAttribute("aria-expanded", "false");
    links.classList.remove("is-open");
  }));

  /* ---------- Barra de progreso + enlace activo ---------- */
  const line = $("#progressLine");
  const navMap = new Map($$("a", links).map(a => [a.getAttribute("href").slice(1), a]));
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    line.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navMap.forEach(a => a.classList.remove("is-active"));
      navMap.get(e.target.id)?.classList.add("is-active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => secObs.observe(s));

  /* ---------- Revelado al hacer scroll (visible en reposo) ---------- */
  const groups = new Map();
  $$(".reveal").forEach(el => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    groups.set(p, i + 1);
    el.style.setProperty("--d", `${Math.min(i, 6) * 0.08}s`);
  });
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      // solo anima lo que entra desde abajo de la pantalla
      if (e.boundingClientRect.top > innerHeight * 0.4) el.classList.add("in");
      else el.classList.add("in", "no-anim");
      revObs.unobserve(el);
    });
  }, { rootMargin: "0px 0px 60px 0px" });
  $$(".reveal").forEach(el => revObs.observe(el));
  const style = document.createElement("style");
  style.textContent = ".reveal.no-anim{animation:none!important}";
  document.head.appendChild(style);

  /* ---------- Contadores y anillos ---------- */
  const animateCount = (el) => {
    const to = parseFloat(el.dataset.to);
    if (reduce) { el.textContent = to.toFixed(1); return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const statObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const ring = $(".ring", e.target);
      const bar = $(".ring__bar", ring);
      bar.style.strokeDashoffset = 326.7 * (1 - parseFloat(ring.dataset.value) / 100);
      animateCount($(".count", e.target));
      statObs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  $$(".stat").forEach(s => statObs.observe(s));

  /* ---------- Teléfono del hero: carrusel automático ---------- */
  const heroImgs = $$("#heroPhone img");
  let hi = 0;
  if (!reduce) setInterval(() => {
    heroImgs[hi].classList.remove("is-on");
    hi = (hi + 1) % heroImgs.length;
    heroImgs[hi].classList.add("is-on");
  }, 3200);

  /* ---------- Tarjetas que giran ---------- */
  $$(".flip").forEach(f => f.addEventListener("click", () => {
    f.setAttribute("aria-pressed", f.getAttribute("aria-pressed") === "true" ? "false" : "true");
  }));

  /* ---------- Vitrina de pantallas ---------- */
  const SCREENS = {
    peque: [
      { img: "bienvenida", icon: "👋", title: "Bienvenida", text: "La primera pantalla saluda a la familia y registra a la persona tutora con su nombre y un correo que solo identifica la cuenta en el dispositivo.", points: ["No pide contraseña: es una demostración local.", "Sin anuncios ni funciones sociales públicas.", "Los datos no se sincronizan con la nube."] },
      { img: "inicio", icon: "🏠", title: "Inicio y reto del día", text: "El peque ve un saludo con su nombre, sus puntos y el reto de hoy, por ejemplo “Estira como gigante”, de unos 5 minutos.", points: ["Botón “Lo hice · avisar a mi tutor”.", "Más ideas para moverse, sin competencia.", "Cada actividad aprobada suma +15 puntos."] },
      { img: "retos", icon: "🤸", title: "Retos en espera", text: "Al avisar, la actividad queda en “Esperando revisión de tu tutor”. Así el adulto acompaña y confirma lo que se hizo.", points: ["Baila tu canción favorita · 10 min.", "Imita animales · 8 min.", "Paseo para descubrir · 15 min."] },
      { img: "habitos", icon: "💧", title: "Hábitos", text: "Registro de vasos de agua, exploración de los grupos del Plato del Bien Comer y un espacio para decir cómo se siente.", points: ["Registrar lo explorado no es una calificación.", "Ánimo: a gusto, tranquilo, más o menos, cansado o triste.", "Si se siente mal, sugiere hablar con un adulto de confianza."] },
      { img: "progreso", icon: "⭐", title: "Progreso e insignias", text: "Los puntos llegan cuando el tutor confirma una actividad. Cada 100 puntos se completa una recompensa virtual.", points: ["Insignias como “Primer reto” y “Familia en equipo”.", "Se ganan por participar, nunca por apariencia o comparación."] },
      { img: "recetas", icon: "🥗", title: "Recetario en familia", text: "Ideas sencillas con ingredientes comunes de la región, con los grupos del Plato del Bien Comer que incluye cada una.", points: ["Quesadillas de hongos y quelites.", "Tostadas de frijol y verduras.", "Calabacitas con elote y avena con fruta."] },
      { img: "ayuda", icon: "🔒", title: "Ayuda y privacidad", text: "Explica con claridad los límites del prototipo y que la app no da diagnósticos ni consejos médicos.", points: ["Todo se guarda en el almacenamiento local.", "Sin notificaciones, anuncios ni chat externo.", "Las pruebas con menores requieren autorizaciones y consentimiento."] }
    ],
    tutor: [
      { img: "tutor-acceso", icon: "🔐", title: "Acceso de la persona tutora", text: "Para abrir perfiles y avances familiares, el tutor escribe el correo guardado en el dispositivo.", points: ["Es una barrera de prototipo, no una autenticación segura.", "Separa el espacio del peque del espacio adulto."] },
      { img: "tutor-familia", icon: "👨‍👩‍👧", title: "Familia", text: "Resumen del día: actividades confirmadas, vasos registrados y puntos acumulados, con todos los perfiles de la familia.", points: ["Varios perfiles infantiles: Alex, Juan, Josias…", "Botón para añadir otro perfil infantil.", "Los perfiles solo existen en esta cuenta local."] },
      { img: "tutor-revision", icon: "✅", title: "Actividades por revisar", text: "El tutor pregunta cómo le fue al peque y confirma la actividad. En ese momento se suman los puntos.", points: ["Botón “Confirmar · +15 pts”.", "Contador de pendientes en la barra inferior."] },
      { img: "tutor-recetas", icon: "📖", title: "Recetario", text: "El mismo recetario regional, con ingredientes y preparación, para planear con calma.", points: ["Basado en el Plato del Bien Comer.", "Una guía de aprendizaje, no una dieta médica."] },
      { img: "tutor-menu", icon: "📅", title: "Planificador familiar", text: "Elige una receta para cada día de la semana y cámbiala cuando quieras.", points: ["De lunes a domingo.", "No es un plan alimenticio médico."] },
      { img: "tutor-ajustes", icon: "⚙️", title: "Ajustes", text: "Recordatorios familiares, meta de agua elegida en familia y un tiempo de uso acordado.", points: ["Tiempo de uso: 15, 30, 45 o 60 minutos.", "La app no bloquea el dispositivo ni mide tiempo en segundo plano."] }
    ]
  };
  const showcase = $("#showcase"), list = $("#screenList"), img = $("#showImg");
  const info = $("#screenInfo");
  let mode = "peque", idx = 0;

  // precarga
  Object.values(SCREENS).flat().forEach(s => { const i = new Image(); i.src = `img/${s.img}.webp`; });

  const renderList = () => {
    list.innerHTML = "";
    SCREENS[mode].forEach((s, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.innerHTML = `<span class="dot" aria-hidden="true">${s.icon}</span><span>${s.title}</span>`;
      b.addEventListener("click", () => show(i));
      li.appendChild(b);
      list.appendChild(li);
    });
  };
  const show = (i, first = false) => {
    const arr = SCREENS[mode];
    idx = (i + arr.length) % arr.length;
    const s = arr[idx];
    $$("button", list).forEach((b, j) => b.setAttribute("aria-current", j === idx ? "true" : "false"));
    $("#screenCount").textContent = `${idx + 1} / ${arr.length}`;
    $("#infoTag").textContent = mode === "peque" ? "Modo Peque" : "Modo Tutor";
    $("#infoTitle").textContent = s.title;
    $("#infoText").textContent = s.text;
    $("#infoPoints").innerHTML = s.points.map(p => `<li>${p}</li>`).join("");
    img.alt = `Captura del APK: ${s.title}`;
    if (first || reduce) { img.src = `img/${s.img}.webp`; return; }
    info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
    img.classList.add("swap");
    setTimeout(() => { img.src = `img/${s.img}.webp`; img.classList.remove("swap"); }, 260);
  };
  const setMode = (m) => {
    mode = m;
    showcase.dataset.mode = m;
    $$(".mode-switch button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
    renderList();
    show(0);
  };
  $$(".mode-switch button").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $("#prevScreen").addEventListener("click", () => show(idx - 1));
  $("#nextScreen").addEventListener("click", () => show(idx + 1));
  // deslizar en el teléfono
  let sx = null;
  $("#showPhone").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  $("#showPhone").addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  });
  renderList();
  show(0, true);

  /* ---------- Rutinas ---------- */
  const ROUTINES = {
    cardio: [["💃", "Baila tu canción favorita", "10 min · movimiento libre"], ["🐸", "Imita animales", "8 min · salta y gatea"], ["🚶", "Paseo para descubrir", "15 min · caminata en familia"]],
    fuerza: [["🦸", "Sentadillas de superhéroe", "Piernas fuertes"], ["🐊", "Camina como cocodrilo", "Brazos y abdomen"], ["🐻", "Plancha del osito", "Abdomen y espalda"]],
    flex: [["🙆", "Estira como gigante", "5 min · brazos al cielo"], ["🧘", "Respira y relaja", "Estiramiento suave y sin dolor"], ["🌈", "Arcoíris de brazos", "Movimientos lentos de lado a lado"]]
  };
  const rBody = $("#routineBody");
  const renderR = (k) => {
    rBody.innerHTML = ROUTINES[k].map(([i, t, d]) => `<div class="move"><span class="move__ico" aria-hidden="true">${i}</span><div><b>${t}</b><small>${d}</small></div></div>`).join("");
    $$(".routines__tabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.r === k)));
  };
  $$(".routines__tabs button").forEach(b => b.addEventListener("click", () => renderR(b.dataset.r)));
  renderR("cardio");

  /* ---------- Demo de juego ---------- */
  let pts = 60, approved = 1, water = 0;
  const CH = [
    { i: "🙆", t: "Estira como gigante", d: "5 min · +15 puntos con aprobación" },
    { i: "💃", t: "Baila tu canción favorita", d: "10 min · +15 puntos con aprobación" },
    { i: "🐸", t: "Imita animales", d: "8 min · +15 puntos con aprobación" },
    { i: "🚶", t: "Paseo para descubrir", d: "15 min · +15 puntos con aprobación" }
  ];
  const chList = $("#challenges");
  chList.innerHTML = CH.map((c, n) => `<li class="ch" data-state="todo" id="ch-${n}"><span class="ch__ico" aria-hidden="true">${c.i}</span><b>${c.t}</b><small>${c.d}</small><button class="ch__btn" type="button">Ya la hice · avisar a mi tutor</button></li>`).join("");

  const toastEl = $("#toast");
  let toastT;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("show"), 2600);
  };
  const confetti = (x, y) => {
    if (reduce) return;
    const colors = ["#9CCFF6", "#F8B4C4", "#AEE5CF", "#FFE39E", "#FFCBAB"];
    for (let k = 0; k < 28; k++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.style.background = colors[k % colors.length];
      document.body.appendChild(c);
      const ang = Math.random() * Math.PI * 2, dist = 80 + Math.random() * 140;
      c.animate([
        { transform: `translate(${x}px, ${y}px) rotate(0deg)`, opacity: 1 },
        { transform: `translate(${x + Math.cos(ang) * dist}px, ${y + Math.sin(ang) * dist - 60}px) rotate(${Math.random() * 720}deg)`, opacity: 1, offset: .6 },
        { transform: `translate(${x + Math.cos(ang) * dist * 1.2}px, ${y + Math.sin(ang) * dist + 120}px) rotate(${Math.random() * 900}deg)`, opacity: 0 }
      ], { duration: 1200 + Math.random() * 500, easing: "cubic-bezier(.22,1,.36,1)" }).onfinish = () => c.remove();
    }
  };
  const unlock = (key, name) => {
    const b = $(`.badge[data-b="${key}"]`);
    if (!b || b.classList.contains("is-on")) return;
    b.classList.add("is-on", "unlock");
    toast(`🏅 Nueva insignia: ${name}`);
  };
  const updatePts = () => {
    $("#ptsNum").textContent = pts;
    const badge = $(".pts-badge");
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
    const within = pts % 100;
    $("#xpBar").style.width = `${within === 0 ? 100 : within}%`;
    $("#xpText").textContent = within === 0 ? "¡Recompensa completada! 100 de 100 puntos" :`${within} de 100 puntos`;
  };
  chList.addEventListener("click", (e) => {
    const btn = e.target.closest(".ch__btn");
    if (!btn) return;
    const li = btn.closest(".ch");
    const st = li.dataset.state;
    if (st === "todo") {
      li.dataset.state = "waiting";
      btn.textContent = "Tutor: confirmar · +15 pts";
      toast("¡Actividad registrada! Pídele a tu tutor que la revise.");
    } else if (st === "waiting") {
      li.dataset.state = "done";
      btn.textContent = "Confirmada ✓";
      btn.disabled = true;
      const before = pts;
      pts += 15; approved++;
      updatePts();
      const r = btn.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top);
      if (Math.floor(pts / 100) > Math.floor(before / 100)) setTimeout(() => toast("🎁 ¡Recompensa virtual completada!"), 900);
      if (approved >= 3) setTimeout(() => unlock("equipo", "Familia en equipo"), 400);
      if (li.id === "ch-3") setTimeout(() => unlock("cami", "Caminante"), 1400);
    }
  });

  const glasses = $("#glasses"), GOAL = 5;
  glasses.innerHTML = Array.from({ length: GOAL }, () => '<span class="glass"></span>').join("");
  $("#addWater").addEventListener("click", () => {
    if (water >= GOAL) { toast("Meta de agua cumplida por hoy 💧"); return; }
    water++;
    $$(".glass", glasses)[water - 1].classList.add("full");
    $("#waterText").textContent = `${water} de ${GOAL} vasos de la meta familiar.`;
    if (water === GOAL) unlock("hidra", "Hidratacionista");
  });

  const MOODS = {
    gusto: "¡Qué bien! Comparte esa alegría con tu familia.",
    tranquilo: "La calma también es energía. ¿Un estiramiento suave?",
    masomenos: "Está bien sentirse así. Un vaso de agua y un paseo corto pueden ayudar.",
    cansado: "Descansar es parte de ser un guerrero. Hoy puedes elegir algo tranquilo.",
    triste: "Gracias por contarlo. Habla con una persona adulta de confianza; no estás solo."
  };
  $$("#moods button").forEach(b => b.addEventListener("click", () => {
    $$("#moods button").forEach(x => x.setAttribute("aria-checked", String(x === b)));
    const msg = $("#moodMsg");
    msg.textContent = MOODS[b.dataset.m];
    msg.animate?.([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: "ease-out" });
  }));

  /* ---------- Plato del Bien Comer ---------- */
  const plate = $(".plate");
  let selG = null;
  const selectG = (g) => {
    selG = selG === g ? null : g;
    plate.classList.toggle("has-sel", !!selG);
    $$(".plate__seg").forEach(s => s.classList.toggle("sel", s.dataset.g === selG));
    $$(".lg").forEach(l => l.setAttribute("aria-pressed", String(l.dataset.g === selG)));
    $$(".recipe").forEach(r => r.classList.toggle("dim", !!selG && !r.dataset.g.split(" ").includes(selG)));
  };
  $$(".plate__seg, .lg").forEach(el => el.addEventListener("click", () => selectG(el.dataset.g)));
  $$(".lg").forEach(l => l.setAttribute("aria-pressed", "false"));

  /* ---------- Línea "Hoy" en el cronograma ---------- */
  const now = new Date();
  if (now.getFullYear() === 2026 && now.getMonth() >= 7 && now.getMonth() <= 11) {
    const m = (now.getMonth() - 7) + (now.getDate() - 1) / 31;
    $(".g-today").style.setProperty("--m", m.toFixed(2));
  }
})();
