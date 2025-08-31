import { Router } from 'express';
const router = Router();
import controllers from '../controllers/notificationController.js';

// POST /api/notifications - Créer une notification
router.post('/', controllers.createNotification);

// GET /api/notifications - Récupérer les notifications
router.get('/', controllers.getNotifications);

// POST /api/notifications/send - Envoyer une notification immédiatement
router.post('/send', controllers.sendNotification);

// GET /api/notifications/test-connection - Tester les connexions email/SMS
router.get('/test-connection', controllers.testConnection);

// GET /api/notifications/health - Vérifier la santé du service
router.get('/health', controllers.healthCheck);

export default router;
