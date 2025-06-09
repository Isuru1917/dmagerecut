// Fix Invalid Email Provider Script
// Run this in your browser console (F12) to fix the google-apps-script issue

console.log('🔧 Fixing Invalid Email Provider Configuration');
console.log('='.repeat(50));

const currentProvider = localStorage.getItem('email_provider');
console.log(`Current provider: ${currentProvider}`);

if (currentProvider === 'google-apps-script') {
  console.log('❌ Invalid provider detected: google-apps-script');
  console.log('🧹 Removing invalid provider...');
  localStorage.removeItem('email_provider');
  
  // Check what's available and auto-configure
  const gmailUser = localStorage.getItem('gmail_user');
  const gmailPassword = localStorage.getItem('gmail_app_password');
  const outlookUser = localStorage.getItem('outlook_user');
  const outlookPassword = localStorage.getItem('outlook_app_password');
  
  if (gmailUser && gmailPassword) {
    localStorage.setItem('email_provider', 'gmail');
    console.log('✅ Auto-configured to use Gmail SMTP');
  } else if (outlookUser && outlookPassword) {
    localStorage.setItem('email_provider', 'outlook');
    console.log('✅ Auto-configured to use Outlook SMTP');
  } else {
    console.log('⚠️ No SMTP credentials found. Please configure via Email Test Page: /email-test');
  }
} else if (currentProvider === 'gmail' || currentProvider === 'outlook') {
  console.log('✅ Valid provider already configured');
} else if (!currentProvider) {
  console.log('ℹ️ No provider set - system will auto-detect based on credentials');
} else {
  console.log(`❌ Unknown provider: ${currentProvider}`);
  localStorage.removeItem('email_provider');
  console.log('🧹 Removed invalid provider');
}

console.log('\n📊 Current configuration:');
console.log(`Provider: ${localStorage.getItem('email_provider') || 'auto-detect'}`);
console.log(`Gmail User: ${localStorage.getItem('gmail_user') || 'not set'}`);
console.log(`Gmail Password: ${localStorage.getItem('gmail_app_password') ? 'set' : 'not set'}`);
console.log(`Outlook User: ${localStorage.getItem('outlook_user') || 'not set'}`);
console.log(`Outlook Password: ${localStorage.getItem('outlook_app_password') ? 'set' : 'not set'}`);

console.log('\n🎯 Next steps:');
console.log('1. Refresh the page');
console.log('2. Try submitting a panel recut request');
console.log('3. If still having issues, visit /email-test to configure SMTP');
