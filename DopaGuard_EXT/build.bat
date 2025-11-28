@echo off
setlocal

echo Cleaning old build...
if exist extension rmdir /S /Q extension

echo Creating extension folder...
mkdir extension 2>nul
mkdir extension\icons 2>nul

echo Bundling JS files with esbuild...
npx esbuild src/content_entry.js src/background.js src/popup.js src/utils/auth.js src/utils/api.js ^
 --bundle ^
 --format=esm ^
 --sourcemap ^
 --outdir=extension

if %ERRORLEVEL% neq 0 (
  echo esbuild failed. Exiting.
  exit /b %ERRORLEVEL%
)

echo Copying static files...
copy /Y manifest.json extension\ >nul
copy /Y src\popup.html extension\ >nul
copy /Y src\blocked.jpg extension\ >nul
copy /Y src\dopeguard.jpg extension\ >nul
copy /Y src\adult_keywords.js extension\ >nul

echo Copying icons...
xcopy /S /Y src\icons\* extension\icons\ >nul

echo Build complete. extension/ is ready.
endlocal
pause
