!function(){let t,n=[],e=[],o={},a=[],r={},i={0:"left",1:"middle",2:"right"};function s(n){let e=t.x-Math.max(n.x,Math.min(t.x,n.x+n.width)),o=t.y-Math.max(n.y,Math.min(t.y,n.y+n.height));return e*e+o*o<t.radius*t.radius}function c(){let o,a,r=e.length?e:n;for(let n=r.length-1;n>=0;n--)if(a=(o=r[n]).collidesWithPointer?o.collidesWithPointer(t):s(o))return o}function u(t){r[i[t.button]]=!0,d(t,"onDown")}function f(t){r[i[t.button]]=!1,d(t,"onUp")}function d(n,e){if(!kontra.canvas)return;let a,r;-1!==n.type.indexOf("mouse")?(a=n.pageX,r=n.pageY):(a=(n.touches[0]||n.changedTouches[0]).pageX,r=(n.touches[0]||n.changedTouches[0]).pageY);let i=a-kontra.canvas.offsetLeft,s=r-kontra.canvas.offsetTop,u=kontra.canvas;for(;u=u.offsetParent;)i-=u.offsetLeft,s-=u.offsetTop;let f,d=kontra.canvas.offsetHeight/kontra.canvas.height;i/=d,s/=d,t.x=i,t.y=s,n.target===kontra.canvas&&(f=c())&&f[e]&&f[e](),o[e]&&o[e](n,f)}addEventListener("mousedown",u),addEventListener("touchstart",u),addEventListener("mouseup",f),addEventListener("touchend",f),addEventListener("blur",function(t){r={}}),addEventListener("mousemove",function(t){d(t,"onOver")}),t=kontra.pointer={x:0,y:0,radius:5,track(t){[].concat(t).map(function(t){t._r||(t._r=t.render,t.render=function(){n.push(this),this._r()},a.push(t))})},untrack(t,n){[].concat(t).map(function(t){t.render=t._r,t._r=n;let e=a.indexOf(t);-1!==e&&a.splice(e,1)})},over:t=>-1!==a.indexOf(t)&&c()===t,onDown(t){o.onDown=t},onUp(t){o.onUp=t},pressed:t=>!!r[t]},kontra._tick=function(){e.length=0,n.map(function(t){e.push(t)}),n.length=0}}();