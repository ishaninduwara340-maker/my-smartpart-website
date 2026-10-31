SmartParts - updated files (copy into your existing "website folder", replace when asked)

index.html           -> website folder\index.html   (replace)
sp-settings.js       -> website folder\sp-settings.js (new)
admin\admin.html     -> website folder\admin\        (replace)
supabase\settings.sql-> run ONCE in Supabase > SQL Editor (do not upload to Netlify)

Then deploy to Netlify as usual. Other pages (policy/terms/profile.html) can also get
<script src="sp-settings.js"></script> before </body> to share the same logo/colors.
Preview during maintenance mode: add ?preview=1 to the site URL.
