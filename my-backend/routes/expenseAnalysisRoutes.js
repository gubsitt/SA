const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig'); // import การเชื่อมต่อฐานข้อมูล

// วิเคราะห์รายจ่ายตามวันที่ (แยกตาม userId)
router.get('/expense-analysis/by-date', async (req, res) => {
    const { startDate, endDate, userId } = req.query; // รับค่า userId จาก query parameters
    try {
        const pool = await poolPromise; // เรียกใช้ poolPromise เพื่อเชื่อมต่อกับฐานข้อมูล
        const query = `
            SELECT categoryId, SUM(amount) AS totalAmount
            FROM Expenses
            WHERE userId = @userId
            AND date BETWEEN @startDate AND @endDate
            GROUP BY categoryId
        `;
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('startDate', sql.DateTime, new Date(startDate))
            .input('endDate', sql.DateTime, new Date(endDate))
            .query(query);
        
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการวิเคราะห์รายจ่าย" });
    }
});

// วิเคราะห์รายจ่ายตามหมวดหมู่
router.get('/expense-analysis/by-category', async (req, res) => {
    const { userId } = req.query; // รับค่า userId จาก query parameters
    try {
        const pool = await poolPromise; // เรียกใช้ poolPromise เพื่อเชื่อมต่อกับฐานข้อมูล
        const query = `
            SELECT c.categoryName, SUM(e.amount) AS totalAmount
            FROM Expenses e
            JOIN Categories c ON e.categoryId = c.categoryId
            WHERE e.userId = @userId
            GROUP BY c.categoryName
        `;
        const result = await pool.request()
            .input('userId', sql.Int, userId) // ตรวจสอบว่าค่า userId ถูกส่งมาถูกต้องหรือไม่
            .query(query);
        
        res.json(result.recordset);
    } catch (error) {
        console.error('เกิดข้อผิดพลาดใน API by-category:', error); // แสดงข้อผิดพลาดใน console
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการวิเคราะห์รายจ่ายตามหมวดหมู่" });
    }
});


module.exports = router;
