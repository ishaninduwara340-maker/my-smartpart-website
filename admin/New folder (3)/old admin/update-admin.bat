@echo off
title SmartPart Admin Auto Update Script
echo ==========================================
echo    Updating SmartPart Admin Panel...
echo ==========================================
echo.

:: Stage all changes
git add .

:: Commit changes with automated timestamp
git commit -m "Auto update admin panel: %date% %time%"

:: Force push to main branch
git push origin main --force

echo.
echo ==========================================
echo    Admin Panel Updated Successfully!
echo ==========================================
pause