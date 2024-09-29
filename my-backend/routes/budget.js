const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// ดึงหมวดหมู่รายจ่ายพร้อมงบประมาณที่ตั้งไว้และเปรียบเทียบกับยอดคงเหลือ
router.get('/expense-categories-budget', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;
    
    // ดึงงบประมาณจากตารางหมวดหมู่รายจ่าย
    const budgetResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT EC.CategoryId, EC.CategoryName, ISNULL(B.Amount, 0) as Budget
        FROM ExpenseCategories EC
        LEFT JOIN Budget B ON EC.CategoryId = B.CategoryId AND B.UserId = @userId
        WHERE EC.UserId = @userId
      `);

    // ดึงยอดคงเหลือจากตาราง Balances
    const balanceResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Balance FROM Balances WHERE UserID = @userId');

    const budgets = budgetResult.recordset;
    const balance = balanceResult.recordset.length > 0 ? balanceResult.recordset[0].Balance : 0;

    // คำนวณงบประมาณรวมทั้งหมด
    const totalBudget = budgets.reduce((sum, category) => sum + category.Budget, 0);

    // ตรวจสอบว่ายอดคงเหลือต่ำกว่างบประมาณรวมทั้งหมดหรือไม่
    const isBelowBudget = balance < totalBudget;

    res.json({
      budgets,
      balance,
      totalBudget,
      isBelowBudget
    });
  } catch (err) {
    console.error('Error fetching expense categories with budgets:', err);
    res.status(500).json({ error: 'Error fetching expense categories' });
  }
});



// บันทึกงบประมาณพร้อมกำหนด Frequency เป็น "Monthly"
router.post('/save-budgets', async (req, res) => {
  const { categories } = req.body;

  // ตรวจสอบว่ามีการส่งหมวดหมู่เข้ามาหรือไม่
  if (!categories || categories.length === 0) {
    return res.status(400).json({ error: 'No categories provided' });
  }

  try {
    const pool = await poolPromise;

    for (const category of categories) {
      // ตรวจสอบว่ามีค่า userId, categoryId และ budget
      if (!category.UserId || !category.CategoryId || category.budget === undefined) {
        return res.status(400).json({ error: 'Invalid data: missing userId, CategoryId, or budget' });
      }

      // ตรวจสอบว่าค่า budget ต้องไม่เป็นค่าลบ
      if (category.budget < 0) {
        return res.status(400).json({ error: 'Budget cannot be negative' });
      }

      // กำหนด Frequency เป็น "Monthly"
      const frequency = 'Monthly';

      // ตรวจสอบว่ามี Budget สำหรับ userId และ CategoryId นี้แล้วหรือไม่
      const result = await pool.request()
        .input('userId', sql.Int, category.UserId)
        .input('categoryId', sql.Int, category.CategoryId)
        .query('SELECT * FROM Budget WHERE UserId = @userId AND CategoryId = @categoryId');

      if (result.recordset.length > 0) {
        // อัปเดตงบประมาณหากมีอยู่แล้ว
        await pool.request()
          .input('userId', sql.Int, category.UserId)
          .input('categoryId', sql.Int, category.CategoryId)
          .input('budget', sql.Float, category.budget)
          .input('frequency', sql.NVarChar, frequency)
          .query('UPDATE Budget SET Amount = @budget, Frequency = @frequency WHERE UserId = @userId AND CategoryId = @categoryId');
      } else {
        // เพิ่มงบประมาณใหม่หากยังไม่มีในฐานข้อมูล
        await pool.request()
          .input('userId', sql.Int, category.UserId)
          .input('categoryId', sql.Int, category.CategoryId)
          .input('budget', sql.Float, category.budget)
          .input('frequency', sql.NVarChar, frequency)
          .query('INSERT INTO Budget (UserId, CategoryId, Amount, Frequency) VALUES (@userId, @categoryId, @budget, @frequency)');
      }
    }

    // ส่ง response กลับเมื่อบันทึกหรืออัปเดตสำเร็จ
    res.json({ message: 'Budgets updated successfully' });
  } catch (err) {
    // แสดง error และส่ง response กลับพร้อม error message
    console.error('Error updating budgets:', err);
    res.status(500).json({ error: 'Error updating budgets' });
  }
});

// ดึงงบประมาณรวมทั้งหมดสำหรับผู้ใช้
router.get('/total-budget', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;

    // ดึงงบประมาณรวมทั้งหมดของผู้ใช้จากตาราง Budget
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT SUM(Amount) as totalBudget 
        FROM Budget 
        WHERE UserId = @userId
      `);

    // ตรวจสอบว่ามีข้อมูลหรือไม่
    if (result.recordset.length === 0 || result.recordset[0].totalBudget === null) {
      return res.status(404).json({ error: 'No budget found for the user' });
    }

    const totalBudget = result.recordset[0].totalBudget;

    res.json({ totalBudget });
  } catch (err) {
    console.error('Error fetching total budget:', err);
    res.status(500).json({ error: 'Error fetching total budget' });
  }
});

// GET Budget route
router.get('/getbudget', async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT B.BudgetID, B.Amount, C.CategoryName, B.Frequency
        FROM Budget B
        JOIN ExpenseCategories C ON B.CategoryID = C.CategoryID  
        WHERE B.UserID = @userId
      `);

    // ตรวจสอบว่ามีข้อมูลจากการ query หรือไม่
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No budget found for this user.' });
    }

    // คำนวณ totalBudget
    const totalBudget = result.recordset.reduce((sum, budget) => sum + budget.Amount, 0);

    res.json({ 
      budgets: result.recordset, 
      totalBudget 
    });
  } catch (err) {
    console.error('Error fetching budget:', err);
    res.status(500).json({ error: 'Error fetching budget' });
  }
});


module.exports = router;
