
;(function($) {

  $('form').on('submit', submit)

  function submit(ev, r, z) {
    ev.preventDefault()
    var opts = {
        size: parseInt($('#size').val())
      , player: ($('#type').val() === '0' ? true : false)
    }
    $('table').ttt(opts)
  }

  $('table').ttt()

})(Zepto)
