/* BabyKids Studio · Invitación digital reutilizable */
(() => {
  'use strict';
  const data = window.DATOS_INVITACION || {};
  const $ = id => document.getElementById(id);
  const clean = value => String(value || '').trim();
  const fecha = clean(data.fecha);
  const hora = clean(data.hora);
  const utcOffset = /^[-+]\d{2}:\d{2}$/.test(clean(data.zonaHorariaUTC))
    ? clean(data.zonaHorariaUTC) : '-05:00';

  const title = clean(data.nombre) || 'Valentina';
  $('invite-name').textContent = title;
  $('message').textContent = clean(data.mensaje) || 'Un día para compartir momentos inolvidables.';
  document.title = `${title} | Invitación de cumpleaños · BabyKids Studio`;

  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
  const timestamp = validDate && validTime ? Date.parse(`${fecha}T${hora}:00${utcOffset}`) : NaN;
  const eventValid = Number.isFinite(timestamp);
  if (validDate) {
    const dateParts = fecha.split('-').map(Number);
    const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
    if (date.getUTCFullYear() === dateParts[0] && date.getUTCMonth() === dateParts[1]-1 && date.getUTCDate() === dateParts[2]) {
      $('date-text').textContent = new Intl.DateTimeFormat('es-EC', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone:'UTC'
      }).format(date);
    }
  }
  if (validTime) {
    const [h, m] = hora.split(':').map(Number);
    $('time-text').textContent = new Intl.DateTimeFormat('es-EC', {
      hour:'numeric', minute:'2-digit', hour12:true, timeZone:'UTC'
    }).format(new Date(Date.UTC(2026,0,1,h,m)));
  }

  const place = clean(data.lugar);
  const address = clean(data.direccion);
  if (place) $('place-name').textContent = place;
  // Si la dirección se proporcionó como coordenadas, mostramos un texto más
  // agradable al invitado y conservamos las coordenadas exactas para el mapa.
  if (address) {
    const isCoordinates = /^-?\d+(?:\.\d+)?,\s*-?\d+(?:\.\d+)?$/.test(address);
    $('place-address').textContent = isCoordinates
      ? 'Ubicación exacta disponible en Google Maps'
      : address;
  }
  const mapLink = $('map-link');
  const explicitMap = clean(data.enlaceMapa);
  const mapAddress = address || place;
  const validMap = /^https:\/\/(maps\.app\.goo\.gl|www\.google\.[a-z.]+\/maps|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.google\.[a-z.]+)/i.test(explicitMap);
  const mapsUrl = validMap ? explicitMap : mapAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}` : '';
  if (mapsUrl) {
    mapLink.href = mapsUrl;
    mapLink.removeAttribute('aria-disabled');
    $('map-helper').textContent = 'Toca el botón para abrir el mapa.';
  } else {
    mapLink.addEventListener('click', e => e.preventDefault());
  }

  function updateCountdown() {
    const ids=['days','hours','minutes','seconds'];
    if (!eventValid) return;
    let remaining = timestamp - Date.now();
    if (remaining <= 0) {
      for (const id of ids) $(id).textContent='00';
      $('countdown-note').textContent = Date.now() - timestamp < 24*3600*1000
        ? '¡Hoy es el gran día! ✨' : 'Gracias por ser parte de nuestros recuerdos.';
      return;
    }
    const days=Math.floor(remaining/86400000);
    remaining%=86400000;
    const hrs=Math.floor(remaining/3600000);
    remaining%=3600000;
    const mins=Math.floor(remaining/60000);
    const secs=Math.floor(remaining%60000/1000);
    [days,hrs,mins,secs].forEach((value,index)=>{
      $(ids[index]).textContent=String(value).padStart(2,'0');
    });
    $('countdown-note').textContent='Cada segundo nos acerca a un momento inolvidable.';
  }
  updateCountdown();
  if (eventValid) setInterval(updateCountdown, 1000);

  const phone = clean(data.telefonoWhatsApp).replace(/\D/g,'');
  const enabled = /^\d{10,15}$/.test(phone) && !/^0+$/.test(phone);
  const button = $('rsvp-button');
  const helper = $('rsvp-helper');
  if (enabled) {
    button.disabled=false;
    helper.textContent='La confirmación se enviará al organizador del cumpleaños.';
  }
  // Música instrumental de cumpleaños (activación manual compatible con móviles).
  const musicAudio = $('birthday-music-audio');
  const musicButton = $('birthday-music-button');
  const musicLabel = $('birthday-music-label');
  const musicHint = $('birthday-music-hint');
  function setMusicState(playing) {
    musicButton.setAttribute('aria-pressed', String(playing));
    musicButton.setAttribute('aria-label', playing ? 'Pausar música de cumpleaños' : 'Reproducir música instrumental de cumpleaños');
    musicLabel.textContent = playing ? 'Pausar música de cumpleaños' : 'Escuchar Cumpleaños feliz';
    musicButton.querySelector('.birthday-music-play').textContent = playing ? 'Ⅱ' : '▶';
    musicHint.textContent = playing ? 'Música activada · toca para pausarla' : 'Melodía instrumental · pulsa para activar la música';
  }
  musicButton.addEventListener('click', async () => {
    if (!musicAudio.paused) {
      musicAudio.pause();
      setMusicState(false);
      return;
    }
    try {
      musicAudio.volume = 0.60;
      await musicAudio.play();
      setMusicState(true);
    } catch (err) {
      setMusicState(false);
      musicHint.textContent = 'No se pudo reproducir la música. Toca nuevamente para intentarlo.';
      console.warn('Reproducción de música:', err);
    }
  });
  musicAudio.addEventListener('pause', () => setMusicState(false));

  $('attendance').addEventListener('change', e => {
    $('guest-count').disabled=e.target.value==='no';
  });
  $('rsvp-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!enabled) return;
    const name=clean($('guest-name').value);
    if (!name) {
      $('guest-name').focus();
      helper.textContent='Escribe tu nombre para preparar la confirmación.';
      return;
    }
    const going=$('attendance').value==='si';
    const count=$('guest-count').value;
    const message = going
      ? `¡Hola! Soy ${name}. Confirmo mi asistencia al cumpleaños de ${title}. Iremos ${count} ${count==='1'?'persona':'personas'}. ¡Gracias por la invitación!`
      : `¡Hola! Soy ${name}. Muchas gracias por invitarme al cumpleaños de ${title}. Lamentablemente no podré asistir. ¡Que pasen un día muy bonito!`;
    const url=`https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    helper.textContent='WhatsApp se abrió con el mensaje. Recuerda pulsar Enviar.';
  });
})();
