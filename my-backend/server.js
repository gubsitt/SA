const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');

// Import routes
const userRoutes = require('./routes/Users'); // ปรับเส้นทางที่นี่

// เปิดการใช้งาน CORS
app.use(cors());



// Middleware สำหรับการจัดการ JSON
app.use(express.json());


// ใช้เส้นทางที่เกี่ยวกับผู้ใช้
app.use('/api/users', userRoutes);

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


  