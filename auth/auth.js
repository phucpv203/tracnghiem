// Simple client-side auth helper with 2-hour expiry per device.
(function(){
  const KEY = 'auth';
  const TTL = 2 * 60 * 60 * 1000; // 2 hours in ms

  function now(){ return Date.now(); }

  function set(username){
    try{
      const obj = { username: username, expires: now() + TTL };
      localStorage.setItem(KEY, JSON.stringify(obj));
    }catch(e){}
  }

  function clear(){ try{ localStorage.removeItem(KEY); }catch(e){} }

  function get(){
    try{
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || !obj.expires) { localStorage.removeItem(KEY); return null; }
      if (now() > obj.expires) { localStorage.removeItem(KEY); return null; }
      return obj;
    }catch(e){ return null; }
  }

  function isAuthenticated(){ return !!get(); }

  window.Auth = { set, get, clear, isAuthenticated };
})();
