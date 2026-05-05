document.addEventListener('turbo:load', () => {
  const burger = document.getElementById('burger');
  const sidebar = document.querySelector('.sidebar');
  const adminSidebar = document.querySelector('.admin-sidebar');
  const overlay = document.getElementById('overlay');

  if (!burger || !overlay) return;

  function open() {
    if(sidebar){
      sidebar.classList.add('open');
    }

    if(adminSidebar){
      adminSidebar.classList.add('open');
    }
    overlay.classList.add('open');
    burger.classList.add('open');
  }

  function close() {
    if(sidebar){
      sidebar.classList.remove('open');
    }

    if(adminSidebar){
      adminSidebar.classList.remove('open');
    }
    overlay.classList.remove('open');
    burger.classList.remove('open');
  }

  function toggle() {
    if(sidebar){
      sidebar.classList.contains('open') ? close() : open();
    }

    if(adminSidebar){
      adminSidebar.classList.contains('open') ? close() : open();
    }
  }

  burger.addEventListener('click', toggle);
  overlay.addEventListener('click', close); // tap outside to close

  // auto-close when a link is tapped

  if(sidebar){
    sidebar.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) close();
      });
    });
  }

  if(adminSidebar){
    adminSidebar.querySelectorAll('.admin-sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) close();
      });
    });
  }

});