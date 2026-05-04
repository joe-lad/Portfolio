document.addEventListener('turbo:load', () => {
  const toggle = document.getElementById("theme-toggle")
  const html = document.documentElement

  const saved = localStorage.getItem("theme")
  if (saved) {
    html.setAttribute("data-theme", saved)
    toggle.textContent = saved === "dark" ? "☀️" : "🌙"
  }

  toggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme")
    const next = current === "dark" ? "light" : "dark"
    html.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
    toggle.textContent = next === "dark" ? "☀️" : "🌙"
  })
});
