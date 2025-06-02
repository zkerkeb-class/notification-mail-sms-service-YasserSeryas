import nodemailer from '../config/email.js';
import { compile } from 'handlebars';
import emailTemplates from '../templates/emailTemplates.js';

class EmailService {
  async sendEmail(notification) {
    try {
      const template = emailTemplates[notification.template];
      if (!template) {
        throw new Error(`Template ${notification.template} not found`);
      }

      const compiledTemplate = compile(template.html);
      const htmlContent = compiledTemplate(notification.templateData);

      const mailOptions = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: notification.recipient,
        subject: notification.subject,
        html: htmlContent,
        text: template.text ? compile(template.text)(notification.templateData) : undefined
      };

      const result = await nodemailer.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      console.error('Email send error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendBulkEmails(notifications) {
    const results = [];
    
    for (const notification of notifications) {
      const result = await this.sendEmail(notification);
      results.push({
        notificationId: notification._id,
        ...result
      });
    }
    
    return results;
  }
}

export default new EmailService();
