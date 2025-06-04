
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EmailSettings } from '../types/types';
import { useToast } from '@/hooks/use-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EmailSettings;
  onSave: (settings: EmailSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EmailSettings>(settings);
  const [newRecipient, setNewRecipient] = useState('');
  const [newCcRecipient, setNewCcRecipient] = useState('');

  const handleSave = () => {
    onSave(formData);
    onClose();
    toast({
      title: "Settings Saved",
      description: "Email settings have been updated successfully.",
    });
  };

  const addRecipient = (type: 'recipients' | 'ccRecipients') => {
    const email = type === 'recipients' ? newRecipient : newCcRecipient;
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], email]
      }));
      if (type === 'recipients') {
        setNewRecipient('');
      } else {
        setNewCcRecipient('');
      }
    }
  };

  const removeRecipient = (type: 'recipients' | 'ccRecipients', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const updateNotification = (key: keyof EmailSettings['notifications'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Email Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Primary Recipients */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Primary Recipients
            </Label>
            <div className="space-y-2">
              {formData.recipients.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-700">{email}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeRecipient('recipients', index)}
                    className="text-red-600 hover:bg-red-50 border-red-200 px-2 py-1 h-7"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient('recipients')}
                  className="flex-1"
                />
                <Button
                  onClick={() => addRecipient('recipients')}
                  disabled={!newRecipient}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* CC Recipients */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              CC Recipients
            </Label>
            <div className="space-y-2">
              {formData.ccRecipients.map((email, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-700">{email}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeRecipient('ccRecipients', index)}
                    className="text-red-600 hover:bg-red-50 border-red-200 px-2 py-1 h-7"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newCcRecipient}
                  onChange={(e) => setNewCcRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient('ccRecipients')}
                  className="flex-1"
                />
                <Button
                  onClick={() => addRecipient('ccRecipients')}
                  disabled={!newCcRecipient}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-4 border-t border-slate-200 pt-6">
            <Label className="text-sm font-medium text-slate-700">
              Notification Preferences
            </Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">New Request Notifications</p>
                  <p className="text-xs text-slate-500">Get notified when new damage reports are submitted</p>
                </div>
                <Switch
                  checked={formData.notifications.newRequest}
                  onCheckedChange={(checked) => updateNotification('newRequest', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">Status Update Notifications</p>
                  <p className="text-xs text-slate-500">Get notified when request status changes</p>
                </div>
                <Switch
                  checked={formData.notifications.statusUpdate}
                  onCheckedChange={(checked) => updateNotification('statusUpdate', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">Completion Notifications</p>
                  <p className="text-xs text-slate-500">Get notified when requests are completed</p>
                </div>
                <Switch
                  checked={formData.notifications.completion}
                  onCheckedChange={(checked) => updateNotification('completion', checked)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
