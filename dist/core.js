!function(){let t={};window.kontra={init(t){let n=this.canvas=document.getElementById(t)||t||document.querySelector("canvas");this.context=n.getContext("2d"),this.context.imageSmoothingEnabled=!1,this.emit("init",this)},on(n,e){t[n]=t[n]||[],t[n].push(e)},emit(n,...e){t[n]&&t[n].forEach(t=>t(...e))},_noop:new Function}}();