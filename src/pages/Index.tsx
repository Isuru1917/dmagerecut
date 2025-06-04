import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import DamageReportForm from '../components/DamageReportForm';
import RecentRequests from '../components/RecentRequests';
import SettingsModal from '../components/SettingsModal';
import { DamageRequest, EmailSettings } from '../types/types';

const Index = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [requests, setRequests] = useState<DamageRequest[]>([
    {
      id: '1',
      gliderName: 'Advance Alpha 7',
      orderNumber: 'ORD-2024-001',
      reason: 'Small tear near leading edge, approximately 3cm',
      panels: [
        {
          panelType: 'Top Surface',
          panelNumber: 'P-42',
          material: 'Dominico N20D',
          quantity: 1,
          side: 'Left Side'
        }
      ],
      status: 'In Progress',
      submittedAt: new Date('2024-06-01T10:30:00'),
      updatedAt: new Date('2024-06-01T14:15:00')
    },
    {
      id: '2',
      gliderName: 'Ozone Rush 5',
      orderNumber: 'ORD-2024-002',
      reason: 'UV damage causing discoloration and fabric weakening',
      panels: [
        {
          panelType: 'Bottom Surface',
          panelNumber: 'P-15',
          material: 'Porcher Skytex 27',
          quantity: 2,
          side: 'Left & Right Side'
        }
      ],
      status: 'Pending',
      submittedAt: new Date('2024-06-02T09:15:00'),
      updatedAt: new Date('2024-06-02T09:15:00')
    },
    {
      id: '3',
      gliderName: 'Gin Boomerang 12',
      orderNumber: 'ORD-2024-003',
      reason: 'Complete panel replacement needed after tree landing',
      panels: [
        {
          panelType: 'Stabilizer',
          panelNumber: 'P-8',
          material: 'Porcher Skytex 38',
          quantity: 1,
          side: 'Right Side'
        },
        {
          panelType: 'Leading Edge',
          panelNumber: 'P-3',
          material: 'Dokdo 40D',
          quantity: 1,
          side: 'Right Side'
        }
      ],
      status: 'Done',
      submittedAt: new Date('2024-05-30T16:45:00'),
      updatedAt: new Date('2024-06-01T11:20:00')
    }
  ]);

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    recipients: ['production@paragliderpro.com', 'quality@paragliderpro.com'],
    ccRecipients: ['manager@paragliderpro.com'],
    notifications: {
      newRequest: true,
      statusUpdate: true,
      completion: true
    }
  });

  const handleNewRequest = (newRequest: Omit<DamageRequest, 'id' | 'submittedAt' | 'updatedAt'>) => {
    const request: DamageRequest = {
      ...newRequest,
      id: Date.now().toString(),
      submittedAt: new Date(),
      updatedAt: new Date()
    };
    setRequests(prev => [request, ...prev]);
    console.log('New panel recut request submitted:', request);
    console.log('Email would be sent to:', emailSettings.recipients);
  };

  const handleStatusUpdate = (id: string, status: DamageRequest['status']) => {
    setRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status, updatedAt: new Date() }
        : req
    ));
    console.log(`Request ${id} status updated to:`, status);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
    console.log(`Request ${id} has been deleted`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">ParagliderPro</h1>
                <p className="text-sm text-slate-600">Panel Recut Management</p>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:shadow-md active:scale-95"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-slate-700" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Left Column - Panel Recut Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">New Panel Recut Request</h2>
              <DamageReportForm onSubmit={handleNewRequest} />
            </div>
          </div>

          {/* Right Column - Recent Requests */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Requests</h2>
              <RecentRequests 
                requests={requests} 
                onStatusUpdate={handleStatusUpdate}
                onDeleteRequest={handleDeleteRequest}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-slate-600">
            © 2024 ParagliderPro Manufacturing. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={emailSettings}
        onSave={setEmailSettings}
      />
    </div>
  );
};

export default Index;
