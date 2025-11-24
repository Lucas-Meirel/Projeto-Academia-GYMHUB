// Handles registration and login for users and admins using localStorage
(function(){
  // Keep only logout logic here. Login is handled by `login.js` (backend).
  function load(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function save(key, val){ localStorage.setItem(key, JSON.stringify(val)); }

  // Logout buttons
  document.addEventListener('click', e=>{
    if(e.target && e.target.id==='btn-logout'){
      localStorage.removeItem('gym_current_user');
      window.open('index.html','_self');
    }
    if(e.target && e.target.id==='btn-logout-admin'){
      localStorage.removeItem('gym_current_admin');
      window.open('index.html','_self');
    }
  });
})();