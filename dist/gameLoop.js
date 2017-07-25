var kontra=function(t,e){"use strict";return t.timestamp=function(){return e.performance&&e.performance.now?function(){return e.performance.now()}:function(){return(new Date).getTime()}}(),t.gameLoop=function(e){var i=Object.create(t.gameLoop.prototype);return i._init(e),i},t.gameLoop.prototype={_init:function(e){if(e=e||{},"function"!=typeof e.update||"function"!=typeof e.render){var i=new ReferenceError("Required functions not found");return void t._logError(i,"You must provide update() and render() functions to create a game loop.")}this.isStopped=!0,this._accumulator=0,this._delta=1e3/(e.fps||60),this._step=1/(e.fps||60),this.update=e.update,this.render=e.render,e.clearCanvas===!1&&(this._clearCanvas=t._noop)},start:function(){this._last=t.timestamp(),this.isStopped=!1,requestAnimationFrame(this._frame.bind(this))},stop:function(){this.isStopped=!0,cancelAnimationFrame(this._rAF)},_frame:function(){if(this._rAF=requestAnimationFrame(this._frame.bind(this)),this._now=t.timestamp(),this._dt=this._now-this._last,this._last=this._now,!(this._dt>1e3)){for(this._accumulator+=this._dt;this._accumulator>=this._delta;)this.update(this._step),this._accumulator-=this._delta;this._clearCanvas(),this.render()}},_clearCanvas:function(){t.context.clearRect(0,0,t.canvas.width,t.canvas.height)}},t}(kontra||{},window);