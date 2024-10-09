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

    // ตรวจสอบงบประมาณรายวันสำหรับผู้ใช้ในหมวดหมู่ที่เลือก
    const budgetResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('categoryId', sql.Int, categoryId)
      .query(`
        SELECT B.Amount AS Budget
        FROM Budget B
        WHERE B.UserId = @userId AND B.CategoryId = @categoryId
      `);

    const budget = budgetResult.recordset[0]?.Budget || 0;

    if (budget <= 0) {
      return res.status(400).json({ error: 'No budget set for this category' });
    }

    // คำนวณจำนวนเงินที่ใช้ไปในวันเดียวกันนี้ (ตรวจสอบวันที่ในเขตเวลาเดียวกัน)
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0); // ตั้งค่าเวลาเป็น 00:00 UTC
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999); // ตั้งค่าเวลาเป็น 23:59 UTC

    const expenseResult = await pool.request()
      .input('userId', sql.Int, userId)
      .input('categoryId', sql.Int, categoryId)
      .input('todayStart', sql.DateTime, todayStart)
      .input('todayEnd', sql.DateTime, todayEnd)
      .query(`
        SELECT SUM(amount) AS TotalExpenses
        FROM Expenses
        WHERE UserID = @userId 
        AND CategoryId = @categoryId 
        AND date BETWEEN @todayStart AND @todayEnd
      `);

    const totalExpensesToday = expenseResult.recordset[0]?.TotalExpenses || 0;

    // ตรวจสอบว่ารายจ่ายในวันนี้เกินงบประมาณรายวันหรือไม่
    if (totalExpensesToday + amount > budget) {
      return res.status(400).json({ 
        message: `รายจ่ายในวันนี้เกินกว่างบประมาณรายวันแล้ว! งบประมาณ: ฿${budget}, รายจ่ายทั้งหมดวันนี้: ฿${totalExpensesToday}`
      });
    }

    // ถ้ารายจ่ายไม่เกินงบประมาณ ให้บันทึกรายจ่าย
    await pool.request()
      .input('amount', sql.Decimal(18, 2), amount)
      .input('description', sql.NVarChar, description)
      .input('categoryId', sql.Int, categoryId)
      .input('isRecurring', sql.Bit, isRecurring)
      .input('userId', sql.Int, userId)
      .query('INSERT INTO Expenses (amount, description, CategoryId, isRecurring, UserID, date) VALUES (@amount, @description, @categoryId, @isRecurring, @userId, GETDATE())');

    res.json({
      message: 'Expense saved successfully',
      expense: { amount, description, categoryId, isRecurring, userId, date: new Date() }
    });
  } catch (err) {
    console.error('Error saving expense:', err);
    res.status(500).json({ error: 'Error saving expense' });
  }
});


// GET route สำหรับดึงหมวดหมู่รายจ่าย (Expense Categories)
router.get('/expense-categories', async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT * FROM ExpenseCategories 
        WHERE UserId = @userId OR UserId IS NULL
      `);  // เพิ่มการดึงหมวดหมู่ที่เป็นสาธารณะ (UserId IS NULL)
    
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching expense categories:', err);
    res.status(500).json({ error: 'Error fetching expense categories' });
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

// GET route สำหรับดึงข้อมูลรายจ่ายตามช่วงวันที่
router.get('/expenses-by-date', async (req, res) => {
  const { userId, startDate, endDate } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request().input('userId', sql.Int, userId);

    // เช็คว่าได้ส่ง startDate และ endDate มาหรือไม่
    if (startDate) {
      request.input('startDate', sql.DateTime, new Date(startDate));
    }
    if (endDate) {
      request.input('endDate', sql.DateTime, new Date(endDate));
    }

    // สร้าง query ที่รองรับการกรองวันที่หรือไม่กรอง
    const query = `
      SELECT * 
      FROM Expenses 
      WHERE UserID = @userId
      ${startDate ? 'AND date >= @startDate' : ''} 
      ${endDate ? 'AND date <= @endDate' : ''}
    `;

    const result = await request.query(query);

    res.json({ expenses: result.recordset });
  } catch (err) {
    console.error('Error fetching expenses by date:', err);
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
      .query('DELETE FROM Expenses WHERE expenseId = @expenseId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });  
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

router.put('/expenses/:expenseId', async (req, res) => {
  const { expenseId } = req.params;  // ใช้ expenseId แทน id
  const { amount, description, CategoryId, isRecurring, UserID } = req.body;  // ใช้ชื่อที่สอดคล้องกันใน SQL Query

  // ตรวจสอบข้อมูลที่รับมาจาก frontend
  console.log('Request params:', req.params);
  console.log('Request body:', req.body);

  if (!expenseId) {
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
      .input('isRecurring', sql.Bit, isRecurring)
      .input('userId', sql.Int, UserID)
      .input('expenseId', sql.Int, expenseId)  // ใช้ expenseId ที่ดึงมาจาก params
      .query('UPDATE Expenses SET amount = @amount, description = @description, CategoryId = @CategoryId, isRecurring = @isRecurring, UserID = @userId WHERE expenseId = @expenseId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense updated successfully' });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ error: 'Error updating expense' });
  }
});

    router.get('/check-recurring-expense', async (req, res) => {
      try {
        const { userId } = req.query; // รับ userId จาก query parameter
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // วันแรกของเดือน

        if (!userId) {
          return res.status(400).json({ message: 'User ID is required', success: false });
        }

        const pool = await poolPromise;
        const result = await pool.request()
          .input('userId', sql.Int, userId)
          .input('firstDayOfMonth', sql.DateTime, firstDayOfMonth)
          .query(`
            SELECT COUNT(*) as expenseCount 
            FROM Expenses 
            WHERE isRecurring = 1 
            AND UserID = @userId 
            AND date >= @firstDayOfMonth
          `);

        const expenseCount = result.recordset[0].expenseCount;

        if (expenseCount > 0) {
          // มีรายจ่ายประจำถูกบันทึกในเดือนนี้
          res.json({ message: 'รายการรายจ่ายประจำถูกหักเรียบร้อยแล้ว', success: true });
        } else {
          // ไม่มีรายจ่ายประจำถูกบันทึกในเดือนนี้
          res.json({ message: 'ยังไม่มีการหักรายการรายจ่ายประจำสำหรับเดือนนี้', success: false });
        }
      } catch (err) {
        console.error('Error checking recurring expense:', err);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบรายจ่ายประจำ', success: false });
      }
    });   

module.exports = router;
