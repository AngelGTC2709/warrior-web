(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const refreshIcons = () => { if (window.lucide) lucide.createIcons(); };

  /* ---------- Tema claro / oscuro sincronizado con las capturas ---------- */
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} }
  };

  function isDarkMode() {
    if (root.dataset.theme) return root.dataset.theme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncHeroImages() {
    const dark = isDarkMode();
    $$("#heroPhone img").forEach(img => {
      const target = dark ? img.dataset.dark : img.dataset.light;
      if (target) img.src = target;
    });
  }

  const saved = store.get("wk-theme");
  if (saved === "dark" || saved === "light") root.dataset.theme = saved;
  syncHeroImages();

  $("#themeBtn").addEventListener("click", () => {
    root.dataset.theme = isDarkMode() ? "light" : "dark";
    store.set("wk-theme", root.dataset.theme);
    syncHeroImages();
    renderShowcase(currentIdx, true);
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

  /* ---------- Revelado escalonado al hacer scroll ---------- */
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
      e.target.classList.add("in");
      revObs.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px 40px 0px" });
  $$(".reveal").forEach(el => revObs.observe(el));

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
      const to = parseFloat(ring.dataset.value);
      bar.style.strokeDashoffset = 326.7 * (1 - to / 100);
      animateCount($(".count", e.target));
      statObs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  $$(".stat").forEach(s => statObs.observe(s));

  /* ---------- Carrusel automático Hero ---------- */
  const heroImgs = $$("#heroPhone img");
  let hi = 0;
  if (!reduce && heroImgs.length > 1) {
    setInterval(() => {
      heroImgs[hi].classList.remove("is-on");
      hi = (hi + 1) % heroImgs.length;
      heroImgs[hi].classList.add("is-on");
    }, 3400);
  }

  /* ---------- Gráficas de Pastel SVG del estudio (5.º y 6.º grado) ---------- */
  const SURVEY_DATA = {
    g5: [
      {
        title: "P1. Bebida habitual (5.º grado)",
        total: "n = 116",
        slices: [
          { label: "Agua simple natural", pct: 37.9, n: 44, color: "#10B981" },
          { label: "Jugos/aguas con azúcar o té", pct: 37.1, n: 43, color: "#F59E0B" },
          { label: "Refrescos o bebidas saborizadas", pct: 25.0, n: 29, color: "#F43F5E" }
        ]
      },
      {
        title: "P2. Tiempo libre en casa (5.º grado)",
        total: "n = 116",
        slices: [
          { label: "Juego activo, bici, deporte", pct: 33.6, n: 39, color: "#10B981" },
          { label: "Dibujar, leer, juguetes", pct: 25.0, n: 29, color: "#38BDF8" },
          { label: "Pantallas sentado(a)", pct: 41.4, n: 48, color: "#F43F5E" }
        ]
      },
      {
        title: "P3. Actividad en el recreo (5.º grado)",
        total: "n = 116",
        slices: [
          { label: "Juegos con movimiento", pct: 46.6, n: 54, color: "#10B981" },
          { label: "Caminar y platicar", pct: 32.8, n: 38, color: "#F59E0B" },
          { label: "Sentado, comer o dispositivo", pct: 20.7, n: 24, color: "#F43F5E" }
        ]
      },
      {
        title: "P4. Sensación al correr (5.º grado)",
        total: "n = 116",
        slices: [
          { label: "Con fuerza, sin problema", pct: 30.2, n: 35, color: "#10B981" },
          { label: "Un poco cansado(a)", pct: 48.3, n: 56, color: "#F59E0B" },
          { label: "Muy agitado(a)", pct: 21.6, n: 25, color: "#F43F5E" }
        ]
      }
    ],
    g6: [
      {
        title: "P1. Días con ≥30 min de actividad (6.º grado)",
        total: "n = 95",
        slices: [
          { label: "4 a 7 días por semana", pct: 23.2, n: 22, color: "#10B981" },
          { label: "1 a 3 días por semana", pct: 48.4, n: 46, color: "#F59E0B" },
          { label: "Casi nunca", pct: 28.4, n: 27, color: "#F43F5E" }
        ]
      },
      {
        title: "P2. Consumo entre comidas (6.º grado)",
        total: "n = 95",
        slices: [
          { label: "Frutas/verduras equilibradas", pct: 24.2, n: 23, color: "#10B981" },
          { label: "Botanas, galletas o pan dulce", pct: 46.3, n: 44, color: "#F59E0B" },
          { label: "Comida rápida y azucaradas", pct: 29.5, n: 28, color: "#F43F5E" }
        ]
      },
      {
        title: "P3. Horas de pantalla al día (6.º grado)",
        total: "n = 95",
        slices: [
          { label: "Menos de 2 horas", pct: 17.9, n: 17, color: "#10B981" },
          { label: "2 a 4 horas diarias", pct: 44.2, n: 42, color: "#F59E0B" },
          { label: "Más de 4 horas diarias", pct: 37.9, n: 36, color: "#F43F5E" }
        ]
      },
      {
        title: "P4. Sueño en días de clase (6.º grado)",
        total: "n = 95",
        slices: [
          { label: "Temprano y con energía", pct: 22.1, n: 21, color: "#10B981" },
          { label: "Tarde por pantallas", pct: 47.4, n: 45, color: "#F59E0B" },
          { label: "Desvelo y cansancio", pct: 30.5, n: 29, color: "#F43F5E" }
        ]
      }
    ]
  };

  function buildPiePaths(slices) {
    const cx = 100, cy = 100, r = 84;
    const sum = slices.reduce((acc, s) => acc + s.pct, 0);
    let currentAngle = -Math.PI / 2;

    return slices.map((s, idx) => {
      const sliceAngle = (s.pct / sum) * Math.PI * 2;
      const x1 = cx + r * Math.cos(currentAngle);
      const y1 = cy + r * Math.sin(currentAngle);
      const endAngle = currentAngle + sliceAngle;
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
      const largeArc = sliceAngle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      currentAngle = endAngle;
      return `<path class="pie-slice" data-idx="${idx}" d="${d}" fill="${s.color}"><title>${s.label}: ${s.pct}% (n=${s.n})</title></path>`;
    }).join("");
  }

  const surveyContainer = $("#surveyCharts");
  function renderSurvey(gradeKey) {
    if (!surveyContainer) return;
    surveyContainer.innerHTML = SURVEY_DATA[gradeKey].map((card, cIdx) => `
      <article class="pie-card" data-card="${cIdx}">
        <h3>${card.title}</h3>
        <div class="pie-card__body">
          <svg class="pie-svg" viewBox="0 0 200 200" aria-label="${card.title}">
            <circle cx="100" cy="100" r="88" class="pie-rim"/>
            ${buildPiePaths(card.slices)}
            <circle cx="100" cy="100" r="34" class="pie-hole"/>
            <text x="100" y="100" class="pie-center-txt">${card.total}</text>
          </svg>
          <ul class="pie-legend">
            ${card.slices.map((s, sIdx) => `
              <li data-idx="${sIdx}">
                <span class="pie-legend__left"><i class="pie-dot" style="background:${s.color}"></i>${s.label}</span>
                <span class="pie-val">${s.pct.toFixed(1)}% (${s.n})</span>
              </li>
            `).join("")}
          </ul>
        </div>
      </article>
    `).join("");

    // Interacción sincronizada entre rebanada del pastel y leyenda
    surveyContainer.querySelectorAll(".pie-card").forEach(card => {
      const slices = card.querySelectorAll(".pie-slice");
      const items = card.querySelectorAll(".pie-legend li");
      const highlight = (idx, active) => {
        slices[idx]?.classList.toggle("is-hl", active);
        items[idx]?.classList.toggle("is-hl", active);
      };
      slices.forEach((sl, i) => {
        sl.addEventListener("mouseenter", () => highlight(i, true));
        sl.addEventListener("mouseleave", () => highlight(i, false));
      });
      items.forEach((it, i) => {
        it.addEventListener("mouseenter", () => highlight(i, true));
        it.addEventListener("mouseleave", () => highlight(i, false));
      });
    });
  }

  $$(".survey-tabs button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".survey-tabs button").forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      renderSurvey(btn.dataset.grade);
    });
  });
  renderSurvey("g5");

  /* ---------- Vitrina de capturas reales (Claro & Oscuro por cada tema) ---------- */
  const SCREENS = {
    rosa: [
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.53 PM (2).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.50 PM (3).jpeg",
        icon: "home", title: "Inicio · Reto familiar",
        text: "Saludo personalizado para el perfil infantil con tema Lavanda y Rosa, puntos acumulados y acceso al reto familiar semanal.",
        points: ["Banner de reto familiar ('Realizar las actividades durante una semana').", "Tarjetas grandes: Agua, Plato, Movimiento, Mis hábitos y retos, Mis logros y NutriBot.", "Cambio inmediato entre tema claro y oscuro."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.53 PM (3).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.50 PM (5).jpeg",
        icon: "droplet", title: "Mis hábitos y retos",
        text: "Registro diario de agua (+10 puntos al completar 5 vasos) y sección 'Colores en mi plato' con los 4 grupos alimenticios.",
        points: ["Botones interactivos '+1' para sumar vasos de agua.", "Grupos: Frutas y verduras, Cereales, Leguminosas y Origen animal.", "Acceso directo al registro emocional."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.53 PM (5).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.51 PM.jpeg",
        icon: "smile", title: "Estado de ánimo y descanso",
        text: "Tarjetas visuales de colores para expresar cómo se siente (Feliz, Emocionado, Tranquilo, Cansado, Triste, Enojado) y registro de horas de sueño.",
        points: ["Sin juicios ni etiquetas clínicas.", "Registro de descanso diario frente a la meta recomendada.", "Lista de retos del día y retos familiares."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.54 PM (1).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.51 PM (3).jpeg",
        icon: "activity", title: "Movimiento de hoy",
        text: "Juegos tradicionales de patio que cambian cada día (Palomas y gavilanes, Salto de cuerda, Paseo en bicicleta) y guía 'Muévete con cuidado'.",
        points: ["Clasificación por Cardio, Fuerza, Flexibilidad y Equilibrio.", "Duración recomendada por rango de edad.", "Acompañamiento seguro en familia."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.53 PM (1).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.51 PM (5).jpeg",
        icon: "salad", title: "Recetas con color",
        text: "Catálogo de recetas saludables con buscador, filtros por tiempo de comida y alertas automáticas de alergias y preferencias del perfil.",
        points: ["Aviso prioritario de alergias registradas (ej. Tomate, Nueces, Cacahuate).", "Preferencias visibles para evitar ingredientes que no le gustan.", "Recetas detalladas paso a paso."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.54 PM (3).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.51 PM (4).jpeg",
        icon: "bot", title: "NutriBot Familiar",
        text: "Asistente integrado en la pantalla principal que responde dudas sobre hábitos, comida y bienestar sin enviar datos a servicios externos.",
        points: ["Preguntas rápidas sugeridas ('¿De qué hablamos hoy?').", "Funciona localmente dentro de la aplicación.", "Lenguaje amigable adaptado a niñas y niños."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.52 PM (5).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.52 PM (2).jpeg",
        icon: "user", title: "Personaliza tu avatar",
        text: "Constructor de personaje con vista previa en vivo: tono de piel, cabello, ropa y accesorios.",
        points: ["Refuerza la identidad y sentido de pertenencia.", "Disponible desde el perfil infantil o desde Mis ajustes."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.52 PM (4).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.52 PM.jpeg",
        icon: "settings", title: "Mis ajustes y apariencia",
        text: "Selector de apariencia (Claro, Oscuro o Automático según el sistema del teléfono) y efectos de sonido.",
        points: ["Permite probar el modo oscuro al instante.", "Los controles parentales permanecen protegidos."]
      }
    ],
    azul: [
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.55 PM.jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.57 PM (3).jpeg",
        icon: "home", title: "Inicio · Tema Azul Cian",
        text: "Cada perfil infantil puede elegir su propia paleta de color ('Azul y verde' o 'Lavanda y rosa') manteniendo todas las funciones.",
        points: ["Personalización visual independiente por cada hijo.", "Recordatorio destacado: 'Toma un vaso de agua' (+10 pts).", "Barra de progreso diario."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.55 PM (2).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.57 PM (5).jpeg",
        icon: "droplet", title: "Mis hábitos y retos (Azul)",
        text: "Seguimiento de hidratación y colores en el plato con botones en azul cian vibrante tanto en modo claro como en modo oscuro.",
        points: ["Contador de 0 a 5 vasos de agua.", "Registro táctil de grupos alimenticios.", "Integración directa con el resumen del tutor."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.55 PM (5).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.57 PM (1).jpeg",
        icon: "trophy", title: "Mis logros y premios",
        text: "Visualización de puntos acumulados, insignias por desbloquear y catálogo de premios familiares creados por el tutor.",
        points: ["Premios canjeables en familia (ej. tiempo de juego o actividad especial).", "Explica claramente cómo se ganan los puntos."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.56 PM (1).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.58 PM (3).jpeg",
        icon: "activity", title: "Movimiento (Azul)",
        text: "Rutinas diarias adaptadas para niños pequeños (6 a 8 años) como 'Saltitos con peso corporal' y 'Postura de árbol con cuidado'.",
        points: ["Adaptación automática según la fecha de nacimiento registrada.", "Instrucciones claras y seguras."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.57 PM.jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.56 PM (6).jpeg",
        icon: "help-circle", title: "¿Necesitas ayuda?",
        text: "Guía ilustrada con la mascota WK que explica cómo registrar agua, cómo ganar puntos y qué es NutriBot.",
        points: ["Aclara que NutriBot no es un médico y no sustituye a un adulto.", "Diseño accesible con tarjetas limpias."]
      }
    ],
    tutor: [
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.54 PM (4).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.48 PM (1).jpeg",
        icon: "users", title: "Panel Familia (Tutor)",
        text: "Centro de mando en tonos ámbar/naranja: selector de perfiles infantiles (Lupita, Auda, Gaby), botón '+ Perfil', puntos y pendientes por revisar.",
        points: ["Botón destacado de Control parental.", "Contadores de perfiles infantiles y actividades por revisar.", "Protegido con candado en el selector Niñez / Tutor."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.46 PM.jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.48 PM (2).jpeg",
        icon: "bar-chart-2", title: "Resumen semanal del menor",
        text: "Gráficas de los últimos 7 días: edad, peso, estatura, vasos de agua por día, anillo de grupos de alimentos, ánimo y descanso por día.",
        points: ["Gráfica de barras diaria frente a la meta de 5 vasos.", "Anillo visual de equilibrio alimenticio.", "Comparativa de horas de sueño frente a lo recomendado (9–12 h)."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.46 PM (3).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.49 PM.jpeg",
        icon: "calendar", title: "Menú de la semana",
        text: "Planificador de lunes a domingo para Desayuno, Comida y Cena con alertas visibles de alergias y preferencias del menor.",
        points: ["Muestra alertas rojas para alergias y amarillas para alimentos que no le gustan.", "Permite asignar o cambiar recetas por día."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.47 PM (1).jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.49 PM (1).jpeg",
        icon: "sliders", title: "Gestión de datos (Retos y Premios)",
        text: "Módulo administrativo para crear y asignar retos, actividades físicas o didácticas, recompensas y planes alimenticios.",
        points: ["Asignación individual o grupal a todos los hijos.", "Seguimiento de estado: Asignado, Lo completó, Verificado."]
      },
      {
        light: "img/WhatsApp Image 2026-11-25 at 10.25.48 PM.jpeg",
        dark: "img/WhatsApp Image 2026-11-25 at 10.25.50 PM (2).jpeg",
        icon: "shield-check", title: "Ajustes y privacidad (Tutor)",
        text: "Configuración de Control parental, metas diarias de agua, selector de apariencia (Claro / Oscuro / Automático) y gestión de cuenta Supabase.",
        points: ["Muestra el correo verificado de la cuenta familiar.", "Cierre de sesión seguro."]
      }
    ]
  };

  const showcase = $("#showcase"), list = $("#screenList"), img = $("#showImg");
  const info = $("#screenInfo");
  let currentMode = "rosa", currentIdx = 0;

  function renderList() {
    list.innerHTML = SCREENS[currentMode].map((s, i) => `
      <li>
        <button type="button" aria-current="${i === currentIdx ? "true" : "false"}" data-i="${i}">
          <span class="dot" aria-hidden="true"><i data-lucide="${s.icon}"></i></span>
          <span>${s.title}</span>
        </button>
      </li>
    `).join("");
    list.querySelectorAll("button").forEach(b => {
      b.addEventListener("click", () => renderShowcase(Number(b.dataset.i)));
    });
    refreshIcons();
  }

  function renderShowcase(i, instant = false) {
    const arr = SCREENS[currentMode];
    currentIdx = (i + arr.length) % arr.length;
    const s = arr[currentIdx];
    const targetSrc = isDarkMode() ? s.dark : s.light;

    list.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-current", j === currentIdx ? "true" : "false"));
    $("#screenCount").textContent = `${currentIdx + 1} / ${arr.length}`;
    $("#infoTag").textContent = currentMode === "rosa" ? "Modo Niñez · Tema Rosa" : currentMode === "azul" ? "Modo Niñez · Tema Azul" : "Modo Tutor · Tema Ámbar";
    $("#infoTitle").textContent = s.title;
    $("#infoText").textContent = s.text;
    $("#infoPoints").innerHTML = s.points.map(p => `<li>${p}</li>`).join("");

    if (instant || reduce) {
      img.src = targetSrc;
      return;
    }
    info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap");
    img.classList.add("swap");
    setTimeout(() => {
      img.src = targetSrc;
      img.classList.remove("swap");
    }, 220);
  }

  $$(".mode-switch button").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".mode-switch button").forEach(b => b.setAttribute("aria-selected", "false"));
      btn.setAttribute("aria-selected", "true");
      currentMode = btn.dataset.mode;
      showcase.dataset.mode = currentMode;
      currentIdx = 0;
      renderList();
      renderShowcase(0);
    });
  });

  $("#prevScreen").addEventListener("click", () => renderShowcase(currentIdx - 1));
  $("#nextScreen").addEventListener("click", () => renderShowcase(currentIdx + 1));

  let sx = null;
  $("#showPhone").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
  $("#showPhone").addEventListener("touchend", e => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) renderShowcase(currentIdx + (dx < 0 ? 1 : -1));
    sx = null;
  });

  renderList();
  renderShowcase(0, true);

  /* ---------- Simulador interactivo con confeti ---------- */
  let pts = 70, approved = 2, water = 0;
  const CH = [
    { i: "droplet", t: "Hidrátate a tu ritmo", d: "Llega a tu meta de agua de hoy · +10 pts" },
    { i: "salad", t: "Plato con colores", d: "Registra dos grupos de alimentos · +15 pts" },
    { i: "smile", t: "Cuéntanos cómo estás", d: "Si quieres, elige cómo te sientes · +15 pts" },
    { i: "trophy", t: "Reto familiar semanal", d: "Realizar las actividades durante una semana · +30 pts" }
  ];
  const chList = $("#challenges");
  chList.innerHTML = CH.map((c, n) => `
    <li class="ch" data-state="todo" id="ch-${n}">
      <span class="ch__ico" aria-hidden="true"><i data-lucide="${c.i}"></i></span>
      <b>${c.t}</b>
      <small>${c.d}</small>
      <button class="ch__btn" type="button">Lo hice · enviar a revisión</button>
    </li>
  `).join("");
  refreshIcons();

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
    const colors = ["#F43F5E", "#F59E0B", "#10B981", "#FACC15", "#38BDF8"];
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
    toast(`Nueva insignia desbloqueada: ${name}`);
  };

  const updatePts = () => {
    $("#ptsNum").textContent = pts;
    const badge = $(".pts-badge");
    badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump");
    const within = pts % 100;
    $("#xpBar").style.width = `${within === 0 ? 100 : within}%`;
    $("#xpText").textContent = `${within === 0 ? 100 : within} de 100 puntos`;
  };

  chList.addEventListener("click", (e) => {
    const btn = e.target.closest(".ch__btn");
    if (!btn) return;
    const li = btn.closest(".ch");
    if (li.dataset.state === "todo") {
      li.dataset.state = "waiting";
      btn.textContent = "Tutor: aprobar · +15 pts";
      toast("Enviado a revisión de tu tutor.");
    } else if (li.dataset.state === "waiting") {
      li.dataset.state = "done";
      btn.textContent = "Aprobado por tutor";
      btn.disabled = true;
      pts += 15; approved++;
      updatePts();
      const r = btn.getBoundingClientRect();
      confetti(r.left + r.width / 2, r.top);
      if (approved >= 3) setTimeout(() => unlock("cami", "Familia activa"), 400);
      toast("¡Actividad aprobada! Puntos acreditados.");
    }
  });

  const glasses = $("#glasses"), GOAL = 5;
  glasses.innerHTML = Array.from({ length: GOAL }, () => '<span class="glass"></span>').join("");
  $("#addWater").addEventListener("click", () => {
    if (water >= GOAL) { toast("Meta de 5 vasos cumplida hoy (+10 pts)"); return; }
    water++;
    $$(".glass", glasses)[water - 1].classList.add("full");
    $("#waterText").textContent = `${water} de ${GOAL} vasos registrados hoy.`;
    if (water === GOAL) {
      pts += 10;
      updatePts();
      unlock("hidra", "Hidratacionista");
    }
  });

  const MOODS = {
    feliz: "¡Qué bien! Tu estado de ánimo feliz se guarda en tu resumen semanal.",
    emocionado: "¡Genial! Aprovecha esa energía para jugar en familia.",
    tranquilo: "Estar tranquilo ayuda a descansar bien.",
    cansado: "Recuerda dormir entre 9 y 12 horas para recuperar energía.",
    triste: "Gracias por contarlo. Platica con tu persona tutora de confianza.",
    enojado: "Respira profundo; contar cómo te sientes es un gran paso."
  };
  $$("#moods button").forEach(b => b.addEventListener("click", () => {
    $$("#moods button").forEach(x => x.setAttribute("aria-checked", String(x === b)));
    $("#moodMsg").textContent = MOODS[b.dataset.m];
  }));
})();