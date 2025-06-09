// Google Apps Script Email Service
// Replaces Gmail and Outlook SMTP services with Google Apps Script integration

import { applyDevCorsProxy } from '../utils/corsProxyUtil';

export interface GoogleAppsScriptConfig {
  scriptUrl: string; // The deployed Google Apps Script web app URL
  companyName: string;
}

export interface EmailRecipients {
  to: string[];
  cc?: string[];
  bcc?: string[];
}

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export class GoogleAppsScriptService {
  private config: GoogleAppsScriptConfig;

  constructor(config: GoogleAppsScriptConfig) {
    this.config = config;
  }

  // Send new damage request notification with Google Sheets storage
  async sendNewRequestNotification(request: any, recipients: EmailRecipients, requestedBy?: string): Promise<boolean> {
    try {
      if (!this.config.scriptUrl) {
        throw new Error('Google Apps Script URL is not configured');
      }      console.log('Sending new request notification via Google Apps Script...');

      const response = await fetch(applyDevCorsProxy(this.config.scriptUrl), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_request',
          request: request,
          recipients: recipients,
          requestedBy: requestedBy || request.requestedBy,
          companyName: this.config.companyName
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Apps Script response error:', errorText);
        throw new Error(`Apps Script API responded with status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from Google Apps Script');
      }

      console.log('✅ New request notification sent successfully via Google Apps Script');
      console.log('📊 Data saved to Google Sheets - Row:', result.sheetRowNumber, 'ID:', result.submissionId);
      
      return true;
    } catch (error) {
      console.error('❌ Error sending new request notification via Google Apps Script:', error);
      return false;
    }
  }

  // Send status update notification with Google Sheets update
  async sendStatusUpdateNotification(request: any, newStatus: string, recipients: EmailRecipients, requestedBy?: string): Promise<boolean> {
    try {
      if (!this.config.scriptUrl) {
        throw new Error('Google Apps Script URL is not configured');
      }      console.log('Sending status update notification via Google Apps Script...');

      // Update the request object with the new status
      const updatedRequest = { ...request, status: newStatus };

      const response = await fetch(applyDevCorsProxy(this.config.scriptUrl), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'status_update',
          request: updatedRequest,
          recipients: recipients,
          requestedBy: requestedBy || request.requestedBy,
          companyName: this.config.companyName
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Apps Script response error:', errorText);
        throw new Error(`Apps Script API responded with status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from Google Apps Script');
      }

      console.log('✅ Status update notification sent successfully via Google Apps Script');
      console.log('📊 Status updated in Google Sheets');
      
      return true;
    } catch (error) {
      console.error('❌ Error sending status update notification via Google Apps Script:', error);
      return false;
    }
  }

  // Send custom email
  async sendEmail(recipients: EmailRecipients, content: EmailContent): Promise<boolean> {
    try {      if (!this.config.scriptUrl) {
        throw new Error('Google Apps Script URL is not configured');
      }

      const response = await fetch(applyDevCorsProxy(this.config.scriptUrl), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom_email',
          recipients: recipients,
          content: content,
          companyName: this.config.companyName
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Apps Script response error:', errorText);
        throw new Error(`Apps Script API responded with status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error from Google Apps Script');
      }

      console.log('✅ Custom email sent successfully via Google Apps Script');
      return true;
    } catch (error) {
      console.error('❌ Error sending custom email via Google Apps Script:', error);
      return false;
    }
  }

  // Test connection to Google Apps Script
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      if (!this.config.scriptUrl) {
        return {
          success: false,
          message: 'Google Apps Script URL is not configured'
        };
      }

      console.log('Testing connection to Google Apps Script...');

      // First try a simple GET request for connection test
      try {        console.log('Attempting GET request...');
        const getResponse = await fetch(applyDevCorsProxy(this.config.scriptUrl), {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
        });

        console.log('GET response status:', getResponse.status);

        if (getResponse.ok) {
          try {
            const result = await getResponse.json();
            console.log('GET response successful:', result);
            return {
              success: true,
              message: 'Connected to Google Apps Script successfully (GET)',
              details: result
            };
          } catch (parseError) {
            console.log('GET response not JSON, trying text:', parseError);
            const text = await getResponse.text();
            return {
              success: true,
              message: 'Connected to Google Apps Script successfully (GET - Text Response)',
              details: { text }
            };
          }
        }
      } catch (getError) {
        console.log('GET request failed, trying POST test...', getError);
      }

      // Try a POST test request      console.log('Attempting POST request...');
      const response = await fetch(applyDevCorsProxy(this.config.scriptUrl), {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'connection_test',
          companyName: this.config.companyName,
          timestamp: new Date().toISOString()
        }),
      });

      console.log('POST response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('POST response error:', errorText);
        return {
          success: false,
          message: `Connection failed: HTTP ${response.status}`,
          details: { 
            status: response.status, 
            error: errorText, 
            headers: Object.fromEntries(response.headers.entries()) 
          }
        };
      }

      const result = await response.json();
      console.log('POST response successful:', result);
      
      if (result.success) {
        return {
          success: true,
          message: 'Connected to Google Apps Script successfully (POST)',
          details: result
        };
      } else {
        return {
          success: false,
          message: result.error || 'Connection test failed',
          details: result
        };
      }
    } catch (error) {
      console.error('Connection test error:', error);
      
      // Provide specific error messages for common CORS issues
      let message = `Connection error: ${error.message}`;
      if (error.message.includes('CORS')) {
        message = 'CORS error: The Google Apps Script web app may not be deployed as "Anyone can access" or may need to be redeployed with updated code.';
      } else if (error.message.includes('Failed to fetch')) {
        message = 'Network error: Unable to reach Google Apps Script. Check the URL and ensure the web app is deployed and accessible.';
      }

      return {
        success: false,
        message: message,
        details: {
          error: error.message,
          name: error.name,
          stack: error.stack,
          scriptUrl: this.config.scriptUrl
        }
      };
    }
  }

  // Get all requests from Google Sheets (optional utility function)
  async getAllRequests(): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {      if (!this.config.scriptUrl) {
        return {
          success: false,
          error: 'Google Apps Script URL is not configured'
        };
      }

      const response = await fetch(applyDevCorsProxy(this.config.scriptUrl), {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'get_requests'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Failed to fetch requests: HTTP ${response.status} - ${errorText}`
        };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Error fetching requests: ${error.message}`
      };
    }
  }
}

// Create and export a configured instance
export const createGoogleAppsScriptService = (config: GoogleAppsScriptConfig): GoogleAppsScriptService => {
  return new GoogleAppsScriptService(config);
};
