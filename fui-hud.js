/* ════════════════════════════════════════════════
   FiveNodes — FUI HUD Injector
   Adds: scanlines, corner brackets, clock, cursor
   ════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Skip if homepage (already has full Three.js treatment) ── */
  if(document.getElementById('galaxy-canvas')) return;

  /* ── Scanlines ── */
  var sl = document.createElement('div');
  sl.className = 'fui-scanlines';
  sl.setAttribute('aria-hidden','true');
  document.body.prepend(sl);

  /* ── HUD overlay ── */
  var hud = document.createElement('div');
  hud.className = 'hud-overlay';
  hud.setAttribute('aria-hidden','true');
  hud.innerHTML =
    '<div class="hud-corner tl"></div>' +
    '<div class="hud-corner tr"></div>' +
    '<div class="hud-corner bl"></div>' +
    '<div class="hud-corner br"></div>' +
    '<div class="hud-status hud-status-tl"><div class="hud-dot"></div>SYS:ACTIVE&nbsp;·&nbsp;NODE/5&nbsp;·&nbsp;v2.04.1</div>' +
    '<div class="hud-status hud-status-tr" id="fui-clock">--:--:--</div>' +
    '<div class="hud-status hud-status-bl">LAT: 12ms&nbsp;·&nbsp;UPTIME: 99.97%</div>' +
    '<div class="hud-status hud-status-br">CONSOLE v2.04</div>';
  document.body.prepend(hud);

  /* ── Live clock ── */
  var clockEl = document.getElementById('fui-clock');
  function tick(){
    var n = new Date();
    if(clockEl) clockEl.textContent = [n.getHours(),n.getMinutes(),n.getSeconds()].map(function(v){return String(v).padStart(2,'0')}).join(':');
  }
  tick();
  setInterval(tick, 1000);

  /* ── Custom cursor (only if not already defined) ── */
  if(!document.getElementById('cursor')){
    var cur = document.createElement('div');
    cur.id = 'cursor';
    cur.style.cssText = 'position:fixed;width:10px;height:10px;background:#C8F135;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);mix-blend-mode:difference;transition:width .15s,height .15s';
    var ring = document.createElement('div');
    ring.id = 'cursor-ring';
    ring.style.cssText = 'position:fixed;width:34px;height:34px;border:1px solid rgba(200,241,53,.5);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:all .1s ease';
    document.body.append(cur, ring);

    var mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove',function(e){
      mx=e.clientX;my=e.clientY;
      cur.style.left=mx+'px';cur.style.top=my+'px';
    });
    (function lerpRing(){
      rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
      ring.style.left=rx+'px';ring.style.top=ry+'px';
      requestAnimationFrame(lerpRing);
    })();
    document.querySelectorAll('a,button').forEach(function(el){
      el.addEventListener('mouseenter',function(){
        cur.style.width='18px';cur.style.height='18px';
        ring.style.width='54px';ring.style.height='54px';
        ring.style.borderColor='rgba(200,241,53,.85)';
      });
      el.addEventListener('mouseleave',function(){
        cur.style.width='10px';cur.style.height='10px';
        ring.style.width='34px';ring.style.height='34px';
        ring.style.borderColor='rgba(200,241,53,.5)';
      });
    });
  }

  /* ── Nav logo FUI branding ── */
  document.querySelectorAll('.nav-logo,.logo').forEach(function(el){
    /* wrap text content in FUI brackets if not already */
    if(!el.querySelector('.logo-bracket') && !el.querySelector('canvas')){
      var txt = el.textContent.trim();
      if(txt && !el.querySelector('.logo-cursor')){
        var cur2 = document.createElement('span');
        cur2.className = 'logo-cursor';
        el.appendChild(cur2);
      }
    }
  });

  /* ── Magnetic buttons ── */
  document.querySelectorAll('.btn,.btn-primary,.btn-lime,.btn-outline,.apply-btn,.model-cta,.nav-cta').forEach(function(btn){
    btn.addEventListener('mousemove',function(e){
      var r=btn.getBoundingClientRect();
      var x=(e.clientX-r.left-r.width/2)*.18;
      var y=(e.clientY-r.top-r.height/2)*.18;
      btn.style.transform='translate('+x+'px,'+y+'px)';
    });
    btn.addEventListener('mouseleave',function(){btn.style.transform='';});
  });

  /* ── Scroll reveal (if not already init) ── */
  if(!window._fnRevealInit){
    window._fnRevealInit = true;
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('vis'); obs.unobserve(e.target); }
      });
    },{threshold:.06,rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
  }

})();
