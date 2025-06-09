# Gmail SMTP Setup Guide

## 🚀 Gmail SMTP Configuration

The Panel Recut system now uses **SMTP only** for reliable email delivery without CORS issues.

### Gmail SMTP Setup (Recommended)

1. **Enable 2-Factor Authentication**
   - Go to [myaccount.google.com](https://myaccount.google.com)
   - Security → 2-Step Verification → Turn on

2. **Generate App Password**
   - In Security settings → App passwords
   - Select "Mail" and generate password
   - Copy the 16-character password (no spaces)

3. **Configure in Your App**
   - Navigate to: `http://127.0.0.1:8080/email-test`
   - Select "Gmail" provider
   - Enter your Gmail email and app password
   - Click "Save Credentials"
   - Test the connection

### Quick Browser Console Setup

If you prefer to configure via browser console:

1. Open your app: `http://127.0.0.1:8080`
2. Press F12 → Console tab
3. Run these commands:

```javascript
localStorage.setItem("email_provider", "gmail");
localStorage.setItem("gmail_user", "your.email@gmail.com");
localStorage.setItem("gmail_app_password", "your-16-char-app-password");
```

### Verification

Test your setup by running in browser console:
```javascript
console.log("Provider:", localStorage.getItem("email_provider"));
console.log("Gmail User:", localStorage.getItem("gmail_user"));
console.log("Has Password:", !!localStorage.getItem("gmail_app_password"));
```

## 🎯 Next Steps

1. Configure Gmail SMTP (5 minutes)
2. Test email sending via Email Test Page
3. Submit a panel recut request to verify
4. Check email server logs if issues arise

## 📧 Email Server

Make sure the email server is running:
```bash
cd email-server
npm start
```

Server runs on port 3001 and handles Gmail SMTP connections.
