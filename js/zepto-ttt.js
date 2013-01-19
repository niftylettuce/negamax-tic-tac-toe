
/*globals Zepto*/
;(function($) {

  var defaults = {
      size: 3
    , player: false
  }

  function TTT($table, opts) {
    this.opts = $.extend(defaults, opts)
    this.$table = $table
    this.play()
    this.render()
  }

  TTT.prototype.render = function render() {

    var that = this

    console.log(that.$table)

    that.$table.empty()

    for(var r=0; r<that.opts.size; r+=1) {
      var $tr = $('<tr />')
      for(var c=0; c<that.opts.size; c+=1) {
        var $td = $('<td />').on('click', click.bind(this, r, c))
        $td.addClass(that.board.getPiece(r, c))
        $tr.append($td)
      }
      that.$table.append($tr)
    }

    function click(r, c) {
      that.board.move(r, c)
      that.render()
    }

  }

  TTT.prototype.play = function play() {
    this.board = new BoardState(this.opts.size)
  }

  function negamax(node, depth) {

  }

  function BoardState(size) {
    this.grid = []
    for(var r=0; r<size; r+=1) {
      var row = []
      for(var c=0; c<size; c+=1) {
        row.push(0)
      }
      this.grid.push(row)
    }
    this.player = 1
    this.count = 0
    return this
  }

  BoardState.prototype.getPiece = function getPiece(r, c) {
    switch(this.grid[r][c]) {
      case 1:
        return 'x'
      case -1:
        return 'o'
      default:
        return ''
    }
  }

  BoardState.prototype.empty = function empty(r, c) {
    return (this.grid[r][c] === 0)
  }

  BoardState.prototype.move = function move(r, c) {
    if (!this.empty(r, c)) return false
    this.grid[r][c] = this.player
    this.player = -this.player
    this.count += 1
    return true
  }

  $.extend($.fn, {
    ttt: function(opts) {
      return new TTT($(this), opts)
    }
  })

})(Zepto)
