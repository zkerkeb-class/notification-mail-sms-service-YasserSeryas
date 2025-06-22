import dotenv from 'dotenv';
dotenv.config();

import emailService from './services/emailService.js';

// Fonction pour tester la connexion SMTP
async function testConnection() {
  console.log('🔍 Test de connexion SMTP...');
  const result = await emailService.verifyConnection();
  
  if (result.success) {
    console.log('✅ Connexion SMTP réussie !');
    return true;
  } else {
    console.error('❌ Erreur de connexion SMTP:', result.error);
    return false;
  }
}

// Fonction pour envoyer un email de test
async function sendTestEmail() {
  console.log('📧 Envoi d\'un email de test...');
  
  const testNotification = {
    recipient: 'yassermohamedyoussouf@gmail.com', // Changez cette adresse
    subject: 'Test du service de notification - Nodemailer',
    template: 'reservation-confirmation',
    templateData: {
      userName: 'Utilisateur Test',
      eventName: 'Test Event Nodemailer',
      reservationNumber: 'TEST-2025-001',
      eventDate: '19 juin 2025',
      eventLocation: 'Laboratoire de test, Bureau',
      ticketCount: 1,
      totalAmount: 25
    }
  };

  try {
    const result = await emailService.sendEmail(testNotification);
    
    if (result.success) {
      console.log('✅ Email envoyé avec succès !');
      console.log('📨 Message ID:', result.messageId);
      console.log('📋 Réponse serveur:', result.response);
    } else {
      console.error('❌ Erreur d\'envoi:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Erreur système:', error.message);
    return { success: false, error: error.message };
  }
}

// Fonction pour tester l'envoi en lot
async function sendBulkTestEmails() {
  console.log('📧📧 Test d\'envoi en lot...');
  
  const notifications = [
    {
      recipient: 'yassermohamedyoussouf@gmail.com',
      subject: 'Newsletter - Juin 2025',
      template: 'event-reminder',
      templateData: {
        userName: 'Abonné 1',
        eventName: 'Newsletter Test',
        timeUntilEvent: '1 semaine',
        eventDate: '26 juin 2025',
        eventLocation: 'En ligne'
      }
    },
    {
      recipient: 'yassermohamedyoussouf@gmail.com',
      subject: 'Rappel - Formation JavaScript',
      template: 'event-reminder',
      templateData: {
        userName: 'Participant 2',
        eventName: 'Formation JavaScript Avancé',
        timeUntilEvent: '24 heures',
        eventDate: '20 juin 2025',
        eventLocation: 'Centre de formation, Paris'
      }
    }
  ];

  try {
    const results = await emailService.sendBulkEmails(notifications);
    console.log('📊 Résultats envoi en lot:');
    
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`  ✅ Email ${index + 1}: Envoyé (${result.messageId})`);
      } else {
        console.log(`  ❌ Email ${index + 1}: Erreur - ${result.error}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('💥 Erreur lors de l\'envoi en lot:', error.message);
    return [];
  }
}

// Fonction principale pour exécuter tous les tests
async function runAllTests() {
  console.log('🚀 Démarrage des tests du service email avec Nodemailer');
  console.log('================================================');
  
  // Test 1: Vérification de la connexion
  const connectionOK = await testConnection();
  console.log('');
  
  if (!connectionOK) {
    console.log('⚠️ Impossible de continuer - problème de connexion SMTP');
    console.log('💡 Vérifiez vos variables d\'environnement dans le fichier .env');
    return;
  }
  
  // Test 2: Envoi d'un email simple
  await sendTestEmail();
  console.log('');
  
  // Pause de 2 secondes entre les tests
  console.log('⏳ Pause de 2 secondes...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test 3: Envoi en lot
  await sendBulkTestEmails();
  console.log('');
  
  console.log('🎉 Tests terminés !');
  console.log('📝 Vérifiez votre boîte email pour confirmer la réception');
}

// Exécuter les tests si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testConnection, sendTestEmail, sendBulkTestEmails, runAllTests };
