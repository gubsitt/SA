  const express = require('express');
  const router = express.Router();
  const { sql, poolPromise } = require('../config/dbconfig');

  // POST route สำหรับเพิ่มหมวดหมู่รายรับ
router.post('/income-categories', async (req, res) => {
  const { categoryName, userId } = req.body;  // รับ userId มาจาก request

  if (!categoryName || !userId) {
    return res.status(400).json({ error: 'Category name and userId are required' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('categoryName', sql.NVarChar, categoryName)
      .input('userId', sql.Int, userId)  // เพิ่ม userId เข้าไปในคำสั่ง SQL
      .query('INSERT INTO IncomeCategories (CategoryName, UserId) VALUES (@categoryName, @userId)');

    res.json({ message: 'Income category added successfully' });
  } catch (err) {
    console.error('Error adding income category:', err);
    res.status(500).json({ error: 'Error adding income category' });
  }
});

    

  // DELETE route สำหรับลบหมวดหมู่รายรับ
router.delete('/income-categories/:id', async (req, res) => {
  const incomeCategoryId = req.params.id;
  const userId = req.query.userId; // รับ userId มาจาก query parameter

  if (!userId) {
      return res.status(400).json({ error: 'UserId is required' });
  }

  try {
      const pool = await poolPromise;
      await pool.request()
        .input('incomeCategoryId', sql.Int, incomeCategoryId)
        .input('userId', sql.Int, userId)  // เช็คว่าเป็นหมวดหมู่ของ user นั้นจริง
        .query('DELETE FROM IncomeCategories WHERE CategoryId = @incomeCategoryId AND UserId = @userId');

      res.json({ message: 'Income category deleted successfully' });
  } catch (err) {
      console.error('Error deleting income category:', err);
      res.status(500).json({ error: 'Error deleting income category' });
  }
});



  module.exports = router;
