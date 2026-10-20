@echo off
echo Netlify Site එක Auto Update වෙමින් පවතී...
git add .
git commit -m "Auto Update"
git push origin main
echo Upload වීම අවසන්!
timeout /t 3