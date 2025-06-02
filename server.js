import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Microservice Notification démarré sur le port ${PORT}`);
  console.log(`🔗 Service BDD configuré sur: ${process.env.DATABASE_SERVICE_URL || 'http://localhost:6000'}`);
});
