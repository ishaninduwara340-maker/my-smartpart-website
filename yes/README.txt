SmartParts - cleaned folder structure

website\   -> main site (Netlify site: smartpartlk)   index.html, policy/terms/profile, chatbot.js, sp-settings.js,
                                                      netlify\functions\chat.js (AI bot), assets\ (all images)
admin\     -> admin panel (Netlify site: smartpartsadmin)  admin.html + _redirects (REQUIRED) + manifest/icons
_archive\  -> unused old files (CategoryShop.*). Do NOT deploy.

Netlify > Site settings > Environment variables:  GEMINI_API_KEY  (needed for the chat bot)
Preview during maintenance mode: add ?preview=1 to the site URL.

--- SETTINGS (admin > ⚙️ Settings) ---
1. Supabase > SQL Editor > run settings.sql ONCE.
2. Deploy admin\ and website\ again (update-admin.bat / update.bat).
3. Admin > Settings > fill + "Save All Settings". Website applies it on load (sp-settings.js).
Mail: order_email / reply_email / order_mail_text are passed to EmailJS as {{to_email}}, {{reply_to}}, {{extra_text}}.
      Put those variables in your EmailJS templates. EMAILJS_TEMPLATE_ID in website\index.html is still 'YOUR_TEMPLATE_ID' - set the real id.
