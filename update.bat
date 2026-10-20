@echo off
chcp 65001 > nul
echo Auto Updating Site...
git add .
git commit -m "Auto Update"
git pull origin main --allow-unrelated-histories --no-rebase
git push origin main
echo Done! Upload completed.
timeout /t 3