#!/usr/bin/env node

// Quick script to help set up email provider in localStorage
// This is a helper script - you need to run this in your browser console

console.log('🔧 Email Provider Setup Helper');
console.log('===============================');
console.log('');
console.log('To fix the CORS issue, you need to set the email provider in localStorage.');
console.log('');
console.log('📋 OPTION 1: Run this in your browser console (F12):');
console.log('');
console.log('// For Gmail SMTP:');
console.log('localStorage.setItem("email_provider", "gmail");');
console.log('localStorage.setItem("gmail_user", "your.email@gmail.com");');
console.log('localStorage.setItem("gmail_app_password", "your-16-char-app-password");');
console.log('');
console.log('// For Outlook SMTP:');
console.log('localStorage.setItem("email_provider", "outlook");');
console.log('localStorage.setItem("outlook_user", "your.email@outlook.com");');
console.log('localStorage.setItem("outlook_app_password", "your-app-password");');
console.log('');
console.log('📋 OPTION 2: Use the Email Test Page at:');
console.log('http://127.0.0.1:8080/email-test');
console.log('');
console.log('📋 OPTION 3: Navigate to your main app and look for email configuration settings');
console.log('');
console.log('🔍 Current Status Check:');
console.log('You can check what\'s currently set by running this in browser console:');
console.log('console.log("Provider:", localStorage.getItem("email_provider"));');
console.log('console.log("Gmail User:", localStorage.getItem("gmail_user"));');
console.log('console.log("Outlook User:", localStorage.getItem("outlook_user"));');
