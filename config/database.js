import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

class DatabaseService {
  constructor() {
    this.baseURL = process.env.DATABASE_SERVICE_URL || 'http://localhost:6000';
    this.timeout = 5000; // 5 secondes
    
    // Configuration axios
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'microservice-notification/1.0.0'
      }
    });

    // Intercepteurs pour le logging
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Intercepteur de requête
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`📤 Appel API BDD: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('📄 Données envoyées:', config.data);
        return config;
      },
      (error) => {
        console.error('❌ Erreur intercepteur requête:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`📥 Réponse API BDD: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        console.error('❌ Erreur intercepteur réponse:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Créer une notification dans la BDD
  async createNotification(notificationData) {
    try {
      console.log('🔄 Création d\'une notification via API BDD...');
      
      const response = await this.apiClient.post('/api/notifications', notificationData);
      
      if (response.data.success) {
        console.log('✅ Notification créée avec succès:', response.data.data.id);
        return {
          success: true,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.message || 'Échec de création');
      }

    } catch (error) {
      console.error('❌ Erreur lors de la création de notification:', error.message);
      
      if (error.response) {
        // Erreur de la réponse du serveur
        return {
          success: false,
          error: error.response.data.message || 'Erreur du serveur BDD',
          statusCode: error.response.status
        };
      } else if (error.request) {
        // Erreur de réseau
        return {
          success: false,
          error: 'Service BDD non disponible',
          statusCode: 503
        };
      } else {
        // Autre erreur
        return {
          success: false,
          error: error.message,
          statusCode: 500
        };
      }
    }
  }

  // Récupérer des notifications depuis la BDD
  async getNotifications(filters = {}) {
    try {
      console.log('🔍 Récupération des notifications via API BDD...');
      
      const response = await this.apiClient.get('/api/notifications', {
        params: filters
      });
      
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };

    } catch (error) {
      console.error('❌ Erreur lors de la récupération:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de récupération',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Mettre à jour le statut d'une notification
  async updateNotificationStatus(notificationId, statusData) {
    try {
      console.log(`🔄 Mise à jour du statut de la notification ${notificationId}...`);
      
      const response = await this.apiClient.put(
        `/api/notifications/${notificationId}/status`,
        statusData
      );
      
      return {
        success: true,
        data: response.data.data
      };

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Erreur de mise à jour',
        statusCode: error.response?.status || 500
      };
    }
  }

  // Vérifier la santé du service BDD
  async healthCheck() {
    try {
      const response = await this.apiClient.get('/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: 'Service BDD non disponible'
      };
    }
  }
}

export default new DatabaseService();
