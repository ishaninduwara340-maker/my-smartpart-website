/* SmartParts — injects the shared header + footer into sub pages.
   Put <div id="spxHead" data-active="about"></div> at the top of <body>
   and <div id="spxFoot"></div> at the bottom. */
(function () {
  var SOC = {
    facebook: 'https://web.facebook.com/profile.php?id=61587377462979',
    instagram: '#',
    youtube: 'http://www.youtube.com/@AraliyaDesign-x2s',
    discord: '#',
    tiktok: '#'
  };
  function J(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  var user = J('sp_currentUser', null);
  var first = user && user.name ? String(user.name).split(' ').slice(0, 2).join(' ') : '';
  var wl = user ? (J('sp_wishlists', {})[user.email] || []).length : 0;
  var cart = J('sp_cart', {}); var cartN = 0;
  Object.keys(cart || {}).forEach(function (k) { cartN += (cart[k] && cart[k].qty) || 0; });
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var I = {
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7.5"/><line x1="21" y1="21" x2="16.7" y2="16.7"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.800-8 11-8 11z"/></svg>',
    cart: '<svg viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h8.800a1 1 0 0 0 1-.8L20 7H6"/></svg>',
    home: '<svg class="ho" viewBox="0 0 24 24" style="fill:var(--cyan);stroke:none"><path d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3z"/></svg>',
    car: '<svg class="car" viewBox="0 0 24 24"><polyline points="5,9 12,16 19,9"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M21 3 3 10.500l7 2.500 2.500 7z"/><line x1="21" y1="3" x2="10" y2="13"/></svg>',
    bank: '<svg viewBox="0 0 24 24"><path d="M3 10 12 4l9 6M5 10v8M9.500 10v8M14.500 10v8M19 10v8M3 20h18"/></svg>',
    up: '<svg viewBox="0 0 24 24"><polyline points="6,15 12,9 18,15"/></svg>'
  };
  var SIC = {
    facebook: '<svg viewBox="0 0 24 24"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 3-3 3 3 0 0 1-3 3zM17.200 5.800a1.100 1.100 0 1 0 1.100 1.100 1.100 1.100 0 0 0-1.100-1.100zM12 2.500c-2.600 0-2.900 0-3.900.1a7 7 0 0 0-2.300.4 4.700 4.700 0 0 0-1.700 1.100 4.700 4.700 0 0 0-1.100 1.700 7 7 0 0 0-.4 2.300c-.1 1-.1 1.300-.1 3.900s0 2.900.1 3.900a7 7 0 0 0 .4 2.300 4.700 4.700 0 0 0 1.100 1.700 4.700 4.700 0 0 0 1.700 1.100 7 7 0 0 0 2.300.4c1 .1 1.300.1 3.900.1s2.900 0 3.900-.1a7 7 0 0 0 2.300-.4 4.900 4.900 0 0 0 2.800-2.800 7 7 0 0 0 .4-2.300c.1-1 .1-1.300.1-3.900s0-2.900-.1-3.900a7 7 0 0 0-.4-2.300 4.700 4.700 0 0 0-1.100-1.700 4.700 4.700 0 0 0-1.700-1.100 7 7 0 0 0-2.300-.4c-1-.1-1.300-.1-3.900-.1z" fill-rule="evenodd" opacity=".0"/><rect x="3.500" y="3.500" width="17" height="17" rx="5" fill="none" stroke="currentColor" stroke-width="1.800" style="stroke:var(--c,#00e5ff)"/><circle cx="12" cy="12" r="4" fill="none" style="stroke:var(--c,#00e5ff)" stroke-width="1.800"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><path d="M23.500 6.200a3 3 0 0 0-2.100-2.100C19.500 3.500 12 3.500 12 3.500s-7.500 0-9.400.6A3 3 0 0 0 .5 6.200C0 8.100 0 12 0 12s0 3.900.5 5.800a3 3 0 0 0 2.100 2.100c1.900.6 9.400.6 9.400.6s7.500 0 9.400-.6a3 3 0 0 0 2.100-2.100c.5-1.900.5-5.800.5-5.800s0-3.900-.5-5.800zM9.600 15.600V8.400l6.200 3.600z"/></svg>',
    discord: '<svg viewBox="0 0 24 24"><path d="M20.300 4.400A19 19 0 0 0 15.600 3l-.2.400a17 17 0 0 0-6.800 0L8.400 3a19 19 0 0 0-4.700 1.400C.700 8.800-.1 13.100.3 17.300a19 19 0 0 0 5.800 2.900l1.200-1.900a12 12 0 0 1-1.900-.9l.5-.4a13.600 13.600 0 0 0 11.600 0l.5.400a12 12 0 0 1-1.900.9l1.200 1.900a19 19 0 0 0 5.800-2.900c.5-4.900-.8-9.200-3.600-12.900zM8.700 14.700c-1.100 0-2-1-2-2.200s.9-2.200 2-2.200 2 1 2 2.200-.9 2.200-2 2.200zm6.600 0c-1.100 0-2-1-2-2.200s.9-2.200 2-2.200 2 1 2 2.200-.9 2.200-2 2.200z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M19.600 6.700a4.800 4.800 0 0 1-3-1.600A4.800 4.800 0 0 1 15.400 2h-3.300v13.300a2.700 2.700 0 1 1-2.700-2.700c.3 0 .6 0 .8.1V9.300a6 6 0 1 0 5.200 5.900V8.600a8 8 0 0 0 4.700 1.500V6.800a4.800 4.800 0 0 1 0-.1z"/></svg>'
  };
  var act = (document.getElementById('spxHead') || {}).dataset ? document.getElementById('spxHead').dataset.active : '';
  function nav(k, href, label, extra) { return '<a href="' + href + '"' + (act === k ? ' class="on"' : '') + '>' + (extra || '') + label + '</a>'; }

  var head = '<header class="spx-head"><div class="spx-top">' +
    '<a class="spx-logo" href="index.html" aria-label="SmartParts home"><img src="assets/logo-s.png" alt=""><span><b>Smart<em>Parts</em></b><small>Tech &amp; Gaming Accessories</small></span></a>' +
    '<form class="spx-search" action="index.html" method="get" role="search">' + I.search + '<input type="search" name="q" placeholder="Search for products, brands..." aria-label="Search"></form>' +
    '<div class="spx-icons">' +
    '<a class="spx-ic" href="' + (user ? 'profile.html' : 'index.html?open=login') + '">' + I.user + '<span class="t">' + (user ? esc(first) : 'Login') + '<small>My Account \u25BE</small></span></a>' +
    '<a class="spx-ic pink" href="index.html?open=wishlist">' + I.heart + (wl ? '<i class="bd">' + wl + '</i>' : '') + '<span class="t">Wishlist<small>' + wl + '</small></span></a>' +
    '<a class="spx-ic" href="index.html?open=cart">' + I.cart + (cartN ? '<i class="bd">' + cartN + '</i>' : '') + '<span class="t">Cart<small>' + cartN + '</small></span></a>' +
    '</div><button class="spx-burger" aria-label="Menu" onclick="document.querySelector(\'.spx-nav\').classList.toggle(\'open\')">' + I.menu + '</button></div>' +
    '<nav class="spx-nav"><div class="spx-nav-in">' +
    nav('home', 'index.html', 'Home', I.home) + nav('shop', 'index.html#products', 'Shop', '').replace('</a>', I.car + '</a>') +
    nav('cats', 'index.html#products', 'Categories', '').replace('</a>', I.car + '</a>') +
    nav('about', 'policy.html#about', 'About') + nav('contact', 'policy.html#contact', 'Contact') +
    '<span class="spx-tag">PLAY LIKE A PRO</span></div></nav></header>';

  var soc = Object.keys(SOC).map(function (k) { return '<a href="' + SOC[k] + '" target="_blank" rel="noopener" aria-label="' + k + '">' + SIC[k] + '</a>'; }).join('');
  var foot = '<footer class="spx-foot"><div class="spx-foot-grid">' +
    '<div><a class="spx-logo" href="index.html"><img src="assets/logo-s.png" alt=""><span><b>Smart<em>Parts</em></b><small>Tech &amp; Gaming Accessories</small></span></a>' +
    '<p>Your one-stop destination for premium gaming &amp; tech accessories. Play better, work smarter.</p><div class="spx-soc">' + soc + '</div></div>' +
    '<div class="lk"><h4>Quick Links</h4><a href="index.html">Home</a><a href="index.html#products">Shop</a><a href="index.html#products">Gaming Accessories</a><a href="index.html#products">Mobile Accessories</a><a href="index.html#products">Computer &amp; Laptop Accessories</a><a href="policy.html#about">About Us</a><a href="policy.html#contact">Contact Us</a></div>' +
    '<div class="lk"><h4>Customer Service</h4><a href="index.html?open=track">Track Your Order</a><a href="policy.html#returns">Returns &amp; Exchange</a><a href="policy.html#terms">Shipping Information</a><a href="terms.html">Terms &amp; Conditions</a><a href="terms.html#privacy">Privacy Policy</a><a href="index.html#faq">FAQ</a></div>' +
    '<div class="spx-news"><h4>Subscribe to Our Newsletter</h4><p style="margin:0 0 12px;font-size:.88rem">Get the latest deals, new arrivals<br>and gaming tips straight to your inbox.</p>' +
    '<form onsubmit="event.preventDefault();var i=this.email;if(i.value.indexOf(\'@\')>0){i.value=\'\';i.placeholder=\'Thanks for subscribing!\'}"><input type="email" name="email" placeholder="Enter your email address" aria-label="Email"><button aria-label="Subscribe">' + I.send + '</button></form>' +
    '<span class="tag2">PLAY<br>LIKE A PRO</span></div></div>' +
    '<div class="spx-foot-bot"><div class="spx-foot-bot-in"><div>\u00A9 2026 SmartParts. All rights reserved.</div>' +
    '<div class="spx-pay"><span>We Accept</span><span class="pc visa">VISA</span><span class="pc mc"><i></i><i></i></span><span class="pc koko">KOKO</span><span class="pc ez">eZ Cash</span><span class="pc bank">' + I.bank + 'Bank<br>Transfer</span></div></div></div></footer>' +
    '<button class="spx-totop" id="spxTop" aria-label="Back to top" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">' + I.up + '</button>';

  var h = document.getElementById('spxHead'), f = document.getElementById('spxFoot');
  if (h) h.outerHTML = head; if (f) f.outerHTML = foot;
  var t = document.getElementById('spxTop');
  window.addEventListener('scroll', function () { if (t) t.style.display = window.scrollY > 500 ? 'grid' : 'none'; }, { passive: true });
})();
