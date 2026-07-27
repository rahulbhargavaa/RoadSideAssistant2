// public/js/login.js
// Small client side enhancement for the login form (basic validation feedback before submit)

document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      const email = loginForm.querySelector('input[name="email"]').value.trim();
      const password = loginForm.querySelector('input[name="password"]').value.trim();

      if (!email || !password) {
        e.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Missing Fields',
          text: 'Please enter both email and password to continue.',
        });
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      const password = registerForm.querySelector('input[name="password"]').value;
      const confirmPassword = registerForm.querySelector('input[name="confirmPassword"]').value;

      if (password !== confirmPassword) {
        e.preventDefault();
        Swal.fire({
          icon: 'error',
          title: 'Password Mismatch',
          text: 'Password and Confirm Password do not match.',
        });
      }
    });
  }
});
