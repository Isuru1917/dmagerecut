# Panel Recut Request System - Google Apps Script Setup Guide

## Overview
The Panel Recut Request System has been **fully migrated** from SMTP email services (Gmail/Outlook) to Google Apps Script. This unified solution provides:

- ✅ **Email Notifications**: Automated email sending via Google's infrastructure
- ✅ **Data Storage**: Automatic saving to Google Sheets database
- ✅ **Simplified Configuration**: Single URL setup instead of complex SMTP credentials
- ✅ **Enhanced Reliability**: Google's robust cloud infrastructure
- ✅ **Built-in Security**: OAuth2 authentication through Google

**Migration Status**: ✅ **COMPLETE** - The system now uses Google Apps Script exclusively for both email delivery and data storage.

## What Changed in the Migration

### Before (SMTP System):
- Required separate Gmail/Outlook SMTP configuration
- Complex authentication setup with app passwords
- Email-only functionality (no data persistence)
- Multiple points of failure (SMTP server, authentication, etc.)
- Platform-dependent configuration

### After (Google Apps Script):
- Single Google Apps Script URL configuration
- Built-in Google OAuth2 authentication
- Combined email + Google Sheets data storage
- Single point of configuration and maintenance
- Platform-independent, cloud-based solution

### Files Updated in Migration:
- ✅ `EmailConfigModal.tsx` - Now configures Google Apps Script URL instead of SMTP
- ✅ `EmailTestPageNew.tsx` - Uses `GoogleAppsScriptService` class for testing
- ✅ `damageRequestService.ts` - Integrated with Google Apps Script service
- ✅ `googleAppsScriptService.ts` - Primary service class for all email/data operations
- 🗃️ `gmailEmailService.ts` - Legacy (can be archived)
- 🗃️ `outlookEmailService.ts` - Legacy (can be archived)

## Quick Setup for New Installations

If you're setting up the system from scratch, follow these steps:

### Step 1: Create a Google Sheet
1. **Go to Google Sheets**: https://sheets.google.com
   - Click the "+" button or "Blank" template
   - Name it: "Panel Recut Requests Database"

3. **Set up the column headers** (Row 1):
   ```
   A1: Submission ID
   B1: Timestamp
   C1: Glider Name
   D1: Order Number
   E1: Reason
   F1: Requested By
   G1: Notes
   H1: Status
   I1: Panel Count
   J1: Panel Details
   K1: Last Updated
   ```

4. **Format the headers**:
   - Select row 1
   - Make it bold
   - Add background color (light blue)
   - Freeze row 1 (View → Freeze → 1 row)

5. **Copy the Sheet ID**:
   - From the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
   - Save this ID - you'll need it later

### Step 2: Set Up Google Apps Script Project

1. **Open Google Apps Script**: https://script.google.com
2. **Create a new project**:
   - Click "New Project"
   - Name it: "Panel Recut Data Manager"

3. **Enable Google Sheets API**:
   - In your Apps Script project, click "Libraries" (+ icon on left)
   - No additional libraries needed - Sheets API is built-in

### Step 3: Update Your Google Apps Script Code

Replace your existing `Code.gs` content with the enhanced version from the `google-apps-script/Code-Enhanced.gs` file in your project:

**Note**: The enhanced Google Apps Script code is already available in your project directory. Use the content from `google-apps-script/Code-Enhanced.gs` file.

