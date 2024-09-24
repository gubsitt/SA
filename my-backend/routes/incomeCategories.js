const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// POST route สำหรับเพิ่มหมวดหมู่รายรับ
router.post('/income-categories', async (req, res) => {
    const { categoryName } = req.body;
    console.log('Received category name:', categoryName); // ตรวจสอบข้อมูลที่ส่งมา
    
    if (!categoryName) {
      return res.status(400).json({ error: 'Category name is required' });
    }
  
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('categoryName', sql.NVarChar, categoryName)
        .query('INSERT INTO IncomeCategories (CategoryName) VALUES (@categoryName)');
  
      res.json({ message: 'Income category added successfully' });
    } catch (err) {
      console.error('Error adding income category:', err);
      res.status(500).json({ error: 'Error adding income category' });
    }
  });
  

// DELETE route สำหรับลบหมวดหมู่รายรับ
router.delete('/income-categories/:id', async (req, res) => {
  const incomeCategoryId = req.params.id;  // เปลี่ยนชื่อเป็น incomeCategoryId

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('incomeCategoryId', sql.Int, incomeCategoryId)  // ใช้ incomeCategoryId แทน
      .query('DELETE FROM IncomeCategories WHERE CategoryId = @incomeCategoryId');

    res.json({ message: 'Income category deleted successfully' });
  } catch (err) {
    console.error('Error deleting income category:', err);
    res.status(500).json({ error: 'Error deleting income category' });
  }
});

module.exports = router;
