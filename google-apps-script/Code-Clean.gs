/**
 * Panel Recut Management System - Google Apps Script
 * Enhanced version with Google Sheets integration
 * Handles both email notifications and data storage
 */

// Configuration - CUSTOMIZE THESE VALUES
const SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your actual Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Name of the sheet tab
const DEFAULT_COMPANY_NAME = 'Panel Recut Company';
const FROM_EMAIL = Session.getActiveUser().getEmail();

/**
 * Handle GET requests (for testing connectivity)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'Panel Recut Data Manager is running',
      timestamp: new Date().toISOString(),
      service: 'Google Apps Script'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Handle OPTIONS requests (required for CORS preflight)
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    .setHeader('Access-Control-Max-Age', '3600');
}

/**
 * Main function to handle POST requests
 */
function doPost(e) {
  try {
    console.log('Received POST request');
    console.log('Request object:', e);
    
    // Handle different request types
    let requestData;
    
    if (e.postData && e.postData.contents) {
      // Standard POST with JSON body
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return createErrorResponse('Invalid JSON format');
      }
    } else if (e.parameter) {
      // URL parameters (for testing)
      requestData = e.parameter;
    } else {
      console.error('No data received');
      return createErrorResponse('No data received');
    }
    
    console.log('Parsed request data:', requestData);
    
    // Extract data from request
    const { type, request, recipients, content, companyName, requestedBy } = requestData;    
    // Use provided company name or default
    const COMPANY_NAME = companyName || DEFAULT_COMPANY_NAME;
    
    console.log('Request type:', type);
    console.log('Company name:', COMPANY_NAME);
    
    let result;
    
    if (type === 'test' || type === 'connection_test') {
      // Handle connection test
      result = {
        success: true,
        message: 'Connection successful',
        timestamp: new Date().toISOString(),
        service: 'Panel Recut Data Manager'
      };
      
    } else if (type === 'new_request') {
      // Save to Google Sheets first
      const sheetResult = saveRequestToSheet(request, requestedBy);
      
      // Send email notification if recipients provided
      let emailResult = { success: true, message: 'No email recipients specified' };
      if (recipients && (recipients.to || recipients.cc || recipients.bcc)) {
        emailResult = sendNewRequestNotification(request, recipients, COMPANY_NAME, requestedBy);
      }
      
      result = {
        success: sheetResult.success && emailResult.success,
        message: `Sheet: ${sheetResult.message}, Email: ${emailResult.message}`,
        sheetRowNumber: sheetResult.rowNumber,
        submissionId: sheetResult.submissionId
      };
      
    } else if (type === 'status_update') {
      // Update status in Google Sheets
      const sheetResult = updateRequestStatusInSheet(request.id, request.status);
      
      // Send email notification if recipients provided
      let emailResult = { success: true, message: 'No email recipients specified' };
      if (recipients && (recipients.to || recipients.cc || recipients.bcc)) {
        emailResult = sendStatusUpdateNotification(request, recipients, COMPANY_NAME, requestedBy);
      }
      
      result = {
        success: sheetResult.success && emailResult.success,
        message: `Sheet: ${sheetResult.message}, Email: ${emailResult.message}`
      };
      
    } else if (type === 'custom_email') {
      result = sendCustomEmail(recipients, content, COMPANY_NAME);
      
    } else if (type === 'get_requests') {
      // Optional: Get all requests from sheet
      result = getAllRequests();
      
    } else {
      return createErrorResponse('Invalid request type specified: ' + type);
    }    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  } catch (error) {
    console.error('Error processing request:', error);
    return createErrorResponse(error.message || 'Unknown error occurred');
  }
}

/**
 * Create error response
 */
function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
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

/**
 * Search requests by various criteria
 */
function searchRequests(criteria) {
  try {
    const allRequestsResult = getAllRequests();
    if (!allRequestsResult.success) {
      return allRequestsResult;
    }
    
    let filteredRequests = allRequestsResult.data;
    
    // Filter by status if provided
    if (criteria.status) {
      filteredRequests = filteredRequests.filter(req => 
        req.Status === criteria.status
      );
    }
    
    // Filter by date range if provided
    if (criteria.startDate) {
      const startDate = new Date(criteria.startDate);
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.Timestamp) >= startDate
      );
    }
    
    if (criteria.endDate) {
      const endDate = new Date(criteria.endDate);
      filteredRequests = filteredRequests.filter(req => 
        new Date(req.Timestamp) <= endDate
      );
    }
    
    // Filter by glider name if provided
    if (criteria.gliderName) {
      filteredRequests = filteredRequests.filter(req => 
        req['Glider Name'].toLowerCase().includes(criteria.gliderName.toLowerCase())
      );
    }
    
    return {
      success: true,
      data: filteredRequests,
      count: filteredRequests.length
    };
    
  } catch (error) {
    console.error('Error searching requests:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// === EMAIL FUNCTIONS ===

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

// === TEST FUNCTIONS ===

/**
 * Test function to verify sheet integration
 */
function testSaveData() {
  const testRequest = {
    gliderName: "Test Glider Model X1",
    orderNumber: "TEST-2025-001",
    reason: "Testing Google Sheets integration",
    panels: [
      {
        panelNumber: "P001",
        material: "Carbon Fiber",
        quantity: 1,
        side: "Left Side"
      },
      {
        panelNumber: "P002", 
        material: "Fiberglass",
        quantity: 2,
        side: "Right Side"
      }
    ],
    notes: "This is a test submission to verify the integration"
  };
  
  const result = saveRequestToSheet(testRequest, "Test User");
  console.log('Test save result:', result);
  return result;
}

/**
 * Test function to verify status update
 */
function testStatusUpdate() {
  // First create a test request to update
  const testResult = testSaveData();
  
  if (testResult.success) {
    // Now update its status
    const updateResult = updateRequestStatusInSheet(testResult.submissionId, "In Progress");
    console.log('Test status update result:', updateResult);
    return updateResult;
  } else {
    console.log('Cannot test status update - test save failed');
    return testResult;
  }
}

/**
 * Test function to get all requests
 */
function testGetAllRequests() {
  const result = getAllRequests();
  console.log('Test get all requests result:', result);
  return result;
}
