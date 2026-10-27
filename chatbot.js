/* SmartParts AI Assistant: chat widget
   index.html eke </body> ekata kalin:  <script src="chatbot.js" defer></script>
   Backend: /.netlify/functions/chat  (Gemini key eka methana, browser eke nehe) */
(function () {
  'use strict';
  if (window.__spBot) return;
  window.__spBot = true;

  var API = '/.netlify/functions/chat';
  var WA = '94767396487';
  var GREETING = 'ආයුබෝවන්! 👋 SmartParts වෙත සාදරයෙන් පිළිගනිමු. මම ඔයාගේ Smart AI Assistant. අද ඔයාට අවශ්‍ය Computer, Laptop හෝ Gaming Accessories මොනවාද?';
  var CHIPS = ['Gaming mouse ekak ona', 'Rs. 5000 ta aduwen headset', 'Keyboard options', 'Delivery fee kiyada?'];

  var history = [];   // {role:'user'|'bot', text}
  var busy = false;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function lkr(n) { return 'Rs. ' + Number(n || 0).toLocaleString(); }
  // very small markdown: **bold** + newlines
  function fmt(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }

  /* ---------- styles ---------- */
  var css = '\
#spb,#spb *{box-sizing:border-box;font-family:"IBM Plex Sans","Noto Sans Sinhala",system-ui,sans-serif}\
#spb-btn{position:fixed;left:18px;bottom:22px;z-index:9990;display:flex;align-items:center;gap:8px;height:52px;padding:0 18px 0 14px;border:0;border-radius:30px;background:linear-gradient(135deg,#e50914,#ff2d3a);color:#fff;font:700 .85rem "Space Grotesk",sans-serif;cursor:pointer;box-shadow:0 6px 22px rgba(229,9,20,.45)}\
#spb-btn:hover{filter:brightness(1.1)}#spb-btn:focus-visible,#spb button:focus-visible,#spb-in:focus-visible{outline:2px solid #fff;outline-offset:2px}\
#spb-btn svg{width:22px;height:22px;fill:none;stroke:#fff;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}\
#spb-panel{position:fixed;left:18px;bottom:84px;z-index:9991;width:370px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100vh - 110px);display:none;flex-direction:column;background:#0d0d15;color:#f1f1f3;border:1px solid rgba(229,9,20,.4);border-radius:16px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.65)}\
#spb-panel.open{display:flex}\
.spb-h{display:flex;align-items:center;gap:10px;padding:12px 14px;background:linear-gradient(135deg,#1a0508,#12121a);border-bottom:1px solid rgba(229,9,20,.35)}\
.spb-av{width:34px;height:34px;border-radius:50%;background:#e50914;display:grid;place-items:center;font-size:1.05rem}\
.spb-h b{display:block;font:700 .92rem "Space Grotesk",sans-serif}.spb-h small{color:#9aa;font-size:.7rem}\
.spb-x{margin-left:auto;background:none;border:0;color:#aab;font-size:1.3rem;cursor:pointer;line-height:1;padding:4px 8px}\
#spb-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}\
.spb-m{max-width:88%;padding:9px 12px;border-radius:14px;font-size:.86rem;line-height:1.5;word-wrap:break-word}\
.spb-m.bot{align-self:flex-start;background:#1a1a24;border:1px solid rgba(255,255,255,.07);border-bottom-left-radius:4px}\
.spb-m.user{align-self:flex-end;background:#e50914;color:#fff;border-bottom-right-radius:4px}\
.spb-chips{display:flex;flex-wrap:wrap;gap:6px}.spb-chip{border:1px solid rgba(229,9,20,.5);background:transparent;color:#ffd7da;border-radius:16px;padding:5px 11px;font-size:.76rem;cursor:pointer}\
.spb-chip:hover{background:rgba(229,9,20,.18)}\
.spb-cards{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;align-self:stretch;scroll-snap-type:x mandatory}\
.spb-card{flex:0 0 150px;scroll-snap-align:start;background:#12121a;border:1px solid rgba(229,9,20,.25);border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:4px}\
.spb-card .im{height:90px;background:#fff;border-radius:8px;display:grid;place-items:center;overflow:hidden}.spb-card img{max-width:100%;max-height:100%;object-fit:contain}\
.spb-card .n{font-size:.75rem;font-weight:600;line-height:1.25;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.5em}\
.spb-card .o{font-size:.68rem;color:#888;text-decoration:line-through;min-height:1em}.spb-card .p{font:700 .85rem "Space Grotesk",sans-serif;color:#fff}\
.spb-card button,.spb-inv button,.spb-inv a{border:0;border-radius:8px;padding:8px;background:linear-gradient(135deg,#e50914,#ff2d3a);color:#fff;font:700 .74rem "Space Grotesk",sans-serif;cursor:pointer;text-align:center;text-decoration:none;display:block}\
.spb-card button.ghost,.spb-inv .wa{background:#25d366;color:#04210f}\
.spb-card button:disabled{opacity:.6;cursor:default}\
.spb-inv{align-self:stretch;background:#12121a;border:1px solid rgba(229,9,20,.5);border-radius:12px;padding:12px;font-size:.8rem}\
.spb-inv h4{margin:0 0 8px;font:800 .8rem "Space Grotesk",sans-serif;letter-spacing:.05em;color:#ff3b47;text-align:center}\
.spb-inv .r{display:flex;justify-content:space-between;gap:10px;padding:3px 0;border-bottom:1px dashed rgba(255,255,255,.1)}\
.spb-inv .t{font-weight:800;font-size:.92rem;border:0;padding-top:8px}.spb-inv .a{display:flex;flex-direction:column;gap:6px;margin-top:10px}\
.spb-inv .note{color:#9aa;font-size:.68rem;margin-top:6px}\
.spb-typing{display:inline-flex;gap:4px;padding:2px 0}.spb-typing i{width:6px;height:6px;border-radius:50%;background:#e50914;animation:spb-b 1s infinite ease-in-out}\
.spb-typing i:nth-child(2){animation-delay:.15s}.spb-typing i:nth-child(3){animation-delay:.3s}\
@keyframes spb-b{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}\
.spb-f{display:flex;gap:8px;padding:10px;border-top:1px solid rgba(255,255,255,.08);background:#12121a}\
#spb-in{flex:1;min-width:0;background:#1a1a24;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:9px 14px;color:#fff;font-size:.86rem}\
#spb-send{width:38px;height:38px;border:0;border-radius:50%;background:#e50914;color:#fff;cursor:pointer;font-size:1rem}\
#spb-send:disabled{opacity:.5}\
@media(max-width:600px){#spb-panel{left:8px;right:8px;bottom:78px;width:auto;max-width:none;height:calc(100vh - 100px)}#spb-btn{left:12px;bottom:18px}}\
@media(prefers-reduced-motion:reduce){#spb-log{scroll-behavior:auto}.spb-typing i{animation:none}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- DOM ---------- */
  var root = document.createElement('div');
  root.id = 'spb';
  root.className = 'sp-no-invert'; // keeps colours correct when the site is in light theme
  root.innerHTML =
    '<button id="spb-btn" type="button" aria-label="Open SmartParts AI chat" aria-expanded="false">' +
    '<svg viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg><span>Chat with us</span></button>' +
    '<section id="spb-panel" role="dialog" aria-label="SmartParts AI Assistant">' +
    '<div class="spb-h"><div class="spb-av">🤖</div><div><b>SmartParts AI Assistant</b><small>● Online 24/7</small></div>' +
    '<button class="spb-x" type="button" aria-label="Close chat">&times;</button></div>' +
    '<div id="spb-log" aria-live="polite"></div>' +
    '<div class="spb-f"><input id="spb-in" type="text" maxlength="500" placeholder="මෙතන type කරන්න..." autocomplete="off">' +
    '<button id="spb-send" type="button" aria-label="Send">➤</button></div></section>';
  document.body.appendChild(root);

  var $ = function (id) { return document.getElementById(id); };
  var panel = $('spb-panel'), log = $('spb-log'), input = $('spb-in'), send = $('spb-send'), btn = $('spb-btn');

  function scroll() { log.scrollTop = log.scrollHeight; }
  function addMsg(role, text) {
    var d = document.createElement('div');
    d.className = 'spb-m ' + role;
    d.innerHTML = fmt(text);
    log.appendChild(d); scroll(); return d;
  }

  function addCards(cards) {
    if (!cards || !cards.length) return;
    var w = document.createElement('div'); w.className = 'spb-cards';
    w.innerHTML = cards.map(function (p) {
      var disc = p.orig > p.price;
      return '<div class="spb-card"><div class="im">' + (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.style.visibility=\'hidden\'">' : '') + '</div>' +
        '<div class="n">' + esc(p.name) + '</div><div class="o">' + (disc ? esc(lkr(p.orig)) : '') + '</div><div class="p">' + esc(lkr(p.price)) + '</div>' +
        '<button type="button" data-add="' + esc(p.id) + '">Add to Cart</button>' +
        '<button type="button" class="ghost" data-pick="' + esc(p.name) + '">මේක ගන්නම්</button></div>';
    }).join('');
    log.appendChild(w); scroll();
  }

  // site eke addToCart eka strict id match ekak use karana nisa, real id eka PRODUCTS walin gannawa
  function realId(id) {
    try { var p = (window.PRODUCTS || PRODUCTS).find(function (x) { return String(x.id) === String(id); }); return p ? p.id : null; } catch (e) { return null; }
  }
  // cart eke thiyena qty eka 'qty' wenakan witharak add karanawa (duplicate wenne nehe)
  function cartAdd(id, qty) {
    try {
      var rid = realId(id); if (rid === null) return false;
      var cur = (cart[rid] && cart[rid].qty) || 0;
      for (var i = cur; i < (qty || 1); i++) window.addToCart(rid, true);
      return true;
    } catch (e) { return false; }
  }
  function openCart() { try { window.openCartDrawer(); } catch (e) { location.hash = '#products'; } }

  function addInvoice(inv) {
    if (!inv) return;
    var rows = inv.items.map(function (l) { return '<div class="r"><span>' + esc(l.name) + ' × ' + l.qty + '</span><span>' + esc(lkr(l.price * l.qty)) + '</span></div>'; }).join('');
    var msg = 'Hello SmartParts! 👋 මගේ order එක:\n' + inv.items.map(function (l) { return '- ' + l.name + ' x' + l.qty + ' = ' + lkr(l.price * l.qty); }).join('\n') +
      '\nDelivery (' + inv.city + '): ' + lkr(inv.delivery) + '\nTOTAL: ' + lkr(inv.total) +
      '\nName: ' + inv.name + '\nPhone: ' + inv.phone + '\nCity: ' + inv.city;
    var w = document.createElement('div'); w.className = 'spb-inv';
    w.innerHTML = '<h4>🛒 SMARTPARTS INVOICE</h4>' +
      '<div class="r"><span>👤 ' + esc(inv.name) + '</span><span>📞 ' + esc(inv.phone) + '</span></div>' +
      '<div class="r"><span>📍 Delivery City</span><span>' + esc(inv.city) + '</span></div>' + rows +
      '<div class="r"><span>🚚 Delivery Fee</span><span>' + esc(lkr(inv.delivery)) + '</span></div>' +
      '<div class="r t"><span>💰 TOTAL</span><span>' + esc(lkr(inv.total)) + '</span></div>' +
      (inv.deliveryConfirmed ? '' : '<div class="note">⚠️ Delivery fee එක checkout එකේදී තහවුරු වෙනවා.</div>') +
      '<div class="a"><button type="button" data-checkout="1">✅ Checkout & Pay</button>' +
      '<a class="wa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(msg) + '">📲 WhatsApp එකෙන් Order කරන්න</a></div>' +
      '<div class="note">Card / LankaQR / Bank Transfer checkout එකේදී තෝරන්න පුළුවන්.</div>';
    w._inv = inv;
    log.appendChild(w); scroll();
  }

  /* ---------- events ---------- */
  function setOpen(o) {
    panel.classList.toggle('open', o);
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    if (o) { if (!log.children.length) start(); setTimeout(function () { input.focus(); }, 50); }
  }
  btn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  root.querySelector('.spb-x').addEventListener('click', function () { setOpen(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false); });

  log.addEventListener('click', function (e) {
    var t = e.target;
    var chip = t.closest && t.closest('.spb-chip'); if (chip) { ask(chip.textContent); return; }
    var add = t.closest && t.closest('[data-add]');
    if (add) {
      var ok = cartAdd(add.getAttribute('data-add'), 1);
      add.textContent = ok ? '✓ Added' : 'Cart එකට add කරන්න බැරි වුණා'; add.disabled = ok;
      if (ok) openCart(); return;
    }
    var pick = t.closest && t.closest('[data-pick]'); if (pick) { ask('මම "' + pick.getAttribute('data-pick') + '" ගන්නම්'); return; }
    var co = t.closest && t.closest('[data-checkout]');
    if (co) {
      var inv = co.closest('.spb-inv')._inv, ok2 = true;
      inv.items.forEach(function (l) { if (!cartAdd(l.id, l.qty)) ok2 = false; });
      openCart();
      if (!ok2) addMsg('bot', 'Cart එකට add කරන්න බැරි වුණා. කරුණාකර WhatsApp button එක පාවිච්චි කරන්න 🙏');
    }
  });

  function start() {
    addMsg('bot', GREETING);
    var c = document.createElement('div'); c.className = 'spb-chips';
    c.innerHTML = CHIPS.map(function (x) { return '<button type="button" class="spb-chip">' + esc(x) + '</button>'; }).join('');
    log.appendChild(c);
  }

  function ask(text) {
    text = String(text || '').trim();
    if (!text || busy) return;
    var chips = log.querySelector('.spb-chips'); if (chips) chips.remove();
    addMsg('user', text);
    history.push({ role: 'user', text: text });
    input.value = '';
    busy = true; send.disabled = true;
    var typing = document.createElement('div'); typing.className = 'spb-m bot';
    typing.innerHTML = '<span class="spb-typing"><i></i><i></i><i></i></span>';
    log.appendChild(typing); scroll();

    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        typing.remove();
        var reply = d.reply || 'සමාවෙන්න, ආයෙත් try කරන්න 🙏';
        addMsg('bot', reply);
        history.push({ role: 'bot', text: reply });
        addCards(d.cards);
        addInvoice(d.invoice);
      })
      .catch(function () {
        typing.remove();
        history.pop(); // let the customer retry
        var m = addMsg('bot', '');
        m.innerHTML = 'සමාවෙන්න, දැන් connect වෙන්න බැහැ 😔 කරුණාකර <a href="https://wa.me/' + WA + '" target="_blank" rel="noopener" style="color:#25d366">WhatsApp</a> එකෙන් අපිට කතා කරන්න.';
      })
      .finally(function () { busy = false; send.disabled = false; input.focus(); });
  }

  send.addEventListener('click', function () { ask(input.value); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); ask(input.value); } });
})();
