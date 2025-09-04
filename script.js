$(document).ready(function(){
  $('.left-curtain').css('width', '0%');
  $('.right-curtain').css('width', '0%');

  $('.valentines-day').click(function(){
    const $v = $(this);

    if (!$v.hasClass('flipped') && !$v.hasClass('flipping')) {
      $v.addClass('flipping');
      setTimeout(function(){
        $v.removeClass('flipping').addClass('flipped');
      }, 800);
      return;
    }

    if ($v.hasClass('flipped') && !$v.hasClass('open')) {
      $v.addClass('open');
      return;
    }
  });
});