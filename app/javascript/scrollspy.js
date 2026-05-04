const links = document.querySelectorAll(".sidebar-link")
const sections = document.querySelectorAll("section[id]")

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(link => link.classList.remove("active"))
      const active = document.querySelector(`.sidebar-link[href="#${entry.target.id}"]`)
      if (active) active.classList.add("active")
    }
  })
}, { threshold: 0.3 })

sections.forEach(section => observer.observe(section))