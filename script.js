$(document).ready(function(){
      // Al cargar la página, ocultamos las cortinas
      $('.left-curtain').css('width', '0%');
      $('.right-curtain').css('width', '0%');
    
      $('.valentines-day').click(function(){
        const $v = $(this);

        // Primer click: flip (si aún no se ha volteado)
        if (!$v.hasClass('flipped') && !$v.hasClass('flipping')) {
          $v.addClass('flipping');
          setTimeout(function(){
            $v.removeClass('flipping').addClass('flipped');
            // $v.find('.behind').hide();  <-- eliminado para mantener 3D
          }, 800); // coincide con duración del giro
          return;
        }

        // Segundo click: abrir (mostrar frente abierto)
        if ($v.hasClass('flipped') && !$v.hasClass('open')) {
          $v.addClass('open');
          return;
        }
        
      });
    });
