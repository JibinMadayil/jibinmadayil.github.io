// Runs before first paint: marks JS as available and applies a saved theme choice.
(function () {
  document.documentElement.classList.add("js");
  try {
    var t = localStorage.getItem("theme");
    if (t === "light" || t === "dark") document.documentElement.setAttribute("data-theme", t);
  } catch (e) {}
})();
