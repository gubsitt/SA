const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// ดึงรายได้ทั้งหมดของผู้ใช้ และเรียงตามวันที่
router.get('/incomes', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Incomes WHERE UserID = @userId ORDER BY date DESC'); // เรียงตามวันที่มากไปน้อย

    res.json({ incomes: result.recordset });
  } catch (err) {
    console.error('Error fetching incomes:', err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// ดึงรายจ่ายทั้งหมดของผู้ใช้ และเรียงตามวันที่
router.get('/expenses', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Expenses WHERE UserID = @userId ORDER BY date DESC'); // เรียงตามวันที่มากไปน้อย

    res.json({ expenses: result.recordset });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

module.exports = router;
