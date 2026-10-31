@echo off
chcp 65001 > nul
title SmartParts - Auto Update
cd /d "%~dp0"

echo ==========================================
echo    SmartParts - Auto Update and Publish
echo ==========================================
echo.

where git >nul 2>nul
if errorlevel 1 (
  echo ERROR: Git install karala naha. https://git-scm.com eken install karanna.
  pause
  exit /b 1
)

for /f "delims=" %%i in ('powershell -nologo -noprofile -command "Get-Date -Format 'yyyy-MM-dd HH:mm'"') do set NOW=%%i

rem Whole script is one block so it keeps working even if git rewrites this file.
(
  if not exist ".git" (
    echo First time setup - GitHub repo eka connect karanawa...
    git init
    git branch -M main
    git remote add origin https://github.com/ishaninduwara340-maker/my-smartpart-website.git
  )

  git config user.email >nul 2>nul || git config user.email "smartparts@users.noreply.github.com"
  git config user.name >nul 2>nul || git config user.name "SmartParts"

  if exist ".git\MERGE_HEAD" (
    echo Aluth wenaskam nawathune merge ekak thibba - eka nawaththanawa...
    git merge --abort
  )

  findstr /x /c:".netlify" .gitignore >nul 2>nul || (echo.& echo .netlify)>>.gitignore

  echo [1/3] Changes save karanawa...
  git add -A >nul 2>nul
  git commit -m "Update %NOW%" >nul 2>nul

  echo [2/3] GitHub eke latest eka ganna - oyage files wala wenaskam thiyaganna...
  git pull origin main --no-rebase --no-edit --allow-unrelated-histories -X ours
  if errorlevel 1 (
    echo.
    echo ERROR: Pull eka fail una. Mata screenshot ekak ewanna.
    pause
    exit /b 1
  )

  echo [3/3] GitHub ekata upload karanawa...
  git push -u origin main
  if errorlevel 1 (
    echo.
    echo ERROR: Upload eka fail una. Internet eka hari GitHub login eka hari balanna.
    pause
    exit /b 1
  )

  echo.
  echo ==========================================
  echo    DONE! Netlify eka auto publish karanawa.
  echo    Minute 1-2kin site eka update wenawa.
  echo ==========================================
  timeout /t 5
  exit /b 0
)
