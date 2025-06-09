# Email System Status Checker - PowerShell Version
# Run this to verify the email system is ready for configuration

Write-Host "🔍 PANEL RECUT EMAIL SYSTEM STATUS CHECK" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test email server connection
Write-Host "📧 Testing email server..." -ForegroundColor Yellow
try {
    $emailServerResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3001/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Email server is running: $($emailServerResponse.service)" -ForegroundColor Green
    $emailServerOk = $true
} catch {
    Write-Host "❌ Email server connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure to run: cd email-server && npm start" -ForegroundColor Blue
    $emailServerOk = $false
}

# Test frontend connection
Write-Host ""
Write-Host "🌐 Testing frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8080" -Method Get -TimeoutSec 5
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✅ Frontend is running" -ForegroundColor Green
        $frontendOk = $true
    } else {
        Write-Host "❌ Frontend responded with status: $($frontendResponse.StatusCode)" -ForegroundColor Red
        $frontendOk = $false
    }
} catch {
    Write-Host "❌ Frontend connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure to run: npm run dev" -ForegroundColor Blue
    $frontendOk = $false
}

# System status summary
Write-Host ""
Write-Host "📊 SYSTEM STATUS SUMMARY" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
$emailStatus = if ($emailServerOk) { "✅ RUNNING" } else { "❌ NOT RUNNING" }
$frontendStatus = if ($frontendOk) { "✅ RUNNING" } else { "❌ NOT RUNNING" }
Write-Host "Email Server (port 3001): $emailStatus"
Write-Host "Frontend (port 8080):     $frontendStatus"

if ($emailServerOk -and $frontendOk) {
    Write-Host ""
    Write-Host "🎉 SYSTEM READY FOR EMAIL CONFIGURATION!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
    Write-Host "1. Open: http://127.0.0.1:8080/email-test"
    Write-Host "2. Configure Gmail or Outlook SMTP"
    Write-Host "3. Test email sending"
    Write-Host "4. Submit a panel recut request to verify"
    
    Write-Host ""
    Write-Host "🔗 USEFUL LINKS:" -ForegroundColor Yellow
    Write-Host "• Email Test Page: http://127.0.0.1:8080/email-test"
    Write-Host "• Main App: http://127.0.0.1:8080"
    Write-Host "• Email Server Health: http://127.0.0.1:3001/health"
} else {
    Write-Host ""
    Write-Host "⚠️  SYSTEM NOT READY" -ForegroundColor Yellow
    Write-Host "Please start the missing services before proceeding."
}
