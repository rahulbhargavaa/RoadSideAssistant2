// public/js/main.js
// Global JavaScript behaviors used across all pages

document.addEventListener('DOMContentLoaded', function () {
  // Add shadow to navbar on scroll
  const navbar = document.querySelector('.main-navbar');
  if (navbar) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = '0 6px 25px rgba(0,0,0,0.25)';
      } else {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
      }
    });
  }

  // Enable Bootstrap tooltips globally, if any exist on the page
  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltipTriggerList.forEach(function (el) {
    new bootstrap.Tooltip(el);
  });

  // Smooth scroll for in-page anchor links (e.g. "How It Works")
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
