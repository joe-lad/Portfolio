document.addEventListener('turbo:load', () => {
  const links = document.querySelectorAll(".sidebar-link");
  const sections = document.querySelectorAll("section[id]");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.dataset.visible = entry.isIntersecting;
    });

    const visible = [...sections].filter(s => s.dataset.visible === 'true');
    if (visible.length === 0) return;

    // pick whichever visible section is closest to the top
    const active = visible.reduce((a, b) =>
      a.getBoundingClientRect().top < b.getBoundingClientRect().top ? a : b
    );
    // console.log(active);

    links.forEach(link => link.classList.remove("active"));
    const activeLink = document.querySelector(`.sidebar-link[href="/#${active.id}"]`);
    if (activeLink) activeLink.classList.add("active");

  }, {
    rootMargin: '-20% 0px -60% 0px', // active zone = top 20%-40% of viewport
    threshold: 0
  });

  sections.forEach(section => observer.observe(section));
});