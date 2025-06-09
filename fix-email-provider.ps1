# Fix Email Provider Configuration
# This script helps reset email provider settings and configure Gmail SMTP

Write-Host "🔧 Email Provider Configuration Fix" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""

# Check if email server is running
Write-Host "📡 Checking email server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:3001/health" -UseBasicParsing -TimeoutSec 5
    $data = $response.Content | ConvertFrom-Json
    if ($data.status -eq "OK") {
        Write-Host "✅ Email server is running and healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Email server returned unexpected response" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Email server is not running" -ForegroundColor Red
    Write-Host "🔧 Please start the email server:" -ForegroundColor Yellow
    Write-Host "   cd email-server" -ForegroundColor Gray
    Write-Host "   npm start" -ForegroundColor Gray
    Write-Host ""
}

# Check if frontend is running
Write-Host "🌐 Checking frontend server status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://127.0.0.1:8080" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Frontend server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend server is not running" -ForegroundColor Red
    Write-Host "🔧 Please start the frontend:" -ForegroundColor Yellow
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "🔧 FIXES TO APPLY:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open your browser to: http://127.0.0.1:8080" -ForegroundColor White
Write-Host "2. Press F12 to open Developer Console" -ForegroundColor White
Write-Host "3. Run these commands to fix the email provider:" -ForegroundColor White
Write-Host ""
Write-Host "// Remove invalid email provider" -ForegroundColor Gray
Write-Host "localStorage.removeItem('email_provider');" -ForegroundColor Yellow
Write-Host ""
Write-Host "// Set Gmail SMTP as default (replace with your Gmail info)" -ForegroundColor Gray
Write-Host "localStorage.setItem('email_provider', 'gmail');" -ForegroundColor Yellow
Write-Host "localStorage.setItem('gmail_user', 'your.email@gmail.com');" -ForegroundColor Yellow
Write-Host "localStorage.setItem('gmail_app_password', 'your-16-char-app-password');" -ForegroundColor Yellow
Write-Host ""
Write-Host "// Check your configuration" -ForegroundColor Gray
Write-Host "console.log('Provider:', localStorage.getItem('email_provider'));" -ForegroundColor Yellow
Write-Host "console.log('Gmail User:', localStorage.getItem('gmail_user'));" -ForegroundColor Yellow
Write-Host "console.log('Has Password:', !!localStorage.getItem('gmail_app_password'));" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Alternative: Use the Email Test Page:" -ForegroundColor White
Write-Host "   http://127.0.0.1:8080/email-test" -ForegroundColor Cyan
Write-Host ""
Write-Host "📧 GMAIL SETUP REMINDER:" -ForegroundColor Magenta
Write-Host "========================" -ForegroundColor Magenta
Write-Host "• Enable 2FA on your Gmail account" -ForegroundColor White
Write-Host "• Generate an App Password (16 characters)" -ForegroundColor White
Write-Host "• Use your full Gmail address" -ForegroundColor White
Write-Host ""
