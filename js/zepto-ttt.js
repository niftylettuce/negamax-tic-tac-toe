
/*globals Zepto*/
;(function($) {

  var defaults = {
      size: 3
    , players: 'cc'
  }

  function TTT($table, opts) {
    this.opts = $.extend(defaults, opts)
    this.$table = $table
    this.players = this.opts.players.split('').map(function(type) {
      return (type === 'p') ? new Player() : new AI()
    })
    this.board = new Board(this.opts.size)
    this.render()
    this.makeNextMove()
  }

  TTT.prototype.makeNextMove = function makeNextMove() {
    if (this.board.ended()) return
    if (this.getPlayer().nextMove) {
      var nextMove = this.getPlayer().nextMove(this.board)
      this.board.move(nextMove[0], nextMove[1])
      this.render()
      setTimeout(this.makeNextMove.bind(this), 100)
    }
  }

  TTT.prototype.getPlayer = function getPlayer() {
    return this.players[this.board.getPlayerIndex()]
  }

  TTT.prototype.render = function render() {

    var that = this

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
      if (this.board.ended()) return
      if (this.getPlayer().nextMove) return
      that.board.move(r, c)
      that.render()
      that.makeNextMove()
    }

  }

  function Player() {
  }

  function AI() {
  }

  AI.prototype.nextMove = function nextMove(board) {
    for(var r=0; r<board.size; r++) {
      for(var c=0; c<board.size; c++) {
        if (board.empty(r, c))
          return [r, c]
      }
    }
  }

  function negamax(node, depth) {
  }

  function Board(size) {
    this.grid = []
    this.size = size
    for(var r=0; r<size; r++) {
      var row = []
      for(var c=0; c<size; c++) {
        row.push(0)
      }
      this.grid.push(row)
    }
    this.player = 1
    this.count = 0
    return this
  }

  Board.prototype.getPlayerIndex = function() {
    return (this.player === 1) ? 0 : 1
  }

  Board.prototype.getPiece = function getPiece(r, c) {
    switch(this.grid[r][c]) {
      case 1:
        return 'x'
      case -1:
        return 'o'
      default:
        return ''
    }
  }

  Board.prototype.ended = function ended() {
    return (this.count === this.size * this.size)
  }

  Board.prototype.empty = function empty(r, c) {
    return (this.grid[r][c] === 0)
  }

  Board.prototype.move = function move(r, c) {
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