```javascript
/**
 * Panel Recut Management System - Google Apps Script
 * Handles both email notifications and Google Sheets data storage
 */

// Configuration - CUSTOMIZE THESE VALUES
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your sheet ID
const SHEET_NAME = 'Sheet1'; // Name of the sheet tab
const DEFAULT_COMPANY_NAME = 'Panel Recut Company';
const FROM_EMAIL = Session.getActiveUser().getEmail();

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Handle preflight OPTIONS request
    if (e.parameter && e.parameter.method === 'OPTIONS') {
      return ContentService
        .createTextOutput('')
        .setMimeType(ContentService.MimeType.TEXT)
        .setHeaders(corsHeaders);
    }

    // Parse the request body
    const requestData = JSON.parse(e.postData.contents);
    const { type, request, recipients, content, companyName, requestedBy } = requestData;

    // Use provided company name or default
    const COMPANY_NAME = companyName || DEFAULT_COMPANY_NAME;

    console.log('Received request:', { 
      type, 
      hasRequest: !!request, 
      hasRecipients: !!recipients,
      companyName: COMPANY_NAME,
      requestedBy: requestedBy || 'Not provided'
    });

    let result;
    
    if (type === 'new_request') {
      // Save to Google Sheets first
      const sheetResult = saveRequestToSheet(request, requestedBy);
      
      // Send email notification
      const emailResult = sendNewRequestNotification(request, recipients, COMPANY_NAME, requestedBy);
      
      result = {
        success: sheetResult.success && emailResult.success,
        message: `Sheet: ${sheetResult.message}, Email: ${emailResult.message}`,
        sheetRowNumber: sheetResult.rowNumber,
        submissionId: sheetResult.submissionId
      };
      
    } else if (type === 'status_update') {
      // Update status in Google Sheets
      const sheetResult = updateRequestStatusInSheet(request.id, request.status);
      
      // Send email notification
      const emailResult = sendStatusUpdateNotification(request, recipients, COMPANY_NAME, requestedBy);
      
      result = {
        success: sheetResult.success && emailResult.success,
        message: `Sheet: ${sheetResult.message}, Email: ${emailResult.message}`
      };
      
    } else if (type === 'custom_email') {
      result = sendCustomEmail(recipients, content, COMPANY_NAME);
      
    } else {
      throw new Error('Invalid request type specified: ' + type);
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(corsHeaders);

  } catch (error) {
    console.error('Error processing request:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
}

/**
 * Save a new damage request to Google Sheets
 */
function saveRequestToSheet(request, requestedBy) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    
    // Generate submission ID
    const submissionId = generateSubmissionId();
    const timestamp = new Date();
    
    // Prepare panel details as JSON string
    const panelDetails = JSON.stringify(request.panels || []);
    const panelCount = (request.panels || []).length;
    
    // Prepare row data
    const rowData = [
      submissionId,                    // A: Submission ID
      timestamp,                       // B: Timestamp
      request.gliderName || '',        // C: Glider Name
      request.orderNumber || '',       // D: Order Number
      request.reason || '',            // E: Reason
      requestedBy || '',               // F: Requested By
      request.notes || '',             // G: Notes
      'Pending',                       // H: Status
      panelCount,                      // I: Panel Count
      panelDetails,                    // J: Panel Details
      timestamp                        // K: Last Updated
    ];
    
    // Append the row
    sheet.appendRow(rowData);
    const rowNumber = sheet.getLastRow();
    
    console.log('Data saved to sheet. Row:', rowNumber, 'ID:', submissionId);
    
    return {
      success: true,
      message: 'Data saved successfully',
      rowNumber: rowNumber,
      submissionId: submissionId
    };
    
  } catch (error) {
    console.error('Error saving to sheet:', error);
    return {
      success: false,
      message: 'Failed to save to sheet: ' + error.message
    };
  }
}

/**
 * Update request status in Google Sheets
 */
function updateRequestStatusInSheet(submissionId, newStatus) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Find the row with matching submission ID
    for (let i = 1; i < data.length; i++) { // Start from row 1 (skip headers)
      if (data[i][0] === submissionId) { // Column A has submission ID
        sheet.getRange(i + 1, 8).setValue(newStatus);      // Column H: Status
        sheet.getRange(i + 1, 11).setValue(new Date());    // Column K: Last Updated
        
        console.log('Status updated for submission:', submissionId, 'to:', newStatus);
        return {
          success: true,
          message: 'Status updated successfully'
        };
      }
    }
    
    return {
      success: false,
      message: 'Submission ID not found: ' + submissionId
    };
    
  } catch (error) {
    console.error('Error updating status in sheet:', error);
    return {
      success: false,
      message: 'Failed to update status: ' + error.message
    };
  }
}

/**
 * Generate a unique submission ID
 */
function generateSubmissionId() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const time = String(now.getTime()).slice(-6); // Last 6 digits of timestamp
  
  return `PR-${year}${month}${day}-${time}`;
}

/**
 * Get all requests from Google Sheets (optional utility function)
 */
function getAllRequests() {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const requests = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const request = {};
      
      headers.forEach((header, index) => {
        request[header] = row[index];
      });
      
      // Parse panel details back to object
      if (request['Panel Details']) {
        try {
          request['Panel Details'] = JSON.parse(request['Panel Details']);
        } catch (e) {
          request['Panel Details'] = [];
        }
      }
      
      requests.push(request);
    }
    
    return {
      success: true,
      data: requests
    };
    
  } catch (error) {
    console.error('Error getting requests:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// === EMAIL FUNCTIONS (Keep your existing email functionality) ===

/**
 * Send new request notification email
 */
function sendNewRequestNotification(request, recipients, companyName, requestedBy) {
  try {
    const subject = `New Panel Recut Request - ${request.gliderName} (Order: ${request.orderNumber})`;
    
    const htmlBody = createNewRequestEmailTemplate(request, companyName, requestedBy);
    const plainTextBody = createPlainTextEmail(request, requestedBy);
    
    // Send to all recipients
    const allRecipients = [
      ...(recipients.to || []),
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ].filter(email => email && email.trim());
    
    if (allRecipients.length === 0) {
      throw new Error('No valid recipients provided');
    }
    
    allRecipients.forEach(email => {
      GmailApp.sendEmail(
        email.trim(),
        subject,
        plainTextBody,
        {
          htmlBody: htmlBody,
          from: FROM_EMAIL
        }
      );
    });
    
    console.log('New request notification sent to:', allRecipients);
    return {
      success: true,
      message: 'Email sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending new request notification:', error);
    return {
      success: false,
      message: 'Failed to send email: ' + error.message
    };
  }
}

/**
 * Send status update notification email
 */
function sendStatusUpdateNotification(request, recipients, companyName, requestedBy) {
  try {
    const subject = `Panel Recut Status Update - ${request.gliderName} (${request.status})`;
    
    const htmlBody = createStatusUpdateEmailTemplate(request, companyName, requestedBy);
    const plainTextBody = createPlainTextStatusEmail(request, requestedBy);
    
    // Send to all recipients
    const allRecipients = [
      ...(recipients.to || []),
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ].filter(email => email && email.trim());
    
    if (allRecipients.length === 0) {
      throw new Error('No valid recipients provided');
    }
    
    allRecipients.forEach(email => {
      GmailApp.sendEmail(
        email.trim(),
        subject,
        plainTextBody,
        {
          htmlBody: htmlBody,
          from: FROM_EMAIL
        }
      );
    });
    
    console.log('Status update notification sent to:', allRecipients);
    return {
      success: true,
      message: 'Status update email sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending status update notification:', error);
    return {
      success: false,
      message: 'Failed to send status update email: ' + error.message
    };
  }
}

/**
 * Send custom email
 */
function sendCustomEmail(recipients, content, companyName) {
  try {
    // Send to all recipients
    const allRecipients = [
      ...(recipients.to || []),
      ...(recipients.cc || []),
      ...(recipients.bcc || [])
    ].filter(email => email && email.trim());
    
    if (allRecipients.length === 0) {
      throw new Error('No valid recipients provided');
    }
    
    allRecipients.forEach(email => {
      GmailApp.sendEmail(
        email.trim(),
        content.subject,
        content.text || content.html,
        {
          htmlBody: content.html,
          from: FROM_EMAIL
        }
      );
    });
    
    console.log('Custom email sent to:', allRecipients);
    return {
      success: true,
      message: 'Custom email sent successfully'
    };
    
  } catch (error) {
    console.error('Error sending custom email:', error);
    return {
      success: false,
      message: 'Failed to send custom email: ' + error.message
    };
  }
}

// === EMAIL TEMPLATES ===

/**
 * Create HTML email template for new requests
 */
function createNewRequestEmailTemplate(request, companyName, requestedBy) {
  const panelsHtml = (request.panels || []).map(panel => `
    <tr>
      <td style="padding: 8px; border: 1px solid #e1e5e9;">${panel.panelNumber}</td>
      <td style="padding: 8px; border: 1px solid #e1e5e9;">${panel.material}</td>
      <td style="padding: 8px; border: 1px solid #e1e5e9;">${panel.quantity}</td>
      <td style="padding: 8px; border: 1px solid #e1e5e9;">${panel.side}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Panel Recut Request</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">New Panel Recut Request</h1>
        <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">${companyName}</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 20px; font-weight: 500;">Request Details</h2>
          <div style="display: grid; gap: 12px;">
            <div><strong style="color: #6c757d;">Glider Name:</strong> <span style="color: #495057;">${request.gliderName}</span></div>
            <div><strong style="color: #6c757d;">Order Number:</strong> <span style="color: #495057;">${request.orderNumber}</span></div>
            <div><strong style="color: #6c757d;">Reason:</strong> <span style="color: #495057;">${request.reason}</span></div>
            <div><strong style="color: #6c757d;">Requested by:</strong> <span style="color: #495057;">${requestedBy || 'Not specified'}</span></div>
            ${request.notes ? `<div><strong style="color: #6c757d;">Notes:</strong> <span style="color: #495057;">${request.notes}</span></div>` : ''}
          </div>
        </div>

        ${panelsHtml ? `
        <div style="margin-bottom: 25px;">
          <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 18px; font-weight: 500;">Panel Information</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: #e9ecef;">
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #495057; border: 1px solid #e1e5e9;">Panel Number</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #495057; border: 1px solid #e1e5e9;">Material</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #495057; border: 1px solid #e1e5e9;">Quantity</th>
                <th style="padding: 12px; text-align: left; font-weight: 600; color: #495057; border: 1px solid #e1e5e9;">Side</th>
              </tr>
            </thead>
            <tbody>
              ${panelsHtml}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin-top: 25px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #1565c0; font-size: 14px;">
            <strong>Submitted:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create HTML email template for status updates
 */
function createStatusUpdateEmailTemplate(request, companyName, requestedBy) {
  const statusColor = request.status === 'Done' ? '#4caf50' : 
                     request.status === 'In Progress' ? '#ff9800' : '#2196f3';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Panel Recut Status Update</title>
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 300;">Status Update</h1>
        <p style="color: #e8f0fe; margin: 10px 0 0 0; font-size: 16px;">${companyName}</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 25px;">
          <div style="background: ${statusColor}; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; font-weight: 500; font-size: 16px;">
            Status: ${request.status}
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 25px;">
          <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 20px; font-weight: 500;">Request Details</h2>
          <div style="display: grid; gap: 12px;">
            <div><strong style="color: #6c757d;">Glider Name:</strong> <span style="color: #495057;">${request.gliderName}</span></div>
            <div><strong style="color: #6c757d;">Order Number:</strong> <span style="color: #495057;">${request.orderNumber}</span></div>
            <div><strong style="color: #6c757d;">Requested by:</strong> <span style="color: #495057;">${requestedBy || 'Not specified'}</span></div>
          </div>
        </div>

        <div style="background: #e8f5e8; border-left: 4px solid #4caf50; padding: 15px; margin-top: 25px; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #2e7d32; font-size: 14px;">
            <strong>Updated:</strong> ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create plain text email for new requests
 */
function createPlainTextEmail(request, requestedBy) {
  const panelsText = (request.panels || []).map(panel => 
    `- ${panel.panelNumber} | ${panel.material} | Qty: ${panel.quantity} | ${panel.side}`
  ).join('\n');

  return `
New Panel Recut Request

Request Details:
- Glider Name: ${request.gliderName}
- Order Number: ${request.orderNumber}
- Reason: ${request.reason}
- Requested by: ${requestedBy || 'Not specified'}
${request.notes ? `- Notes: ${request.notes}` : ''}

${panelsText ? `Panel Information:\n${panelsText}\n` : ''}

Submitted: ${new Date().toLocaleString()}
  `.trim();
}

/**
 * Create plain text email for status updates
 */
function createPlainTextStatusEmail(request, requestedBy) {
  return `
Panel Recut Status Update

Status: ${request.status}

Request Details:
- Glider Name: ${request.gliderName}
- Order Number: ${request.orderNumber}
- Requested by: ${requestedBy || 'Not specified'}

Updated: ${new Date().toLocaleString()}
  `.trim();
}
```

### Step 4: Configure Your Script

1. **Update the SPREADSHEET_ID**:
   - In the script, find: `const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE';`
   - Replace with your actual Google Sheet ID

2. **Update SHEET_NAME if needed**:
   - If your sheet tab has a different name, update: `const SHEET_NAME = 'Sheet1';`

3. **Save the script**: Ctrl+S

### Step 5: Set Up Permissions

1. **Run a test function**:
   - In the Apps Script editor, select the function `doPost` from the dropdown
   - Click the "Run" button (▷)
   - You'll be prompted to authorize permissions

2. **Grant permissions**:
   - Click "Review permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Panel Recut Data Manager (unsafe)"
   - Click "Allow"

### Step 6: Deploy the Web App

1. **Click "Deploy" → "New deployment"**
2. **Configure deployment**:
   - Type: "Web app"
   - Description: "Panel Recut Data & Email Service"
   - Execute as: "Me"
   - Who has access: "Anyone" (for your frontend to access)

3. **Click "Deploy"**
4. **Copy the Web App URL** - you'll need this for your frontend

### Step 7: Configure the Panel Recut Application

**This step is critical** - you need to configure the application to use your Google Apps Script:

1. **Start the Panel Recut Application**
2. **Open the Settings** (gear icon in the top-right)
3. **Configure Google Apps Script**:
   - Paste your Google Apps Script web app URL
   - Enter your company name
   - Click "Test Connection" to verify it works
   - Save the configuration

The application will now use Google Apps Script for both email notifications and data storage.

1. **Test from Apps Script editor**:
   ```javascript
   // Create a test function in your Apps Script
   function testSaveData() {
     const testRequest = {
       gliderName: "Test Glider",
       orderNumber: "TEST-001",
       reason: "Testing sheet integration",
       panels: [
         {
           panelNumber: "P001",
           material: "Carbon Fiber",
           quantity: 1,
           side: "Left Side"
         }
       ],
       notes: "This is a test submission"
     };
     
     const result = saveRequestToSheet(testRequest, "Test User");
     console.log(result);
   }
   ```

2. **Run the test function**:
   - Select `testSaveData` from the dropdown
   - Click Run
   - Check your Google Sheet for the new data

## Step 8: Update Your Frontend (Optional)

If you want to use this Google Apps Script from your React frontend instead of the current email services, you can create a new service:

```typescript
// src/services/googleSheetsService.ts
export interface GoogleSheetsConfig {
  scriptUrl: string;
  companyName: string;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  async submitRequest(request: any, requestedBy: string, recipients: any): Promise<boolean> {
    try {
      const response = await fetch(this.config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_request',
          request: request,
          recipients: recipients,
          requestedBy: requestedBy,
          companyName: this.config.companyName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error submitting request:', error);
      return false;
    }
  }
}
```

## Step 9: Monitor and Maintain

1. **View execution logs**:
   - In Apps Script: "Executions" tab shows all runs
   - Check for errors or failed submissions

2. **Monitor your Google Sheet**:
   - New submissions will appear as new rows
   - Status updates will modify existing rows

3. **Backup your data**:
   - Regularly download your sheet as Excel/CSV
   - Consider setting up automated backups

## Step 10: Advanced Features (Optional)

### Add Data Validation
In your Google Sheet:
1. Select the "Status" column (H)
2. Data → Data validation
3. Criteria: "List of items"
4. Items: Pending, In Progress, Done
5. Show warning for invalid data: checked

### Create Summary Dashboard
Add a second sheet with formulas:
```
=COUNTIF(Sheet1!H:H,"Pending")    // Count pending requests
=COUNTIF(Sheet1!H:H,"Done")       // Count completed requests
=COUNTA(Sheet1!A:A)-1             // Total submissions
```

### Set Up Email Notifications
1. Tools → Script editor (from Google Sheets)
2. Create triggers for sheet changes
3. Send notifications when new data is added

## Troubleshooting

### Common Issues:

1. **"Permission denied" error**:
   - Make sure you've authorized the script
   - Check that the sheet ID is correct

2. **"Spreadsheet not found" error**:
   - Verify the SPREADSHEET_ID constant
   - Ensure the sheet is accessible by your Google account

3. **CORS errors from frontend**:
   - Make sure your web app is deployed with "Anyone" access
   - Check that the URL is correct

4. **Data not appearing**:
   - Check the Apps Script execution logs
   - Verify the sheet name matches SHEET_NAME constant

### Debug Steps:
1. Test the script functions individually in Apps Script editor
2. Check execution logs for error messages
3. Verify sheet permissions and sharing settings
4. Test with simple data first, then complex structures

## Security Considerations

1. **Sensitive Data**: Don't store sensitive information in the sheet
2. **Access Control**: Limit sheet sharing to necessary personnel
3. **Script Security**: Regularly review script permissions
4. **Data Backup**: Implement regular backups of your data

This guide provides a complete integration between your Panel Recut system and Google Sheets, maintaining your existing email functionality while adding robust data storage capabilities.
