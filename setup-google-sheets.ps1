# Google Sheets Setup Script
# Run this in PowerShell to quickly set up your Google Sheets integration

Write-Host "Google Apps Script & Google Sheets Integration Setup" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📋 STEP 1: Create Google Sheet" -ForegroundColor Yellow
Write-Host "1. Go to: https://sheets.google.com"
Write-Host "2. Create new spreadsheet named 'Panel Recut Requests Database'"
Write-Host "3. Add these headers in row 1:"
Write-Host "   A1: Submission ID"
Write-Host "   B1: Timestamp"
Write-Host "   C1: Glider Name"
Write-Host "   D1: Order Number"
Write-Host "   E1: Reason"
Write-Host "   F1: Requested By"
Write-Host "   G1: Notes"
Write-Host "   H1: Status"
Write-Host "   I1: Panel Count"
Write-Host "   J1: Panel Details"
Write-Host "   K1: Last Updated"

Write-Host "`n⚙️ STEP 2: Set up Google Apps Script" -ForegroundColor Yellow
Write-Host "1. Go to: https://script.google.com"
Write-Host "2. Create new project named 'Panel Recut Data Manager'"
Write-Host "3. Replace Code.gs content with the enhanced version"

Write-Host "`n🔧 STEP 3: Configure the script" -ForegroundColor Yellow
Write-Host "1. Copy your Google Sheet ID from the URL"
Write-Host "2. Update SPREADSHEET_ID in the script"
Write-Host "3. Save the script (Ctrl+S)"

Write-Host "`n🚀 STEP 4: Deploy the script" -ForegroundColor Yellow
Write-Host "1. Click Deploy > New deployment"
Write-Host "2. Type: Web app"
Write-Host "3. Execute as: Me"
Write-Host "4. Who has access: Anyone"
Write-Host "5. Copy the web app URL"

Write-Host "`n🧪 STEP 5: Test the integration" -ForegroundColor Yellow
Write-Host "1. Run testSaveData() function in Apps Script"
Write-Host "2. Check your Google Sheet for new data"
Write-Host "3. Test status updates with testStatusUpdate()"

Write-Host "`n📁 Files created:" -ForegroundColor Green
Write-Host "✅ GOOGLE_SHEETS_INTEGRATION_GUIDE.md - Complete setup guide"
Write-Host "✅ Code-Enhanced.gs - Enhanced Google Apps Script code"

Write-Host "`n🔗 Useful Links:" -ForegroundColor Cyan
Write-Host "Google Sheets: https://sheets.google.com"
Write-Host "Apps Script: https://script.google.com"
Write-Host "Documentation: https://developers.google.com/apps-script"

Write-Host "`n✨ Next Steps:" -ForegroundColor Magenta
Write-Host "1. Follow the complete guide in GOOGLE_SHEETS_INTEGRATION_GUIDE.md"
Write-Host "2. Use Code-Enhanced.gs as your Apps Script code"
Write-Host "3. Test thoroughly before connecting to your frontend"
Write-Host "4. Monitor the execution logs for any issues"

Write-Host "`nSetup script completed! Check the guide for detailed instructions." -ForegroundColor Green
