/* BabyKids Studio Fotográfico — Apertura del sobre de Valentina */
(() => {
  'use strict';
  const overlay = document.getElementById('invitation-gate');
  const openButton = document.getElementById('open-envelope');
  const musicButton = document.getElementById('birthday-music-button');
  if (!overlay || !openButton) return;
  document.documentElement.classList.add('envelope-locked');
  let opened = false;
  openButton.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    openButton.disabled = true;
    overlay.classList.add('is-opening');
    document.getElementById('gate-hint').textContent = 'Una sorpresa preparada con cariño…';

    // El toque de abrir el sobre cuenta como gesto del usuario:
    // intentamos comenzar la música; el botón dentro de la tarjeta puede pausarla.
    if (musicButton && musicButton.getAttribute('aria-pressed') !== 'true') {
      musicButton.click();
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.setTimeout(() => {
      overlay.classList.add('is-leaving');
      document.documentElement.classList.remove('envelope-locked');
      window.scrollTo({top:0,left:0,behavior:'instant'});
      window.setTimeout(() => { overlay.hidden = true; }, reduced ? 0 : 740);
    }, reduced ? 40 : 1650);
  }, {once:true});
})();
