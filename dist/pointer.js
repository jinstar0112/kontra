!function(r){var u,s,a,f=[],l={onOver:[],onOut:[],onDown:[],onUp:[]},n=window.addEventListener;function e(o,i,c){var r;return function(){var n=this,e=arguments,t=c&&!r;clearTimeout(r),r=setTimeout(function(){r=null,c||o.apply(n,e)},i),t&&o.apply(n,e)}}function t(n){o(n,"onDown")}function o(n,e){if(n.target===r.canvas){-1!==n.type.indexOf("mouse")?(u=5,s=n.clientX,a=n.clientY):(u=10,s=n.touches[0].clientX,a=n.touches[0].clientY);var t={clientX:s,clientY:a,type:n.type,x:s-r.canvas.offsetLeft-u/2,y:a-r.canvas.offsetTop-u/2,size:u},o=[];if(l[e].forEach(function(n){(n.collisionFn||p)(t,n.sprite)&&n.sprite.isAlive&&o.push(n)}),1===o.length)o[0].callback(t);else if(1<o.length){var i,c=-1/0;o.forEach(function(n,e){var t=f.indexOf(n.sprite);c<t&&(c=t,i=e)}),o[i].callback(t)}}}function p(n,e){return n.x<e.x+e.width&&n.x+n.size>e.x&&n.y<e.y+e.height&&n.y+n.size>e.y}n("mousedown",t),n("touchstart",t),n("mousemove",e(function(n){o(n,"onOver")},50)),n("mousemove",e(pointerOutHandler,50)),r.pointer={},["onOver","onOut","onDown","onUp"].forEach(function(o){r.pointer[o]=function(n,e,t){l[o].push({sprite:n,callback:e,collisionFn:t}),n._render||(n._render=n.render,n.render=function(){f.push(this),this._render()})}}),r._tick=function(){f.length=0}}(kontra);