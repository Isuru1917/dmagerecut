import { supabase } from '@/integrations/supabase/client';
import { DamageRequest, PanelInfo } from '@/types/types';
import { EmailNotificationService } from './emailNotificationService';
import { createGmailEmailService } from './gmailEmailService';
import { emailSettingsService } from './emailSettingsService';

export interface CreateDamageRequestData {
  gliderName: string;
  orderNumber: string;
  reason: string;
  panels: PanelInfo[];
  notes?: string;
  status?: string;
}

// Email sending utility that supports both Resend and Gmail
async function sendEmailNotification(request: DamageRequest, type: 'new_request' | 'status_update', oldStatus?: string) {
  try {
    const emailSettings = await emailSettingsService.getEmailSettings();
    
    if (!emailSettings || !emailSettings.notifications[type === 'new_request' ? 'newRequest' : 'statusUpdate']) {
      return; // Email notifications disabled
    }    // Check which email provider is configured
    const emailProvider = localStorage.getItem('email_provider') || 'resend';

    if (emailProvider === 'gmail') {
      // Use Gmail SMTP service
      const gmailUser = localStorage.getItem('gmail_user');
      const gmailAppPassword = localStorage.getItem('gmail_app_password');
      
      if (!gmailUser || !gmailAppPassword) {
        return;
      }const gmailService = createGmailEmailService({
        gmailUser,
        gmailAppPassword,
        companyName: 'Aqua Dynamics'
      });      const recipients = {
        to: emailSettings.recipients,
        cc: emailSettings.ccRecipients
      };

      if (type === 'new_request') {
        await gmailService.sendNewRequestNotification(request, recipients);
      } else {
        await gmailService.sendStatusUpdateNotification(request, request.status, recipients);
      }
    } else {
      // Use existing Resend service
      const notificationType = type === 'new_request' ? 'new_request' : 'status_update';
      await EmailNotificationService.sendNewRequestNotification({
        to: emailSettings.recipients,
        cc: emailSettings.ccRecipients,
        damageRequest: request,
        type: notificationType
      });    }
  } catch (emailError) {
    // Don't throw error here - request operation was successful, email is secondary
  }
}

export const damageRequestService = {  // Create a new damage request
  async createDamageRequest(data: CreateDamageRequestData): Promise<DamageRequest> {
    const now = new Date().toISOString();
    
    const { data: result, error } = await supabase
      .from('damage_requests')
      .insert({
        glider_name: data.gliderName,
        order_number: data.orderNumber,
        reason: data.reason,
        panels: data.panels as any,
        status: data.status || 'Pending',
        notes: data.notes || null,
        submitted_at: now,
        updated_at: now,
        created_at: now
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create damage request: ${error.message}`);
    }

    const newRequest: DamageRequest = {
      id: result.id,
      gliderName: result.glider_name,
      orderNumber: result.order_number,
      reason: result.reason,
      panels: result.panels as unknown as PanelInfo[],
      status: result.status as 'Pending' | 'In Progress' | 'Done',
      submittedAt: new Date(result.submitted_at),
      updatedAt: new Date(result.updated_at),
      notes: result.notes || undefined
    };    // Send email notification for new request
    await sendEmailNotification(newRequest, 'new_request');

    return newRequest;
  },

  // Get all damage requests
  async getDamageRequests(): Promise<DamageRequest[]> {
    const { data, error } = await supabase
      .from('damage_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch damage requests: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      gliderName: item.glider_name,
      orderNumber: item.order_number,
      reason: item.reason,
      panels: item.panels as unknown as PanelInfo[],
      status: item.status as 'Pending' | 'In Progress' | 'Done',
      submittedAt: new Date(item.submitted_at),
      updatedAt: new Date(item.updated_at),
      notes: item.notes || undefined
    }));
  },
  // Update damage request status
  async updateDamageRequestStatus(id: string, status: 'Pending' | 'In Progress' | 'Done'): Promise<void> {
    const { error } = await supabase
      .from('damage_requests')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to update damage request status: ${error.message}`);
    }    // Send email notification for status update
    try {
      const updatedRequest = await this.getDamageRequestById(id);
      if (updatedRequest) {
        await sendEmailNotification(updatedRequest, 'status_update');
      }
    } catch (emailError) {
      console.error('Failed to send status update email notification:', emailError);
      // Don't throw error here - status was updated successfully, email is secondary
    }
  },

  // Delete a damage request
  async deleteDamageRequest(id: string): Promise<void> {
    const { error } = await supabase
      .from('damage_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete damage request: ${error.message}`);
    }
  },

  // Get a single damage request by ID
  async getDamageRequestById(id: string): Promise<DamageRequest | null> {
    const { data, error } = await supabase
      .from('damage_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows returned
      }
      throw new Error(`Failed to fetch damage request: ${error.message}`);
    }

    return {
      id: data.id,
      gliderName: data.glider_name,
      orderNumber: data.order_number,
      reason: data.reason,
      panels: data.panels as unknown as PanelInfo[],
      status: data.status as 'Pending' | 'In Progress' | 'Done',
      submittedAt: new Date(data.submitted_at),
      updatedAt: new Date(data.updated_at),
      notes: data.notes || undefined
    };
  }
};
