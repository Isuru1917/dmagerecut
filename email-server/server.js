const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Gmail SMTP transporter
const createTransporter = (gmailUser, gmailAppPassword) => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword
    }
  });
};

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { gmail, email } = req.body;
    
    console.log('📧 Sending email via Gmail SMTP...');
    console.log('From:', gmail.user);
    console.log('To:', email.to);
    console.log('Subject:', email.subject);
    
    // Create transporter with provided credentials
    const transporter = createTransporter(gmail.user, gmail.appPassword);
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified');
    
    // Send email
    const info = await transporter.sendMail({
      from: email.from,
      to: email.to.join(', '),
      cc: email.cc ? email.cc.join(', ') : undefined,
      bcc: email.bcc ? email.bcc.join(', ') : undefined,
      subject: email.subject,
      html: email.html,
      text: email.text
    });
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    });
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to send email'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Panel Recut Email Server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log(`📧 Gmail SMTP endpoint: http://localhost:${PORT}/api/send-email`);
});
