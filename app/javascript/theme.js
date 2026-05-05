document.addEventListener('turbo:load', () => {
  const toggle = document.getElementById("theme-toggle")
  const html = document.documentElement

  // Sync button icon with current theme (already set by head script)
  toggle.textContent = html.getAttribute("data-theme") === "dark" ? "☀️" : "🌙"

  toggle.addEventListener("click", () => {
    const current = html.getAttribute("data-theme")
    const next = current === "dark" ? "light" : "dark"
    html.setAttribute("data-theme", next)
    localStorage.setItem("theme", next)
    toggle.textContent = next === "dark" ? "☀️" : "🌙"
  })
})