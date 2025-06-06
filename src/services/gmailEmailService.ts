// Gmail SMTP Email Service
// This service uses your Gmail account with App Password to send emails

export interface GmailEmailConfig {
  gmailUser: string;
  gmailAppPassword: string;
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

export class GmailEmailService {
  private config: GmailEmailConfig;  constructor(config: GmailEmailConfig) {
    this.config = config;
  }  // Send email using Gmail SMTP via backend server
  async sendEmail(recipients: EmailRecipients, content: EmailContent): Promise<boolean> {
    try {
      // For client-side Gmail sending, we use our backend service
      const response = await fetch('http://localhost:3001/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gmail: {
            user: this.config.gmailUser,
            appPassword: this.config.gmailAppPassword,
          },
          email: {
            from: this.config.gmailUser,
            to: recipients.to,
            cc: recipients.cc,
            bcc: recipients.bcc,
            subject: content.subject,
            html: content.html,
            text: content.text,
          },        }),      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Email API responded with status: ${response.status} - ${errorText}`);      }

      const result = await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Generate professional HTML email template
  generateEmailTemplate(title: string, content: string, footerNote?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px 20px; }
        .content h2 { color: #1e293b; margin-top: 0; font-size: 20px; }
        .details { background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .details h3 { margin-top: 0; color: #334155; font-size: 16px; }
        .panel-list { margin: 15px 0; }
        .panel-item { background-color: white; padding: 15px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #3b82f6; }
        .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-pending { background-color: #fef3c7; color: #92400e; }
        .status-processing { background-color: #dbeafe; color: #1e40af; }
        .status-done { background-color: #d1fae5; color: #065f46; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
        .button:hover { background-color: #2563eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${this.config.companyName}</h1>
            <p>Panel Recut Management System</p>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p><strong>${this.config.companyName}</strong> - Professional Paraglider Services</p>
            <p>This is an automated notification from the Panel Recut Management System.</p>
            ${footerNote ? `<p><em>${footerNote}</em></p>` : ''}
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Send new damage request notification
  async sendNewRequestNotification(request: any, recipients: EmailRecipients): Promise<boolean> {
    const panelsHtml = request.panels.map((panel: any) => `
      <div class="panel-item">
        <strong>${panel.panelType}</strong> - Panel ${panel.panelNumber}<br>
        Material: ${panel.material}<br>
        Side: ${panel.side}<br>
        Quantity: ${panel.quantity}
      </div>
    `).join('');

    const htmlContent = this.generateEmailTemplate(
      'New Panel Recut Request',
      `
        <h2>🔧 New Panel Recut Request Submitted</h2>
        <p>A new panel recut request has been submitted and requires attention.</p>
        
        <div class="details">
          <h3>Request Details</h3>
          <p><strong>Glider:</strong> ${request.gliderName}</p>
          <p><strong>Order Number:</strong> ${request.orderNumber}</p>
          <p><strong>Status:</strong> <span class="status-badge status-pending">Pending</span></p>
          <p><strong>Submitted:</strong> ${new Date(request.submittedAt).toLocaleString()}</p>
          
          <h3>Reason for Recut</h3>
          <p>${request.reason}</p>
          
          ${request.notes ? `
            <h3>Additional Notes</h3>
            <p>${request.notes}</p>
          ` : ''}
          
          <h3>Panels Required</h3>
          <div class="panel-list">
            ${panelsHtml}
          </div>
        </div>
        
        <p>Please review this request and update the status accordingly in the management system.</p>
      `,
      'Sent via Gmail SMTP'
    );

    const textContent = `
New Panel Recut Request - ${this.config.companyName}

Glider: ${request.gliderName}
Order Number: ${request.orderNumber}
Status: Pending
Submitted: ${new Date(request.submittedAt).toLocaleString()}

Reason: ${request.reason}

${request.notes ? `Notes: ${request.notes}` : ''}

Panels Required:
${request.panels.map((panel: any) => 
  `- ${panel.panelType} Panel ${panel.panelNumber} (${panel.material}, ${panel.side}, Qty: ${panel.quantity})`
).join('\n')}

Please review this request in the management system.
`;

    return this.sendEmail(recipients, {
      subject: `🔧 New Panel Recut Request: ${request.gliderName} (${request.orderNumber})`,
      html: htmlContent,
      text: textContent
    });
  }

  // Send status update notification
  async sendStatusUpdateNotification(request: any, newStatus: string, recipients: EmailRecipients): Promise<boolean> {
    const statusColors = {
      'Pending': 'status-pending',
      'Processing': 'status-processing', 
      'Done': 'status-done'
    };

    const htmlContent = this.generateEmailTemplate(
      'Request Status Update',
      `
        <h2>📋 Request Status Updated</h2>
        <p>The status of a panel recut request has been updated.</p>
        
        <div class="details">
          <h3>Request Information</h3>
          <p><strong>Glider:</strong> ${request.gliderName}</p>
          <p><strong>Order Number:</strong> ${request.orderNumber}</p>
          <p><strong>New Status:</strong> <span class="status-badge ${statusColors[newStatus] || 'status-pending'}">${newStatus}</span></p>
          <p><strong>Updated:</strong> ${new Date().toLocaleString()}</p>
          
          <h3>Original Request</h3>
          <p><strong>Reason:</strong> ${request.reason}</p>
          <p><strong>Submitted:</strong> ${new Date(request.submittedAt).toLocaleString()}</p>
        </div>
        
        <p>Request tracking: ${request.orderNumber}</p>
      `,
      'Sent via Gmail SMTP'
    );

    const textContent = `
Request Status Update - ${this.config.companyName}

Glider: ${request.gliderName}
Order Number: ${request.orderNumber}
New Status: ${newStatus}
Updated: ${new Date().toLocaleString()}

Original Request:
Reason: ${request.reason}
Submitted: ${new Date(request.submittedAt).toLocaleString()}

Request tracking: ${request.orderNumber}
`;

    return this.sendEmail(recipients, {
      subject: `📋 Status Update: ${request.gliderName} - ${newStatus} (${request.orderNumber})`,
      html: htmlContent,
      text: textContent
    });
  }
}

// Create and export a configured instance
export const createGmailEmailService = (config: GmailEmailConfig): GmailEmailService => {
  return new GmailEmailService(config);
};
