import { Router } from 'express';
const router = Router();
import controllers from '../controllers/notificationController.js';

// POST /api/notifications - Créer une notification
router.post('/', controllers.createNotification);

// GET /api/notifications - Récupérer les notifications
router.get('/', controllers.getNotifications);

// POST /api/notifications/send - Envoyer une notification immédiatement
router.post('/send', controllers.sendNotification);

export default router;
