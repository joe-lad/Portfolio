document.addEventListener('turbo:load', () => {
  const burger = document.getElementById('burger');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('overlay');

  if (!burger || !sidebar || !overlay) return;

  function open() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
    burger.classList.add('open');
  }

  function close() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
    burger.classList.remove('open');
  }

  function toggle() {
    sidebar.classList.contains('open') ? close() : open();
  }

  burger.addEventListener('click', toggle);
  overlay.addEventListener('click', close); // tap outside to close

  // auto-close when a link is tapped
  sidebar.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) close();
    });
  });
});