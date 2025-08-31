import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Validation des variables d'environnement requises
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes pour SMTP:', missingVars.join(', '));
  console.error('💡 Veuillez configurer ces variables dans votre fichier .env');
}

const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : null,
  // Configuration pour les serveurs SMTP qui nécessitent TLS
  tls: {
    rejectUnauthorized: false
  }
};

// Ne créer le transporter que si les identifiants sont présents
let transporter = null;
if (emailConfig.auth) {
  transporter = nodemailer.createTransport(emailConfig);
} else {
  console.warn('⚠️ Transporter email non initialisé - identifiants SMTP manquants');
}

export default transporter;
