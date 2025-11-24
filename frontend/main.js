// Handles plans selection, aula page and displaying current user choices
(function(){
  function load(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; } }
  function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }

  function renderChoices(){
    const el = document.getElementById('my-choices');
    const u = JSON.parse(localStorage.getItem('gym_current_user')||'null');
    if(!el) return;
    el.innerHTML = '<p><strong>Usuário:</strong> ' + u.login + '</p>' +
                   ('<p><strong>Plano:</strong> ' + (u.plan||'—') + '</p>') +
                   ('<p><strong>Dias:</strong> ' + (u.days && u.days.length? u.days.join(', '):'—') + '</p>') +
                   ('<p><strong>Exercícios:</strong> ' + (u.exercises && u.exercises.length? u.exercises.join(', '):'—') + '</p>');
  }

  // Aula page setup
  function setupAula(){
    const daysGrid = document.getElementById('days-grid');
    const exercisesGrid = document.getElementById('exercises-grid');
    if(!daysGrid || !exercisesGrid) return;
    const days = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
    daysGrid.innerHTML = '';
    days.forEach(d=>{
      const card = document.createElement('div');
      card.className='day-card';
      card.innerHTML = '<h3>'+d+'</h3><label><input type="checkbox" value="'+d+'"> Selecionar</label>';
      daysGrid.appendChild(card);
    });

    const muscleGroups = {
      'Pernas':['Agachamento','Leg Press','Avanço','Stiff','Flexora','Panturrilha'],
      'Peito':['Supino Reto','Supino Inclinado','Crucifixo','Crossover','Flexão','Pullover'],
      'Costas':['Puxada na Frente','Remada','Levantamento Terra','Puxada Unilateral','Pulldown','Remada Curvada'],
      'Ombros':['Desenvolvimento','Elevação Lateral','Elevação Frontal','Remada Alta','Face Pull','Arnold Press'],
      'Braços':['Rosca Direta','Rosca Alternada','Tríceps Corda','Tríceps Testa','Supinação','Rosca Martelo'],
      'Core':['Prancha','Abdominal','Abdominal Infra','Russian Twist','Elevação de Pernas','Hollow Hold']
    };

    exercisesGrid.innerHTML = '';
    Object.entries(muscleGroups).forEach(([group, list])=>{
      const card = document.createElement('div');
      card.className='exercise card';
      card.innerHTML = '<h4>'+group+'</h4>';
      const ol = document.createElement('ol');
      list.forEach(v=>{
        const li = document.createElement('li');
        li.innerHTML = '<label><input type="checkbox" value="'+v+'"> '+v+'</label>';
        ol.appendChild(li);
      });
      card.appendChild(ol);
      exercisesGrid.appendChild(card);
    });

    // prefill from current user
    const u = JSON.parse(localStorage.getItem('gym_current_user')||'null');
    if(u){
      // days
      const dayChecks = daysGrid.querySelectorAll('input[type=checkbox]');
      dayChecks.forEach(ch=>{
        if(u.days && u.days.includes(ch.value)) ch.checked = true;
      });
      // exercises
      const exChecks = exercisesGrid.querySelectorAll('input[type=checkbox]');
      exChecks.forEach(ch=>{
        if(u.exercises && u.exercises.includes(ch.value)) ch.checked = true;
      });
    }
  }

  // initialize when document ready
  document.addEventListener('DOMContentLoaded', ()=>{
    renderChoices();
    setupAula();
    // Save handler: coleta dias e exercícios selecionados e envia ao backend
    const btnSave = document.getElementById('btn-save-aula');
    if (btnSave) {
      btnSave.addEventListener('click', async () => {
        const daysGrid = document.getElementById('days-grid');
        const exercisesGrid = document.getElementById('exercises-grid');
        if (!daysGrid || !exercisesGrid) return;

        const selectedDays = Array.from(daysGrid.querySelectorAll('input[type=checkbox]:checked')).map(c=>c.value);
        const selectedExercises = Array.from(exercisesGrid.querySelectorAll('input[type=checkbox]:checked')).map(c=>c.value);

        // obtain user id: prefer 'id' from localStorage (set at login), fallback to gym_current_user.id
        let id = null;
        try { id = Number(localStorage.getItem('id')) || null; } catch(e) { id = null; }
        if (!id) {
          try {
            const u = JSON.parse(localStorage.getItem('gym_current_user')||'null');
            if (u && u.id) id = Number(u.id);
          } catch(e) { /* ignore */ }
        }

        const msgEl = document.getElementById('save-msg');

        if (!id) {
          if (msgEl) msgEl.textContent = 'Erro: usuário não identificado. Faça login novamente.';
          return;
        }

        const payload = { id, dias: selectedDays, aulas: selectedExercises };

        try {
          const res = await fetch('http://localhost:3000/api/aulas/registerAula', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const data = await res.json();
          if (res.ok) {
            alert(data.message || 'Dados salvos com sucesso.');
            // Atualiza o gym_current_user no localStorage para refletir as escolhas
            try {
              const u = JSON.parse(localStorage.getItem('gym_current_user')||'null') || {};
              u.days = selectedDays;
              u.exercises = selectedExercises;
              localStorage.setItem('gym_current_user', JSON.stringify(u));
            } catch(e) { /* ignore */ }
            // re-render choices
            renderChoices();
          } else {
            alert(data.error || 'Falha ao salvar dados.');
          }
        } catch (err) {
          alert('Erro de comunicação com o servidor.');
        }
      });
    }
  });

})();
