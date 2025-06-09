// Email Configuration Verification Script
// Run this in browser console to verify your email setup

function verifyEmailConfiguration() {
    console.log("🔍 VERIFYING EMAIL CONFIGURATION");
    console.log("=".repeat(40));
    
    const provider = localStorage.getItem("email_provider");
    const gmailUser = localStorage.getItem("gmail_user");
    const gmailPassword = localStorage.getItem("gmail_app_password");
    const outlookUser = localStorage.getItem("outlook_user");
    const outlookPassword = localStorage.getItem("outlook_app_password");
    
    console.log(`📧 Email Provider: ${provider || "❌ NOT SET"}`);
    console.log("");
    
    if (provider === "gmail") {
        console.log("✅ Gmail SMTP Selected");
        console.log(`   User: ${gmailUser || "❌ Missing"}`);
        console.log(`   Password: ${gmailPassword ? "✅ Set" : "❌ Missing"}`);
        
        if (gmailUser && gmailPassword) {
            console.log("🎉 Gmail configuration looks complete!");
            console.log("💡 Try submitting a panel recut request to test email sending");
        } else {
            console.log("⚠️  Gmail configuration incomplete");
        }
    } else if (provider === "outlook") {
        console.log("✅ Outlook SMTP Selected");
        console.log(`   User: ${outlookUser || "❌ Missing"}`);
        console.log(`   Password: ${outlookPassword ? "✅ Set" : "❌ Missing"}`);
        
        if (outlookUser && outlookPassword) {
            console.log("🎉 Outlook configuration looks complete!");
            console.log("💡 Try submitting a panel recut request to test email sending");
        } else {
            console.log("⚠️  Outlook configuration incomplete");
        }    } else if (provider === "resend") {
        console.log("❌ Resend API selected - this is no longer supported!");
        console.log("💡 Resend has been removed to fix CORS issues");
        console.log("🔧 Please switch to Gmail or Outlook SMTP instead");
    } else {
        console.log("❌ NO EMAIL PROVIDER SET");
        console.log("💡 This is why you're getting email errors!");
        console.log("");
        console.log("🔧 To fix, run one of these:");
        console.log('   localStorage.setItem("email_provider", "gmail");');
        console.log('   localStorage.setItem("email_provider", "outlook");');
    }
    
    console.log("");
    console.log("🚀 Email Server Status:");
    fetch('http://127.0.0.1:3001/health')
        .then(response => response.json())
        .then(data => {
            console.log("✅ Email server is running:", data);
        })
        .catch(error => {
            console.log("❌ Email server not responding:", error.message);
            console.log("💡 Make sure email server is running: node email-server/server.js");
        });
}

// Auto-run the verification
verifyEmailConfiguration();
