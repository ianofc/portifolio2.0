  const themeToggleBtn = document.getElementById('theme-toggle');
   const themeIcon = document.getElementById('theme-icon');
   const htmlEl = document.documentElement;

   function initTheme() {
     if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
       htmlEl.classList.add('dark');
       themeIcon.classList.remove('fa-sun');
       themeIcon.classList.add('fa-moon');
     } else {
       htmlEl.classList.remove('dark');
       themeIcon.classList.remove('fa-moon');
       themeIcon.classList.add('fa-sun');
     }
   }

   themeToggleBtn.addEventListener('click', () => {
     if (htmlEl.classList.contains('dark')) {
       htmlEl.classList.remove('dark');
       localStorage.theme = 'light';
       themeIcon.classList.remove('fa-moon');
       themeIcon.classList.add('fa-sun');
     } else {
       htmlEl.classList.add('dark');
       localStorage.theme = 'dark';
       themeIcon.classList.remove('fa-sun');
       themeIcon.classList.add('fa-moon');
     }
   });

   initTheme();

   // Mobile menu slide-in from right
   const menuToggleBtn = document.getElementById('menu-toggle');
   const mobileMenu = document.getElementById('mobile-menu');
   const closeMenuBtn = mobileMenu.querySelector('.close-menu');

   function openMobileMenu() {
     mobileMenu.style.right = "0";
     mobileMenu.style.left = "auto";
     mobileMenu.classList.add('open');
     mobileMenu.classList.remove('translate-x-full');
     setTimeout(() => mobileMenu.focus(), 100);
   }
   function closeMobileMenu() {
     mobileMenu.classList.remove('open');
     mobileMenu.classList.add('translate-x-full');
     setTimeout(() => {
       mobileMenu.style.right = "";
       mobileMenu.style.left = "";
     }, 300);
     menuToggleBtn.focus();
   }

   menuToggleBtn.addEventListener('click', openMobileMenu);
   closeMenuBtn.addEventListener('click', closeMobileMenu);

   document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
       closeMobileMenu();
     }
   });
   mobileMenu.addEventListener('click', (e) => {
     if (e.target === mobileMenu) {
       closeMobileMenu();
     }
   });

   document.querySelectorAll('#mobile-menu-nav a').forEach(link => {
     link.addEventListener('click', closeMobileMenu);
   });

   let currentProjectIndex = 0;
   let projects = [];
   let projectFilter = "all";

   async function fetchGitHubProjects() {
     try {
       const response = await fetch('https://api.github.com/users/ianofc/repos');
       if (!response.ok) throw new Error('Network response was not ok');
       projects = await response.json();
       if (projects.length === 0) return;
       filterProjects();
     } catch (error) {
       console.error('Failed to fetch projects:', error);
     }
   }

   function filterProjects() {
     let filtered = projects;
     if (projectFilter !== "all") {
       filtered = projects.filter(p => {
         const lang = (p.language || '').toLowerCase();
         const topics = (p.topics?.join(" ") || '').toLowerCase();
         const desc = (p.description || '').toLowerCase();
         const name = (p.name || '').toLowerCase();
         // Filtros
         if (projectFilter === "web") return /html|css|javascript|react|typescript|next|vue|svelte/.test(lang) || /web|frontend|site/.test(topics + desc);
         if (projectFilter === "api") return /api/.test(name) || /api|rest|graphql/.test(topics + desc);
         if (projectFilter === "cli") return /cli|terminal|console/.test(topics + desc + name);
         if (projectFilter === "cloud") return /cloud|aws|azure|gcp|google cloud|lambda|serverless/.test(topics + desc);
         if (projectFilter === "ia") return /ai|ia|machine|ml|deep|inteligência|artificial|learning/.test(topics + desc);
         if (projectFilter === "python") return lang === "python" || /python/.test(topics + desc);
         if (projectFilter === "java") return lang === "java" || /java/.test(topics + desc);
         if (projectFilter === "bd") return /sql|postgres|mysql|sqlite|database|banco de dados/.test(lang) || /sql|postgres|mysql|sqlite|database|banco de dados/.test(topics + desc);
         return false;
       });
     }
     if (filtered.length > 0) {
       currentProjectIndex = 0;
       displayProjectFiltered(filtered, 0);
       createIndicatorsFiltered(filtered);
     } else {
       // Se nenhum projeto, limpa a área
       document.getElementById('main-image').src = '';
       document.getElementById('project-title').innerText = 'Nenhum projeto encontrado';
       document.getElementById('project-description').innerText = '';
       document.getElementById('project-tools').innerHTML = '';
       document.getElementById('carousel-indicators').innerHTML = '';
       for (let i = 1; i <= 4; i++) {
         document.getElementById(`thumbnail-${i}`).src = '';
         document.getElementById(`thumbnail-${i}`).alt = '';
       }
     }
   }

   function displayProjectFiltered(filtered, index) {
     const project = filtered[index];
     if (!project) return;
     const repoName = project.name.toLowerCase();
     document.getElementById('main-image').src = `https://github.com/ianofc/${repoName}/raw/master/assets/images/tema.png`;
     document.getElementById('main-image').alt = `Main screenshot of the project named ${project.name}`;
     document.getElementById('project-title').innerText = project.name;
     document.getElementById('project-description').innerText = project.description || 'No description available.';
     for (let i = 1; i <= 4; i++) {
       const thumb = document.getElementById(`thumbnail-${i}`);
       thumb.src = `https://github.com/ianofc/${repoName}/raw/master/assets/images/img${i}.png`;
       thumb.alt = `Thumbnail ${i} screenshot of the project named ${project.name}`;
     }
     const toolsContainer = document.getElementById('project-tools');
     toolsContainer.innerHTML = '';
     if (project.language) {
       const toolIcon = document.createElement('i');
       const lang = project.language.toLowerCase();
       let iconClass = 'fas fa-code';
       if (lang === 'javascript') iconClass = 'fab fa-js';
       else if (lang === 'python') iconClass = 'fab fa-python';
       else if (lang === 'java') iconClass = 'fab fa-java';
       else if (lang === 'html') iconClass = 'fab fa-html5';
       else if (lang === 'css') iconClass = 'fab fa-css3-alt';
       else if (lang === 'php') iconClass = 'fab fa-php';
       else if (lang === 'ruby') iconClass = 'fas fa-gem';
       toolIcon.className = `${iconClass} text-xl text-white`;
       toolIcon.setAttribute('title', project.language);
       toolsContainer.appendChild(toolIcon);
     }
     updateIndicatorsFiltered(filtered, index);
     window.filteredProjects = filtered;
     window.filteredIndex = index;
   }

   function createIndicatorsFiltered(filtered) {
     const indicatorsContainer = document.getElementById('carousel-indicators');
     indicatorsContainer.innerHTML = '';
     filtered.forEach((_, index) => {
       const indicator = document.createElement('button');
       indicator.className = 'w-3 h-3 bg-gray-500 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500';
       indicator.dataset.index = index;
       indicator.setAttribute('aria-label', `Select project ${index + 1}`);
       indicator.setAttribute('role', 'tab');
       indicator.addEventListener('click', () => {
         displayProjectFiltered(filtered, index);
       });
       indicatorsContainer.appendChild(indicator);
     });
   }

   function updateIndicatorsFiltered(filtered, index) {
     const indicators = document.querySelectorAll('#carousel-indicators button');
     indicators.forEach((indicator, i) => {
       if (i === index) {
         indicator.className = 'w-3 h-3 bg-white rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500';
         indicator.setAttribute('aria-selected', 'true');
         indicator.tabIndex = 0;
       } else {
         indicator.className = 'w-3 h-3 bg-gray-500 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500';
         indicator.setAttribute('aria-selected', 'false');
         indicator.tabIndex = -1;
       }
     });
   }

   document.getElementById('prev-btn').addEventListener('click', () => {
     const filtered = window.filteredProjects || projects;
     if (!filtered.length) return;
     window.filteredIndex = (window.filteredIndex - 1 + filtered.length) % filtered.length;
     displayProjectFiltered(filtered, window.filteredIndex);
   });

   document.getElementById('next-btn').addEventListener('click', () => {
     const filtered = window.filteredProjects || projects;
     if (!filtered.length) return;
     window.filteredIndex = (window.filteredIndex + 1) % filtered.length;
     displayProjectFiltered(filtered, window.filteredIndex);
   });

   // Filtros de projetos - agora funcionam para todos os botões
   const projectFilters = document.querySelectorAll('#project-filters button');
   projectFilters.forEach(btn => {
     btn.addEventListener('click', () => {
       projectFilter = btn.dataset.filter;
       projectFilters.forEach(b => b.classList.remove('bg-sky-400', 'text-white'));
       btn.classList.add('bg-sky-400', 'text-white');
       filterProjects();
     });
   });

   function openModal(src) {
     const modal = document.getElementById("myModal");
     const img = document.getElementById("img01");
     img.src = src;
     modal.style.display = "flex";
     modal.setAttribute('aria-hidden', 'false');
     modal.focus();
   }

   function closeModal() {
     const modal = document.getElementById("myModal");
     modal.style.display = "none";
     modal.setAttribute('aria-hidden', 'true');
   }

   // Skills modal open/close
   function showSkillsModal() {
     const modal = document.getElementById('skillsModal');
     modal.classList.add('visible');
     modal.setAttribute('aria-hidden', 'false');
     modal.focus();
   }
   function closeSkillsModal() {
     const modal = document.getElementById('skillsModal');
     modal.classList.remove('visible');
     modal.setAttribute('aria-hidden', 'true');
   }

   // Memory Game Logic
   const skills = [
     { name: 'Python', img: 'https://placehold.co/80x80/png?text=Python+Logo', alt: 'Python logo, blue snake icon on white background' },
     { name: 'Java', img: 'https://placehold.co/80x80/png?text=Java+Logo', alt: 'Java logo, red coffee cup icon on white background' },
     { name: 'SQL', img: 'https://placehold.co/80x80/png?text=SQL+Logo', alt: 'SQL database icon, stacked cylinders in blue on white background' },
     { name: 'PostgreSQL', img: 'https://placehold.co/80x80/png?text=PostgreSQL+Logo', alt: 'PostgreSQL elephant logo in blue on white background' },
     { name: 'AWS', img: 'https://placehold.co/80x80/png?text=AWS+Logo', alt: 'AWS cloud logo orange and black on white background' },
     { name: 'Docker', img: 'https://placehold.co/80x80/png?text=Docker+Logo', alt: 'Docker whale logo in blue on white background' },
     { name: 'Git', img: 'https://placehold.co/80x80/png?text=Git+Logo', alt: 'Git logo orange diamond shape on white background' },
     { name: 'GitHub', img: 'https://placehold.co/80x80/png?text=GitHub+Logo', alt: 'GitHub logo black cat silhouette on white background' },
     { name: 'JavaScript', img: 'https://placehold.co/80x80/png?text=JavaScript+Logo', alt: 'JavaScript logo yellow square with black JS letters' },
     { name: 'Node.js', img: 'https://placehold.co/80x80/png?text=Node.js+Logo', alt: 'Node.js hexagon logo green on white background' },
     { name: 'React', img: 'https://placehold.co/80x80/png?text=React+Logo', alt: 'React atom logo blue on white background' },
     { name: 'Go', img: 'https://placehold.co/80x80/png?text=Go+Logo', alt: 'Go gopher logo blue on white background' }
   ];

   let gameStarted = false;
   let gamePaused = false;
   let flippedCards = [];
   let matchedPairs = 0;
   let timerInterval = null;
   let secondsElapsed = 0;
   let playerName = '';
   let ranking = [];

   const gameBoard = document.getElementById('gameBoard');
   const startButton = document.getElementById('startButton');
   const pauseButton = document.getElementById('pauseButton');
   const resetButton = document.getElementById('resetButton');
   const timerDisplay = document.getElementById('timer');
   const playerNameInput = document.getElementById('playerName');
   const rankingList = document.getElementById('ranking');

   function shuffleArray(array) {
     for (let i = array.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [array[i], array[j]] = [array[j], array[i]];
     }
     return array;
   }

   function createGameBoard() {
     gameBoard.innerHTML = '';
     const cardsArray = [...skills, ...skills];
     shuffleArray(cardsArray);
     cardsArray.forEach((skill, index) => {
       const card = document.createElement('div');
       card.className = 'card';
       card.setAttribute('role', 'button');
       card.setAttribute('tabindex', '0');
       card.setAttribute('aria-label', 'Memory card');
       card.dataset.skill = skill.name;
       card.dataset.index = index;

       const cardInner = document.createElement('div');
       cardInner.className = 'card-inner';

       const cardFront = document.createElement('div');
       cardFront.className = 'card-front';
       const frontImg = document.createElement('img');
       frontImg.src = 'https://placehold.co/80x80/png?text=?';
       frontImg.alt = 'Card back with question mark';
       cardFront.appendChild(frontImg);

       const cardBack = document.createElement('div');
       cardBack.className = 'card-back';
       const backImg = document.createElement('img');
       backImg.src = skill.img;
       backImg.alt = skill.alt;
       cardBack.appendChild(backImg);

       cardInner.appendChild(cardFront);
       cardInner.appendChild(cardBack);
       card.appendChild(cardInner);

       card.addEventListener('click', () => {
         if (!gameStarted || gamePaused) return;
         if (flippedCards.length === 2 || card.classList.contains('flipped')) return;
         flipCard(card);
       });
       card.addEventListener('keydown', (e) => {
         if (e.key === 'Enter' || e.key === ' ') {
           e.preventDefault();
           card.click();
         }
       });

       gameBoard.appendChild(card);
     });
   }

   function flipCard(card) {
     card.classList.add('flipped');
     flippedCards.push(card);
     if (flippedCards.length === 2) {
       checkForMatch();
     }
   }

   function checkForMatch() {
     const [card1, card2] = flippedCards;
     if (card1.dataset.skill === card2.dataset.skill) {
       matchedPairs++;
       flippedCards = [];
       if (matchedPairs === skills.length) {
         endGame();
       }
     } else {
       gamePaused = true;
       setTimeout(() => {
         card1.classList.remove('flipped');
         card2.classList.remove('flipped');
         flippedCards = [];
         gamePaused = false;
       }, 1000);
     }
   }

   function startTimer() {
     timerInterval = setInterval(() => {
       secondsElapsed++;
       updateTimerDisplay();
     }, 1000);
   }

   function stopTimer() {
     clearInterval(timerInterval);
     timerInterval = null;
   }

   function updateTimerDisplay() {
     const minutes = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
     const seconds = (secondsElapsed % 60).toString().padStart(2, '0');
     timerDisplay.textContent = `${minutes}:${seconds}`;
   }

   function startGame() {
     if (!playerNameInput.value.trim()) {
       alert('Por favor, digite seu nome para iniciar o jogo.');
       playerNameInput.focus();
       return;
     }
     playerName = playerNameInput.value.trim();
     gameStarted = true;
     gamePaused = false;
     flippedCards = [];
     matchedPairs = 0;
     createGameBoard();
     startTimer();
     startButton.disabled = true;
     pauseButton.disabled = false;
     resetButton.disabled = false;
     playerNameInput.disabled = true;
   }

   function pauseGame() {
     if (!gameStarted) return;
     if (gamePaused) {
       gamePaused = false;
       startTimer();
       pauseButton.textContent = 'PAUSAR';
     } else {
       gamePaused = true;
       stopTimer();
       pauseButton.textContent = 'CONTINUAR';
     }
   }

   function resetGame() {
     stopTimer();
     gameStarted = false;
     gamePaused = false;
     flippedCards = [];
     matchedPairs = 0;
     secondsElapsed = 0;
     updateTimerDisplay();
     gameBoard.innerHTML = '';
     startButton.disabled = false;
     pauseButton.disabled = true;
     resetButton.disabled = true;
     pauseButton.textContent = 'PAUSAR';
     playerNameInput.disabled = false;
     playerNameInput.value = '';
   }

   function endGame() {
     stopTimer();
     alert(`Parabéns, ${playerName}! Você completou o jogo em ${timerDisplay.textContent}.`);
     ranking.push({ name: playerName, time: secondsElapsed });
     ranking.sort((a, b) => a.time - b.time);
     updateRanking();
     showSkillsModal();
     unlockAchievement('memory');
     resetGame();
   }

   function updateRanking() {
     rankingList.innerHTML = '';
     ranking.slice(0, 10).forEach((entry, index) => {
       const li = document.createElement('li');
       const minutes = Math.floor(entry.time / 60).toString().padStart(2, '0');
       const seconds = (entry.time % 60).toString().padStart(2, '0');
       li.textContent = `${index + 1}. ${entry.name} - ${minutes}:${seconds}`;
       rankingList.appendChild(li);
     });
   }

   startButton.addEventListener('click', startGame);
   pauseButton.addEventListener('click', pauseGame);
   resetButton.addEventListener('click', resetGame);

   window.onload = () => {
     fetchGitHubProjects();
   };

   (function() {
     const header = document.getElementById('main-header');
     const originalClasses = "flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full relative z-30 transition-all duration-300 bg-transparent";
     const floatingClasses = "flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full fixed top-0 left-1/2 -translate-x-1/2 z-40 bg-transparent transition-all duration-300";
     function updateHeader() {
       if (window.scrollY > 20) {
         header.className = floatingClasses;
         header.style.left = "50%";
         header.style.transform = "translateX(-50%)";
         header.style.right = "";
         header.style.margin = "";
         header.style.maxWidth = "";
       } else {
         header.className = originalClasses;
         header.style.left = "";
         header.style.transform = "";
         header.style.right = "";
         header.style.margin = "";
         header.style.maxWidth = "";
       }
     }
     window.addEventListener('scroll', updateHeader);
     updateHeader();
   })();

   // Toggle flags sidebar
   const showFlagsBtn = document.getElementById('show-flags-btn');
   const flagsList = document.getElementById('flags-list');
   let flagsVisible = false;
   showFlagsBtn.addEventListener('click', () => {
     flagsVisible = !flagsVisible;
     flagsList.style.display = flagsVisible ? 'flex' : 'none';
   });
   // Fecha as bandeiras ao clicar fora do sidebar
   document.addEventListener('click', (e) => {
     if (!showFlagsBtn.contains(e.target) && !flagsList.contains(e.target)) {
       flagsList.style.display = 'none';
       flagsVisible = false;
     }
   });

   // Miniaturas dos projetos do GitHub em Destaques
   async function loadGithubHighlights() {
     try {
       const response = await fetch('https://api.github.com/users/ianofc/repos?per_page=6&sort=updated');
       if (!response.ok) return;
       const repos = await response.json();
       const highlights = document.getElementById('github-highlights');
       if (!highlights) return;
       highlights.innerHTML = '';
       repos.slice(0, 6).forEach(repo => {
         const repoName = repo.name;
         const thumbUrl = `https://github.com/ianofc/${repoName}/raw/master/assets/images/tema.png`;
         const repoDiv = document.createElement('div');
         repoDiv.className = 'flex-shrink-0 flex flex-col items-center cursor-pointer';
         const img = document.createElement('img');
         img.src = thumbUrl;
         img.alt = `Miniatura do projeto ${repoName}`;
         img.className = 'rounded-full w-18 h-18 border-2 border-sky-400 object-cover bg-white';
         img.width = 72;
         img.height = 72;
         img.onerror = function() {
           this.src = 'https://placehold.co/72x72?text=Repo';
         };
         const span = document.createElement('span');
         span.className = 'text-xs mt-1 max-w-[72px] truncate text-center text-sky-400 font-bold';
         span.textContent = repoName;
         repoDiv.appendChild(img);
         repoDiv.appendChild(span);
         highlights.appendChild(repoDiv);
       });
     } catch {}
   }
   window.addEventListener('DOMContentLoaded', loadGithubHighlights);

   // Acessibilidade
   const accBtn = document.getElementById('accessibility-btn');
   const accMenu = document.getElementById('accessibility-menu');
   let accMenuVisible = false;
   accBtn.addEventListener('click', (e) => {
     e.stopPropagation();
     accMenuVisible = !accMenuVisible;
     accMenu.style.display = accMenuVisible ? 'block' : 'none';
   });
   document.addEventListener('click', (e) => {
     if (!accBtn.contains(e.target) && !accMenu.contains(e.target)) {
       accMenu.style.display = 'none';
       accMenuVisible = false;
     }
   });

   // ====== Atalhos de teclado: botão e menu ======
   const shortcutsBtn = document.getElementById('shortcuts-btn');
   const shortcutsMenu = document.getElementById('shortcuts-menu');
   let shortcutsMenuVisible = false;
   shortcutsBtn.addEventListener('click', (e) => {
     e.stopPropagation();
     shortcutsMenuVisible = !shortcutsMenuVisible;
     shortcutsMenu.style.display = shortcutsMenuVisible ? 'block' : 'none';
   });
   document.addEventListener('click', (e) => {
     if (!shortcutsBtn.contains(e.target) && !shortcutsMenu.contains(e.target)) {
       shortcutsMenu.style.display = 'none';
       shortcutsMenuVisible = false;
     }
   });

   // ====== Suporte aos atalhos de navegação ======
   const sectionShortcuts = {
     1: 'home',
     2: 'about-details',
     3: 'projects',
     4: 'skills',
     5: 'feedbackSection',
     6: 'fale-comigo',
     7: 'services',
     8: 'hire-me',
   };
   document.addEventListener('keydown', function(e) {
     if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
       const key = Number(e.key);
       if (sectionShortcuts[key]) {
         const section = document.getElementById(sectionShortcuts[key]);
         if (section) {
           section.scrollIntoView({behavior: 'smooth', block: 'start'});
           e.preventDefault();
         }
       }
     }
   });

   // ====== Rolagem suave para links de navegação ======
   document.querySelectorAll('a[href^="#"]').forEach(link => {
     link.addEventListener('click', function(e) {
       const targetId = this.getAttribute('href').slice(1);
       const target = document.getElementById(targetId);
       if (target) {
         e.preventDefault();
         target.scrollIntoView({ behavior: 'smooth', block: 'start' });
       }
     });
   });

   // Paleta de cores personalizada com menu suspenso de pincel
   const paletteDropdown = document.getElementById('palette-dropdown');
   const paletteTrigger = document.getElementById('palette-trigger');
   const paletteMenu = document.getElementById('palette-menu');
   const paletteBtns = paletteMenu.querySelectorAll('.palette-btn');
   let paletteMenuOpen = false;
   function setPalette(palette) {
     document.body.classList.remove('palette-default', 'palette-green', 'palette-purple', 'palette-orange');
     document.body.classList.add('palette-' + palette);
     localStorage.setItem('palette', palette);
     paletteBtns.forEach(btn => {
       btn.classList.toggle('selected', btn.dataset.palette === palette);
     });
   }
   function initPalette() {
     let palette = localStorage.getItem('palette') || 'default';
     setPalette(palette);
   }
   paletteBtns.forEach(btn => {
     btn.addEventListener('click', (e) => {
       setPalette(btn.dataset.palette);
       closePaletteMenu();
     });
   });

   function openPaletteMenu() {
     paletteDropdown.classList.add('open');
     paletteMenuOpen = true;
     paletteMenu.focus();
   }
   function closePaletteMenu() {
     paletteDropdown.classList.remove('open');
     paletteMenuOpen = false;
   }
   paletteTrigger.addEventListener('click', (e) => {
     e.stopPropagation();
     paletteMenuOpen ? closePaletteMenu() : openPaletteMenu();
   });
   // Fecha ao clicar fora
   document.addEventListener('click', (e) => {
     if (paletteMenuOpen && !paletteDropdown.contains(e.target)) {
       closePaletteMenu();
     }
   });
   // Fecha com ESC
   document.addEventListener('keydown', (e) => {
     if (paletteMenuOpen && e.key === 'Escape') {
       closePaletteMenu();
       paletteTrigger.focus();
     }
   });

   initPalette();

   // Feedback interativo
   const feedbackForm = document.getElementById('feedbackForm');
   const feedbackList = document.getElementById('feedbackList');
   const emojiPicker = document.getElementById('emojiPicker');
   let selectedEmoji = '';
   // Emoji picker seleção visual
   emojiPicker.querySelectorAll('.emoji-btn').forEach(btn => {
     btn.addEventListener('click', () => {
       emojiPicker.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
       btn.classList.add('selected');
       selectedEmoji = btn.dataset.emoji;
     });
   });

   // Renderiza estrelas de avaliação
   function renderStars(rating) {
     let html = '<span class="feedback-stars">';
     for (let i = 1; i <= 5; i++) {
       html += `<span style="color:${i <= rating ? '#f59e42' : '#bbb'}">&#9733;</span>`;
     }
     html += '</span>';
     return html;
   }

   // Adiciona feedback na lista (no topo)
   function addFeedback({name, comment, rating, emoji}) {
     const div = document.createElement('div');
     div.className = 'bg-gray-900 rounded-xl p-6 shadow-lg';
     div.innerHTML = `
      <div class="flex items-center gap-4 mb-2">
        <div class="w-12 h-12 rounded-full bg-sky-400 flex items-center justify-center text-white font-bold text-xl uppercase">${name[0] || '?'}</div>
        <div>
          <p class="text-sky-400 font-bold">${name}</p>
          ${rating ? renderStars(rating) : ''}
          ${emoji ? `<span class="feedback-emoji">${emoji}</span>` : ''}
        </div>
      </div>
      <p class="text-white font-semibold">${comment}</p>
     `;
     feedbackList.prepend(div);
   }

   feedbackForm.addEventListener('submit', function(e) {
     e.preventDefault();
     const name = feedbackForm.feedbackName.value.trim() || 'Anônimo';
     const comment = feedbackForm.feedbackComment.value.trim();
     const rating = Number(feedbackForm.rating.value) || 0;
     const emoji = selectedEmoji;
     if (!comment) return;
     addFeedback({name, comment, rating, emoji});
     feedbackForm.reset();
     selectedEmoji = '';
     emojiPicker.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
     unlockAchievement('feedback');
   });

   // ====== Conquistas (Gamificação) ======
   const achievementsData = [
     { id: 'visit', name: 'Primeiro Acesso', desc: 'Você visitou o portfólio!', icon: '🏆' },
     { id: 'memory', name: 'Memória Ninja', desc: 'Jogou o jogo da memória.', icon: '🧠' },
     { id: 'feedback', name: 'Colaborador', desc: 'Enviou um feedback.', icon: '💬' },
     { id: 'challenge', name: 'Desafiante', desc: 'Resolveu um desafio de programação.', icon: '💻' }
   ];
   let unlockedAchievements = JSON.parse(localStorage.getItem('achievements') || '[]');
   function unlockAchievement(id) {
     if (!unlockedAchievements.includes(id)) {
       unlockedAchievements.push(id);
       localStorage.setItem('achievements', JSON.stringify(unlockedAchievements));
       renderAchievements();
     }
   }
   function renderAchievements() {
     const list = document.getElementById('achievements-list');
     if (!list) return;
     list.innerHTML = '';
     achievementsData.forEach(a => {
       const unlocked = unlockedAchievements.includes(a.id);
       const div = document.createElement('div');
       div.className = `flex flex-col items-center justify-center rounded-xl p-4 w-40 h-36 ${unlocked ? 'bg-green-700' : 'bg-gray-700 opacity-50'} shadow`;
       div.innerHTML = `
         <span class="text-4xl mb-2">${a.icon}</span>
         <span class="font-bold text-white">${a.name}</span>
         <span class="text-xs text-gray-200 text-center mt-1">${a.desc}</span>
         ${unlocked ? '<span class="text-green-300 mt-1 font-bold">Desbloqueada!</span>' : '<span class="text-gray-400 mt-1">Bloqueada</span>'}
       `;
       list.appendChild(div);
     });
   }
   // Desbloqueia conquista de visita ao carregar a página
   unlockAchievement('visit');

   // ====== Desafios de Programação ======
   const challengeCode = document.getElementById('challenge-code');
   const runChallenge = document.getElementById('run-challenge');
   const challengeResult = document.getElementById('challenge-result');
   if (runChallenge) {
     runChallenge.addEventListener('click', () => {
       challengeResult.textContent = '';
       let userCode = challengeCode.value;
       // Validação básica: precisa conter function soma(a, b)
       if (!/function\s+soma\s*\(\s*a\s*,\s*b\s*\)/.test(userCode)) {
         challengeResult.textContent = 'Sua função deve se chamar soma(a, b)';
         challengeResult.className = 'text-red-400 font-bold mt-2';
         return;
       }
       try {
         // eslint-disable-next-line no-new-func
         const fn = new Function(userCode + '; return soma(2, 3);');
         const result = fn();
         if (result === 5) {
           challengeResult.textContent = '✅ Correto! soma(2, 3) = 5';
           challengeResult.className = 'text-green-400 font-bold mt-2';
           unlockAchievement('challenge');
         } else {
           challengeResult.textContent = `❌ Resultado incorreto. soma(2, 3) = ${result}`;
           challengeResult.className = 'text-yellow-400 font-bold mt-2';
         }
       } catch (err) {
         challengeResult.textContent = 'Erro ao executar seu código: ' + err.message;
         challengeResult.className = 'text-red-400 font-bold mt-2';
       }
     });
   }

   // Renderiza conquistas ao carregar
   renderAchievements();

   // Animação de entrada para seções ao rolar
   function revealSectionsOnScroll() {
     const sections = document.querySelectorAll('main section');
     const trigger = window.innerHeight * 0.92;
     sections.forEach(sec => {
       const rect = sec.getBoundingClientRect();
       if (rect.top < trigger) {
         sec.classList.add('visible');
       }
     });
   }
   window.addEventListener('scroll', revealSectionsOnScroll);
   window.addEventListener('DOMContentLoaded', revealSectionsOnScroll);

   // Easter Egg: Configurações
   const settingsEggBtn = document.getElementById('settings-egg-btn');
   const settingsEggIcon = document.getElementById('settings-egg-icon');
   const eggModal = document.getElementById('easterEggModal');
   let partyTimeout = null;

   function openEasterEggModal() {
     document.body.classList.add('party-mode');
     eggModal.classList.add('visible');
     eggModal.setAttribute('aria-hidden', 'false');
     eggModal.focus();
     // Remove party-mode após 30s se não fechar antes
     partyTimeout = setTimeout(() => {
       closeEasterEggModal();
     }, 30000);
   }
   function closeEasterEggModal() {
     document.body.classList.remove('party-mode');
     eggModal.classList.remove('visible');
     eggModal.setAttribute('aria-hidden', 'true');
     if (partyTimeout) clearTimeout(partyTimeout);
     partyTimeout = null;
     settingsEggBtn.focus();
   }
   settingsEggBtn.addEventListener('click', () => {
     // animação de giro
     settingsEggIcon.classList.add('spin');
     setTimeout(() => {
       settingsEggIcon.classList.remove('spin');
       openEasterEggModal();
     }, 900);
   });
   // Fecha modal com ESC
   document.addEventListener('keydown', (e) => {
     if (eggModal.classList.contains('visible') && e.key === 'Escape') {
       closeEasterEggModal();
     }
   });
   // Fecha ao clicar fora do modal
   eggModal.addEventListener('click', (e) => {
     if (e.target === eggModal) closeEasterEggModal();
   });

   // Efeito Download CV (frontend)
   document.addEventListener('DOMContentLoaded', function () {
     const downloadBtn = document.getElementById('downloadCVBtnFront');
     if (downloadBtn) {
       downloadBtn.addEventListener('click', function (e) {
         e.preventDefault();
         const progressSpan = document.getElementById('downloadProgressFront');
         let progress = 0;
         const originalHref = downloadBtn.getAttribute('href');
         downloadBtn.setAttribute('disabled', 'disabled');
         downloadBtn.style.pointerEvents = 'none';
         downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i><span id="downloadProgressFront">0%</span>';
         const interval = setInterval(() => {
           if (progress >= 100) {
             clearInterval(interval);
             downloadBtn.innerHTML = '<i class="fas fa-download mr-2"></i><span id="downloadProgressFront">Baixar CV</span>';
             downloadBtn.removeAttribute('disabled');
             downloadBtn.style.pointerEvents = '';
             // Baixar o arquivo (link externo)
             const link = document.createElement('a');
             link.href = originalHref;
             link.target = '_blank';
             link.rel = 'noopener';
             document.body.appendChild(link);
             link.click();
             document.body.removeChild(link);
           } else {
             progress++;
             downloadBtn.querySelector('#downloadProgressFront').innerText = `${progress}%`;
           }
         }, 18);
       });
     }

     // Efeito Hire-me (frontend)
     const hireBtn = document.getElementById('hireMeBtnFront');
     if (hireBtn) {
       hireBtn.addEventListener('click', function (e) {
         e.preventDefault();
         hireBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
         setTimeout(() => {
           hireBtn.innerHTML = 'Hire me!';
           if (typeof confetti === 'function') {
             confetti({
               particleCount: 100,
               spread: 70,
               origin: { y: 0.6 }
             });
           }
           // Rola para a seção de contratação (já está na seção, só anima)
         }, 2000);
       });
     }
   });