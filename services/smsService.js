import twilioClient from '../config/sms';
import { compile } from 'handlebars';
import smsTemplates from '../templates/smsTemplates';

class SMSService {
  async sendSMS(notification) {
    try {
      const template = smsTemplates[notification.template];
      if (!template) {
        throw new Error(`Template ${notification.template} not found`);
      }

      const compiledTemplate = compile(template.content);
      const messageContent = compiledTemplate(notification.templateData);

      const message = await twilioClient.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: notification.recipient
      });

      return {
        success: true,
        sid: message.sid,
        status: message.status
      };
    } catch (error) {
      console.error('SMS send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkSMS(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      const result = await this.sendSMS(notification);
      results.push({
        notificationId: notification._id,
        ...result
      });
      
      // Petite pause pour éviter le rate limiting de Twilio
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }
}

export default new SMSService();
