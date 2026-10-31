/* SmartParts - applies the admin "Settings" (Supabase site_settings.site_config) to the storefront.
   Loaded at the end of index.html:  <script src="sp-settings.js"></script>  */
(async function () {
  var URL = 'https://qugzplavwjphcsvhhmce.supabase.co';
  var KEY = 'sb_publishable_Yt4U1VouugJzfo1d_CzKxQ_C1bclvcp';
  var c;
  try {
    var r = await fetch(URL + '/rest/v1/site_settings?key=eq.site_config&select=value', { headers: { apikey: KEY, Authorization: 'Bearer ' + KEY } });
    c = ((await r.json())[0] || {}).value;
  } catch (e) { return; }
  if (!c) return;
  window.SP_CFG = c;

  /* Maintenance mode (add ?preview=1 to the URL to bypass) */
  if (c.maintenance && location.search.indexOf('preview=1') < 0) {
    document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:#0d0d15;color:#fff;font-family:sans-serif;padding:20px"><div><h1>🚧 ' + (c.site_name || 'SmartParts') + '</h1><p>' + (c.maint_msg || "We'll be back soon!") + '</p></div></div>';
    return;
  }

  var OLD_PHONES = ['076 739 6487', '076-7396487', '0767396487', '+94767396487'];
  var OLD_EMAIL = 'ishaninduwara36@gmail.com';
  var OLD_WA = '94767396487';
  var digits = function (s) { return String(s || '').replace(/\D/g, ''); };
  function intl(p) { var d = digits(p); return d.charAt(0) === '0' ? '94' + d.slice(1) : d; }

  function apply() {
    var root = document.documentElement.style;

    /* Logo: header, footer, profile, checkout, favicon */
    var imgs = document.querySelectorAll('img[data-splogo], img[src*="logo-s"], img[data-sp="logo"]');
    for (var i = 0; i < imgs.length; i++) {
      if (c.logo_url) { imgs[i].src = c.logo_url; imgs[i].style.display = ''; }
      else if ('logo_url' in c) { imgs[i].style.display = 'none'; }
    }
    if (c.logo_url) { var f = document.querySelector('link[rel~="icon"]'); if (f) f.href = c.logo_url; }
    if (c.site_name) document.title = c.site_name + (c.tagline ? ' — ' + c.tagline : '');

    /* Colors */
    if (c.primary) {
      var h = c.primary.replace('#', ''), n = parseInt(h, 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
      var rgba = function (a) { return 'rgba(' + R + ',' + G + ',' + B + ',' + a + ')'; };
      var dark = '#' + [R, G, B].map(function (v) { return ('0' + Math.round(v * 0.78).toString(16)).slice(-2); }).join('');
      root.setProperty('--accent', c.primary); root.setProperty('--sp-red', c.primary);
      root.setProperty('--accent-dark', dark); root.setProperty('--accent-glow', rgba(0.2));
      root.setProperty('--accent-dim', rgba(0.1)); root.setProperty('--border', rgba(0.15)); root.setProperty('--border-strong', rgba(0.3));
    }
    if (c.accent) { root.setProperty('--sp-red2', c.accent); root.setProperty('--fire-yellow', c.accent); }

    /* Address: fill [data-sp="address"] or add a line to the footer */
    if (c.address) {
      var ad = document.querySelectorAll('[data-sp="address"]');
      if (ad.length) ad.forEach(function (e) { e.textContent = c.address; });
      else {
        var ft = document.querySelector('[data-sp="footer_text"]');
        if (ft && ft.parentNode && !document.getElementById('spAddrLine')) {
          var d = document.createElement('div'); d.id = 'spAddrLine'; d.setAttribute('data-sp', 'address');
          d.style.cssText = 'opacity:.8;font-size:.85em;margin-top:4px'; d.textContent = '📍 ' + c.address;
          ft.parentNode.insertBefore(d, ft.nextSibling);
        }
      }
    }

    /* Text tags */
    ['tagline', 'footer_text', 'newsletter', 'warranty'].forEach(function (k) {
      if (c[k]) document.querySelectorAll('[data-sp="' + k + '"]').forEach(function (e) { e.textContent = c[k]; });
    });

    /* Phone + email: replace the old defaults in links and visible text */
    var ph = c.phone, em = c.contact_email;
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) { if (ph) a.href = 'tel:+' + intl(ph); });
    document.querySelectorAll('a[href^="mailto:"]').forEach(function (a) { if (em) a.href = 'mailto:' + em; });
    if (ph || em) {
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), t;
      while ((t = w.nextNode())) {
        if (t.parentNode && /^(SCRIPT|STYLE|TEXTAREA)$/.test(t.parentNode.nodeName)) continue;
        var v = t.nodeValue;
        if (em && v.indexOf(OLD_EMAIL) > -1) v = v.split(OLD_EMAIL).join(em);
        if (ph) OLD_PHONES.forEach(function (o) { if (v.indexOf(o) > -1) v = v.split(o).join(ph); });
        if (v !== t.nodeValue) t.nodeValue = v;
      }
    }

    /* WhatsApp links */
    if (c.whatsapp) {
      var wa = intl(c.whatsapp);
      document.querySelectorAll('a[href*="wa.me/"]').forEach(function (a) {
        a.href = a.href.replace(/wa\.me\/\+?\d+/, 'wa.me/' + wa);
      });
    }

    /* Social links (replace the node so the old "coming soon" handler is dropped) */
    ['facebook', 'instagram', 'tiktok', 'youtube'].forEach(function (k) {
      if (!c[k]) return;
      document.querySelectorAll('[data-sp-link="' + k + '"]').forEach(function (a) {
        var n2 = a.cloneNode(true); n2.href = c[k]; a.parentNode.replaceChild(n2, a);
      });
    });

    /* Toggles */
    if (c.show_payments === false) document.querySelectorAll('.sp-paystrip, .spx-pay, [data-sp="payments"]').forEach(function (e) { e.style.display = 'none'; });
    if (c.chat_on === false) document.querySelectorAll('#spb').forEach(function (e) { e.style.display = 'none'; });
  }

  apply();
  setTimeout(apply, 1500);   /* re-apply after the page's own scripts finish */
  setTimeout(apply, 4000);
})();
