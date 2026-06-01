// script-login.js - xử lý form đăng nhập
(function(){
  const form = document.getElementById('login-form');
  const err = document.getElementById('err');

  function getReturnUrl(){
    const p = new URLSearchParams(location.search);
    return p.get('r') || 'index.html';
  }

  // Nếu đã login và chưa hết hạn, chuyển về return URL
  try {
    if (window.Auth && Auth.isAuthenticated()) {
      const ret = getReturnUrl();
      location.href = ret;
    }
  } catch(e){}

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;

    const user = (window.USERS || []).find(x=>x.username===u && x.password===p);
    if (!user) {
      err.style.display = 'block'; err.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.'; return;
    }

    try {
      if (window.Auth && typeof Auth.set === 'function') {
        Auth.set(user.username);
      } else {
        // fallback: store username with 2h expiry
        const expires = Date.now() + 2 * 60 * 60 * 1000;
        localStorage.setItem('auth', JSON.stringify({ username: user.username, expires }));
      }
    } catch(e){}

    const ret = getReturnUrl();
    location.href = ret;
  });
})();
