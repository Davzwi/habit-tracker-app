#!/usr/bin/env node

import fs from "node:fs/promises";

const INPUT = "index-repair.html";
const OUTPUT = "index.html";

async function repairFunctionsOnly() {
  console.log("🔧 Repariere nur die Funktionen, behalte das Original-Design...\n");
  
  let html = await fs.readFile(INPUT, "utf8");
  
  // Backup
  const backup = OUTPUT.replace(/\.html$/, `.backup-before-repair-${Date.now()}.html`);
  await fs.writeFile(backup, await fs.readFile(OUTPUT, "utf8"), "utf8");
  console.log(`📦 Backup: ${backup}`);
  
  const fixes = [];
  
  // 1. Fix Task Management Functions
  console.log("1️⃣ Repariere Task-Management...");
  
  // Ensure selectItem actually saves tasks
  const selectItemFix = `
    function selectItem(name, icon, category, time) {
      console.log('Adding:', { name, icon, category, time });
      
      const today = new Date();
      const dateStr = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
      
      const newTask = {
        id: Date.now().toString(),
        title: name,
        icon: icon,
        time: time || '09:00',
        category: category,
        completed: false,
        date: dateStr
      };
      
      let tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
      tasks.push(newTask);
      localStorage.setItem('userTasks', JSON.stringify(tasks));
      
      closeAddItemModal();
      showToast(\`"\${name}" wurde hinzugefügt!\`);
      
      // Reload to show new task
      setTimeout(() => location.reload(), 500);
    }`;
  
  if (!html.includes('localStorage.setItem(\'userTasks\'')) {
    html = html.replace(
      /function selectItem\([^)]*\)\s*\{[^}]*\}/,
      selectItemFix
    );
    fixes.push("✅ selectItem speichert jetzt Tasks");
  }
  
  // 2. Add display function for user tasks
  console.log("2️⃣ Füge Task-Anzeige hinzu...");
  
  const displayUserTasks = `
    function displayUserTasks() {
      const tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
      const today = new Date();
      const dateStr = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
      
      const todayTasks = tasks.filter(t => t.date === dateStr);
      
      todayTasks.forEach(task => {
        const hour = parseInt(task.time.split(':')[0]);
        let section;
        
        if (hour >= 6 && hour < 12) {
          section = document.querySelector('.timeline-section:nth-child(1) .timeline-items');
        } else if (hour >= 12 && hour < 18) {
          section = document.querySelector('.timeline-section:nth-child(2) .timeline-items');
        } else {
          section = document.querySelector('.timeline-section:nth-child(3) .timeline-items');
        }
        
        if (section) {
          const taskEl = document.createElement('div');
          taskEl.className = 'timeline-item user-task';
          taskEl.setAttribute('data-task-id', task.id);
          taskEl.innerHTML = \`
            <div class="task-time">\${task.time}</div>
            <div class="task-dot" style="background: #6CA6FF;"></div>
            <div class="task-content">
              <div class="timeline-item-icon" data-icon="\${task.icon || 'star'}"></div>
              <div class="task-info">
                <div class="task-title">\${task.title}</div>
                <div class="task-subtitle">\${task.category || ''}</div>
              </div>
            </div>
            <div class="task-actions">
              <button class="task-check" onclick="toggleUserTask('\${task.id}')">\${task.completed ? '✓' : ''}</button>
              <button class="task-delete" onclick="deleteUserTask('\${task.id}')" style="
                background: transparent;
                border: none;
                color: rgba(255,255,255,0.5);
                cursor: pointer;
                padding: 4px;
                font-size: 18px;
              ">×</button>
            </div>
          \`;
          
          // Insert in time order
          const items = section.querySelectorAll('.timeline-item');
          let inserted = false;
          for (let item of items) {
            const itemTime = item.querySelector('.task-time')?.textContent;
            if (itemTime && itemTime > task.time) {
              section.insertBefore(taskEl, item);
              inserted = true;
              break;
            }
          }
          if (!inserted) section.appendChild(taskEl);
        }
      });
      
      // Re-initialize icons
      if (typeof initializeSVGIcons === 'function') {
        setTimeout(() => initializeSVGIcons(), 100);
      }
    }
    
    function toggleUserTask(id) {
      let tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
      const task = tasks.find(t => t.id === id);
      if (task) {
        task.completed = !task.completed;
        localStorage.setItem('userTasks', JSON.stringify(tasks));
        location.reload();
      }
    }
    
    function deleteUserTask(id) {
      if (confirm('Task wirklich löschen?')) {
        let tasks = JSON.parse(localStorage.getItem('userTasks') || '[]');
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('userTasks', JSON.stringify(tasks));
        location.reload();
      }
    }`;
  
  if (!html.includes('displayUserTasks')) {
    html = html.replace('</script>', displayUserTasks + '\n</script>');
    fixes.push("✅ Task-Anzeige Funktionen hinzugefügt");
  }
  
  // 3. Call displayUserTasks on load
  console.log("3️⃣ Aktiviere Task-Anzeige beim Laden...");
  
  if (!html.includes('displayUserTasks()')) {
    html = html.replace(
      'document.addEventListener(\'DOMContentLoaded\', () => {',
      'document.addEventListener(\'DOMContentLoaded\', () => {\n      displayUserTasks();'
    );
    fixes.push("✅ Tasks werden beim Laden angezeigt");
  }
  
  // 4. Fix icon mapping
  console.log("4️⃣ Repariere Icon-Mapping...");
  
  // Make sure iconMapping exists and is complete
  if (!html.includes('const iconMapping = {')) {
    const iconMappingCode = `
    const iconMapping = {
      '🌅': 'alarm',
      '💧': 'water',
      '☕': 'coffee',
      '🏃': 'run',
      '💪': 'gym',
      '📚': 'book',
      '🧘': 'meditation',
      '🛏️': 'bed',
      '🚿': 'shower',
      '📱': 'phone',
      '💻': 'laptop',
      '✉️': 'email',
      '🧠': 'brain',
      '❤️': 'heart',
      '⭐': 'star',
      '🏠': 'home',
      '🎯': 'target',
      '📊': 'chart',
      '📅': 'calendar',
      '🔍': 'search',
      '💤': 'sleep',
      '🚶': 'run',
      '✍️': 'code',
      '🍎': 'food',
      '🤝': 'meeting'
    };`;
    
    html = html.replace('<script>', '<script>\n' + iconMappingCode);
    fixes.push("✅ Icon-Mapping hinzugefügt");
  }
  
  // 5. Fix navigation functions
  console.log("5️⃣ Repariere Navigation...");
  
  if (!html.includes('function changeMonth(')) {
    const navFunctions = `
    function changeMonth(direction) {
      selectedDate.setMonth(selectedDate.getMonth() + direction);
      updateCalendarDisplay();
      generateDateSelector();
      checkTodayButtonVisibility();
      displayUserTasks();
    }
    
    function changeYear(direction) {
      selectedDate.setFullYear(selectedDate.getFullYear() + direction);
      updateCalendarDisplay();
      generateDateSelector();
      checkTodayButtonVisibility();
      displayUserTasks();
    }
    
    function goToToday() {
      selectedDate = new Date();
      updateCalendarDisplay();
      generateDateSelector();
      checkTodayButtonVisibility();
      displayUserTasks();
    }`;
    
    html = html.replace('</script>', navFunctions + '\n</script>');
    fixes.push("✅ Navigationsfunktionen repariert");
  }
  
  // 6. Make sure getSVGIcon works
  console.log("6️⃣ Stelle sicher dass Icons funktionieren...");
  
  const getSVGIconFix = `
    function getSVGIcon(name) {
      // Map emoji to icon name if needed
      const mapped = iconMapping[name] || name;
      return svgIcons[mapped] || svgIcons.star || '<svg viewBox="0 0 24 24"></svg>';
    }`;
  
  if (html.includes('function getSVGIcon')) {
    html = html.replace(/function getSVGIcon\([^)]*\)\s*\{[^}]*\}/, getSVGIconFix);
    fixes.push("✅ Icon-Funktion repariert");
  }
  
  // Save repaired version
  await fs.writeFile(OUTPUT, html, "utf8");
  
  console.log("\n✨ Reparaturen angewendet:");
  fixes.forEach(fix => console.log(`  ${fix}`));
  
  console.log("\n🎉 Funktionen repariert, Original-Design beibehalten!");
  console.log("💡 Lade die Seite neu mit Cmd+Shift+R");
}

repairFunctionsOnly().catch(console.error);