!function(){var r=/(jpeg|jpg|gif|png)$/,i=/(wav|mp3|ogg|aac)$/,n=/^no$/,t=/^\//,e=/\/$/,a=new Audio,c={wav:"",mp3:a.canPlayType("audio/mpeg;").replace(n,""),ogg:a.canPlayType('audio/ogg; codecs="vorbis"').replace(n,""),aac:a.canPlayType("audio/aac;").replace(n,"")};function u(n,a){return[n.replace(e,""),a.replace(t,"")].join("/")}function f(n){return n.split(".").pop()}function s(n){var a=n.replace("."+f(n),"");return 2==a.split("/").length?a.replace(t,""):a}function d(e,o){return new Promise(function(n,a){var t=new Image;o=u(h.imagePath,e),t.onload=function(){h.images[s(e)]=h.images[o]=this,n(this)},t.onerror=function(){a(o)},t.src=o})}function p(e,o,r){return new Promise(function(n,a){if(e=[].concat(e).reduce(function(n,a){return c[f(a)]?a:n},r)){var t=new Audio;o=u(h.audioPath,e),t.addEventListener("canplay",function(){h.audio[s(e)]=h.audio[o]=this,n(this)}),t.onerror=function(){a(o)},t.src=o,t.load()}else a(e)})}function l(a,t){return t=u(h.dataPath,a),fetch(t).then(function(n){if(!n.ok)throw n;return n.clone().json().catch(function(){return n.text()})}).then(function(n){return h.data[s(a)]=h.data[t]=n,n})}var h=kontra.assets={images:{},audio:{},data:{},imagePath:"",audioPath:"",dataPath:"",load:function(){var n,a,t,e,o=[];for(t=0;a=arguments[t];t++)e=(n=f([].concat(a)[0])).match(r)?d(a):n.match(i)?p(a):l(a),o.push(e);return Promise.all(o)}}}();