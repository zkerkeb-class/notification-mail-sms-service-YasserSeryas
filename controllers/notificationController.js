import DatabaseService from '../config/database.js';
import emailService from '../services/emailService.js';
import smsService from '../services/smsService.js';

class NotificationController {
  // Créer et enregistrer une notification
  async createNotification(req, res) {
    try {
      console.log('📨 Nouvelle demande de création de notification');
      
      const {
        type,
        recipient,
        subject,
        content,
        template,
        templateData,
        priority,
        scheduledFor,
        metadata
      } = req.body;

      // Validation des données
      if (!type || !recipient || !template) {
        return res.status(400).json({
          success: false,
          message: 'Champs requis: type, recipient, template'
        });
      }

      // Préparer les données pour la BDD
      const notificationData = {
        type,
        recipient,
        subject,
        content: content || `Notification ${template} pour ${recipient}`,
        template,
        templateData: templateData || {},
        priority: priority || 'normal',
        scheduledFor: scheduledFor || new Date(),
        metadata: {
          ...metadata,
          source: 'microservice-notification',
          createdBy: req.user?.id || 'system'
        }
      };

      // Appeler le service BDD pour enregistrer la notification
      const result = await DatabaseService.createNotification(notificationData);

      if (result.success) {
        console.log('✅ Notification enregistrée avec succès');
        
        // TODO: Ici, vous pourriez ajouter la notification à une queue
        // pour traitement asynchrone (envoi email/SMS)
        
        res.status(201).json({
          success: true,
          message: 'Notification créée et enregistrée avec succès',
          data: result.data
        });
      } else {
        console.error('❌ Échec de l\'enregistrement en BDD');
        
        res.status(result.statusCode || 500).json({
          success: false,
          message: result.error || 'Erreur lors de l\'enregistrement'
        });
      }

    } catch (error) {
      console.error('❌ Erreur dans createNotification:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur interne du service notification'
      });
    }
  }

  // Récupérer l'historique des notifications
  async getNotifications(req, res) {
    try {
      console.log('📋 Demande de récupération des notifications');
      
      const filters = {
        status: req.query.status,
        type: req.query.type,
        page: req.query.page || 1,
        limit: req.query.limit || 10,
        userId: req.query.userId
      };

      // Nettoyer les filtres (supprimer les valeurs undefined)
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const result = await DatabaseService.getNotifications(filters);

      if (result.success) {
        res.json({
          success: true,
          data: result.data,
          pagination: result.pagination
        });
      } else {
        res.status(result.statusCode || 500).json({
          success: false,
          message: result.error
        });
      }

    } catch (error) {
      console.error('❌ Erreur dans getNotifications:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des notifications'
      });
    }
  }
  // Envoyer une notification immédiate (email/sms)
 async sendNotification(req, res) {
  try {
    console.log('🚀 Demande d\'envoi immédiat de notification');
    
    const {
      type,
      recipient,
      subject,
      template,
      templateData,
      priority = 'normal'
    } = req.body;

    // Validation des données requises
    if (!type || !recipient || !template) {
      return res.status(400).json({
        success: false,
        message: 'Champs requis: type, recipient, template'
      });
    }

    // Validation du type de notification
    if (!['email', 'sms'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type de notification non supporté. Utilisez: email, sms'
      });
    }

    // Validation spécifique email
    if (type === 'email' && !subject) {
      return res.status(400).json({
        success: false,
        message: 'Le subject est requis pour les emails'
      });
    }

    // ✅ ÉTAPE 1: ENREGISTREMENT INITIAL avec status 'pending'
    const initialNotificationData = {
      type,
      recipient,
      subject: subject || null,
      content: `Notification ${template} pour ${recipient}`,
      template,
      templateData: templateData || {},
      priority,
      status: 'pending', // Status initial
      scheduledFor: new Date(),
      retryCount: 0,
      metadata: {
        source: 'microservice-notification',
        sentImmediately: true,
        createdBy: req.user?.id || 'system',
        attempts: 0,
        provider: type === 'email' ? 'nodemailer' : 'twilio'
      }
    };

    console.log('💾 Enregistrement initial en BDD...');
    let dbResult;
    let notificationId;

    try {
      dbResult = await DatabaseService.createNotification(initialNotificationData);
      
      if (!dbResult.success) {
        throw new Error('Échec de l\'enregistrement initial en BDD');
      }
      console.log("dbResult:", dbResult);
      notificationId = dbResult.data.id;
      console.log('✅ Notification créée en BDD avec ID:', notificationId);
      
    } catch (dbError) {
      console.error('❌ Erreur lors de l\'enregistrement initial:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'enregistrement initial en base de données',
        error: dbError.message
      });
    }

    // ✅ ÉTAPE 2: TENTATIVE D'ENVOI
    let sendResult = null;
    const sendStartTime = new Date();

    try {
      if (type === 'email') {
        console.log('📧 Envoi d\'email avec Nodemailer...');
        
        sendResult = await emailService.sendEmail({
          recipient,
          subject,
          template,
          templateData
        });

      } else if (type === 'sms') {
        console.log('📱 Envoi de SMS...');
        
        sendResult = await smsService.sendSMS({
          recipient,
          template,
          templateData
        });
      }

      console.log(`${sendResult?.success ? '✅' : '❌'} Résultat envoi ${type}:`, {
        recipient,
        success: sendResult?.success,
        messageId: sendResult?.messageId,
        error: sendResult?.error
      });

    } catch (sendError) {
      console.error(`❌ Erreur lors de l'envoi ${type}:`, sendError);
      sendResult = {
        success: false,
        error: sendError.message
      };
    }

    // ✅ ÉTAPE 3: MISE À JOUR en BDD avec le résultat d'envoi
    const sendEndTime = new Date();
    const updateData = {
      status: sendResult?.success ? 'sent' : 'failed',
      sentAt: sendResult?.success ? sendEndTime : null,
      retryCount: 1,
      updatedAt: sendEndTime,
      'metadata.messageId': sendResult?.messageId || null,
      'metadata.errorMessage': sendResult?.success ? null : (sendResult?.error || 'Unknown error'),
      'metadata.attempts': 1,
      'metadata.lastAttempt': sendEndTime.toISOString(),
      'metadata.processingTime': sendEndTime - sendStartTime,
      'metadata.status': sendResult?.success ? 'sent' : 'failed'
    };

    console.log('🔄 Mise à jour du status en BDD...');
    
    try {
      const updateResult = await DatabaseService.updateNotificationStatus(notificationId, updateData);
      
      if (updateResult.success) {
        console.log('✅ Status mis à jour en BDD:', updateData.status);
      } else {
        console.error('⚠️ Échec de la mise à jour en BDD (mais envoi traité)');
      }
      
    } catch (updateError) {
      console.error('⚠️ Erreur lors de la mise à jour BDD:', updateError);
      // On continue car l'envoi a été traité
    }

    // ✅ ÉTAPE 4: RÉPONSE basée sur le résultat d'envoi
    if (sendResult && sendResult.success) {
      console.log('✅ Notification envoyée avec succès');
      
      return res.status(200).json({
        success: true,
        message: `${type === 'email' ? 'Email' : 'SMS'} envoyé avec succès`,
        data: {
          notificationId,
          type,
          recipient,
          template,
          messageId: sendResult.messageId,
          status: 'sent',
          sentAt: sendEndTime.toISOString(),
          provider: type === 'email' ? 'Nodemailer' : 'Twilio',
          processingTime: sendEndTime - sendStartTime
        }
      });
      
    } else {
      console.error('❌ Échec de l\'envoi de notification');
      
      return res.status(500).json({
        success: false,
        message: `Erreur lors de l'envoi du ${type === 'email' ? 'email' : 'SMS'}`,
        data: {
          notificationId,
          type,
          recipient,
          template,
          status: 'failed',
          error: sendResult?.error || 'Erreur inconnue'
        },
        error: sendResult?.error || 'Erreur inconnue'
      });
    }

  } catch (error) {
    console.error('❌ Erreur générale dans sendNotification:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erreur interne lors de l\'envoi de la notification',
      error: error.message
    });
  }
}



  // Vérifier la santé des services
  async healthCheck(req, res) {
    try {
      const dbHealth = await _healthCheck();
      
      res.json({
        status: 'OK',
        service: 'microservice-notification',
        timestamp: new Date().toISOString(),
        dependencies: {
          database: dbHealth.success ? 'OK' : 'KO',
          databaseDetails: dbHealth.data || dbHealth.error
        }
      });

    } catch (error) {
      res.status(500).json({
        status: 'KO',
        service: 'microservice-notification',
        error: error.message
      });
    }
  }

  // Tester la connexion des services (email/SMS)
  async testConnection(req, res) {
    try {
      console.log('🔍 Test des connexions des services...');
      
      const results = {
        timestamp: new Date().toISOString(),
        tests: {}
      };

      // Test connexion email (Nodemailer)
      try {
        const emailTest = await emailService.verifyConnection();
        results.tests.email = {
          provider: 'Nodemailer',
          status: emailTest.success ? 'OK' : 'FAILED',
          message: emailTest.message || emailTest.error,
          config: {
            host: process.env.SMTP_HOST || 'Non configuré',
            port: process.env.SMTP_PORT || 'Non configuré',
            user: process.env.SMTP_USER ? '***@' + process.env.SMTP_USER.split('@')[1] : 'Non configuré'
          }
        };
      } catch (error) {
        results.tests.email = {
          provider: 'Nodemailer',
          status: 'ERROR',
          message: error.message
        };
      }

      // Test connexion SMS (Twilio)
      try {
        const smsTest = await smsService.verifyConnection();
        results.tests.sms = {
          provider: 'Twilio',
          status: smsTest.success ? 'OK' : 'FAILED',
          message: smsTest.message || smsTest.error
        };
      } catch (error) {
        results.tests.sms = {
          provider: 'Twilio',
          status: 'ERROR',
          message: error.message
        };
      }

      // Déterminer le statut global
      const allTestsPassed = Object.values(results.tests).every(test => test.status === 'OK');
      
      res.status(allTestsPassed ? 200 : 500).json({
        success: allTestsPassed,
        message: allTestsPassed ? 'Tous les services sont opérationnels' : 'Un ou plusieurs services ont des problèmes',
        data: results
      });

    } catch (error) {
      console.error('❌ Erreur dans testConnection:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors du test des connexions',
        error: error.message
      });
    }
  }
}

export default new NotificationController();
