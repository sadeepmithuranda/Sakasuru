// Applies the saved light/dark choice before the app renders, so dark mode never flashes white.
// Kept as a file (not inline) so it works under the strict Content-Security-Policy.
(function () {
  var choice = "system";
  try {
    choice = localStorage.getItem("sk_theme") || "system";
  } catch (e) {}
  var dark = choice === "dark" || (choice !== "light" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var root = document.documentElement;
  if (dark) root.classList.add("dark");
  root.style.colorScheme = dark ? "dark" : "light";
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#0B1310" : "#0E6B4F");
})();
