document.addEventListener('DOMContentLoaded', () => {
  const btnGenerate = document.getElementById('btn-generate');
  const resultsSection = document.getElementById('results-section');

  const countryCodeSelect = document.getElementById('country-code-select');
  const paraInput = document.getElementById('para-input');
  const deInput = document.getElementById('de-input');
  const phoneInput = document.getElementById('phone-input');
  const msgInput = document.getElementById('msg-input');
  const respInput = document.getElementById('resp-input');

  const getFullPhone = () => {
    const code = countryCodeSelect ? countryCodeSelect.value : '';
    let raw = phoneInput ? phoneInput.value.trim() : '';
    if (!raw) return '';
    if (raw.startsWith('+')) return raw;
    raw = raw.replace(/^0+/, '');
    return `${code}${raw}`;
  };

  // 3D Preview Modal Logic & Elements
  const previewModalScreen = document.getElementById('preview-modal-screen');
  const btnOpenPreviewModal = document.getElementById('btn-open-preview-modal');
  const btnClosePreviewModal = document.getElementById('btn-close-preview-modal');
  const btnClosePreviewModalFooter = document.getElementById('btn-close-preview-modal-footer');
  const btnGenerateFromModal = document.getElementById('btn-generate-from-modal');

  const previewEnvelope = document.getElementById('preview-envelope');
  const prevWaxSeal = document.getElementById('prev-wax-seal');
  const previewLetter = document.getElementById('preview-letter');
  const prevLetterBackBtn = document.getElementById('prev-letter-back-btn');
  const prevHint = document.getElementById('prev-hint');

  const prevStamp = document.getElementById('prev-stamp');
  const prevPara = document.getElementById('prev-para');
  const prevDe = document.getElementById('prev-de');
  const prevLetterPara = document.getElementById('prev-letter-para');
  const prevLetterDe = document.getElementById('prev-letter-de');
  const prevMsg = document.getElementById('prev-msg');

  const btnTest = document.getElementById('btn-test');
  const btnRestart = document.getElementById('btn-restart');
  const toast = document.getElementById('toast');

  // Share buttons
  const btnShareWa = document.getElementById('btn-share-wa');
  const btnShareIg = document.getElementById('btn-share-ig');
  const btnShareNative = document.getElementById('btn-share-native');
  const btnShareCopy = document.getElementById('btn-share-copy');

  let currentLink = '';
  let selectedTheme = 'rose';
  let selectedEmoji = '❤️';
  let emojiTouched = false; // si el usuario eligió emoji manual, el tema no lo pisa
  let previewState = 'front'; // front, back, opened, reading
  let previewTimer;
  let previousFocus;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pageSurfaces = document.querySelectorAll('.site-header, .generator-main, .creator-credit, .skip-link');

  const updateDesignPreview = () => {
    document.getElementById('mini-stamp').textContent = selectedEmoji;
    const activeTheme = document.querySelector('.theme-opt.active');
    document.getElementById('selected-color-name').textContent = activeTheme.textContent.trim();
    document.querySelectorAll('.theme-opt, .emoji-opt[data-emoji]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.classList.contains('active')));
    });
  };

  // 0. Modal Open / Close & 3D Interactive Controls
  const resetPreviewEnvelope = () => {
    clearTimeout(previewTimer);
    if (!previewEnvelope) return;
    previewEnvelope.classList.remove('flipped', 'open');
    if (previewLetter) previewLetter.classList.remove('zoomed');
    previewState = 'front';
    if (prevHint) prevHint.textContent = 'Haz clic sobre el sobre para abrirlo o girarlo...';
  };

  const openPreviewModal = () => {
    previousFocus = document.activeElement;
    updatePreviewText();
    if (previewEnvelope) {
      previewEnvelope.setAttribute('data-theme', selectedTheme);
    }
    document.body.setAttribute('data-theme', selectedTheme);
    resetPreviewEnvelope();
    if (previewModalScreen) {
      previewModalScreen.inert = false;
      previewModalScreen.setAttribute('aria-hidden', 'false');
      previewModalScreen.classList.add('active');
      pageSurfaces.forEach(surface => { surface.inert = true; });
      document.body.style.overflow = 'hidden';
      btnClosePreviewModal.focus();
    }
  };

  const closePreviewModal = () => {
    if (previewModalScreen) {
      previewModalScreen.classList.remove('active');
      pageSurfaces.forEach(surface => { surface.inert = false; });
      document.body.style.overflow = '';
      previousFocus?.focus();
      previewModalScreen.inert = true;
      previewModalScreen.setAttribute('aria-hidden', 'true');
    }
    resetPreviewEnvelope();
  };

  previewModalScreen.addEventListener('click', event => {
    if (event.target === previewModalScreen) closePreviewModal();
  });
  document.addEventListener('keydown', event => {
    if (!previewModalScreen.classList.contains('active')) return;
    if (event.key === 'Escape') closePreviewModal();
    if (event.key !== 'Tab') return;
    const focusable = [...previewModalScreen.querySelectorAll('button:not(:disabled), [tabindex="0"]')]
      .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !previewModalScreen.contains(document.activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !previewModalScreen.contains(document.activeElement))) {
      event.preventDefault();
      first.focus();
    }
  });

  if (btnOpenPreviewModal) {
    btnOpenPreviewModal.addEventListener('click', openPreviewModal);
  }
  if (btnClosePreviewModal) {
    btnClosePreviewModal.addEventListener('click', closePreviewModal);
  }
  if (btnClosePreviewModalFooter) {
    btnClosePreviewModalFooter.addEventListener('click', closePreviewModal);
  }

  if (btnGenerateFromModal) {
    btnGenerateFromModal.addEventListener('click', () => {
      closePreviewModal();
      btnGenerate.click();
    });
  }

  // Interactive 3D Envelope inside Preview Modal
  if (previewEnvelope) {
    previewEnvelope.addEventListener('click', (e) => {
      if (
        e.target.closest('#prev-wax-seal') ||
        e.target.closest('#prev-letter-back-btn') ||
        e.target.closest('.rsvp-btn')
      ) return;

      if (previewState === 'front') {
        previewEnvelope.classList.add('flipped');
        previewState = 'back';
        if (prevHint) prevHint.textContent = 'Pulsa sobre el sello de cera para romperlo y abrir...';
        return;
      }

      if (previewState === 'back' && !e.target.closest('#prev-wax-seal')) {
        previewEnvelope.classList.remove('flipped');
        previewState = 'front';
        if (prevHint) prevHint.textContent = 'Haz clic sobre el sobre para abrirlo o girarlo...';
        return;
      }

      if (previewState === 'opened' && e.target.closest('#preview-letter')) {
        if (previewLetter) previewLetter.classList.add('zoomed');
        previewState = 'reading';
        if (prevHint) prevHint.textContent = 'Leyendo la carta...';
      }
    });
  }

  if (prevWaxSeal) {
    prevWaxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      if (previewState === 'back') {
        previewEnvelope.classList.add('open');
        previewState = 'opened';
        if (prevHint) prevHint.textContent = 'Haz clic en la carta para sacarla y leerla...';
        previewTimer = setTimeout(() => {
          if (previewLetter) previewLetter.classList.add('zoomed');
          previewState = 'reading';
        }, reducedMotion ? 0 : 1200);
      }
    });
  }

  if (prevLetterBackBtn) {
    prevLetterBackBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetPreviewEnvelope();
    });
  }

  // 1. Live Text Updates
  const updatePreviewText = () => {
    const paraVal = paraInput.value.trim();
    const deVal = deInput.value.trim();
    const msgVal = msgInput.value.trim();

    prevPara.textContent = paraVal || 'María García';
    prevDe.textContent = deVal || 'Carlos Romero';
    document.getElementById('mini-para').textContent = paraVal || 'Alguien especial';
    document.getElementById('mini-de').textContent = deVal || 'Ti';
    const characterCount = Array.from(msgInput.value).length;
    document.getElementById('character-count').textContent = `${characterCount} ${characterCount === 1 ? 'carácter' : 'caracteres'}`;

    const firstNamePara = paraVal ? paraVal.split(' ')[0] : 'María';
    const firstNameDe = deVal ? deVal.split(' ')[0] : 'Carlos';

    prevLetterPara.textContent = firstNamePara;
    prevLetterDe.textContent = firstNameDe;

    prevMsg.replaceChildren();
    const previewMessage = msgVal || 'Tengo algo muy lindo que decirte...\n¿Quieres compartir este momento conmigo? ✨💖';
    previewMessage.split('\n').forEach((line, index) => {
      if (index) prevMsg.appendChild(document.createElement('br'));
      prevMsg.appendChild(document.createTextNode(line));
    });
  };

  paraInput.addEventListener('input', updatePreviewText);
  deInput.addEventListener('input', updatePreviewText);
  msgInput.addEventListener('input', updatePreviewText);

  // 2. Theme Picker
  const themeOpts = document.querySelectorAll('.theme-opt');
  themeOpts.forEach(btn => {
    btn.addEventListener('click', () => {
      themeOpts.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      selectedTheme = btn.getAttribute('data-theme');
      document.body.setAttribute('data-theme', selectedTheme);
      if (previewEnvelope) previewEnvelope.setAttribute('data-theme', selectedTheme);

      // Solo sugerir el emoji del tema si el usuario no eligió uno manual
      const defaultEmoji = btn.getAttribute('data-default-emoji');
      if (defaultEmoji && !emojiTouched) {
        selectedEmoji = defaultEmoji;
        prevStamp.textContent = selectedEmoji;

        // Sync emoji selector buttons (incluye emojis personalizados)
        document.querySelectorAll('#emoji-selector .emoji-opt').forEach(eb => {
          if (eb.id === 'emoji-add-btn') return;
          if (eb.getAttribute('data-emoji') === selectedEmoji) {
            eb.classList.add('active');
          } else {
            eb.classList.remove('active');
          }
        });
      }
      updateDesignPreview();
      invalidateLink();
    });
  });

  // 3. Emoji Picker (delegado: funciona también con emojis personalizados)
  const emojiSelector = document.getElementById('emoji-selector');
  const emojiAddBtn = document.getElementById('emoji-add-btn');
  const emojiCustomRow = document.getElementById('emoji-custom-row');
  const emojiCustomInput = document.getElementById('emoji-custom-input');
  const emojiCustomSave = document.getElementById('emoji-custom-save');

  const selectEmojiTile = (tile) => {
    emojiSelector.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('active'));
    tile.classList.add('active');
    emojiTouched = true;
    selectedEmoji = tile.getAttribute('data-emoji');
    prevStamp.textContent = selectedEmoji;
    updateDesignPreview();
    invalidateLink();
  };

  emojiSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.emoji-opt');
    if (!btn || btn.id === 'emoji-add-btn') return;
    selectEmojiTile(btn);
  });

  // Botón ➕: muestra el campo para pegar un emoji propio
  emojiAddBtn.addEventListener('click', () => {
    emojiCustomRow.hidden = !emojiCustomRow.hidden;
    if (!emojiCustomRow.hidden) emojiCustomInput.focus();
  });

  const addCustomEmoji = () => {
    const value = emojiCustomInput.value.trim();
    if (!value) return;
    // Acepta 1 emoji (hasta 4 puntos de código por ZWJ/variantes), sin espacios
    const chars = Array.from(value.replace(/\s/g, ''));
    if (chars.length === 0 || chars.length > 4) return;
    const emoji = chars.join('');

    // Evitar duplicados: si ya existe, solo seleccionarlo
    const existing = emojiSelector.querySelector(`.emoji-opt[data-emoji="${CSS.escape(emoji)}"]`);
    if (existing) {
      selectEmojiTile(existing);
    } else {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'emoji-opt';
      tile.setAttribute('data-emoji', emoji);
      tile.textContent = emoji;
      tile.title = 'Tu emoji personalizado (doble clic para quitar)';
      // Doble clic quita un emoji personalizado
      tile.addEventListener('dblclick', () => {
        const wasActive = tile.classList.contains('active');
        tile.remove();
        if (wasActive) {
          const first = emojiSelector.querySelector('.emoji-opt[data-emoji]');
          if (first) selectEmojiTile(first);
        }
      });
      emojiSelector.insertBefore(tile, emojiAddBtn);
      selectEmojiTile(tile);
    }
    emojiCustomInput.value = '';
    emojiCustomRow.hidden = true;
  };

  emojiCustomSave.addEventListener('click', addCustomEmoji);
  emojiCustomInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomEmoji();
    }
  });

  // Si el usuario edita algo tras generar, el link queda obsoleto: ocultarlo
  const invalidateLink = () => {
    if (!resultsSection.classList.contains('active')) return;
    resultsSection.classList.remove('active');
    btnGenerate.style.display = 'block';
    btnGenerate.textContent = 'Generar Enlace Corto ↗';
    currentLink = '';
  };
  [paraInput, deInput, phoneInput, msgInput, respInput].forEach(el => {
    if (el) el.addEventListener('input', invalidateLink);
  });
  if (countryCodeSelect) countryCodeSelect.addEventListener('change', invalidateLink);

  // 4. Link Generation
  btnGenerate.addEventListener('click', async () => {
    const para = paraInput.value.trim();
    const de = deInput.value.trim();
    const phone = getFullPhone();
    const msg = msgInput.value.trim();
    const resp = respInput.value.trim() || '¡Sabía que dirías que sí! Todo está listo para nuestro momento especial. 🥰✨';

    if (!para || !de || !msg) {
      const missingInput = [paraInput, deInput, msgInput].find(input => !input.value.trim());
      missingInput.focus();
      missingInput.setCustomValidity('Completa este campo para crear tu carta.');
      missingInput.reportValidity();
      missingInput.addEventListener('input', () => missingInput.setCustomValidity(''), { once: true });
      return;
    }

    btnGenerate.textContent = 'Guardando carta...';
    btnGenerate.disabled = true;

    const baseURI = window.location.href.split('/').slice(0, -1).join('/') + '/';

    // 1. Crear respaldo local Base64 URL-safe con JSON estructurado (UTF-8 seguro)
    const payloadObj = { para, de, msg, resp, phone, theme: selectedTheme, emoji: selectedEmoji };
    const jsonStr = JSON.stringify(payloadObj);
    const utf8BytesArray = new TextEncoder().encode(jsonStr);
    let binaryStr = '';
    utf8BytesArray.forEach((b) => { binaryStr += String.fromCharCode(b); });
    const base64 = window.btoa(binaryStr)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const backupUrl = `${baseURI}index.html?c=${base64}&t=${selectedTheme}&e=${encodeURIComponent(selectedEmoji)}`;
    currentLink = backupUrl;

    // 2. Si Supabase está configurado, guardar en la Base de Datos (con theme/emoji)
    if (window.SupabaseLetterDB && window.SupabaseLetterDB.isConfigured()) {
      try {
        const letter = await window.SupabaseLetterDB.createLetter({
          recipient_name: para,
          sender_name: de,
          sender_phone: phone,
          message: msg,
          acceptance_message: resp,
          theme: selectedTheme,
          emoji: selectedEmoji
        });

        const dbUrl = `${baseURI}index.html?l=${letter.short_code}&t=${selectedTheme}&e=${encodeURIComponent(selectedEmoji)}`;
        currentLink = dbUrl;
      } catch (err) {
        console.error('Error al guardar en Supabase:', err);
        currentLink = backupUrl;
      }
    }
    // Sin Supabase se usa el enlace Base64 directamente (sin acortador externo:
    // is.gd falla por CORS y mete latencia innecesaria).

    btnGenerate.textContent = 'Generar Enlace Corto';
    btnGenerate.disabled = false;
    resultsSection.classList.add('active');
    btnGenerate.style.display = 'none';
    resultsSection.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'nearest' });
  });

  // Copy & Share mechanisms
  const showToast = (message = '¡Enlace copiado al portapapeles! 💖') => {
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2800);
  };

  const copyToClipboardText = async (text, toastMsg) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(toastMsg || '¡Enlace copiado al portapapeles! 💖');
    } catch (err) {
      const tempInput = document.createElement('textarea');
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      showToast(toastMsg || '¡Enlace copiado al portapapeles! 💖');
    }
  };

  if (btnShareCopy) {
    const copySpan = document.getElementById('btn-share-copy-text');
    btnShareCopy.addEventListener('click', () => {
      if (!currentLink) return;
      copyToClipboardText(currentLink);
      btnShareCopy.classList.add('copied');
      if (copySpan) copySpan.textContent = '¡Copiado! ✓';
      setTimeout(() => {
        btnShareCopy.classList.remove('copied');
        if (copySpan) copySpan.textContent = 'Copiar Link';
      }, 2200);
    });
  }

  if (btnShareWa) {
    btnShareWa.addEventListener('click', () => {
      if (!currentLink) return;
      const targetName = paraInput.value.trim();
      // Texto plano ASCII-safe: los emojis en el parámetro ?text= se corrompen
      // (��) en algunos móviles/WhatsApp Web. Se envía sin emojis.
      const messageText = targetName
        ? `Hola ${targetName}! Te he enviado una carta especial. Mirala aqui: ${currentLink}`
        : `Hola! Te he enviado una carta especial. Mirala aqui: ${currentLink}`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
      window.open(waUrl, '_blank');
    });
  }

  if (btnShareIg) {
    btnShareIg.addEventListener('click', async () => {
      if (!currentLink) return;
      await copyToClipboardText(currentLink, '¡Enlace copiado! Redirigiendo a Instagram... 📸');
      setTimeout(() => {
        window.open('https://www.instagram.com/direct/inbox/', '_blank');
      }, 1200);
    });
  }

  if (btnShareNative) {
    btnShareNative.addEventListener('click', async () => {
      if (!currentLink) return;
      const targetName = paraInput.value.trim();
      const shareData = {
        title: 'Una Carta Especial 💖',
        text: targetName
          ? `¡Hola ${targetName}! Te he enviado una carta de amor especial 💖✨`
          : 'Te he enviado una carta de amor especial 💖✨',
        url: currentLink
      };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          if (err.name !== 'AbortError') {
            copyToClipboardText(currentLink);
          }
        }
      } else {
        copyToClipboardText(currentLink, '¡Enlace copiado al portapapeles! 💖');
      }
    });
  }

  btnTest.addEventListener('click', () => {
    window.open(currentLink, '_blank');
  });

  btnRestart.addEventListener('click', () => {
    resultsSection.classList.remove('active');
    btnGenerate.style.display = 'block';
    paraInput.value = '';
    deInput.value = '';
    phoneInput.value = '';
    if (countryCodeSelect) countryCodeSelect.selectedIndex = 0;
    msgInput.value = '';
    respInput.value = '';
    currentLink = '';
    [paraInput, deInput, msgInput].forEach(input => input.setCustomValidity(''));
    updatePreviewText();
    paraInput.focus();
  });
  updatePreviewText();
  updateDesignPreview();
});
