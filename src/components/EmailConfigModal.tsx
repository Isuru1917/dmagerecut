import React, { useState, useEffect } from 'react';
import { X, Globe, CheckCircle, AlertCircle, Mail, Database, Send, ExternalLink } from 'lucide-react';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmailConfigModal: React.FC<EmailConfigModalProps> = ({ isOpen, onClose }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [testStatus, setTestStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ status: 'idle' });

  // Load existing settings when modal opens
  useEffect(() => {
    if (isOpen) {
      setScriptUrl(localStorage.getItem('google_script_url') || '');
      setCompanyName(localStorage.getItem('company_name') || 'Panel Recut Management System');
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('google_script_url', scriptUrl);
    localStorage.setItem('company_name', companyName);
    
    // Clean up old email provider settings
    localStorage.removeItem('email_provider');
    localStorage.removeItem('gmail_user');
    localStorage.removeItem('gmail_app_password');
    localStorage.removeItem('outlook_user');
    localStorage.removeItem('outlook_app_password');
    
    onClose();
  };
  const handleTest = async () => {
    if (!scriptUrl) {
      setTestStatus({ status: 'error', message: 'Please enter a Google Apps Script URL' });
      return;
    }

    setTestStatus({ status: 'testing', message: 'Testing connection...' });
    
    try {
      const response = await fetch(scriptUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setTestStatus({ status: 'success', message: 'Connection successful! Google Apps Script is responding.' });
      } else {
        setTestStatus({ status: 'error', message: `Connection failed: HTTP ${response.status}` });
      }
    } catch (error: any) {
      setTestStatus({ status: 'error', message: `Connection error: ${error.message}` });
    }
  };
  const handleReset = () => {
    setScriptUrl('');
    setCompanyName('Panel Recut Management System');
    setTestStatus({ status: 'idle' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Email & Data Configuration</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Google Apps Script Info */}
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-5 mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Google Apps Script Integration</h3>
            </div>
            <div className="space-y-4 text-green-800">
              <p><strong>✅ Enhanced Solution!</strong> This system now uses Google Apps Script for:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Email notifications</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Google Sheets data storage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">No passwords required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Send className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Automatic data logging</span>
                </div>
              </div>
              <p className="text-sm mt-3">
                Deploy the provided Google Apps Script and enter the web app URL below to enable both email notifications and automatic data storage in Google Sheets.
              </p>
            </div>
          </div>

          {/* Setup Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-blue-900 mb-3">📋 Quick Setup Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
              <li>Follow the setup guide in <code className="bg-blue-100 px-2 py-1 rounded">GOOGLE_SHEETS_INTEGRATION_GUIDE.md</code></li>
              <li>Deploy the Google Apps Script as a web app</li>
              <li>Copy the web app URL and paste it below</li>
              <li>Test the connection to verify everything works</li>
            </ol>
          </div>
        </div>        {/* Configuration Form */}
        <div className="space-y-6">
          {/* Google Apps Script URL */}
          <div>
            <label htmlFor="scriptUrl" className="block text-sm font-medium text-slate-700 mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              Google Apps Script Web App URL *
            </label>
            <input
              id="scriptUrl"
              type="url"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="https://script.google.com/macros/s/[YOUR_SCRIPT_ID]/exec"
            />
            <p className="text-xs text-slate-600 mt-1">
              The deployed Google Apps Script web app URL that handles email notifications and data storage
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="inline w-4 h-4 mr-2" />
              Company Name
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Panel Recut Management System"
            />
            <p className="text-xs text-slate-600 mt-1">
              This name will appear in email notifications and system communications
            </p>
          </div>

          {/* Test Connection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Test Connection</label>
              <button
                onClick={handleTest}
                disabled={!scriptUrl || testStatus.status === 'testing'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{testStatus.status === 'testing' ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>
            
            {testStatus.status !== 'idle' && (
              <div className={`p-3 rounded-lg border ${
                testStatus.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : testStatus.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {testStatus.status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {testStatus.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  {testStatus.status === 'testing' && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                  <span className={`text-sm ${
                    testStatus.status === 'success' 
                      ? 'text-green-800' 
                      : testStatus.status === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}>
                    {testStatus.message}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Current Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h4 className="font-semibold text-slate-900 mb-3">Current Configuration Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {scriptUrl ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-sm text-slate-700">
                  Google Apps Script URL: {scriptUrl ? 'Configured' : 'Not configured'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {companyName ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-sm text-slate-700">
                  Company Name: {companyName || 'Using default'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {testStatus.status === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                )}
                <span className="text-sm text-slate-700">
                  Connection: {testStatus.status === 'success' ? 'Verified' : 'Not tested'}
                </span>
              </div>
            </div>
          </div>

          {/* Migration Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <ExternalLink className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-yellow-800">
                <h4 className="font-semibold mb-1">Migration from SMTP</h4>
                <p className="text-sm">
                  This system has been upgraded from Gmail/Outlook SMTP to Google Apps Script. 
                  Your old email settings will be automatically removed when you save this configuration.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>
          <div className="space-x-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!scriptUrl}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailConfigModal;
