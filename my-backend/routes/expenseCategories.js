    const express = require('express');
    const router = express.Router();
    const { sql, poolPromise } = require('../config/dbconfig');

    // POST route สำหรับเพิ่มหมวดหมู่รายจ่าย
    router.post('/expense-categories', async (req, res) => {
        const { categoryName, userId } = req.body;
        console.log('Received expense category name:', categoryName, 'for userId:', userId); // ตรวจสอบข้อมูลที่ส่งมา

        if (!categoryName || !userId) {
            return res.status(400).json({ error: 'Category name and userId are required' });
        }

        try {
            const pool = await poolPromise;
            await pool.request()
                .input('categoryName', sql.NVarChar, categoryName)
                .input('userId', sql.Int, userId)  // เพิ่ม userId
                .query('INSERT INTO ExpenseCategories (CategoryName, UserId) VALUES (@categoryName, @userId)');

            res.json({ message: 'Expense category added successfully' });
        } catch (err) {
            console.error('Error adding expense category:', err);
            res.status(500).json({ error: 'Error adding expense category' });
        }
    });

// DELETE route สำหรับลบหมวดหมู่รายจ่าย
router.delete('/expense-categories/:id', async (req, res) => {
    const expenseCategoryId = req.params.id;
    const userId = req.query.userId;  // รับ userId จาก query parameter

    if (!userId) {
        return res.status(400).json({ error: 'UserId is required' });
    }

    let transaction;

    try {
        const pool = await poolPromise;
        transaction = new sql.Transaction(pool);  // เริ่ม transaction

        // เริ่มต้น transaction
        await transaction.begin();

        // ตรวจสอบว่าเป็นหมวดหมู่สาธารณะหรือไม่
        const checkCategoryRequest = new sql.Request(transaction);
        const categoryResult = await checkCategoryRequest
            .input('expenseCategoryId', sql.Int, expenseCategoryId)
            .query('SELECT UserId FROM ExpenseCategories WHERE CategoryId = @expenseCategoryId;');

        const category = categoryResult.recordset[0];
        
        if (category.UserId === null) {
            // หมวดหมู่เป็นหมวดหมู่สาธารณะ ห้ามลบ
            await transaction.rollback();
            return res.status(400).json({ error: 'Cannot delete public category.' });
        }

        // ตรวจสอบว่ามีรายจ่ายในหมวดหมู่นี้หรือไม่
        const checkRequest = new sql.Request(transaction);
        const checkResult = await checkRequest
            .input('expenseCategoryId', sql.Int, expenseCategoryId)
            .input('userId', sql.Int, userId)
            .query('SELECT COUNT(*) AS count FROM Expenses WHERE CategoryId = @expenseCategoryId AND UserId = @userId;');

        const expenseCount = checkResult.recordset[0].count;

        if (expenseCount > 0) {
            // หากมีรายจ่ายที่เชื่อมโยงกับหมวดหมู่นี้ ให้ยกเลิก transaction และส่งข้อความเตือน
            await transaction.rollback();
            return res.status(400).json({ error: 'Cannot delete category because there are expenses associated with it.' });
        }

        // ถ้าไม่มีรายจ่ายที่เชื่อมโยง สามารถดำเนินการลบต่อได้
        // ลบข้อมูลจาก Budget
        const request2 = new sql.Request(transaction);
        await request2
            .input('expenseCategoryId', sql.Int, expenseCategoryId)
            .input('userId', sql.Int, userId)
            .query('DELETE FROM Budget WHERE CategoryId = @expenseCategoryId AND UserId = @userId;');

        // ลบข้อมูลจาก ExpenseCategories
        const request3 = new sql.Request(transaction);
        await request3
            .input('expenseCategoryId', sql.Int, expenseCategoryId)
            .input('userId', sql.Int, userId)
            .query('DELETE FROM ExpenseCategories WHERE CategoryId = @expenseCategoryId AND UserId = @userId;');

        // ยืนยันการทำงานของ transaction
        await transaction.commit();

        res.json({ message: 'Expense category and related data deleted successfully' });
    } catch (err) {
        if (transaction) await transaction.rollback();  // ยกเลิก transaction ถ้าเกิดข้อผิดพลาด
        console.error('Error deleting expense category:', err);
        res.status(500).json({ error: 'Error deleting expense category' });
    }
});
    

    module.exports = router;
