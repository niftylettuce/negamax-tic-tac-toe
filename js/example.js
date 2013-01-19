
/*globals Zepto*/
;(function($) {

  $('form').on('submit', submit)

  function submit(ev, r, z) {
    ev.preventDefault()
    var opts = {
        size: parseInt($('#size').val(), 10)
      , players: $('#type').val()
      , depth: parseInt($('#depth').val(), 10)
    }
    $('table').ttt(opts)
  }

  $('form').submit()

})(Zepto)
