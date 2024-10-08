const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');
const ExcelJS = require('exceljs');

// Route สำหรับ export ข้อมูลเป็น Excel ตามช่วงวันที่/เดือน/ปี
router.get('/export-transactions-excel', async (req, res) => {
  const { userId, startDate, endDate, type } = req.query;  // type สามารถเป็น 'income' หรือ 'expense'

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const pool = await poolPromise;
    let query = '';

    // แปลง startDate และ endDate เพื่อให้ครอบคลุมเวลาทั้งวัน
    const startDateTime = new Date(`${startDate}T00:00:00`);
    const endDateTime = new Date(`${endDate}T23:59:59`);
    
    // สร้าง query สำหรับดึงข้อมูลรายรับหรือรายจ่าย
    if (type === 'expense') {
      query = `
        SELECT e.amount, e.description, c.CategoryName, e.date 
        FROM Expenses e
        JOIN ExpenseCategories c ON e.CategoryId = c.CategoryId
        WHERE e.UserID = @userId 
        AND e.date >= @startDate 
        AND e.date <= @endDate
      `;
    } else if (type === 'income') {
      query = `
        SELECT i.amount, i.description, c.CategoryName, i.date 
        FROM Incomes i
        JOIN IncomeCategories c ON i.CategoryId = c.CategoryId
        WHERE i.UserID = @userId 
        AND i.date >= @startDate 
        AND i.date <= @endDate
      `;
    } else {
      return res.status(400).json({ error: 'Invalid type, must be either "income" or "expense"' });
    }

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('startDate', sql.DateTime, startDateTime)  // ใช้ startDateTime แปลงเวลาเริ่มต้น
      .input('endDate', sql.DateTime, endDateTime)  // ใช้ endDateTime แปลงเวลาสิ้นสุด
      .query(query);

    // สร้างไฟล์ Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${type} Report`);

    // เพิ่มหัวตาราง
    worksheet.columns = [
      { header: 'Amount', key: 'amount', width: 10 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Category Name', key: 'categoryName', width: 20 },
      { header: 'Date', key: 'date', width: 20 }
    ];

    // เพิ่มข้อมูลลงในตาราง
    result.recordset.forEach(record => {
      worksheet.addRow({
        amount: record.amount,
        description: record.description,
        categoryName: record.CategoryName,
        date: record.date.toISOString().slice(0, 10)  // แปลงวันที่เป็นรูปแบบ YYYY-MM-DD
      });
    });

    // ส่งไฟล์ Excel ให้ผู้ใช้ดาวน์โหลด
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_report_${startDate}_to_${endDate}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Error exporting data:', err);
    res.status(500).json({ error: 'Error exporting data' });
  }
});

module.exports = router;
