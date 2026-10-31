@echo off
title SmartPart Admin Auto Update Script
echo ==========================================
echo    Updating SmartPart Admin Panel...
echo ==========================================
echo.

:: Stage all changes
git add .

:: Commit changes with a simple message (Avoiding date/time formatting issues)
git commit -m "Admin panel auto update"

:: Push to main branch (Removed --force unless strictly needed, standard push is safer)
git push origin main

echo.
echo ==========================================
echo    Admin Panel Updated Successfully!
echo ==========================================
pause