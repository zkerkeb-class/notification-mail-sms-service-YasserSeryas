import { createTransporter } from 'nodemailer';

const emailConfig = {
  service: 'SendGrid',
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
};

const transporter = createTransporter(emailConfig);

export default transporter;
