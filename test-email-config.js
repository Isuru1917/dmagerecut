#!/usr/bin/env node

// Test Email Configuration Fix
// This script helps you verify the email provider setup

console.log('🔧 Testing Email Configuration Fix');
console.log('==================================');
console.log('');

// Test server connection
async function testEmailServer() {
  console.log('📡 Testing email server connection...');
  
  try {
    const response = await fetch('http://127.0.0.1:3001/health');
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Email server is running and healthy');
      return true;
    } else {
      console.log('❌ Email server returned unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.log('❌ Email server connection failed:', error.message);
    console.log('🔧 Make sure the email server is running: npm start in email-server folder');
    return false;
  }
}

// Instructions for browser console testing
function showBrowserInstructions() {
  console.log('');
  console.log('🌐 Browser Console Instructions:');
  console.log('================================');
  console.log('');
  console.log('1. Open your browser to: http://127.0.0.1:8080');
  console.log('2. Press F12 to open developer console');
  console.log('3. Run this command to check current configuration:');
  console.log('');
  console.log('   console.log("Provider:", localStorage.getItem("email_provider"));');
  console.log('   console.log("Gmail User:", localStorage.getItem("gmail_user"));');
  console.log('   console.log("Has Gmail Password:", !!localStorage.getItem("gmail_app_password"));');
  console.log('');
  console.log('4. If no provider is set, configure Gmail SMTP with:');
  console.log('');
  console.log('   localStorage.setItem("email_provider", "gmail");');
  console.log('   localStorage.setItem("gmail_user", "your.email@gmail.com");');
  console.log('   localStorage.setItem("gmail_app_password", "your-16-char-password");');
  console.log('');
  console.log('5. Refresh the page and try submitting a panel recut request');
  console.log('');
  console.log('📋 Alternative: Use the Email Test Page at:');
  console.log('   http://127.0.0.1:8080/email-test');
  console.log('');
}

// Main test function
async function runTests() {
  const serverOk = await testEmailServer();
  
  if (serverOk) {
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('=============');
    console.log('');
    console.log('The email server is running correctly. The CORS issue should be fixed');
    console.log('once you configure the email provider in localStorage.');
    console.log('');
    showBrowserInstructions();
  } else {
    console.log('');
    console.log('❌ Email server is not running. Please start it first:');
    console.log('   cd email-server');
    console.log('   npm start');
  }
}

// Run if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment - just show instructions
  showBrowserInstructions();
}
