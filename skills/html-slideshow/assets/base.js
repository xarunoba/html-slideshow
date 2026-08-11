(function () {
  "use strict";
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  const deck = document.getElementById("deck");
  const counter = document.getElementById("counter");
  const progressBar = document.getElementById("progress-bar");
  const dotsEl = document.getElementById("dots");
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const fsBtn = document.getElementById("fs");
  const ovBtn = document.getElementById("ov");
  const hint = document.getElementById("hint");

  const slides = () => Array.from(deck.querySelectorAll(":scope > .slide"));
  let current = 0;
  let navGuard = 0;
  let snapTimer = null; // fallback timer for the scroll-snap restore
  let snapEnd = null; // scrollend listener ref, so a later goTo can cancel it

  const clampIndex = (i) => {
    const n = slides().length;
    return n ? Math.max(0, Math.min(n - 1, i)) : 0;
  };

  function goTo(i, smooth) {
    const s = slides();
    if (!s.length) return;
    const idx = clampIndex(i);
    current = idx;
    navGuard = performance.now() + 750;
    const targetSlide = s[idx];

    // CSS scroll-snap-type: x mandatory fights programmatic scrolling on mobile
    // Chromium (Brave/Edge on Android): the compositor re-clamps the deck's
    // scroll mid-flight, so Element.scrollIntoView either doesn't move or lands
    // on the wrong slide — manual touch swipe keeps working. Drive the deck's
    // own scrollLeft with snap disabled, then restore snap once it settles.
    const applySnap = () => {
      deck.style.scrollSnapType = deck.classList.contains("is-overview")
        ? "none"
        : "x mandatory";
    };
    // cancel any restore still pending from the previous navigation
    clearTimeout(snapTimer);
    deck.removeEventListener("scrollend", snapEnd);
    snapTimer = null;
    snapEnd = null;

    deck.style.scrollSnapType = "none";

    const delta =
      targetSlide.getBoundingClientRect().left - deck.getBoundingClientRect().left;
    deck.scrollTo({
      left: deck.scrollLeft + delta,
      top: 0,
      behavior: smooth === false ? "instant" : "smooth",
    });

    if (smooth === false || Math.abs(delta) <= 1) {
      // No animation: snap can come straight back.
      snapTimer = setTimeout(applySnap, 60);
    } else {
      // Restore once the smooth scroll fully settles — a fixed timer would cut
      // a multi-slide jump short and let snap re-clamp it mid-flight. The
      // fallback covers browsers without a `scrollend` event.
      snapEnd = () => {
        deck.removeEventListener("scrollend", snapEnd);
        snapEnd = null;
        clearTimeout(snapTimer);
        snapTimer = null;
        applySnap();
      };
      deck.addEventListener("scrollend", snapEnd, { once: true });
      snapTimer = setTimeout(snapEnd, 2000);
    }

    setActive(idx);
  }
  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  function setActive(idx) {
    const s = slides();
    if (!s.length) return;
    current = clampIndex(idx);
    s.forEach((sl, i) => {
      const on = i === current;
      sl.classList.toggle("is-active", on);
      sl.setAttribute("aria-hidden", on ? "false" : "true");
      sl.setAttribute("aria-label", "Slide " + (i + 1) + " of " + s.length);
      sl.setAttribute("role", "group");
      sl.setAttribute("aria-roledescription", "slide");
    });
    counter.textContent = current + 1 + " / " + s.length;
    progressBar.style.width =
      (s.length <= 1 ? 100 : (current / (s.length - 1)) * 100) + "%";
    renderDots(current);
    const hash = "#" + (current + 1);
    if (location.hash !== hash && history.replaceState)
      history.replaceState(null, "", hash);
  }

  const MAX_DOTS = 9;
  function renderDots(active) {
    const n = slides().length;
    dotsEl.innerHTML = "";
    if (!n) return;
    const mk = (i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.setAttribute("aria-current", i === active ? "true" : "false");
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(i);
      });
      dotsEl.appendChild(b);
    };
    const ell = () => {
      const s = document.createElement("span");
      s.className = "dots-ell";
      s.textContent = "\u2026";
      s.setAttribute("aria-hidden", "true");
      dotsEl.appendChild(s);
    };
    if (n <= MAX_DOTS) {
      for (let i = 0; i < n; i++) mk(i);
      return;
    }

    const mid = MAX_DOTS - 2;
    let lo = active - (mid >> 1);
    let hi = lo + mid - 1;
    if (lo < 1) {
      hi += 1 - lo;
      lo = 1;
    }
    if (hi > n - 2) {
      lo -= hi - (n - 2);
      hi = n - 2;
    }
    lo = Math.max(1, lo);
    hi = Math.min(n - 2, hi);
    mk(0);
    if (lo > 1) ell();
    for (let i = lo; i <= hi; i++) mk(i);
    if (hi < n - 2) ell();
    mk(n - 1);
  }

  let observer = null;
  function observe() {
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        if (deck.classList.contains("is-overview")) return;
        if (performance.now() < navGuard) return;
        let best = -1,
          bestRatio = 0;
        entries.forEach((en) => {
          if (en.intersectionRatio > bestRatio) {
            bestRatio = en.intersectionRatio;
            best = slides().indexOf(en.target);
          }
        });
        if (best >= 0 && bestRatio >= 0.5 && best !== current) setActive(best);
      },
      { root: deck, threshold: [0.5, 0.75] },
    );
    slides().forEach((sl) => observer.observe(sl));
  }

  function toggleOverview(force, target) {
    const on =
      force !== undefined ? force : !deck.classList.contains("is-overview");
    deck.classList.toggle("is-overview", on);
    ovBtn.setAttribute("aria-pressed", on ? "true" : "false");

    if (!on) {
      void deck.offsetWidth;
      goTo(target != null ? target : current, false);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  // --- Portrait fit -----------------------------------------------------
  // A portrait frame reflows a landscape slide into a narrow box, so wide
  // content (tables, grids) overflows. When the deck reads portrait, lay each
  // slide out at full landscape resolution (frame-height × --slide-w/--slide-h)
  // and zoom it down to fit the frame width (see `.deck.is-portrait > .slide`
  // in base.css). cqw/cqh resolve to the unzoomed box, so content renders at
  // landscape scale and scales together — the slide looks exactly as it does
  // on a landscape screen. Measuring the deck (not the viewport) keeps this
  // correct when the deck lives in an iframe or split pane.
  const supportsPortraitFit =
    typeof CSS !== "undefined" &&
    !!CSS.supports &&
    CSS.supports("height: 100svh") &&
    CSS.supports("zoom: 1");

  function fitPortrait() {
    if (!supportsPortraitFit) return;
    const w = deck.clientWidth;
    const h = deck.clientHeight;
    if (!w || !h) return;
    if (h > w) {
      const root = getComputedStyle(document.documentElement);
      const sw = parseFloat(root.getPropertyValue("--slide-w")) || 16;
      const sh = parseFloat(root.getPropertyValue("--slide-h")) || 9;
      deck.style.setProperty("--fit-zoom", String(w / (h * (sw / sh))));
      deck.classList.add("is-portrait");
    } else {
      deck.classList.remove("is-portrait");
      deck.style.removeProperty("--fit-zoom");
    }
  }

  document.addEventListener("keydown", (e) => {
    if (
      e.target instanceof Element &&
      e.target.closest("input,textarea,select,[contenteditable]")
    )
      return;
    const over = deck.classList.contains("is-overview");
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case "PageDown":
      case " ":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "ArrowUp":
      case "PageUp":
        e.preventDefault();
        prev();
        break;
      case "Home":
        e.preventDefault();
        goTo(0, false);
        break;
      case "End":
        e.preventDefault();
        goTo(slides().length - 1, false);
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      case "o":
      case "O":
        toggleOverview();
        break;
      case "Escape":
        if (over) toggleOverview(false);
        break;
    }
  });

  deck.addEventListener("click", (e) => {
    if (deck.classList.contains("is-overview")) {
      const sl = e.target.closest(".slide");
      if (sl) {
        const i = slides().indexOf(sl);
        if (i >= 0) {
          toggleOverview(false, i);
        }
      }
      return;
    }

    if (
      e.target.closest(
        "a,button,input,textarea,select,[contenteditable],[data-no-nav]",
      )
    )
      return;
    const mid = deck.getBoundingClientRect().left + deck.clientWidth / 2;
    (e.clientX < mid ? prev : next)();
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    prev();
  });
  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    next();
  });
  fsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullscreen();
  });
  ovBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleOverview();
  });

  window.addEventListener("resize", fitPortrait);
  window.addEventListener("orientationchange", fitPortrait);
  // Drop the portrait canvas while printing — @media print lays slides out one
  // per page at its own size; the zoomed landscape canvas would fight that.
  window.addEventListener("beforeprint", () => {
    deck.classList.remove("is-portrait");
    deck.style.removeProperty("--fit-zoom");
  });
  window.addEventListener("afterprint", fitPortrait);

  function fromHash() {
    const h = location.hash.slice(1);
    if (!h) return null;
    if (/^\d+$/.test(h)) return clampIndex(parseInt(h, 10) - 1);
    const el = document.getElementById(h);
    if (el) {
      const sl = el.closest(".slide");
      if (sl) return slides().indexOf(sl);
    }
    return null;
  }
  window.addEventListener("hashchange", () => {
    const i = fromHash();
    if (i !== null) goTo(i);
  });

  new MutationObserver(() => {
    renderDots(current);
    observe();
    setActive(current);
    fitPortrait();
  }).observe(deck, { childList: true });

  if (!sessionStorage.getItem("slHintSeen")) {
    hint.hidden = false;
    sessionStorage.setItem("slHintSeen", "1");
    setTimeout(() => {
      hint.hidden = true;
    }, 5000);
  }

  fitPortrait();
  renderDots(0);
  observe();
  goTo(fromHash() ?? 0, false);
  deck.focus();
})();
