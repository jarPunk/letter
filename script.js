document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');
  const letter = document.getElementById('letter');
  const hint = document.getElementById('hint');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const btnBack = document.getElementById('letter-back-btn');
  const successScreen = document.getElementById('success-screen');
  const closeSuccess = document.getElementById('close-success');
  const paper = document.querySelector('.letter-paper');
  const noWrapper = document.querySelector('.btn-no-wrapper');
  
  let state = 'front'; // front, back, opened, reading
  
  // 1. Initialize ambient background floating hearts
  initFloatingHearts();
  
  // Parse URL Parameters (dynamic letter contents)
  parseURLParams();
  
  // 2. Envelope interaction
  envelope.addEventListener('click', (e) => {
    // Prevent clicking envelope when interacting with letter contents or RSVP buttons
    if (
      e.target.closest('#btn-yes') || 
      e.target.closest('#btn-no') || 
      e.target.closest('#letter-back-btn') || 
      e.target.closest('#rsvp-section')
    ) {
      return;
    }
    
    // Front to back flip
    if (state === 'front') {
      envelope.classList.add('flipped');
      state = 'back';
      hint.textContent = 'Pulsa sobre el sello de cera para romperlo y abrir...';
      return;
    }
    
    // Back to front flip (only before opening)
    if (state === 'back' && !e.target.closest('#wax-seal')) {
      envelope.classList.remove('flipped');
      state = 'front';
      hint.textContent = 'Haz clic sobre el sobre para ver quién te escribe...';
      return;
    }
    
    // Zoom letter if envelope is open but not yet expanded
    if (state === 'opened' && e.target.closest('#letter')) {
      zoomLetter();
    }
  });
  
  // Wax seal opens envelope
  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent card flip
    if (state === 'back') {
      openEnvelope();
    }
  });
  
  // Guardar/Put back letter interaction
  btnBack.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLetter();
  });
  
  // RSVP YES celebration
  btnYes.addEventListener('click', (e) => {
    e.stopPropagation();
    successScreen.classList.add('active');
    triggerConfetti();
  });
  
  // Close success modal
  closeSuccess.addEventListener('click', () => {
    successScreen.classList.remove('active');
  });
  
  // Evasive "No" Button events
  const triggerNoEvasion = (e) => {
    e.preventDefault(); // Stop standard tap/click actions on mobile
    evadeButton(btnNo, paper);
  };
  
  btnNo.addEventListener('mouseenter', triggerNoEvasion);
  btnNo.addEventListener('touchstart', triggerNoEvasion, { passive: false });
  btnNo.addEventListener('click', triggerNoEvasion);

  // --- Functions ---
  
  function openEnvelope() {
    envelope.classList.add('open');
    state = 'opened';
    hint.textContent = 'Haz clic en la carta para sacarla y leerla...';
    
    // Zoom letter automatically after flap opening animation (1.2s)
    setTimeout(() => {
      if (state === 'opened') {
        zoomLetter();
      }
    }, 1200);
  }
  
  function zoomLetter() {
    letter.classList.add('zoomed');
    state = 'reading';
    hint.style.opacity = '0';
  }
  
  function closeLetter() {
    letter.classList.remove('zoomed');
    envelope.classList.remove('open');
    
    // Restore evasive No button to its original wrapper
    if (btnNo.parentElement !== noWrapper) {
      noWrapper.appendChild(btnNo);
    }
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transition = '';
    btnNo.style.margin = '';
    
    state = 'back';
    hint.textContent = 'Pulsa sobre el sello de cera para romperlo y abrir...';
    hint.style.opacity = '1';
  }
  
  function evadeButton(btn, container) {
    // If not already appended to paper container, move it in the DOM
    if (btn.parentElement !== container) {
      container.appendChild(btn);
    }
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const btnWidth = btn.offsetWidth;
    const btnHeight = btn.offsetHeight;
    
    // Keep within bounds of the letter paper with safe padding
    const padding = 15;
    const maxX = containerWidth - btnWidth - padding * 2;
    const maxY = containerHeight - btnHeight - padding * 2;
    
    const randomX = Math.random() * maxX + padding;
    const randomY = Math.random() * maxY + padding;
    
    btn.style.position = 'absolute';
    btn.style.left = `${randomX}px`;
    btn.style.top = `${randomY}px`;
    btn.style.margin = '0';
    btn.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
  }
  
  function initFloatingHearts() {
    const bg = document.getElementById('hearts-bg');
    if (!bg) return;
    
    const numHearts = 15;
    const hearts = ['❤️', '💖', '💝', '💕', '♥'];
    
    for (let i = 0; i < numHearts; i++) {
      createHeart(bg, hearts);
    }
  }
  
  function createHeart(container, icons) {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = icons[Math.floor(Math.random() * icons.length)];
    
    const size = Math.random() * 20 + 12; // 12px to 32px
    const left = Math.random() * 100; // 0% to 100%
    const duration = Math.random() * 8 + 8; // 8s to 16s
    const delay = Math.random() * -16; // Random starting offset
    
    heart.style.setProperty('--size', `${size}px`);
    heart.style.setProperty('--left', `${left}%`);
    heart.style.setProperty('--duration', `${duration}s`);
    heart.style.setProperty('--delay', `${delay}s`);
    
    container.appendChild(heart);
  }
  
  function triggerConfetti() {
    const container = document.getElementById('confetti-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear old ones
    const colors = ['#ff4d6d', '#ff758f', '#ff8fa3', '#ffb3c1', '#c9184a', '#a4133c', '#ffccd5'];
    const numHearts = 55;
    
    for (let i = 0; i < numHearts; i++) {
      const heart = document.createElement('div');
      heart.className = 'confetti-heart';
      heart.textContent = '❤️';
      
      const size = Math.random() * 16 + 8; // 8px to 24px
      const color = colors[Math.floor(Math.random() * colors.length)];
      const duration = Math.random() * 2.2 + 1.8; // 1.8s to 4s
      
      const xStart = Math.random() * 100;
      const xMid = xStart + (Math.random() * 40 - 20);
      const xEnd = xMid + (Math.random() * 60 - 30);
      
      heart.style.setProperty('--size', `${size}px`);
      heart.style.setProperty('--color', color);
      heart.style.setProperty('--duration', `${duration}s`);
      heart.style.setProperty('--x-start', `${xStart}vw`);
      heart.style.setProperty('--x-mid', `${xMid}vw`);
      heart.style.setProperty('--x-end', `${xEnd}vw`);
      
      container.appendChild(heart);
      
      setTimeout(() => {
        heart.remove();
      }, duration * 1000);
    }
  }
  
  function parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    let para = params.get('para');
    let de = params.get('de');
    let msg = params.get('msg');
    let resp = params.get('resp');
    
    // Check for base64 compressed format in parameter "c"
    const compressed = params.get('c');
    if (compressed) {
      try {
        // Decode base64 URL-safe string
        const base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = decodeURIComponent(escape(window.atob(base64)));
        const parts = decoded.split('|');
        if (parts.length >= 3) {
          para = parts[0];
          de = parts[1];
          msg = parts[2];
          resp = parts[3] || ''; // 4th part holds acceptance response message
        }
      } catch (err) {
        console.error('Error decoding compressed parameters:', err);
      }
    }
    
    // Update DOM elements
    if (para) {
      const paraEnvelope = document.getElementById('para-envelope');
      const paraLetter = document.getElementById('para-letter');
      if (paraEnvelope) paraEnvelope.textContent = para;
      if (paraLetter) paraLetter.textContent = para.trim().split(' ')[0];
    }
    
    if (de) {
      const deEnvelope = document.getElementById('de-envelope');
      const deLetter = document.getElementById('de-letter');
      if (deEnvelope) deEnvelope.textContent = de;
      if (deLetter) deLetter.textContent = de.trim().split(' ')[0];
    }
    
    if (msg) {
      const mensajeEl = document.getElementById('mensaje');
      if (mensajeEl) {
        mensajeEl.innerHTML = msg.replace(/\n/g, '<br>');
      }
    }

    if (resp) {
      const successMsgEl = document.getElementById('success-message');
      if (successMsgEl) {
        successMsgEl.innerHTML = resp.replace(/\n/g, '<br>');
      }
    }
  }
});
