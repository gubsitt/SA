const cron = require('node-cron');
const { sql, poolPromise } = require('../config/dbconfig');

// สร้าง cron job ที่จะทำงานทุกวันที่ 1 ของเดือน
cron.schedule('0 0 1 * *', async () => {
  try {
    const pool = await poolPromise;

    // ดึงข้อมูลรายจ่ายประจำจากฐานข้อมูล
    const result = await pool.request()
      .query('SELECT * FROM Expenses WHERE isRecurring = 1');

    const recurringExpenses = result.recordset;

    // เพิ่มรายการรายจ่ายประจำใหม่ในเดือนนี้
    for (const expense of recurringExpenses) {
      await pool.request()
        .input('amount', sql.Decimal(18, 2), expense.amount)
        .input('description', sql.NVarChar, expense.description)
        .input('categoryId', sql.Int, expense.CategoryId)   
        .input('isRecurring', sql.Bit, expense.isRecurring)
        .input('userId', sql.Int, expense.UserID)
        .query('INSERT INTO Expenses (amount, description, CategoryId, isRecurring, UserID, date) VALUES (@amount, @description, @categoryId, @isRecurring, @userId, GETDATE())');
    }

    console.log('รายการรายจ่ายประจำถูกหักเรียบร้อยแล้ว!');
  } catch (err) {
    console.error('เกิดข้อผิดพลาดในการบันทึกรายจ่ายประจำ:', err);  
  }
});

module.exports = cron;
