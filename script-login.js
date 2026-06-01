// script-login.js - xử lý form đăng nhập
(function(){
  const form = document.getElementById('login-form');
  const err = document.getElementById('err');
  const rememberEl = document.getElementById('remember');

  function getReturnUrl(){
    const p = new URLSearchParams(location.search);
    return p.get('r') || 'index.html';
  }

  // Nếu đã lưu trong localStorage (remember), tự động chuyển hướng
  try {
    const remembered = localStorage.getItem('loggedUser');
    if (remembered) {
      const ret = getReturnUrl();
      location.href = ret;
    }
  } catch(e){}

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;
    const remember = !!(rememberEl && rememberEl.checked);

    const user = (window.USERS || []).find(x=>x.username===u && x.password===p);
    if (!user) {
      err.style.display = 'block'; err.textContent = 'Tên đăng nhập hoặc mật khẩu không đúng.'; return;
    }

    try {
      if (remember) {
        localStorage.setItem('loggedUser', user.username);
      } else {
        sessionStorage.setItem('loggedUser', user.username);
      }
    } catch(e){}

    const ret = getReturnUrl();
    location.href = ret;
  });
})();
