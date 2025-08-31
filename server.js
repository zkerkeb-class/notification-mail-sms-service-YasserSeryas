import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import emailService from './services/emailService.js';

const PORT = process.env.PORT || 3004;

app.listen(PORT, async () => {
  console.log(`🚀 Microservice Notification démarré sur le port ${PORT}`);
  console.log(`🔗 Service BDD configuré sur: ${process.env.DATABASE_SERVICE_URL || 'http://localhost:6000'}`);
  
  // Vérification de la connexion SMTP
  const emailConnection = await emailService.verifyConnection();
  if (emailConnection.success) {
    console.log('✅ Connexion SMTP vérifiée avec succès');
  } else {
    console.error('❌ Erreur de connexion SMTP:', emailConnection.error);
  }
});
