var kontra=function(e,t){"use strict";return e.animation=function(t){var r=Object.create(e.animation.prototype);return r._init(t),r},e.animation.prototype={_init:function(e){e=e||{},this.spriteSheet=e.spriteSheet,this.frames=e.frames,this.frameRate=e.frameRate,this.width=e.spriteSheet.frame.width,this.height=e.spriteSheet.frame.height,this.currentFrame=0,this._accumulator=0,this.update=this._advance,this.render=this._draw},play:function(){this.update=this._advance,this.render=this._draw},stop:function(){this.update=e._noop,this.render=e._noop},pause:function(){this.update=e._noop},clone:function(){return e.animation(this)},_advance:function(e){for(e=e||1/60,this._accumulator+=e;this._accumulator*this.frameRate>=1;)this.currentFrame=++this.currentFrame%this.frames.length,this._accumulator-=1/this.frameRate},_draw:function(t){t=t||{};var r=t.context||e.context,i=this.frames[this.currentFrame]/this.spriteSheet.framesPerRow|0,a=this.frames[this.currentFrame]%this.spriteSheet.framesPerRow|0;r.drawImage(this.spriteSheet.image,a*this.spriteSheet.frame.width,i*this.spriteSheet.frame.height,this.spriteSheet.frame.width,this.spriteSheet.frame.height,t.x,t.y,this.spriteSheet.frame.width,this.spriteSheet.frame.height)}},e.spriteSheet=function(t){var r=Object.create(e.spriteSheet.prototype);return r._init(t),r},e.spriteSheet.prototype={_init:function(t){if(t=t||{},this.animations={},!e._isImage(t.image)&&!e._isCanvas(t.image)){var r=new SyntaxError("Invalid image.");return void e._logError(r,"You must provide an Image for the SpriteSheet.")}this.image=t.image,this.frame={width:t.frameWidth,height:t.frameHeight},this.framesPerRow=t.image.width/t.frameWidth|0,t.animations&&this.createAnimations(t.animations)},createAnimations:function(r){var i;if(!r||0===Object.keys(r).length)return i=new ReferenceError("No animations found."),void e._logError(i,"You must provide at least one named animation to create an Animation.");var a,s,n,h;for(var o in r)if(r.hasOwnProperty(o)){if(a=r[o],s=a.frames,n=a.frameRate,h=[],s===t)return i=new ReferenceError("No animation frames found."),void e._logError(i,"Animation "+o+" must provide a frames property.");if(e._isNumber(s))h.push(s);else if(e._isString(s))h=this._parseFrames(s);else{if(!Array.isArray(s))return i=new SyntaxError("Improper frames value"),void e._logError(i,"The frames property must be a number, string, or array.");for(var m,f=0;m=s[f];f++)e._isString(m)?h.push.apply(h,this._parseFrames(m)):h.push(m)}this.animations[o]=e.animation({spriteSheet:this,frames:h,frameRate:n})}},_parseFrames:function(e){var t,r=[],i=e.split("..").map(Number),a=i[0]<i[1]?1:-1;if(1===a)for(t=i[0];t<=i[1];t++)r.push(t);else for(t=i[0];t>=i[1];t--)r.push(t);return r}},e}(kontra||{});