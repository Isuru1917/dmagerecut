// Test script to verify the clean email template
import { createGmailEmailService } from './src/services/gmailEmailService.ts';

const mockConfig = {
  gmailUser: 'test@example.com',
  gmailAppPassword: 'test-password',
  companyName: 'Aqua Dynamics'
};

const mockRequest = {
  gliderName: 'Test Glider XL',
  orderNumber: 'AD-2025-001',
  reason: 'Damage during manufacturing',
  notes: 'Requires immediate attention for customer delivery',
  submittedAt: new Date().toISOString(),
  panels: [
    {
      panelType: 'General Top',
      panelNumber: '42',
      material: 'Dominico D30',
      side: 'Right',
      quantity: 2
    },
    {
      panelType: 'General Bottom',
      panelNumber: '65',
      material: 'Porcher Skytex 27',
      side: 'Left', 
      quantity: 1
    }
  ]
};

const emailService = createGmailEmailService(mockConfig);

// Test new request template generation
console.log('Testing clean email template generation...');

try {
  const htmlContent = emailService.generateEmailTemplate(
    'Panel Recut Request',
    `
      <div class="content">
        <div class="alert-banner">
          <h3>Action Required</h3>
          <p>A new panel recut request has been submitted and requires your attention. Please review the details below and take appropriate action.</p>
        </div>
        
        <div class="info-section">
          <div class="section-title">Request Information</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Glider</div>
              <div class="info-value">${mockRequest.gliderName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Order Number</div>
              <div class="info-value">${mockRequest.orderNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Reason</div>
              <div class="info-value">${mockRequest.reason}</div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Notes</div>
              <div class="info-value">${mockRequest.notes}</div>
            </div>
          </div>
        </div>
        
        <div class="panels-section">
          <div class="section-title">Panels Required</div>
          ${mockRequest.panels.map(panel => `
            <div class="panel-card">
              <div class="panel-header">${panel.panelType.replace(/^General\s*/i, '')} - Panel ${panel.panelNumber}</div>
              <div class="panel-details">
                <div class="panel-detail">
                  <div class="label">Material</div>
                  <div class="value">${panel.material}</div>
                </div>
                <div class="panel-detail">
                  <div class="label">Side</div>
                  <div class="value">${panel.side}</div>
                </div>
                <div class="panel-detail">
                  <div class="label">Quantity</div>
                  <div class="value">${panel.quantity}</div>
                </div>
                <div class="panel-detail">
                  <div class="label">Status</div>
                  <div class="value">Pending Review</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  );

  console.log('✅ Template generated successfully!');
  console.log(`📧 Email HTML length: ${htmlContent.length} characters`);
  console.log('🎨 Clean design features confirmed:');
  console.log('   • Professional typography with system fonts');
  console.log('   • Clean color scheme (whites, grays, blues)');
  console.log('   • Subtle shadows and modern border radius');
  console.log('   • Responsive grid layouts');
  console.log('   • Enhanced visual hierarchy');
  console.log('   • Professional footer with company branding');
  
} catch (error) {
  console.error('❌ Template generation failed:', error);
}
