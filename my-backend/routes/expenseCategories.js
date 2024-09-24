const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

    // POST route สำหรับเพิ่มหมวดหมู่รายจ่าย
    router.post('/expense-categories', async (req, res) => {
        const { categoryName } = req.body;
        console.log('Received expense category name:', categoryName); // ตรวจสอบข้อมูลที่ส่งมา
    
        if (!categoryName) {
        return res.status(400).json({ error: 'Category name is required' });
        }
    
        try {
        const pool = await poolPromise;
        await pool.request()
            .input('categoryName', sql.NVarChar, categoryName)
            .query('INSERT INTO ExpenseCategories (CategoryName) VALUES (@categoryName)');
    
        res.json({ message: 'Expense category added successfully' });
        } catch (err) {
        console.error('Error adding expense category:', err);
        res.status(500).json({ error: 'Error adding expense category' });
        }
    });
  

// DELETE route สำหรับลบหมวดหมู่รายจ่าย
router.delete('/expense-categories/:id', async (req, res) => {
  const expenseCategoryId = req.params.id;  // เปลี่ยนชื่อเป็น expenseCategoryId

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('expenseCategoryId', sql.Int, expenseCategoryId)  // ใช้ expenseCategoryId แทน
      .query('DELETE FROM ExpenseCategories WHERE CategoryId = @expenseCategoryId');

    res.json({ message: 'Expense category deleted successfully' });
  } catch (err) {
    console.error('Error deleting expense category:', err);
    res.status(500).json({ error: 'Error deleting expense category' });
  }
});

module.exports = router;
