import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DamageRequest, PanelInfo } from '../types/types';
import { useToast } from '@/hooks/use-toast';
import MaterialAutocomplete from './ui/material-autocomplete';
import { PlusCircle, Trash2 } from 'lucide-react';

interface DamageReportFormProps {
  onSubmit: (request: Omit<DamageRequest, 'id' | 'submittedAt' | 'updatedAt'>) => void;
}

const DamageReportForm: React.FC<DamageReportFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    gliderName: '',
    orderNumber: '',
    reason: '',
    notes: ''
  });

  const [panels, setPanels] = useState<PanelInfo[]>([{
    panelType: '',
    panelNumber: '',
    material: '',
    quantity: 1,
    side: 'Left Side' as const
  }]);

  type FormErrorType = {
    [K in keyof typeof formData]?: string;
  };

  type PanelErrorType = {
    [index: number]: {
      panelType?: string;
      panelNumber?: string;
      material?: string;
      quantity?: string;
    }
  };

  const [formErrors, setFormErrors] = useState<FormErrorType>({});
  const [panelErrors, setPanelErrors] = useState<PanelErrorType>({});

  const validateForm = () => {
    const newFormErrors: FormErrorType = {};
    const newPanelErrors: PanelErrorType = {};
    let hasErrors = false;

    // Validate main form fields
    if (!formData.gliderName.trim()) {
      newFormErrors.gliderName = 'Glider name is required';
      hasErrors = true;
    }

    if (!formData.orderNumber.trim()) {
      newFormErrors.orderNumber = 'Order number is required';
      hasErrors = true;
    }

    if (!formData.reason.trim()) {
      newFormErrors.reason = 'Reason is required';
      hasErrors = true;
    }

    // Validate each panel
    panels.forEach((panel, index) => {
      const panelError: { [key: string]: string } = {};

      if (!panel.panelType.trim()) {
        panelError.panelType = 'Panel type is required';
        hasErrors = true;
      }

      if (!panel.panelNumber.trim()) {
        panelError.panelNumber = 'Panel number is required';
        hasErrors = true;
      }

      if (!panel.material.trim()) {
        panelError.material = 'Material is required';
        hasErrors = true;
      }

      if (panel.quantity < 1) {
        panelError.quantity = 'Quantity must be at least 1';
        hasErrors = true;
      }

      if (Object.keys(panelError).length > 0) {
        newPanelErrors[index] = panelError;
      }
    });

    setFormErrors(newFormErrors);
    setPanelErrors(newPanelErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    onSubmit({
      ...formData,
      panels,
      status: 'Pending'
    });

    // Reset form
    setFormData({
      gliderName: '',
      orderNumber: '',
      reason: '',
      notes: ''
    });
    
    setPanels([{
      panelType: '',
      panelNumber: '',
      material: '',
      quantity: 1,
      side: 'Left Side'
    }]);

    setIsSubmitting(false);

    toast({
      title: "Request Submitted",
      description: "Your damage panel recut request has been submitted successfully.",
    });
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePanelChange = (index: number, field: keyof PanelInfo, value: string | number) => {
    const updatedPanels = [...panels];
    updatedPanels[index] = { ...updatedPanels[index], [field]: value };
    setPanels(updatedPanels);
    
    // Clear error for this field if it exists
    if (panelErrors[index]?.[field]) {
      const updatedErrors = { ...panelErrors };
      if (updatedErrors[index]) {
        updatedErrors[index] = { ...updatedErrors[index], [field]: undefined };
        if (Object.keys(updatedErrors[index]).every(k => !updatedErrors[index][k])) {
          delete updatedErrors[index];
        }
      }
      setPanelErrors(updatedErrors);
    }
  };

  const addPanel = () => {
    setPanels([...panels, {
      panelType: '',
      panelNumber: '',
      material: '',
      quantity: 1,
      side: 'Left Side'
    }]);
  };

  const removePanel = (index: number) => {
    if (panels.length === 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one panel is required.",
        variant: "destructive",
      });
      return;
    }
    
    const updatedPanels = [...panels];
    updatedPanels.splice(index, 1);
    setPanels(updatedPanels);
    
    // Remove errors for this panel
    if (panelErrors[index]) {
      const updatedErrors = { ...panelErrors };
      delete updatedErrors[index];
      
      // Reindex errors for panels after the removed one
      Object.keys(updatedErrors).forEach(key => {
        const keyIndex = parseInt(key);
        if (keyIndex > index) {
          updatedErrors[keyIndex - 1] = updatedErrors[keyIndex];
          delete updatedErrors[keyIndex];
        }
      });
      
      setPanelErrors(updatedErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Order Information */}
      <div className="space-y-4">
        <h3 className="text-md font-medium text-slate-900 border-b border-slate-200 pb-2">
          Order Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gliderName">Glider Name *</Label>
            <Input
              id="gliderName"
              value={formData.gliderName}
              onChange={(e) => handleInputChange('gliderName', e.target.value)}
              className={`transition-all duration-200 ${formErrors.gliderName ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="e.g., Advance Alpha 7"
            />
            {formErrors.gliderName && (
              <p className="text-sm text-red-600">{formErrors.gliderName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderNumber">Order Number *</Label>
            <Input
              id="orderNumber"
              value={formData.orderNumber}
              onChange={(e) => handleInputChange('orderNumber', e.target.value)}
              className={`transition-all duration-200 ${formErrors.orderNumber ? 'border-red-500 focus:border-red-500' : ''}`}
              placeholder="Enter order number"
            />
            {formErrors.orderNumber && (
              <p className="text-sm text-red-600">{formErrors.orderNumber}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason *</Label>
          <Textarea
            id="reason"
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            className={`min-h-[80px] transition-all duration-200 ${formErrors.reason ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="Please describe the reason for the panel recut..."
          />
          {formErrors.reason && (
            <p className="text-sm text-red-600">{formErrors.reason}</p>
          )}
        </div>
      </div>

      {/* Panel Information */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
          <h3 className="text-md font-medium text-slate-900">
            Panel Information
          </h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={addPanel}
            className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <PlusCircle className="w-4 h-4" /> Add Panel
          </Button>
        </div>
        
        {panels.map((panel, index) => (
          <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-slate-800">Panel #{index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePanel(index)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`panelType-${index}`}>Panel Type *</Label>
                <Select 
                  value={panel.panelType} 
                  onValueChange={(value) => handlePanelChange(index, 'panelType', value)}
                >
                  <SelectTrigger 
                    id={`panelType-${index}`}
                    className={`transition-all duration-200 ${panelErrors[index]?.panelType ? 'border-red-500 focus:border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select panel type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                    <SelectItem value="Top Surface">Top Surface</SelectItem>
                    <SelectItem value="Bottom Surface">Bottom Surface</SelectItem>
                    <SelectItem value="Leading Edge">Leading Edge</SelectItem>
                    <SelectItem value="Trailing Edge">Trailing Edge</SelectItem>
                    <SelectItem value="Stabilizer">Stabilizer</SelectItem>
                    <SelectItem value="Tip">Tip</SelectItem>
                    <SelectItem value="Center Cell">Center Cell</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {panelErrors[index]?.panelType && (
                  <p className="text-sm text-red-600">{panelErrors[index].panelType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`panelNumber-${index}`}>Panel Number *</Label>
                <Input
                  id={`panelNumber-${index}`}
                  value={panel.panelNumber}
                  onChange={(e) => handlePanelChange(index, 'panelNumber', e.target.value)}
                  className={`transition-all duration-200 ${panelErrors[index]?.panelNumber ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Enter panel number"
                />
                {panelErrors[index]?.panelNumber && (
                  <p className="text-sm text-red-600">{panelErrors[index].panelNumber}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <MaterialAutocomplete
                  id={`material-${index}`}
                  value={panel.material}
                  onChange={(value) => handlePanelChange(index, 'material', value)}
                  required={true}
                  error={panelErrors[index]?.material}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  value={panel.quantity}
                  onChange={(e) => handlePanelChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  className={`transition-all duration-200 ${panelErrors[index]?.quantity ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="1"
                />
                {panelErrors[index]?.quantity && (
                  <p className="text-sm text-red-600">{panelErrors[index].quantity}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`side-${index}`}>Side *</Label>
                <Select 
                  value={panel.side} 
                  onValueChange={(value: any) => handlePanelChange(index, 'side', value)}
                >
                  <SelectTrigger id={`side-${index}`} className="transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 shadow-lg z-50">
                    <SelectItem value="Left Side">Left Side</SelectItem>
                    <SelectItem value="Right Side">Right Side</SelectItem>
                    <SelectItem value="Left & Right Side">Left & Right Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="min-h-[80px] transition-all duration-200"
            placeholder="Any additional information or special requests..."
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          'Submit Panel Recut Request'
        )}
      </Button>
    </form>
  );
};

export default DamageReportForm;
