SmartParts - cleaned folder structure

website\   -> main site (Netlify site: smartpartlk)   index.html, policy/terms/profile, chatbot.js, sp-settings.js,
                                                      netlify\functions\chat.js (AI bot), assets\ (all images)
admin\     -> admin panel (Netlify site: smartpartsadmin)  admin.html + _redirects (REQUIRED) + manifest/icons
_archive\  -> unused old files (CategoryShop.*). Do NOT deploy.

Netlify > Site settings > Environment variables:  GEMINI_API_KEY  (needed for the chat bot)
Preview during maintenance mode: add ?preview=1 to the site URL.
