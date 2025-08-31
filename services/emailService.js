import nodemailer from '../config/email.js';
import pkg from 'handlebars';
import emailTemplates from '../templates/emailTemplates.js';

const { compile } = pkg;

class EmailService {  async sendEmail(notification) {
    try {
      if (!nodemailer) {
        throw new Error('Service email non configuré - vérifiez vos variables d\'environnement SMTP');
      }

      // Debug: Afficher les templates disponibles
      console.log('🔍 Templates disponibles:', Object.keys(emailTemplates));
      console.log('🎯 Template demandé:', notification.template);

      const template = emailTemplates[notification.template];
      if (!template) {
        throw new Error(`Template '${notification.template}' not found. Templates disponibles: ${Object.keys(emailTemplates).join(', ')}`);
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
  async verifyConnection() {
    try {
      if (!nodemailer) {
        return { 
          success: false, 
          error: 'Transporter email non initialisé - vérifiez vos variables d\'environnement SMTP' 
        };
      }
      
      await nodemailer.verify();
      console.log('SMTP connection verified successfully');
      return { success: true, message: 'SMTP connection verified' };
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
