!function(){class t{constructor(t,i){t=t||{},this.spriteSheet=t.spriteSheet,this.frames=t.frames,this.frameRate=t.frameRate,this.loop=void 0===t.loop||t.loop,i=t.spriteSheet.frame,this.width=i.width,this.height=i.height,this.margin=i.margin||0,this._f=0,this._a=0}clone(){return kontra.animation(this)}reset(){this._f=0,this._a=0}update(t){if(this.loop||this._f!=this.frames.length-1)for(t=t||1/60,this._a+=t;this._a*this.frameRate>=1;)this._f=++this._f%this.frames.length,this._a-=1/this.frameRate}render(t){t=t||{};let i=this.frames[this._f]/this.spriteSheet._f|0,e=this.frames[this._f]%this.spriteSheet._f|0;(t.context||kontra.context).drawImage(this.spriteSheet.image,e*this.spriteSheet.frame.width+(2*e+1)*this.margin,i*this.spriteSheet.frame.height+(2*i+1)*this.margin,this.spriteSheet.frame.width,this.spriteSheet.frame.height,t.x,t.y,t.width,t.height)}}kontra.animation=function(i){return new t(i)},kontra.animation.prototype=t.prototype;class i{constructor(t){t=t||{},this.animations={},this.image=t.image,this.frame={width:t.frameWidth,height:t.frameHeight,margin:t.frameMargin},this._f=t.image.width/t.frameWidth|0,this.createAnimations(t.animations)}createAnimations(t){let i,e,h,s;for(s in t)e=(i=t[s]).frames,h=[],[].concat(e).map(function(t){h=h.concat(this._p(t))},this),this.animations[s]=kontra.animation({spriteSheet:this,frames:h,frameRate:i.frameRate,loop:i.loop})}_p(t,i){if(+t===t)return t;let e=[],h=t.split(".."),s=i=+h[0],a=+h[1];if(s<a)for(;i<=a;i++)e.push(i);else for(;i>=a;i--)e.push(i);return e}}kontra.spriteSheet=function(t){return new i(t)},kontra.spriteSheet.prototype=i.prototype}();