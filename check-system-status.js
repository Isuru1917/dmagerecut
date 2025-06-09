#!/usr/bin/env node

// Email System Status Checker
// Run this to verify the email system is ready for configuration

console.log('🔍 PANEL RECUT EMAIL SYSTEM STATUS CHECK');
console.log('==========================================\n');

// Test email server connection
async function checkEmailServer() {
  console.log('📧 Testing email server...');
  try {
    const response = await fetch('http://127.0.0.1:3001/health');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Email server is running:', data.service);
      return true;
    } else {
      console.log('❌ Email server responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Email server connection failed:', error.message);
    console.log('💡 Make sure to run: cd email-server && npm start');
    return false;
  }
}

// Test frontend connection
async function checkFrontend() {
  console.log('\n🌐 Testing frontend...');
  try {
    const response = await fetch('http://127.0.0.1:8080');
    if (response.ok) {
      console.log('✅ Frontend is running');
      return true;
    } else {
      console.log('❌ Frontend responded with status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend connection failed:', error.message);
    console.log('💡 Make sure to run: npm run dev');
    return false;
  }
}

// Main status check
async function main() {
  const emailServerOk = await checkEmailServer();
  const frontendOk = await checkFrontend();
  
  console.log('\n📊 SYSTEM STATUS SUMMARY');
  console.log('========================');
  console.log(`Email Server (port 3001): ${emailServerOk ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
  console.log(`Frontend (port 8080):     ${frontendOk ? '✅ RUNNING' : '❌ NOT RUNNING'}`);
  
  if (emailServerOk && frontendOk) {
    console.log('\n🎉 SYSTEM READY FOR EMAIL CONFIGURATION!');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Open: http://127.0.0.1:8080/email-test');
    console.log('2. Configure Gmail or Outlook SMTP');
    console.log('3. Test email sending');
    console.log('4. Submit a panel recut request to verify');
    
    console.log('\n🔗 USEFUL LINKS:');
    console.log('• Email Test Page: http://127.0.0.1:8080/email-test');
    console.log('• Main App: http://127.0.0.1:8080');
    console.log('• Email Server Health: http://127.0.0.1:3001/health');
  } else {
    console.log('\n⚠️  SYSTEM NOT READY');
    console.log('Please start the missing services before proceeding.');
  }
}

// Import fetch for Node.js if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);
