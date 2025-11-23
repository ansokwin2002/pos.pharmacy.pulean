@echo off
echo ========================================
echo Downloading Khmer Font for PDF Support
echo ========================================
echo.

echo Downloading NotoSansKhmer-Regular.ttf...
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $client = New-Object System.Net.WebClient; $client.DownloadFile('https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf', 'public\fonts\NotoSansKhmer-Regular.ttf')}"

if exist "public\fonts\NotoSansKhmer-Regular.ttf" (
    echo.
    echo ========================================
    echo SUCCESS! Font downloaded successfully!
    echo ========================================
    echo.
    echo File location: public\fonts\NotoSansKhmer-Regular.ttf
    echo.
    echo Next steps:
    echo 1. Restart your development server (npm run dev)
    echo 2. Generate a PDF to test Khmer text
    echo 3. Check browser console for: "Font loaded successfully!"
    echo.
) else (
    echo.
    echo ========================================
    echo FAILED! Could not download font
    echo ========================================
    echo.
    echo Please download manually:
    echo 1. Visit: https://fonts.google.com/noto/specimen/Noto+Sans+Khmer
    echo 2. Click "Download family"
    echo 3. Extract NotoSansKhmer-Regular.ttf
    echo 4. Copy to: public\fonts\NotoSansKhmer-Regular.ttf
    echo.
    echo Or open: http://localhost:3000/fonts/download-fonts.html
    echo.
)

pause
