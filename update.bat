@echo off
chcp 65001 > nul
echo Auto Updating Site...
git pull origin main --rebase
git add .
git commit -m "Auto Update"
git push origin main
echo Done! Upload completed.
timeout /t 3