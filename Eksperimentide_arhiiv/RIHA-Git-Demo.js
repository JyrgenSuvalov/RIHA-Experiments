function valmistaEtte() {

  // Arvamuse käsitleja
  $('#Saada').click(function() {
    $('#tanuteade').removeClass('varjus');
    $.post('https://api.staticman.net/v2/entry/e-gov/RIHA-Git-Demo/master/',
      { Arvamus: $('#Arvamus').val() },
      function() {
        // alert('Saadetud!');
      }
    );    
  });

}