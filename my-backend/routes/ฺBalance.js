const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// GET ยอดคงเหลือของผู้ใช้แต่ละคน
router.get('/balance/:userId', async (req, res) => {
  const userId = req.params.userId;  // รับ UserID จาก request params

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Balance FROM Balances WHERE UserID = @userId');
      
    if (result.recordset.length > 0) {
      res.json({ balance: result.recordset[0].Balance });
    } else {
      res.status(404).json({ error: 'Balance not found for this user' });
    }
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ error: 'Error fetching balance' });
  }
});

// POST สำหรับอัปเดตหรือเพิ่มยอดคงเหลือ
router.post('/balance/update', async (req, res) => {
  const { userId } = req.body;  // รับ userId จาก frontend

  if (!userId) {
    return res.status(400).json({ error: 'UserID is required' });
  }

  try {
    const pool = await poolPromise;

    // คำนวณรายรับและรายจ่ายสำหรับ UserID
    const totalIncomeResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT SUM(Amount) as totalIncome FROM Incomes WHERE UserID = @userId');
      
    const totalExpenseResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT SUM(Amount) as totalExpense FROM Expenses WHERE UserID = @userId');

    const totalIncome = totalIncomeResult.recordset[0].totalIncome || 0;
    const totalExpense = totalExpenseResult.recordset[0].totalExpense || 0;

    const balance = totalIncome - totalExpense;

    // ตรวจสอบว่ามี UserID อยู่ในตาราง Balances แล้วหรือไม่
    const balanceCheck = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Balances WHERE UserID = @userId');

    if (balanceCheck.recordset.length > 0) {
      // ถ้ามี UserID อยู่แล้ว, ทำการอัปเดตยอดคงเหลือ
      await pool.request()
        .input('balance', sql.Decimal(18, 2), balance)
        .input('userId', sql.Int, userId)
        .query('UPDATE Balances SET Balance = @balance WHERE UserID = @userId');
    } else {
      // ถ้ายังไม่มี UserID, เพิ่ม record ใหม่
      await pool.request()
        .input('userId', sql.Int, userId)
        .input('balance', sql.Decimal(18, 2), balance)
        .query('INSERT INTO Balances (UserID, Balance) VALUES (@userId, @balance)');
    }

    res.json({ message: 'Balance updated successfully', balance });
  } catch (err) {
    console.error('Error updating balance:', err);
    res.status(500).json({ error: 'Error updating balance' });
  }
});


module.exports = router;
