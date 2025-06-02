import { post, get, patch } from 'axios';

class NotificationDataService {
  constructor() {
    this.baseURL = process.env.NOTIFICATION_DATA_SERVICE_URL || 'http://localhost:3002/api';
    this.apiKey = process.env.NOTIFICATION_DATA_SERVICE_API_KEY;
  }

  async createNotification(notificationData) {
    try {
      const response = await post(`${this.baseURL}/notifications`, notificationData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error.response?.data || error.message);
      throw new Error('Failed to create notification');
    }
  }

  async getNotificationById(id) {
    try {
      const response = await get(`${this.baseURL}/notifications/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching notification:', error.response?.data || error.message);
      throw new Error('Failed to fetch notification');
    }
  }

  async updateNotificationStatus(id, status, metadata = {}) {
    try {
      const response = await patch(`${this.baseURL}/notifications/${id}/status`, {
        status,
        ...metadata
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating notification status:', error.response?.data || error.message);
      throw new Error('Failed to update notification status');
    }
  }

  async getNotificationStats(filters = {}) {
    try {
      const response = await get(`${this.baseURL}/notifications/stats`, {
        params: filters,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching notification stats:', error.response?.data || error.message);
      throw new Error('Failed to fetch notification stats');
    }
  }

  async incrementRetryCount(id) {
    try {
      const response = await patch(`${this.baseURL}/notifications/${id}/retry`, {}, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error incrementing retry count:', error.response?.data || error.message);
      throw new Error('Failed to increment retry count');
    }
  }
}

export default new NotificationDataService();
