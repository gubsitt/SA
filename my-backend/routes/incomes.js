const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// POST route สำหรับบันทึกรายรับ
router.post('/incomes', async (req, res) => {
  const { amount, description, categoryId, userId } = req.body;

  if (!amount || !description || !categoryId || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('amount', sql.Decimal(18, 2), amount)
      .input('description', sql.NVarChar, description)
      .input('categoryId', sql.Int, categoryId)
      .input('userId', sql.Int, userId)
      .query('INSERT INTO Incomes (amount, description, CategoryId, UserID, date) VALUES (@amount, @description, @categoryId, @userId, GETDATE())');

    res.json({
      message: 'Income saved successfully',
      income: { amount, description, categoryId, date: new Date(), userId }
    });
  } catch (err) {
    console.error('Error saving income:', err);
    res.status(500).json({ error: 'Error saving income' });
  }
});

// GET route สำหรับดึงหมวดหมู่รายรับ
router.get('/income-categories', async (req, res) => {
  const { userId } = req.query;  // ตรวจสอบว่ามีการรับ userId
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * FROM IncomeCategories 
        WHERE UserId = @userId OR UserId IS NULL
      `);  // เพิ่มการตรวจสอบหมวดหมู่สาธารณะ (UserId IS NULL)
      
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching income categories:', err);
    res.status(500).json({ error: 'Error fetching income categories' });
  }
});



// GET route สำหรับดึงข้อมูลรายรับทั้งหมดของผู้ใช้
router.get('/incomes', async (req, res) => {
  const { userId } = req.query;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM Incomes WHERE UserID = @userId');

    res.json({ incomes: result.recordset });
  } catch (err) {
    console.error('Error fetching incomes:', err);
    res.status(500).json({ error: 'Failed to fetch incomes' });
  }
});

// DELETE route สำหรับลบรายรับ
router.delete('/incomes/:id', async (req, res) => {
  const incomeId = req.params.id;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('incomeId', sql.Int, incomeId)
      .query('DELETE FROM Incomes WHERE incomeId = @incomeId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Income not found' });
    }

    res.json({ message: 'Income deleted successfully' });
  } catch (err) {
    console.error('Error deleting income:', err);
    res.status(500).json({ error: 'Error deleting income' });
  }
});

// PUT route สำหรับแก้ไขรายรับ
router.put('/incomes/:incomeId', async (req, res) => {
  const { incomeId } = req.params;  // ใช้ id ที่ดึงมาจาก URL params
  const { amount, description, CategoryId, UserID } = req.body;  // ดึงค่าจาก request body

  // ตรวจสอบข้อมูลที่รับมาจาก frontend
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);

  // ตรวจสอบว่าข้อมูลครบถ้วนหรือไม่
  if (!incomeId) {
    return res.status(400).json({ error: 'Income ID is missing' });
  }
  if (!amount) {
    return res.status(400).json({ error: 'Amount is missing' });
  }
  if (!description) {
    return res.status(400).json({ error: 'Description is missing' });
  }
  if (!CategoryId) {
    return res.status(400).json({ error: 'Category ID is missing' });
  }
  if (!UserID) {
    return res.status(400).json({ error: 'User ID is missing' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('amount', sql.Decimal(18, 2), amount)
      .input('description', sql.NVarChar, description)
      .input('categoryId', sql.Int, CategoryId)
      .input('userId', sql.Int, UserID)
      .input('incomeId', sql.Int, incomeId)  // ใช้ id ที่ดึงมาจาก params
      .query('UPDATE Incomes SET amount = @amount, description = @description, CategoryId = @categoryId, UserID = @userId WHERE incomeId = @incomeId');

    // ตรวจสอบว่าอัปเดตสำเร็จหรือไม่ (ถ้าไม่มีแถวถูกอัปเดต แสดงว่าไม่พบข้อมูล)
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Income not found' });
    }

    // ส่ง response เมื่ออัปเดตสำเร็จ
    res.json({ message: 'Income updated successfully' });
  } catch (err) {
    console.error('Error updating income:', err);
    res.status(500).json({ error: 'Error updating income' });
  }
});




module.exports = router;
