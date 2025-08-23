#!/usr/bin/env node

import fs from "node:fs/promises";

const INDEX = "index.html";

async function addMissingFeatures() {
  console.log("🚀 Adding missing features...\n");
  
  let html = await fs.readFile(INDEX, "utf8");
  
  // Backup
  const backup = INDEX.replace(/\.html$/, `.features-backup-${Date.now()}.html`);
  await fs.writeFile(backup, html, "utf8");
  
  const features = [];
  
  // 1. Add delete task functionality
  if (!html.includes('function deleteTask')) {
    const deleteTaskFunction = `
    function deleteTask(taskId) {
      if (!confirm('Aufgabe wirklich löschen?')) return;
      
      let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      tasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      location.reload();
    }`;
    
    html = html.replace('</script>', deleteTaskFunction + '\n</script>');
    features.push("✅ Delete task function added");
  }
  
  // 2. Add task completion functionality
  if (!html.includes('function toggleTaskComplete')) {
    const toggleCompleteFunction = `
    function toggleTaskComplete(taskId) {
      let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        // Update UI
        const element = document.querySelector(\`[data-task-id="\${taskId}"]\`);
        if (element) {
          element.classList.toggle('completed');
          updateProgress();
        }
      }
    }`;
    
    html = html.replace('</script>', toggleCompleteFunction + '\n</script>');
    features.push("✅ Task completion toggle added");
  }
  
  // 3. Add progress calculation
  if (!html.includes('function updateProgress')) {
    const progressFunction = `
    function updateProgress() {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const today = new Date();
      const dateStr = \`\${today.getFullYear()}-\${String(today.getMonth() + 1).padStart(2, '0')}-\${String(today.getDate()).padStart(2, '0')}\`;
      
      const todayTasks = tasks.filter(t => t.date === dateStr);
      const completed = todayTasks.filter(t => t.completed).length;
      const total = todayTasks.length;
      
      // Update all progress displays
      document.querySelectorAll('.progress-text').forEach(el => {
        el.textContent = total > 0 ? \`\${completed}/\${total}\` : '0/0';
      });
      
      document.querySelectorAll('.progress-percentage').forEach(el => {
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        el.textContent = \`\${percentage}%\`;
      });
      
      // Update progress rings
      document.querySelectorAll('.progress-ring').forEach(ring => {
        const circle = ring.querySelector('circle:last-child');
        if (circle) {
          const radius = circle.r.baseVal.value;
          const circumference = radius * 2 * Math.PI;
          const offset = total > 0 ? circumference - (completed / total) * circumference : circumference;
          circle.style.strokeDashoffset = offset;
        }
      });
    }`;
    
    html = html.replace('</script>', progressFunction + '\n</script>');
    features.push("✅ Progress tracking added");
  }
  
  // 4. Add habits tracking
  if (!html.includes('function trackHabitStreak')) {
    const habitFunction = `
    function trackHabitStreak(habitId) {
      let habits = JSON.parse(localStorage.getItem('habits') || '{}');
      const today = new Date().toISOString().split('T')[0];
      
      if (!habits[habitId]) {
        habits[habitId] = {
          streak: 0,
          lastDate: null,
          dates: []
        };
      }
      
      const habit = habits[habitId];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (!habit.dates.includes(today)) {
        habit.dates.push(today);
        
        if (habit.lastDate === yesterdayStr) {
          habit.streak++;
        } else {
          habit.streak = 1;
        }
        
        habit.lastDate = today;
        localStorage.setItem('habits', JSON.stringify(habits));
      }
      
      return habit.streak;
    }`;
    
    html = html.replace('</script>', habitFunction + '\n</script>');
    features.push("✅ Habit streak tracking added");
  }
  
  // 5. Fix the add button to actually work
  if (!html.includes('function toggleAddMenu')) {
    const addMenuFunction = `
    function toggleAddMenu() {
      const overlay = document.getElementById('addMenuOverlay');
      const menu = document.getElementById('addMenu');
      const button = document.getElementById('addButtonInner');
      
      if (overlay && menu) {
        const isActive = overlay.classList.contains('active');
        
        if (isActive) {
          closeAddMenu();
        } else {
          overlay.classList.add('active');
          menu.classList.add('active');
          if (button) button.classList.add('active');
        }
      }
    }
    
    function closeAddMenu() {
      const overlay = document.getElementById('addMenuOverlay');
      const menu = document.getElementById('addMenu');
      const button = document.getElementById('addButtonInner');
      
      if (overlay) overlay.classList.remove('active');
      if (menu) menu.classList.remove('active');
      if (button) button.classList.remove('active');
    }`;
    
    html = html.replace('</script>', addMenuFunction + '\n</script>');
    features.push("✅ Add menu functions fixed");
  }
  
  // 6. Update loadUserTasks to include delete buttons
  const oldAddTasksToSection = /function addTasksToSection\([^)]*\)\s*\{[\s\S]*?\n\s{4}\}/;
  const newAddTasksToSection = `function addTasksToSection(sectionName, tasks) {
      const sectionMap = {
        'morning': document.querySelector('.timeline-section:nth-child(1) .timeline-items'),
        'afternoon': document.querySelector('.timeline-section:nth-child(2) .timeline-items'),
        'evening': document.querySelector('.timeline-section:nth-child(3) .timeline-items')
      };
      
      const section = sectionMap[sectionName];
      if (!section) return;
      
      tasks.sort((a, b) => a.time.localeCompare(b.time));
      
      tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'timeline-item' + (task.completed ? ' completed' : '');
        taskElement.setAttribute('data-task-id', task.id);
        taskElement.innerHTML = \`
          <div class="task-time">\${task.time}</div>
          <div class="task-dot" style="background: var(--cat-\${task.icon}, #6CA6FF);"></div>
          <div class="task-content" onclick="toggleTaskComplete('\${task.id}')">
            <div class="timeline-item-icon" data-icon="\${task.icon}"></div>
            <div class="task-info">
              <div class="task-title">\${task.title}</div>
              <div class="task-subtitle">\${task.category}</div>
            </div>
          </div>
          <div class="task-actions">
            <button class="task-check" onclick="toggleTaskComplete('\${task.id}')">
              \${task.completed ? '✓' : ''}
            </button>
            <button class="task-delete" onclick="deleteTask('\${task.id}')" style="
              background: rgba(255,67,54,0.1);
              border: none;
              color: #ff4336;
              padding: 4px 8px;
              border-radius: 4px;
              cursor: pointer;
              margin-left: 8px;
            ">×</button>
          </div>
        \`;
        
        // Insert in order
        const items = section.querySelectorAll('.timeline-item');
        let inserted = false;
        
        for (let item of items) {
          const itemTime = item.querySelector('.task-time')?.textContent;
          if (itemTime && itemTime > task.time) {
            section.insertBefore(taskElement, item);
            inserted = true;
            break;
          }
        }
        
        if (!inserted) {
          section.appendChild(taskElement);
        }
      });
      
      setTimeout(() => initializeSVGIcons(), 100);
    }`;
  
  if (html.match(oldAddTasksToSection)) {
    html = html.replace(oldAddTasksToSection, newAddTasksToSection);
    features.push("✅ Task display enhanced with actions");
  }
  
  // 7. Call updateProgress on load
  if (!html.includes('updateProgress();')) {
    html = html.replace('loadUserTasks();', 'loadUserTasks();\n      updateProgress();');
    features.push("✅ Progress updates on load");
  }
  
  // Save
  await fs.writeFile(INDEX, html, "utf8");
  
  console.log("✨ Features added:");
  features.forEach(f => console.log(`  ${f}`));
  
  console.log("\n🎉 Missing features have been added!");
  console.log("💡 Reload the page to see the new functionality");
}

addMissingFeatures().catch(console.error);