import queueService from '../services/queueService';
import emailService from '../services/emailService';
import smsService from '../services/smsService';
import { findById } from '../models/Notification';
require('../config/database').default;

// Traitement des emails
queueService.getEmailQueue().process('send-email', async (job) => {
  const { notificationId } = job.data;
  
  try {
    const notification = await findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const result = await emailService.sendEmail(notification);
    
    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
    } else {
      notification.status = 'failed';
      notification.errorMessage = result.error;
      notification.retryCount += 1;
    }
    
    await notification.save();
    return result;
  } catch (error) {
    console.error('Email processing error:', error);
    throw error;
  }
});

// Traitement des SMS
queueService.getSMSQueue().process('send-sms', async (job) => {
  const { notificationId } = job.data;
  
  try {
    const notification = await findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }

    const result = await smsService.sendSMS(notification);
    
    if (result.success) {
      notification.status = 'sent';
      notification.sentAt = new Date();
    } else {
      notification.status = 'failed';
      notification.errorMessage = result.error;
      notification.retryCount += 1;
    }
    
    await notification.save();
    return result;
  } catch (error) {
    console.error('SMS processing error:', error);
    throw error;
  }
});

console.log('Notification workers started...');
