(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  // Theme
  var themeBtn = document.querySelector(".theme-toggle");

  function storedTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  function effectiveTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return darkQuery.matches ? "dark" : "light";
  }

  function syncThemeUI() {
    var dark = effectiveTheme() === "dark";
    root.classList.toggle("is-dark", dark);
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    var meta = document.querySelectorAll('meta[name="theme-color"]');
    meta.forEach(function (m) { m.setAttribute("content", dark ? "#100F0E" : "#312D2A"); });
  }

  themeBtn.addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeUI();
  });

  darkQuery.addEventListener("change", function () {
    if (!storedTheme()) syncThemeUI();
  });

  syncThemeUI();

  // Mobile menu
  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuBtn.addEventListener("click", function () {
    setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  // Active section in nav, with a sliding underline on wide screens
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  var indicator = nav.querySelector(".nav-indicator");
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function moveIndicator(link) {
    if (!link) { indicator.style.opacity = "0"; return; }
    var navBox = nav.getBoundingClientRect();
    var box = link.getBoundingClientRect();
    indicator.style.width = (box.width - 24) + "px";
    indicator.style.transform = "translateX(" + (box.left - navBox.left + 12) + "px)";
    indicator.style.opacity = "1";
  }

  var current = null;
  function setActive(id) {
    var link = null;
    links.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + id;
      if (on) { a.setAttribute("aria-current", "true"); link = a; }
      else a.removeAttribute("aria-current");
    });
    current = link;
    moveIndicator(link);
  }

  // Scroll-driven bits: header border, reading progress, active section, timeline fill
  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress span");
  var timeline = document.querySelector(".timeline");
  var entries = Array.prototype.slice.call(document.querySelectorAll(".entry"));
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 8);
    progress.style.setProperty("--read", max > 0 ? Math.min(1, y / max).toFixed(4) : "0");

    var probe = window.innerHeight * 0.35;
    var activeId = null;
    sections.forEach(function (s) {
      if (s && s.getBoundingClientRect().top <= probe) activeId = s.id;
    });
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) activeId = "contact";
    if (!current || !activeId || current.getAttribute("href") !== "#" + activeId) setActive(activeId);

    if (timeline) {
      var box = timeline.getBoundingClientRect();
      var mark = window.innerHeight * 0.6;
      var fill = (mark - box.top) / box.height;
      fill = Math.max(0, Math.min(1, fill));
      timeline.style.setProperty("--fill", fill.toFixed(4));
      entries.forEach(function (el) {
        el.classList.toggle("is-reached", el.getBoundingClientRect().top + 12 <= mark);
      });
    }
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", function () { moveIndicator(current); onScroll(); });

  // Reveal timeline entry details as they come into view
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    var seen = new IntersectionObserver(function (items) {
      items.forEach(function (item) {
        if (item.isIntersecting) {
          item.target.classList.add("is-seen");
          seen.unobserve(item.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    entries.forEach(function (el) { seen.observe(el); });
  } else {
    entries.forEach(function (el) { el.classList.add("is-seen"); });
  }

  // Pause the hero diagram's pulses when it is off screen
  var flow = document.querySelector(".flow");
  if (flow && "IntersectionObserver" in window) {
    new IntersectionObserver(function (items) {
      flow.classList.toggle("is-paused", !items[0].isIntersecting);
    }).observe(flow);
  }
  document.addEventListener("visibilitychange", function () {
    if (flow) flow.classList.toggle("is-paused", document.hidden);
  });

  // Copy email
  var toast = document.querySelector(".toast");
  var toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var done = function () {
        btn.textContent = "Copied";
        showToast((btn.getAttribute("data-copy-label") || "Email address") + " copied");
        setTimeout(function () { btn.textContent = "Copy"; }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(done, function () { showToast("Copy failed. Select the text instead."); });
      } else {
        showToast("Copy isn't available here. Select the text instead.");
      }
    });
  });

  // Fusion-style greeting by the visitor's time of day
  var greet = document.getElementById("fx-greeting");
  if (greet) {
    var hr = new Date().getHours();
    greet.textContent = (hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening") + ", and welcome.";
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Start the hero sequence
  function start() {
    onScroll();
    requestAnimationFrame(function () { root.classList.add("is-loaded"); });
  }
  if (document.fonts && document.fonts.ready) {
    var started = false;
    var go = function () { if (!started) { started = true; start(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 600);
  } else {
    start();
  }
})();
