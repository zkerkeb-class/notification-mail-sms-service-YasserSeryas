import DatabaseService from '../config/database.js';

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
      
      // 1. D'abord créer la notification en BDD
      const createResult = await this.createNotification(req, res);
      
      // Si la création a échoué, on s'arrête
      if (!createResult) return;

      // 2. TODO: Ajouter la logique d'envoi immédiat
      // Par exemple, appeler un service d'email ou SMS
      
      console.log('📧 Envoi de la notification...');
      // Simuler l'envoi
      setTimeout(async () => {
        // Mettre à jour le statut en BDD
        // await databaseService.updateNotificationStatus(notificationId, {
        //   status: 'sent',
        //   sentAt: new Date()
        // });
      }, 1000);

    } catch (error) {
      console.error('❌ Erreur dans sendNotification:', error);
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de la notification'
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
}

export default new NotificationController();
