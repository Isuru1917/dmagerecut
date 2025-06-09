import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, MailCheck, AlertTriangle, CheckCircle, Loader2, Globe, Database, Send } from 'lucide-react';
import { GoogleAppsScriptService, createGoogleAppsScriptService } from '@/services/googleAppsScriptService';

const EmailTestPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Google Apps Script configuration
  const [scriptUrl, setScriptUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Email details
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('Test Email from Panel Recut App');
  const [emailBody, setEmailBody] = useState('This is a test email sent from the Panel Recut Management System using Google Apps Script.');
  
  // Load stored configuration
  useEffect(() => {
    setScriptUrl(localStorage.getItem('google_script_url') || '');
    setCompanyName(localStorage.getItem('company_name') || 'Panel Recut Management System');
  }, []);
  // Test connection to Google Apps Script
  const testConnection = async () => {
    if (!scriptUrl) {
      toast({
        title: 'Configuration Missing',
        description: 'Please configure your Google Apps Script URL first.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      setTestResult(null);
      
      // Create Google Apps Script service instance
      const googleService = createGoogleAppsScriptService({
        scriptUrl,
        companyName
      });
      
      // Use the service's built-in test connection method
      const result = await googleService.testConnection();
      
      if (result.success) {
        setTestResult({
          success: true,
          message: result.message
        });
        
        toast({
          title: 'Connection Successful',
          description: result.message,
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Failed to connect to Google Apps Script: ${error.message || 'Unknown error'}`
      });
      
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to your Google Apps Script. Please check your configuration.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
    // Send a test email using Google Apps Script
  const sendTestEmail = async () => {
    if (!recipient) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a recipient email address.',
        variant: 'destructive'
      });
      return;
    }

    if (!scriptUrl) {
      toast({
        title: 'Configuration Missing',
        description: 'Please configure your Google Apps Script URL first.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setLoading(true);
      setTestResult(null);
      
      // Create a test damage request object similar to what the actual app would send
      const testRequest = {
        id: `TEST-${Date.now()}`,
        customerName: 'Test Customer',
        jobNumber: 'TEST-JOB-001',
        requestedBy: 'Email Test Page',
        materialType: 'Standard Material',
        thickness: '18mm',
        width: '200',
        height: '400',
        quantity: 1,
        damageDescription: 'Test damage description for email testing',
        damageType: 'Test',
        urgency: 'Standard',
        requiredDate: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        notes: emailBody
      };      // Create Google Apps Script service instance
      const googleService = createGoogleAppsScriptService({
        scriptUrl,
        companyName
      });

      // Use sendEmail method for custom test email
      const success = await googleService.sendEmail(
        { to: [recipient] },
        {
          subject,
          html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                   <h2>🔧 ${subject}</h2>
                   <p>${emailBody}</p>
                   <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                   <h3>Test Request Details:</h3>
                   <ul>
                     <li><strong>Customer:</strong> ${testRequest.customerName}</li>
                     <li><strong>Job Number:</strong> ${testRequest.jobNumber}</li>
                     <li><strong>Material:</strong> ${testRequest.materialType}</li>
                     <li><strong>Dimensions:</strong> ${testRequest.width} × ${testRequest.height} × ${testRequest.thickness}</li>
                     <li><strong>Quantity:</strong> ${testRequest.quantity}</li>
                     <li><strong>Damage Type:</strong> ${testRequest.damageType}</li>
                     <li><strong>Description:</strong> ${testRequest.damageDescription}</li>
                   </ul>
                   <p style="margin-top: 20px; font-size: 12px; color: #666;">
                     This is a test email from ${companyName || 'Panel Recut Management System'}
                   </p>
                 </div>`,
          text: `${subject}\n\n${emailBody}\n\nTest Request Details:\n- Customer: ${testRequest.customerName}\n- Job Number: ${testRequest.jobNumber}\n- Material: ${testRequest.materialType}\n- Dimensions: ${testRequest.width} × ${testRequest.height} × ${testRequest.thickness}\n- Quantity: ${testRequest.quantity}\n- Damage Type: ${testRequest.damageType}\n- Description: ${testRequest.damageDescription}\n\nThis is a test email from ${companyName || 'Panel Recut Management System'}`
        }
      );
      
      if (success) {
        setTestResult({
          success: true,
          message: `Test email sent successfully to ${recipient} via Google Apps Script.`
        });
        
        toast({
          title: 'Email Sent Successfully',
          description: `Test email delivered to ${recipient} via Google Apps Script.`,
        });
      } else {
        throw new Error('Google Apps Script email sending failed');
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Failed to send test email: ${error.message || 'Unknown error'}`
      });
      
      toast({
        title: 'Email Failed',
        description: `Could not send test email: ${error.message || 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
    // Save configuration
  const saveConfiguration = () => {
    try {
      localStorage.setItem('google_script_url', scriptUrl);
      localStorage.setItem('company_name', companyName);
      
      // Clean up old email provider settings
      localStorage.removeItem('email_provider');
      localStorage.removeItem('gmail_user');
      localStorage.removeItem('gmail_app_password');
      localStorage.removeItem('outlook_user');
      localStorage.removeItem('outlook_app_password');
      
      toast({
        title: 'Configuration Saved',
        description: 'Google Apps Script configuration has been saved.',
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save configuration to local storage.',
        variant: 'destructive'
      });
    }
  };
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 flex items-center">
        <Globe className="mr-2" /> Google Apps Script Email Test
      </h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Google Apps Script Connection
            </CardTitle>
            <CardDescription>
              Test the connection to your deployed Google Apps Script web app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                This tests if your Google Apps Script is deployed and responding
              </p>
              <Button 
                onClick={testConnection}
                disabled={loading || !scriptUrl}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
            
            {testResult && (
              <Alert className={`mt-4 ${testResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertTitle>{testResult.success ? 'Success' : 'Error'}</AlertTitle>
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Google Apps Script Configuration
          </CardTitle>
          <CardDescription>
            Configure your Google Apps Script web app URL and company information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scriptUrl">Google Apps Script Web App URL</Label>
            <Input 
              id="scriptUrl"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/[YOUR_SCRIPT_ID]/exec"
              className="font-mono text-sm"
            />
            <p className="text-xs text-slate-600">
              The deployed web app URL from your Google Apps Script
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input 
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Panel Recut Management System"
            />
            <p className="text-xs text-slate-600">
              This name will appear in email notifications
            </p>
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={saveConfiguration}
              variant="secondary"
              className="w-full"
            >
              <Database className="mr-2 h-4 w-4" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Send className="mr-2 h-5 w-5" />
            Send Test Email
          </CardTitle>
          <CardDescription>
            Send a test email and log data to Google Sheets using your Google Apps Script
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input 
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="recipient@example.com"
            />
            <p className="text-xs text-slate-600">
              Email address to receive the test notification
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input 
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Test Email Subject"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="body">Additional Notes</Label>
            <Textarea 
              id="body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Enter additional notes for the test email..."
              rows={3}
            />
            <p className="text-xs text-slate-600">
              These notes will be included in the test request data
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What this test does:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Creates a sample panel recut request</li>
              <li>• Sends an email notification to the specified recipient</li>
              <li>• Logs the request data to your Google Sheets</li>
              <li>• Tests the complete Google Apps Script integration</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={sendTestEmail}
            disabled={loading || !scriptUrl || !recipient}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              <>
                <MailCheck className="mr-2 h-4 w-4" />
                Send Test Email & Log to Sheets
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Configuration Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Current Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {scriptUrl ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="text-sm font-medium">Google Apps Script URL</p>
                <p className="text-xs text-slate-600">
                  {scriptUrl || 'Not configured'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {companyName ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <p className="text-sm font-medium">Company Name</p>
                <p className="text-xs text-slate-600">
                  {companyName || 'Using default'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {testResult?.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-slate-400" />
              )}
              <div>
                <p className="text-sm font-medium">Connection Status</p>
                <p className="text-xs text-slate-600">
                  {testResult?.success ? 'Connected and verified' : 'Not tested'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTestPage;