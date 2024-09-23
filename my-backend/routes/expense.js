const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// POST route สำหรับบันทึกรายจ่าย
router.post('/expenses', async (req, res) => {
  const { amount, description, categoryId, isRecurring, userId } = req.body;

  if (!amount || !description || !categoryId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('amount', sql.Decimal(18, 2), amount)
      .input('description', sql.NVarChar, description)
      .input('categoryId', sql.Int, categoryId)
      .input('isRecurring', sql.Bit, isRecurring)
      .input('userId', sql.Int, userId)
      .query('INSERT INTO Expenses (Amount, Description, CategoryId, IsRecurring, UserID, Date) VALUES (@amount, @description, @categoryId, @isRecurring, @userId, GETDATE())');

    res.json({
      message: 'Expense saved successfully',
      expense: { amount, description, categoryId, isRecurring, userId, date: new Date() }
    });
  } catch (err) {
    console.error('Error saving expense:', err);
    res.status(500).json({ error: 'Error saving expense' });
  }
});

// GET route สำหรับดึงหมวดหมู่รายจ่าย
router.get('/expense-categories', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM ExpenseCategories');
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching expense categories:', err);
    res.status(500).json({ error: 'Failed to fetch expense categories' });
  }
});

// GET route สำหรับดึงข้อมูลรายจ่ายทั้งหมดของผู้ใช้
router.get('/expenses', async (req, res) => {
  const { userId } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Expenses WHERE UserID = @userId');

    res.json({ expenses: result.recordset });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// DELETE route สำหรับลบรายจ่าย
router.delete('/expenses/:id', async (req, res) => {
  const expenseId = req.params.id;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('expenseId', sql.Int, expenseId)
      .query('DELETE FROM Expenses WHERE ExpenseId = @expenseId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

// PUT route สำหรับแก้ไขรายจ่าย
router.put('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { amount, description, categoryId, isRecurring, userId } = req.body;

  if (!id || !amount || !description || !categoryId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('amount', sql.Decimal(18, 2), amount)
      .input('description', sql.NVarChar, description)
      .input('categoryId', sql.Int, categoryId)
      .input('isRecurring', sql.Bit, isRecurring)
      .input('userId', sql.Int, userId)
      .input('id', sql.Int, id)
      .query('UPDATE Expenses SET Amount = @amount, Description = @description, CategoryId = @categoryId, IsRecurring = @isRecurring, UserID = @userId WHERE ExpenseId = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully' });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Error updating expense' });
  }
});

module.exports = router;
