import express, { json, urlencoded } from 'express';
import cors from 'cors';

import notificationRoutes from './routes/notificationRoutes.js';
// import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Middlewares
app.use(cors());
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true }));

// Logging des requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check


// Gestion des erreurs
// app.use(errorHandler);

export default app;

