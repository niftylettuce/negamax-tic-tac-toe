
/*globals Zepto*/
;(function($) {

  var defaults = {
      size: 3
    , players: 'cc'
    , depth: 9
  }

  function TTT($table, opts) {
    var that = this
    this.opts = $.extend(defaults, opts)
    this.$table = $table
    this.players = this.opts.players.split('').map(function(type) {
      return (type === 'p') ? new Player() : new AI(that.opts.depth)
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

    $('#score').text(that.board.score())

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

  function AI(depth) {
    this.depth = depth
  }

  AI.prototype.nextMove = function nextMove(board) {
    return this.negamax(board, this.depth, -10000, 10000).move
  }

  // X _ _
  // _ _ _
  // _ _ _



  AI.prototype.negamax = function negamax(board, depth, alpha, beta) {

    // we only want to call score() when we know what the end score will be
    // or if we've run out of depth for the algorithm to search through n # times
    if (board.ended() || depth === 0)
      return {
        score: board.score() * board.player
      }

    var bestMove = null

    for(var r=0; r<board.size; r++) {
      for(var c=0; c<board.size; c++) {
        if (board.empty(r, c)) {

          // make the move
          board.move(r, c)

          // we only want the score, not the bestMove too
          var score = -negamax(board, depth - 1, -beta, -alpha).score

          // undo the move
          board.undoMove(r, c)

          // e.g. [ 0, 0 ] and board is empty
          // and you put X in [ 0, 0 ] = 0.3
          // we switch and negate alpha and beta
          // you get some score depending on depth as long as it is size * size
          // if the depth is less than the max number of spaces/depth
          // 0, 1 or -1
          // else you get 0

          // alpha is the best score found so far
          if (score > alpha) {
            alpha = score
            bestMove = [r, c]
          }

          // once you reach beta, no more searching needed
          // because we're looking for a move that would negate any advantage we have
          if (score > beta) {
            return {
                score: score
              , move: [r, c]
            }
          }

        }
      }
    }

    // we want to return both score and the move
    return {
        // alpha (it gets changed inside loop)
        // is the maximum of initial value and
        // the negated returned values from negamax
        score: alpha
      , move: bestMove  // variable bestMove
    }

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
    return (this.checkWinner() !== null)
  }

  Board.prototype.empty = function empty(r, c) {
    return (this.grid[r][c] === 0)
  }

  // 1 = X won
  // -1 = O won
  // 0 = draw game
  Board.prototype.score = function score() {
    var n = this.checkWinner()
    if (n !== null) return n

    // n must have returned null, so continue

    // negamax can only return as a score whatever we return here
    // or the negation of this

    // we don't want to just return 0 here
    // because if we can't analyze entire game to the end
    // we need some way for negamax to pick some
    // positions over others

    // TODO: estimate using the current board state

    // fork for X:
    // X _ X
    // _ _ _
    // _ _ X

    // TODO: let's try to make the algorithm do something

    // compute # of odd cells by X
    // subtract # of odd cells by O
    // divide by total # size^2

    // so basically computers will take odd # cells
    // until depth # of moves from the end of the game
    // then analyze game to the end so it will switch
    // to try to win the game
    var sumX = 0
      , sumO = 0
    for(var r=0; r<this.size; r++) {
      for(var c=0; c<this.size; c++) {
        // check if odd
        if ((r + c) % 2 === 1) {
          if (this.grid[r][c] === 1)
            sumX += 1
          else if (this.grid[r][c] === -1)
            sumO += 1
        }
      }
    }

    // this will always return -0.5 to 0.5
    return ( (sumX - sumO) / (this.size * this.size) )

    // which should make negamax make
    //  moves that are odd numbers

    // if neither have fork then nobody has advantage

    // if x has a fork return 0.8 - opp corners
    // if o has a fork return -0.8 - opp corners
    // if x has a center return 0.1 - slight advant

  }

  Board.prototype.checkWinner = function checkWinner() {

    var rows = createArray(this.size, 0)
      , cols = createArray(this.size, 0)
      , diag = 0
      , antiDiag = 0

    for(var r=0; r<this.size; r++) {
      for(var c=0; c<this.size; c++) {
        rows[r] += this.grid[r][c]
        cols[c] += this.grid[r][c]
        // 0,0 & 1,1 & 2,2
        if (r === c) {
          diag += this.grid[r][c]
        }
        // 0,2 & 1,1 & 2,0
        if(r + c === this.size - 1) {
          antiDiag += this.grid[r][c]
        }
      }
    }

    // check after loop for Math.abs(3)
    // and return proper signum
    for(var z=0; z<this.size; z++) {
      if (Math.abs(rows[z]) === this.size)
        return sgn(rows[z]) // 1 or -1
      if (Math.abs(cols[z]) === this.size)
        return sgn(cols[z]) // 1 or -1
    }

    // check for diag
    if (Math.abs(diag) === this.size)
      return sgn(diag)

    // check for antiDiag
    if (Math.abs(antiDiag) === this.size)
      return sgn(antiDiag)

    // check if draw and return 0
    // use >= just to be safe
    if (this.count >= this.size * this.size)
      return 0

    // if not a winner then return null since nobody won
    return null

    // http://en.wikipedia.org/wiki/Signum_function
    // (e.g. ( (-2 > 1) - (-2 < 1) ) == -1
    //          ^ false: 0  ^ true: 1
    function sgn(x) {
      return ( (x > 1) - (x < 1) )
    }

    function createArray(size, value) {
      var arr = []
      for(var i=0; i<size; i++) {
        arr.push(value)
      }
      return arr
    }

  }

  Board.prototype.move = function move(r, c) {
    if (!this.empty(r, c)) return false
    this.grid[r][c] = this.player
    this.player = -this.player
    this.count += 1
    return true
  }

  Board.prototype.undoMove = function undoMove(r, c) {
    this.grid[r][c] = 0
    this.player = -this.player
    this.count -= 1
  }

  $.extend($.fn, {
    ttt: function(opts) {
      return new TTT($(this), opts)
    }
  })

})(Zepto)
