/* =====================================================================
   SmartParts AI Assistant  —  chatbot.js  (self-contained, works offline)
   ---------------------------------------------------------------------
   • file:// / localhost / live site — ekama widda wada karanawa.
   • User message eka network ekakata yanne NA (default). Local JS logic
     ekenma auto-reply ekak load wenawa (typing animation ekka).
   • Optional: window.SP_CHAT_ENDPOINT = 'https://.../chat' set karoth,
     http(s) page ekakadi eka try karala, fail unoth local reply ekata
     automatically fallback wenawa. (Default: OFF)
   • WhatsApp link eka "fallback" button ekak widihata thiyenawa —
     error message ekak widihata nemei.
   ===================================================================== */
(function () {
  'use strict';
  if (window.__spChatLoaded) return;
  window.__spChatLoaded = true;

  /* ---------- helpers ---------- */
  function waNumber() {
    try { if (typeof getShopWhatsAppNumber === 'function') return getShopWhatsAppNumber(); } catch (e) {}
    return '94767396487';
  }
  function waLink(text) {
    return 'https://wa.me/' + waNumber() + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lkr(n) { return 'LKR ' + (Number(n) || 0).toLocaleString('en-US'); }
  function tokens(s) {
    return String(s || '').toLowerCase().split(/[^\p{L}\p{M}\p{N}]+/u).filter(Boolean);
  }
  function hasAny(toks, raw, words) {
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.indexOf(' ') > -1 ? raw.indexOf(w) > -1 : toks.indexOf(w) > -1) return true;
    }
    return false;
  }
  function getProducts() {
    try { if (typeof PRODUCTS !== 'undefined' && Array.isArray(PRODUCTS)) return PRODUCTS; } catch (e) {}
    return window.PRODUCTS && Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
  }

  /* ---------- styles ---------- */
  var css = '\
#spc-launch{position:fixed;left:18px;bottom:18px;z-index:99990;display:flex;align-items:center;gap:8px;padding:14px 22px;border:0;border-radius:40px;cursor:pointer;color:#fff;font:700 15px/1 system-ui,Segoe UI,Arial,sans-serif;background:linear-gradient(135deg,#e50914,#b8070f);box-shadow:0 8px 24px rgba(229,9,20,.45);transition:transform .15s}\
#spc-launch:hover{transform:translateY(-2px)}\
#spc-panel{position:fixed;left:18px;bottom:78px;z-index:99991;width:min(370px,calc(100vw - 24px));height:min(560px,calc(100vh - 110px));display:none;flex-direction:column;background:#0d0d15;color:#fff;border:1px solid rgba(229,9,20,.35);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.8),0 0 24px rgba(229,9,20,.18);overflow:hidden;font:14px/1.5 system-ui,Segoe UI,Arial,sans-serif}\
#spc-panel.open{display:flex}\
.spc-head{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(180deg,#1a0b10,#12121a);border-bottom:1px solid rgba(229,9,20,.3)}\
.spc-av{width:38px;height:38px;border-radius:50%;background:#e50914;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none}\
.spc-ttl{flex:1;min-width:0}.spc-ttl b{display:block;font-size:15px}.spc-ttl small{color:#9a9aaa;font-size:12px}\
.spc-ttl small:before{content:"\\25CF";color:#35c759;margin-right:5px;font-size:9px}\
.spc-x{background:none;border:0;color:#aaa;font-size:22px;cursor:pointer;padding:4px 8px;border-radius:8px}.spc-x:hover{color:#fff;background:rgba(255,255,255,.08)}\
#spc-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}\
.spc-m{max-width:88%;padding:11px 14px;border-radius:14px;word-wrap:break-word;overflow-wrap:anywhere;animation:spcIn .2s ease}\
.spc-m.bot{align-self:flex-start;background:#1a1a24;border:1px solid rgba(255,255,255,.1);border-bottom-left-radius:4px}\
.spc-m.me{align-self:flex-end;background:#e50914;border-bottom-right-radius:4px}\
.spc-m a{color:#35d07f}\
@keyframes spcIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}\
.spc-dots{display:inline-flex;gap:4px;padding:2px 0}.spc-dots i{width:7px;height:7px;border-radius:50%;background:#888899;animation:spcB 1s infinite}\
.spc-dots i:nth-child(2){animation-delay:.15s}.spc-dots i:nth-child(3){animation-delay:.3s}\
@keyframes spcB{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-5px);opacity:1}}\
.spc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}\
.spc-chip{background:rgba(229,9,20,.12);border:1px solid rgba(229,9,20,.45);color:#fff;border-radius:18px;padding:6px 12px;font-size:12.5px;cursor:pointer}.spc-chip:hover{background:#e50914}\
.spc-prod{display:flex;gap:10px;align-items:center;margin-top:8px;padding:8px;border-radius:10px;background:#12121a;border:1px solid rgba(229,9,20,.25);cursor:pointer;text-decoration:none;color:#fff}\
.spc-prod:hover{border-color:#e50914}\
.spc-prod img{width:46px;height:46px;border-radius:8px;object-fit:cover;background:#0d0d15;flex:none}\
.spc-prod b{display:block;font-size:13px;line-height:1.3}.spc-prod span{font-size:12.5px;color:#ff6b75}.spc-prod em{font-style:normal;font-size:11.5px;color:#9a9aaa;margin-left:6px}\
.spc-wa{display:inline-block;margin-top:9px;padding:8px 14px;border-radius:20px;background:#25d366;color:#04210f!important;font-weight:700;text-decoration:none!important;font-size:13px}\
.spc-form{display:flex;gap:8px;padding:12px;border-top:1px solid rgba(229,9,20,.25);background:#0d0d15}\
#spc-in{flex:1;min-width:0;background:#12121a;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:11px 16px;font:inherit;outline:none}\
#spc-in:focus{border-color:#e50914}\
.spc-send{width:44px;height:44px;border-radius:50%;border:0;background:#e50914;color:#fff;font-size:18px;cursor:pointer;flex:none}.spc-send:hover{background:#b8070f}\
@media(max-width:480px){#spc-panel{left:12px;right:12px;width:auto;bottom:74px}#spc-launch{left:12px;bottom:12px}}';
  var st = document.createElement('style');
  st.id = 'spc-style';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- DOM ---------- */
  var root = document.createElement('div');
  root.id = 'spc-root';
  root.innerHTML =
    '<button id="spc-launch" type="button" aria-label="Open chat"><span>💬</span><span>Chat with us</span></button>' +
    '<section id="spc-panel" role="dialog" aria-label="SmartParts AI Assistant">' +
      '<div class="spc-head"><div class="spc-av">🤖</div>' +
        '<div class="spc-ttl"><b>SmartParts AI Assistant</b><small>Online 24/7</small></div>' +
        '<button class="spc-x" type="button" aria-label="Close chat">✕</button></div>' +
      '<div id="spc-msgs" aria-live="polite"></div>' +
      '<form class="spc-form" id="spc-form" autocomplete="off">' +
        '<input id="spc-in" type="text" maxlength="300" placeholder="මෙතන type කරන්න..." aria-label="Type your message">' +
        '<button class="spc-send" type="submit" aria-label="Send">➤</button></form>' +
    '</section>';
  document.body.appendChild(root);

  var panel = document.getElementById('spc-panel');
  var msgs = document.getElementById('spc-msgs');
  var input = document.getElementById('spc-in');
  var launch = document.getElementById('spc-launch');
  var greeted = false, busy = false;

  /* ---------- rendering ---------- */
  function scrollDown() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(who, html) {
    var d = document.createElement('div');
    d.className = 'spc-m ' + who;
    d.innerHTML = html;
    msgs.appendChild(d);
    scrollDown();
    return d;
  }
  function chips(list) {
    return '<div class="spc-chips">' + list.map(function (c) {
      return '<button type="button" class="spc-chip" data-q="' + esc(c[1] || c[0]) + '">' + esc(c[0]) + '</button>';
    }).join('') + '</div>';
  }
  function waBtn(label, text) {
    return '<a class="spc-wa" href="' + waLink(text) + '" target="_blank" rel="noopener">💬 ' + esc(label || 'WhatsApp') + '</a>';
  }
  var MAIN_CHIPS = [
    ['🛒 Products', 'products'], ['🚚 Delivery', 'delivery'], ['🛡️ Warranty', 'warranty'],
    ['💳 Payment', 'payment'], ['📦 Track order', 'track order'], ['📞 Contact', 'contact']
  ];

  /* ---------- product search (local) ---------- */
  var STOP = ['the', 'and', 'for', 'with', 'price', 'cost', 'how', 'much', 'what', 'have', 'you', 'any', 'show', 'need',
              'want', 'buy', 'tiyenawada', 'තියෙනවද', 'තියෙනවාද', 'මිල', 'කීයද', 'ඕන', 'one', 'please', 'plz', 'hari'];
  function productHtml(p) {
    var img = p.img || (p.images && p.images[0]) || '';
    var stock = p.inStock === false || Number(p.stock) <= 0 ? '<em>Out of stock</em>' : '';
    return '<div class="spc-prod" data-pid="' + esc(p.id) + '">' +
      (img ? '<img src="' + esc(img) + '" alt="" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : '<img alt="" style="visibility:hidden">') +
      '<div><b>' + esc(p.name) + '</b><span>' + lkr(p.price) + '</span>' + stock + '</div></div>';
  }
  function searchProducts(toks) {
    var q = toks.filter(function (t) { return t.length >= 3 && STOP.indexOf(t) < 0; });
    if (!q.length) return [];
    var res = [];
    getProducts().forEach(function (p) {
      var hay = (p.name + ' ' + (p.brand || '') + ' ' + (p.cat || '') + ' ' + (p.category || '') + ' ' +
                 (p.compatList || []).join(' ') + ' ' + (p.desc || '')).toLowerCase();
      var nameHay = (p.name + ' ' + (p.brand || '') + ' ' + (p.cat || '')).toLowerCase();
      var score = 0;
      q.forEach(function (t) {
        if (nameHay.indexOf(t) > -1) score += 3;
        else if (hay.indexOf(t) > -1) score += 1;
      });
      if (score > 0) res.push({ p: p, s: score });
    });
    res.sort(function (a, b) { return b.s - a.s; });
    return res.map(function (r) { return r.p; });
  }
  function categoryChips() {
    var seen = {}, out = [];
    getProducts().forEach(function (p) {
      var c = p.category || p.cat;
      if (!c) return;
      var k = String(c).toLowerCase();
      if (seen[k]) return;
      seen[k] = 1;
      out.push([String(c).replace(/[-_]/g, ' '), String(c).replace(/[-_]/g, ' ')]);
    });
    return out.slice(0, 8);
  }

  /* ---------- reply engine (all local) ---------- */
  function reply(text) {
    var raw = text.toLowerCase().trim();
    var t = tokens(raw);
    var G = ['hi', 'hello', 'hey', 'hii', 'hiii', 'helo', 'hola', 'ayubowan', 'ayubovan', 'ආයුබෝවන්', 'හලෝ', 'හායි', 'හෙලෝ', 'සුබ'];
    var THANKS = ['thanks', 'thank', 'thx', 'ty', 'ස්තූතියි', 'ස්තුතියි', 'istuti', 'isthuthi', 'stuti'];

    if (hasAny(t, raw, THANKS)) {
      return '😊 ස්තූතියි! තවත් උදව්වක් ඕන නම් අහන්න.' + chips(MAIN_CHIPS);
    }
    if (hasAny(t, raw, ['delivery', 'deliver', 'courier', 'shipping', 'ship', 'postage', 'ඩිලිවරි', 'කුරියර්', 'යවන්නේ', 'යවනවද'])) {
      return '🚚 අපි <b>island-wide courier delivery</b> කරනවා. Delivery charge එක සහ ලැබෙන කාලය checkout එකේදී බලාගන්න පුළුවන්. විශේෂ ප්‍රශ්නයක් නම් WhatsApp කරන්න.' + waBtn('Delivery ගැන අහන්න', 'Hi SmartParts! Delivery ගැන දැනගන්න ඕන.');
    }
    if (hasAny(t, raw, ['warranty', 'guarantee', 'return', 'repair', 'replace', 'වගකීම', 'වරන්ටි', 'වොරන්ටි', 'warrenty'])) {
      return '🛡️ SmartParts items වලට <b>company warranty</b> තියෙනවා. Product එක අනුව warranty කාලය වෙනස් වෙන්න පුළුවන් — product එකේ details බලන්න, නැත්නම් WhatsApp එකෙන් අහන්න.' + waBtn('Warranty ගැන අහන්න', 'Hi SmartParts! Warranty ගැන දැනගන්න ඕන.');
    }
    if (hasAny(t, raw, ['payment', 'pay', 'card', 'bank', 'transfer', 'visa', 'master', 'ගෙවීම', 'ගෙවන්න', 'ගෙවන්නේ', 'payhere'])) {
      return '💳 ගෙවීම් කරන්න ක්‍රම:<br>• Online card payment<br>• Direct Bank Transfer (ගෙවලා <b>slip එක WhatsApp</b> කරන්න, Order ID එක එක්ක)<br>සියල්ල <b>LKR</b> වලින්.' + waBtn('Payment ගැන අහන්න', 'Hi SmartParts! Payment ගැන දැනගන්න ඕන.');
    }
    if (hasAny(t, raw, ['track', 'tracking', 'status', 'order status', 'ඕඩර්', 'ඔඩර්', 'ඇණවුම']) && !searchProducts(t.filter(function (x) { return x !== 'order'; })).length) {
      return '📦 Order එකේ status බලන්න, <b>Order ID</b> එක website එකේ <a href="#" data-act="track">Track Order</a> කොටසට දාන්න. ID එක නැත්නම් WhatsApp කරන්න.' + waBtn('Order එක ගැන අහන්න', 'Hi SmartParts! මගේ order එක ගැන දැනගන්න ඕන.');
    }
    if (hasAny(t, raw, ['contact', 'phone', 'number', 'call', 'hotline', 'location', 'address', 'open', 'hours', 'කතා', 'ෆෝන්', 'අංකය', 'ලිපිනය'])) {
      return '📞 Hotline: <b>076-7396487</b><br>WhatsApp: <b>+94 76 739 6487</b>' + waBtn('WhatsApp එකෙන් කතා කරන්න', 'Hi SmartParts!');
    }
    if (hasAny(t, raw, ['whatsapp', 'agent', 'human', 'person', 'staff', 'support', 'help', 'වට්ස්ඇප්', 'උදව්'])) {
      return '👍 අපේ team එක එක්ක කෙලින්ම කතා කරන්න පුළුවන්:' + waBtn('WhatsApp Chat', 'Hi SmartParts! මට උදව්වක් ඕන.');
    }
    if (hasAny(t, raw, ['products', 'product', 'categories', 'category', 'catalog', 'items', 'මොනවාද', 'බඩු', 'නිෂ්පාදන']) && !searchProducts(t.filter(function (x) { return ['products', 'product', 'categories', 'category', 'catalog', 'items'].indexOf(x) < 0; })).length) {
      var cc = categoryChips();
      return '🛒 අපි Mobile, PC, Laptop සහ Gaming accessories විකුණනවා. මොන වර්ගයද බලන්න ඕන?' + (cc.length ? chips(cc) : '') +
             '<br><a href="#" data-act="cats">Categories බලන්න →</a>';
    }

    var hits = searchProducts(t);
    if (hits.length) {
      var top = hits.slice(0, 3);
      return '🔎 මෙන්න ගැලපෙන items ' + (hits.length > 3 ? '(' + hits.length + 'න් මුල් 3):' : ':') + top.map(productHtml).join('') +
             (hits.length > 3 ? '<div style="margin-top:8px;font-size:12.5px;color:#9a9aaa">තව ඕන නම් product නම / brand එක ටිකක් විස්තර කරන්න.</div>' : '') +
             waBtn('මේ ගැන අහන්න', 'Hi SmartParts! "' + text + '" ගැන දැනගන්න ඕන.');
    }

    if (t.length && t.every(function (x) { return G.indexOf(x) > -1; }) || (hasAny(t, raw, G) && t.length <= 3)) {
      return 'ආයුබෝවන්! 👋 අද ඔයාට අවශ්‍ය Computer, Laptop, Mobile හෝ Gaming Accessories මොනවාද? Product නමක් type කරන්න, නැත්නම් පහළින් තෝරන්න.' + chips(MAIN_CHIPS);
    }

    /* graceful fallback — NOT an error. WhatsApp is the next step. */
    return 'ඒ ගැන මට හරියටම තහවුරු කරලා කියන්න බැරි වුණා 🙏 Product නමක් (e.g. <i>mouse, keyboard, charger</i>) type කරන්න, නැත්නම් අපේ team එකෙන් කෙලින්ම අහන්න:' +
           waBtn('WhatsApp එකෙන් අහන්න', 'Hi SmartParts! ' + text) + chips(MAIN_CHIPS);
  }

  /* optional remote API (OFF unless window.SP_CHAT_ENDPOINT is set) */
  function tryRemote(text) {
    var ep = window.SP_CHAT_ENDPOINT;
    if (!ep || !/^https?:$/.test(location.protocol) || typeof fetch !== 'function') return Promise.resolve(null);
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 6000);
    return fetch(ep, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }), signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { if (!r.ok) throw new Error('bad ' + r.status); return r.json(); })
      .then(function (d) { var a = d && (d.reply || d.message || d.answer); return a ? esc(a).replace(/\n/g, '<br>') : null; })
      .catch(function () { return null; })
      .then(function (v) { clearTimeout(timer); return v; });
  }

  /* ---------- send flow ---------- */
  function send(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    busy = true;
    addMsg('me', esc(text));
    input.value = '';
    var typing = addMsg('bot', '<span class="spc-dots"><i></i><i></i><i></i></span>');
    var started = Date.now();
    tryRemote(text).then(function (remote) {
      var html;
      try { html = remote || reply(text); }
      catch (e) {
        console.warn('[SmartParts chat]', e);
        html = 'සමාවෙන්න, පොඩි ගැටලුවක් ඇති වුණා. WhatsApp එකෙන් අපිට කතා කරන්න:' + waBtn('WhatsApp Chat', 'Hi SmartParts! ' + text);
      }
      var wait = Math.max(0, 550 - (Date.now() - started));   /* natural typing delay */
      setTimeout(function () {
        typing.innerHTML = html;
        busy = false;
        scrollDown();
        input.focus();
      }, wait);
    });
  }

  /* ---------- events ---------- */
  function open() {
    panel.classList.add('open');
    launch.style.display = 'none';
    if (!greeted) {
      greeted = true;
      addMsg('bot', 'ආයුබෝවන්! 👋 SmartParts වෙත සාදරයෙන් පිළිගනිමු. මම ඔයාගේ Smart AI Assistant. අද ඔයාට අවශ්‍ය Computer, Laptop හෝ Gaming Accessories මොනවාද?' + chips(MAIN_CHIPS));
    }
    setTimeout(function () { input.focus(); }, 50);
  }
  function close() { panel.classList.remove('open'); launch.style.display = 'flex'; }

  launch.addEventListener('click', open);
  panel.querySelector('.spc-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) close(); });
  document.getElementById('spc-form').addEventListener('submit', function (e) { e.preventDefault(); send(input.value); });

  msgs.addEventListener('click', function (e) {
    var chip = e.target.closest('.spc-chip');
    if (chip) { send(chip.getAttribute('data-q')); return; }
    var prod = e.target.closest('.spc-prod');
    if (prod) {
      var id = prod.getAttribute('data-pid');
      try { if (typeof openSpecModal === 'function') { openSpecModal(isNaN(id) ? id : Number(id)); } } catch (x) {}
      return;
    }
    var act = e.target.closest('[data-act]');
    if (act) {
      e.preventDefault();
      var target = act.getAttribute('data-act') === 'track' ? (document.getElementById('spTrackInput') || document.getElementById('spTrackBtn')) : document.getElementById('shopByCat');
      if (target && target.scrollIntoView) { target.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      if (window.matchMedia && window.matchMedia('(max-width:480px)').matches) close();
    }
  });

  /* Allow the rest of the site to open the chat:  window.spChatOpen() */
  window.spChatOpen = open;
  window.spChatClose = close;
})();
