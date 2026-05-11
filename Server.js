const express    = require('express');
const cors       = require('cors');
require('dotenv').config();

const { initDatabase } = require('./Database');
const authRoutes       = require('./Authroutes');
const workoutRoutes    = require('./Workoutroutes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'Aura API rodando ✅' }));
app.use('/auth',     authRoutes);
app.use('/workouts', workoutRoutes);

async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}

start();