import dotenv from 'dotenv';
dotenv.config();

// Exemple complet d'utilisation de l'API sendNotification

const API_BASE = 'http://localhost:3004/api/notifications';

// Fonction utilitaire pour faire des requêtes
async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    return {
      status: response.status,
      success: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

// Test 1: Vérification des connexions
async function testConnections() {
  console.log('🔍 Test des connexions des services...');
  
  const result = await apiRequest('/test-connection');
  
  if (result.success) {
    console.log('✅ Connexions OK');
    console.log('📧 Email:', result.data.data.tests.email.status);
    console.log('📱 SMS:', result.data.data.tests.sms.status);
  } else {
    console.error('❌ Problème de connexion:', result.data.message);
  }
  
  return result;
}

// Test 2: Envoi d'email
async function testEmailSending() {
  console.log('📧 Test d\'envoi d\'email...');
  
  const emailData = {
    type: 'email',
    recipient: 'yassermohamedyoussouf@gmail.com', // Changez cette adresse
    subject: 'Test API Controller - Nodemailer',
    template: 'reservation-confirmation',
    templateData: {
      userName: 'Utilisateur API Test',
      eventName: 'Test Controller Event',
      reservationNumber: 'API-2025-001',
      eventDate: '19 juin 2025',
      eventLocation: 'Bureau de test, Local',
      ticketCount: 1,
      totalAmount: 30
    },
    priority: 'high'
  };

  const result = await apiRequest('/send', 'POST', emailData);
  
  if (result.success) {
    console.log('✅ Email envoyé avec succès !');
    console.log('📨 Message ID:', result.data.data.messageId);
    console.log('🕒 Envoyé à:', result.data.data.sentAt);
  } else {
    console.error('❌ Erreur d\'envoi email:', result.data.message);
    if (result.data.error) {
      console.error('🔍 Détail:', result.data.error);
    }
  }
  
  return result;
}

// Test 3: Envoi de SMS (si Twilio configuré)
async function testSMSSending() {
  console.log('📱 Test d\'envoi de SMS...');
  
  const smsData = {
    type: 'sms',
    recipient: '+33123456789', // Changez ce numéro
    template: 'event-reminder',
    templateData: {
      userName: 'Test SMS',
      eventName: 'Formation API',
      timeUntilEvent: '30 minutes'
    },
    priority: 'normal'
  };

  const result = await apiRequest('/send', 'POST', smsData);
  
  if (result.success) {
    console.log('✅ SMS envoyé avec succès !');
    console.log('📱 SID:', result.data.data.messageId);
  } else {
    console.error('❌ Erreur d\'envoi SMS:', result.data.message);
    console.log('💡 Note: Vérifiez la configuration Twilio si nécessaire');
  }
  
  return result;
}

// Test 4: Santé du service
async function testHealthCheck() {
  console.log('🏥 Test de santé du service...');
  
  const result = await apiRequest('/health');
  
  if (result.success) {
    console.log('✅ Service en bonne santé');
    console.log('📊 Statut:', result.data.status);
  } else {
    console.error('❌ Problème de santé du service:', result.data);
  }
  
  return result;
}

// Test 5: Création de notification (sans envoi)
async function testNotificationCreation() {
  console.log('💾 Test de création de notification...');
  
  const notificationData = {
    type: 'email',
    recipient: 'test@example.com',
    subject: 'Notification programmée',
    template: 'event-reminder',
    templateData: {
      userName: 'Utilisateur programmé',
      eventName: 'Événement futur'
    },
    priority: 'low',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Dans 24h
  };

  const result = await apiRequest('/', 'POST', notificationData);
  
  if (result.success) {
    console.log('✅ Notification créée en BDD');
    console.log('🆔 ID:', result.data.data?._id || 'Non disponible');
  } else {
    console.error('❌ Erreur de création:', result.data.message);
  }
  
  return result;
}

// Test complet
async function runAllControllerTests() {
  console.log('🚀 Tests du Contrôleur Notification avec Nodemailer');
  console.log('=====================================================');
  
  // Vérifier que le serveur répond
  try {
    await fetch(API_BASE + '/health');
  } catch (error) {
    console.error('❌ Le serveur n\'est pas accessible.');
    console.log('💡 Démarrez le serveur avec: npm start');
    return;
  }

  const results = {};

  // Test 1: Santé du service
  results.health = await testHealthCheck();
  console.log('');

  // Test 2: Connexions
  results.connections = await testConnections();
  console.log('');

  // Test 3: Création de notification
  results.creation = await testNotificationCreation();
  console.log('');

  // Test 4: Envoi d'email (si connexion OK)
  if (results.connections.success) {
    results.email = await testEmailSending();
    console.log('');

    // Pause entre les envois
    console.log('⏳ Pause de 2 secondes...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 5: Envoi de SMS (optionnel)
    results.sms = await testSMSSending();
    console.log('');
  }

  // Résumé des tests
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('==================');
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${test}: ${result.success ? 'Succès' : 'Échec'}`);
  });

  console.log('');
  console.log('🎉 Tests terminés !');
  console.log('📝 Vérifiez votre boîte email pour les notifications reçues');
}

// Exécuter les tests si le script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllControllerTests().catch(console.error);
}

export { 
  testConnections, 
  testEmailSending, 
  testSMSSending, 
  testHealthCheck, 
  testNotificationCreation,
  runAllControllerTests 
};
