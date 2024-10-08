const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// ดึงหมวดหมู่รายจ่ายพร้อมงบประมาณรายวันและเปรียบเทียบกับยอดคงเหลือ
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

    console.log('Budget Result:', budgetResult.recordset); // ตรวจสอบข้อมูลที่ได้จากการดึงข้อมูล

    const balanceResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT Balance FROM Balances WHERE UserID = @userId');

    const budgets = budgetResult.recordset;
    const balance = balanceResult.recordset.length > 0 ? balanceResult.recordset[0].Balance : 0;

    // คำนวณจำนวนวันที่เหลือในเดือนนี้
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = lastDayOfMonth - today.getDate();

    // คำนวณงบประมาณรวมที่เหลือสำหรับวันที่เหลือในเดือน
    const totalBudgetForRemainingDays = budgets.reduce((sum, category) => sum + (category.Budget * daysRemaining), 0);

    // ตรวจสอบว่ายอดคงเหลือต่ำกว่างบประมาณที่เหลือหรือไม่
    const isBelowBudget = balance < totalBudgetForRemainingDays;

    res.json({
      budgets,
      balance,
      totalBudgetForRemainingDays,
      isBelowBudget
    });
  } catch (err) {
    console.error('Error fetching expense categories with budgets:', err);
    res.status(500).json({ error: 'Error fetching expense categories' });
  }
});

// บันทึกงบประมาณรายวัน
router.post('/save-budgets', async (req, res) => {
  const { categories } = req.body;

  if (!categories || categories.length === 0) {
    return res.status(400).json({ error: 'No categories provided' });
  }

  try {
    const pool = await poolPromise;

    for (const category of categories) {
      if (!category.UserId || !category.CategoryId || category.budget === undefined) {
        return res.status(400).json({ error: 'Invalid data: missing userId, CategoryId, or budget' });
      }

      if (category.budget < 0) {
        return res.status(400).json({ error: 'Budget cannot be negative' });
      }

      const frequency = 'Monthly';

      const result = await pool.request()
        .input('userId', sql.Int, category.UserId)
        .input('categoryId', sql.Int, category.CategoryId)
        .query('SELECT * FROM Budget WHERE UserId = @userId AND CategoryId = @categoryId');

      if (result.recordset.length > 0) {
        await pool.request()
          .input('userId', sql.Int, category.UserId)
          .input('categoryId', sql.Int, category.CategoryId)
          .input('budget', sql.Float, category.budget)
          .input('frequency', sql.NVarChar, frequency)
          .query('UPDATE Budget SET Amount = @budget, Frequency = @frequency WHERE UserId = @userId AND CategoryId = @categoryId');
      } else {
        await pool.request()
          .input('userId', sql.Int, category.UserId)
          .input('categoryId', sql.Int, category.CategoryId)
          .input('budget', sql.Float, category.budget)
          .input('frequency', sql.NVarChar, frequency)
          .query('INSERT INTO Budget (UserId, CategoryId, Amount, Frequency) VALUES (@userId, @categoryId, @budget, @frequency)');
      }
    }

    res.json({ message: 'Budgets updated successfully' });
  } catch (err) {
    console.error('Error updating budgets:', err);
    res.status(500).json({ error: 'Error updating budgets' });
  }
});

// ดึงข้อมูลงบประมาณตาม userId
router.get('/getbudget', async (req, res) => {
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
        SELECT B.BudgetID, B.Amount AS Budget, C.CategoryName
        FROM Budget B
        JOIN ExpenseCategories C ON B.CategoryID = C.CategoryID  
        WHERE B.UserID = @userId
      `);

    // ตรวจสอบว่ามีข้อมูลจากการ query หรือไม่
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'No budget found for this user.' });
    }

    const totalBudget = result.recordset.reduce((sum, budget) => sum + budget.Budget, 0);

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
