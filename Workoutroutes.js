const express        = require('express');
const { pool }       = require('./Database');
const authMiddleware = require('./Authmiddleware');

const router = express.Router();

router.use(authMiddleware);

// ── GET /workouts ─────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM workouts WHERE user_id = ? ORDER BY last_updated DESC',
      [req.userId]
    );
    const workouts = rows.map(w => ({
      id:                w.id,
      name:              w.name,
      division:          w.division,
      muscleGroup:       w.muscle_group,
      estimatedDuration: w.estimated_duration,
      exerciseCount:     w.exercise_count,
      notes:             w.notes,
      lastUpdated:       w.last_updated,
    }));
    return res.json(workouts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar treinos' });
  }
});

// ── POST /workouts ────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { name, division, muscleGroup, estimatedDuration, notes } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Nome do treino é obrigatório' });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO workouts (user_id, name, division, muscle_group, estimated_duration, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, name, division || '', muscleGroup || '', estimatedDuration || 45, notes || '']
    );
    return res.status(201).json({
      id: result.insertId,
      name, division, muscleGroup, estimatedDuration,
      notes, exerciseCount: 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao criar treino' });
  }
});

// ── DELETE /workouts/:id ──────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM workouts WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao excluir treino' });
  }
});

module.exports = router;