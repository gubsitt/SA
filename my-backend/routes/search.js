// เพิ่มใน routes เช่น /routes/income-expense.js

const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../config/dbconfig');

// API ค้นหาทั้งรายรับและรายจ่าย
router.get('/search', async (req, res) => {
    const { query, userId } = req.query; // รับคำค้นหาและ userId จาก query parameter

    if (!query || !userId) {
        return res.status(400).json({ error: 'Missing search query or userId' });
    }

    try {
        const pool = await poolPromise;
        const request = pool.request();
        request.input('userId', sql.Int, userId);
        request.input('query', sql.NVarChar, `%${query}%`);

        // ค้นหารายรับ
        const incomeResult = await request.query(`
            SELECT * FROM Incomes
            WHERE UserId = @userId AND (Description LIKE @query OR Amount LIKE @query)
        `);

        // ค้นหารายจ่าย
        const expenseResult = await request.query(`
            SELECT * FROM Expenses
            WHERE UserId = @userId AND (Description LIKE @query OR Amount LIKE @query)
        `);

        res.json({
            incomes: incomeResult.recordset,
            expenses: expenseResult.recordset
        });
    } catch (error) {
        console.error('Error during search:', error);
        res.status(500).json({ error: 'Error during search' });
    }
});

module.exports = router;
