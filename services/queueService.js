import Queue from 'bull';
import redisClient from '../config/redis';

// Créer les queues
const emailQueue = new Queue('email notifications', {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
  }
});

const smsQueue = new Queue('sms notifications', {
  redis: {
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD
  }
});

class QueueService {
  async addEmailToQueue(notificationData, options = {}) {
    const jobOptions = {
      priority: this.getPriorityValue(notificationData.priority),
      delay: notificationData.scheduledFor ? 
        new Date(notificationData.scheduledFor).getTime() - Date.now() : 0,
      attempts: notificationData.maxRetries || 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: 50,
      removeOnFail: 50,
      ...options
    };

    return await emailQueue.add('send-email', notificationData, jobOptions);
  }

  async addSMSToQueue(notificationData, options = {}) {
    const jobOptions = {
      priority: this.getPriorityValue(notificationData.priority),
      delay: notificationData.scheduledFor ? 
        new Date(notificationData.scheduledFor).getTime() - Date.now() : 0,
      attempts: notificationData.maxRetries || 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: 50,
      removeOnFail: 50,
      ...options
    };

    return await smsQueue.add('send-sms', notificationData, jobOptions);
  }

  getPriorityValue(priority) {
    const priorities = {
      'urgent': 1,
      'high': 2,
      'normal': 3,
      'low': 4
    };
    return priorities[priority] || 3;
  }

  getEmailQueue() {
    return emailQueue;
  }

  getSMSQueue() {
    return smsQueue;
  }
}

export default new QueueService();
