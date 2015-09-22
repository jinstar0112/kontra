var kontra = (function(kontra, window) {
  'use strict';

  /**
   * Get the current time. Uses the User Timing API if it's available or defaults to using
   * Date().getTime()
   * @memberof kontra
   *
   * @returns {number}
   */
  kontra.timestamp = (function() {
    if (window.performance && window.performance.now) {
      return function timestampPerformance() {
        return window.performance.now();
      };
    }
    else {
      return function timestampDate() {
        return new Date().getTime();
      };
    }
  })();

  /**
   * Game loop that updates and renders the game every frame.
   * @memberof kontra
   *
   * @see kontra.gameLoop.prototype.init for list of parameters.
   */
  kontra.gameLoop = function(properties) {
    var gameLoop = Object.create(kontra.gameLoop.prototype);
    gameLoop.init(properties);

    return gameLoop;
  };

  kontra.gameLoop.prototype = {
    /**
     * Initialize properties on the game loop.
     * @memberof kontra.gameLoop
     *
     * @param {object}   properties - Properties of the game loop.
     * @param {number}   [properties.fps=60] - Desired frame rate.
     * @param {function} properties.update - Function called to update the game.
     * @param {function} properties.render - Function called to render the game.
     */
    init: function init(properties) {
      properties = properties || {};

      // check for required functions
      if (typeof properties.update !== 'function' || typeof properties.render !== 'function') {
        var error = new ReferenceError('Required functions not found');
        kontra.logError(error, 'You must provide update() and render() functions to create a game loop.');
        return;
      }

      this.isStopped = false;

      // animation variables
      this._accumulator = 0;
      this._delta = 1E3 / (properties.fps || 60);

      this.update = properties.update;
      this.render = properties.render;
    },

    /**
     * Start the game loop.
     * @memberof kontra.gameLoop
     */
    start: function start() {
      this._last = kontra.timestamp();
      this.isStopped = false;
      requestAnimationFrame(this._frame.bind(this));
    },

    /**
     * Stop the game loop.
     */
    stop: function stop() {
      this.isStopped = true;
      cancelAnimationFrame(this._rAF);
    },

    /**
     * Called every frame of the game loop.
     * @memberof kontra.gameLoop
     * @private
     */
    _frame: function frame() {
      var _this = this;

      _this._rAF = requestAnimationFrame(_this._frame.bind(_this));

      _this._now = kontra.timestamp();
      _this._dt = _this._now - _this._last;
      _this._last = _this._now;

      // prevent updating the game with a very large dt if the game were to lose focus
      // and then regain focus later
      if (_this._dt > 1E3) {
        return;
      }

      _this._accumulator += _this._dt;

      while (_this._accumulator >= _this._delta) {
        _this.update(_this._delta / 1E3);

        _this._accumulator -= _this._delta;
      }

      _this.render();
    }
  };

  return kontra;
})(kontra || {}, window);