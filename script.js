$(document).ready(function(){
  $('.left-curtain').css('width', '0%');
  $('.right-curtain').css('width', '0%');
  
  // NUEVO: preparar pista como frase debajo del sobre en un flexbox
  const $envelope = $('.valentines-day');
  const $hint = $('.hint');
  if ($envelope.length && $hint.length) {
    // Texto actualizado solicitado
    $hint.text('Haz clic sobre el sobre').addClass('hint-phrase');
    // Crear contenedor flex solo si no existe ya
    if (!$envelope.parent().hasClass('envelope-flex')) {
      const $wrap = $('<div class="envelope-flex"></div>');
      $envelope.add($hint).wrapAll($wrap);
    }
  }

  $('.valentines-day').click(function(){
    const $v = $(this);

    if (!$v.hasClass('flipped') && !$v.hasClass('flipping')) {
      $v.addClass('flipping');
      setTimeout(function(){
        $v.removeClass('flipping').addClass('flipped');
        $('.hint').text('Haz clic nuevamente para abrir');
      }, 800);
      return;
    }

    if ($v.hasClass('flipped') && !$v.hasClass('open')) {
      $v.addClass('open');
      $('.hint').addClass('hide');
      return;
    }
  });
});