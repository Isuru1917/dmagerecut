# CORS Proxy Setup for Google Apps Script

This document explains how to fix CORS issues when connecting to Google Apps Script from a local development server.

## Problem

When testing a web app locally that connects to Google Apps Script, you may encounter CORS (Cross-Origin Resource Sharing) errors like:

```
Access to fetch at 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec' from origin 'http://localhost:8080' has been blocked by CORS policy
```

This happens because Google Apps Script's CORS implementation can be problematic with localhost development servers.

## Solution

We've implemented two solutions:

### 1. CORS-aware Google Apps Script

The `Code-CORS-Fixed.gs` file contains all necessary CORS headers:

- `doGet()` has CORS headers
- `doPost()` has CORS headers
- `createErrorResponse()` has CORS headers
- `doOptions()` function handles preflight requests

### 2. Local CORS Proxy

For development, we've added a CORS proxy that acts as a middleman between your app and Google Apps Script:

```
Your App → Local CORS Proxy → Google Apps Script
```

## Setup Instructions

1. **Deploy your Google Apps Script correctly**:
   - Use the code from `Code-CORS-Fixed.gs`
   - Deploy as a new Web App (new deployment, not updating existing)
   - Set "Execute as" to "Me"
   - Set "Who has access" to "Anyone"
   - Copy the new deployment URL

2. **Start the CORS proxy server**:
   ```
   npm run cors-proxy
   ```
   The proxy will run at: http://localhost:8082/

3. **Start your development server with the proxy**:
   ```
   npm run dev:with-cors
   ```
   Or start both separately:
   ```
   npm run dev
   npm run cors-proxy
   ```

4. **Test the connection**:
   - Open the application
   - Enter your Google Apps Script URL
   - The application will automatically use the CORS proxy in development

5. **Testing CORS directly**:
   - Open `cors-test.html` in your browser
   - Enter your Google Apps Script URL
   - Test both direct connections and proxy connections

## Deployment

For production deployment:
- The CORS proxy is not needed in production
- The application detects when it's in production mode and bypasses the proxy
- Ensure your Google Apps Script has proper CORS headers 

## Troubleshooting

If you're still experiencing issues:

1. **Check your Google Apps Script deployment**:
   - Make sure you created a NEW deployment after changing the code
   - Verify the access settings are correct (Anyone, even anonymous)

2. **Test with the CORS test page**:
   - Use `cors-test.html` to isolate and debug the issue

3. **Clear browser cache**:
   - CORS failures can be cached by the browser
   - Try private/incognito mode or clear your cache
   
4. **Check browser console**:
   - Look for specific error messages that might provide more details

5. **Verify Google Sheet ID**:
   - Make sure your Google Apps Script has the correct Spreadsheet ID
