@echo off
echo 🚀 Building DopeGuard Extension...

:: Ensure output folder exists
if not exist "extension" mkdir extension

:: === Bundle content_entry.js ===
echo 🧠 Bundling content_entry.js ...
npx esbuild src/content_entry.js --bundle --platform=browser --minify --target=es2017 --outfile=extension/content_entry.js

:: === Bundle background.js ===
echo ⚙️  Bundling background.js ...
npx esbuild src/background.js --bundle --platform=browser --minify --target=es2017 --outfile=extension/background.bundle.js

:: === Bundle popup.js ===
echo 💬 Bundling popup.js ...
npx esbuild src/popup.js --bundle --platform=browser --minify --target=es2017 --outfile=extension/popup.bundle.js

:: === Copy static assets ===
echo 📦 Copying static assets...
xcopy src\*.html extension\ /Y >nul
xcopy src\*.jpg extension\ /Y >nul
xcopy src\*.png extension\ /Y >nul
xcopy src\*.json extension\ /Y >nul
xcopy src\icons extension\icons\ /E /Y >nul
xcopy src\data extension\data\ /E /Y >nul
xcopy src\model extension\model\ /E /Y >nul

echo ✅ Build complete! Load the 'extension' folder in chrome://extensions
pause
