
;(function($) {

  var defaults = {
      size: 3
    , player: false
  }

  function TTT($table, opts) {
    this.opts = $.extend(defaults, opts)
    this.$table = $table
    this.render()
    this.play()
  }

  TTT.prototype.render = function render() {

    var that = this

    that.$table.empty()

    for(var r=0; r<that.opts.size; r+=1) {
      var $tr = $('<tr />')
      for(var c=0; c<that.opts.size; c+=1) {
        var $td = $('<td />').on('click', click(r, c))
        $tr.append($td)
      }
      that.$table.append($tr)
    }

    function click(r, c) {
      that.move(r, c)
    }

  }

  TTT.prototype.move = function move(r, c) {
  }

  TTT.prototype.play = function play() {
  }

  $.extend($.fn, {
    ttt: function(opts) {
      return new TTT($(this), opts)
    }
  })

})(Zepto)
