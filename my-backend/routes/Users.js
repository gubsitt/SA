const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../config/dbconfig');

// POST route สำหรับการลงทะเบียนผู้ใช้
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body; // รับข้อมูล email ด้วย

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)  // จัดเก็บชื่อผู้ใช้
      .input('email', sql.NVarChar, email)        // จัดเก็บอีเมล
      .input('password', sql.NVarChar, password)  // จัดเก็บรหัสผ่าน
      .query('INSERT INTO Users (Name, Email, Password, CreatedDate) VALUES (@username, @email, @password, GETDATE())');

    res.json({ message: 'User registered successfully', username });
  } catch (err) {
    console.error('Error inserting user:', err);  // เพิ่ม log เพื่อแสดงข้อผิดพลาดที่เกิดขึ้น
    res.status(500).json({ error: 'Registration failed', details: err });
  }
});



// POST route สำหรับการล็อกอินผู้ใช้
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, password)
      .query('SELECT * FROM Users WHERE Name = @username AND Password = @password');

    if (result.recordset.length > 0) {
      res.json({ message: 'Login successful', token: 'fake-jwt-token' });
    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Error logging in user:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});




module.exports = router;
