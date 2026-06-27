import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import our separate feature files
import goalRoutes from './routes/goalRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import motivationRoutes from './routes/motivationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 30-Second Global Timeout Safeguard
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(504).json({ error: "The AI processing pipeline took too long. Request aborted." });
    }
  });
  next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Enterprise Mesh'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Register all modular features
app.use('/api/goals', goalRoutes);
app.use('/api/goals', taskRoutes);
app.use('/api/motivation', motivationRoutes);
app.use('/api/goals', reviewRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Modular Feature Server running on port ${PORT}`));
