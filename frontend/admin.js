// Admin dashboard: list users, edit, delete, view details
(function(){
  function load(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }

  function ensureAdmin(){
    const a = JSON.parse(localStorage.getItem('gym_current_admin')||'null');
    if(!a){
      alert('Faça login como admin.');
      window.open('admin-login.html','_self');
      return false;
    }
    return true;
  }

  async function renderUsers(){
    if(!ensureAdmin()) return;
    const container = document.getElementById('users-table');
    if(!container) return;
    // fetch users from backend
    try {
      const res = await fetch('http://localhost:3000/api/auth/users');
      if (!res.ok) { container.innerHTML = '<p>Erro ao carregar usuários.</p>'; return; }
      const users = await res.json();
      if (!Array.isArray(users) || users.length === 0) { container.innerHTML = '<p>Nenhum usuário cadastrado.</p>'; return; }
      let html = '<table><thead><tr><th>Nome</th><th>Email</th><th>Plano</th><th>Ações</th></tr></thead><tbody>';
      users.forEach(u => {
        const plan = (u.planos && u.planos.length) ? u.planos[0] : '—';
        html += '<tr data-id="'+u.id+'"><td>'+(u.name || '—')+'</td><td class="small">'+(u.email||'')+'</td><td>'+(plan)+'</td>' +
                '<td><button class="btn small edit-user" data-id="'+u.id+'">Editar</button> <button class="btn outline small view-user" data-id="'+u.id+'">Ver</button> <button class="btn outline small del-user" data-id="'+u.id+'">Remover</button></td></tr>';
      });
      html += '</tbody></table>';
      container.innerHTML = html;

      // attach handlers
      container.querySelectorAll('.del-user').forEach(b => {
        b.addEventListener('click', async e => {
          const id = b.dataset.id;
          if (!confirm('Remover usuário?')) return;
          try {
            const resp = await fetch('http://localhost:3000/api/auth/user/' + id, { method: 'DELETE' });
            if (!resp.ok) { alert('Falha ao remover usuário'); return; }
            renderUsers();
            const det = document.getElementById('user-details'); if (det) det.innerHTML = '';
          } catch (err) { alert('Erro de comunicação ao remover usuário'); }
        });
      });

      container.querySelectorAll('.view-user').forEach(b => {
        b.addEventListener('click', async e => {
          const id = b.dataset.id;
          try {
            const resp = await fetch('http://localhost:3000/api/auth/user/' + id);
            if (!resp.ok) { alert('Erro ao buscar usuário'); return; }
            const u = await resp.json();
            const det = document.getElementById('user-details');
            if (!det) return;
            const plan = (u.planos && u.planos.length) ? u.planos[0] : '—';
            det.innerHTML = '<p><strong>Nome:</strong> ' + (u.name || '—') + '</p>' +
                            '<p><strong>Email:</strong> ' + (u.email||'') + '</p>' +
                            '<p><strong>Plano(s):</strong> ' + (u.planos && u.planos.length ? u.planos.join(', ') : '—') + '</p>' +
                            '<p><strong>Dias:</strong> ' + (u.dias && u.dias.length ? u.dias.join(', ') : '—') + '</p>' +
                            '<p><strong>Aulas:</strong> ' + (u.aulas && u.aulas.length ? u.aulas.join(', ') : '—') + '</p>';
          } catch (err) { alert('Erro de comunicação ao buscar usuário'); }
        });
      });

      container.querySelectorAll('.edit-user').forEach(b => {
        b.addEventListener('click', async e => {
          const id = b.dataset.id;
          try {
            const resp = await fetch('http://localhost:3000/api/auth/user/' + id);
            if (!resp.ok) { alert('Erro ao buscar usuário'); return; }
            const u = await resp.json();
            // prompt-only edit for name and email
            const newName = prompt('Nome:', u.name || '') || u.name;
            const newEmail = prompt('Email:', u.email || '') || u.email;
            // send update
            const updateRes = await fetch('http://localhost:3000/api/auth/user/' + id, {
              method: 'PUT', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: newName, email: newEmail })
            });
            const updated = await updateRes.json();
            if (!updateRes.ok) { alert(updated.error || 'Falha ao atualizar'); return; }
            alert('Usuário atualizado.');
            renderUsers();
          } catch (err) { alert('Erro de comunicação ao atualizar usuário'); }
        });
      });

    } catch (err) {
      const container = document.getElementById('users-table'); if (container) container.innerHTML = '<p>Erro ao carregar usuários.</p>';
    }
    

  }

  document.addEventListener('DOMContentLoaded', renderUsers);

})();
