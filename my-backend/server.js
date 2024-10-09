const express = require('express'); 
const app = express();
const port = 3000;
const cors = require('cors');

require('./routes/recurringExpenseCron'); 


const incomes = require('./routes/incomes');
const expenses = require('./routes/expense');
const userRoutes = require('./routes/Users');
const balanceRoutes = require('./routes/ฺBalance'); // เพิ่มเส้นทางสำหรับ Balance
const incomeCategories = require('./routes/incomeCategories');
const expenseCategories = require('./routes/expenseCategories');
const searchRoutes = require('./routes/search');
const budget = require('./routes/budget');
const excel = require('./routes/excel');
const wallet = require('./routes/wallet');
const expenseAnalysis = require('./routes/expenseAnalysisRoutes'); // เพิ่มเส้นทาง Expense Analysis

// เปิดการใช้งาน CORS
app.use(cors());

// Middleware สำหรับการจัดการ JSON
app.use(express.json());

// ใช้เส้นทางที่เกี่ยวกับผู้ใช้
app.use('/api/users', userRoutes);
app.use('/api', incomes);
app.use('/api', expenses);
app.use('/api', balanceRoutes); // เพิ่มเส้นทางสำหรับ Balance
app.use('/api', incomeCategories);
app.use('/api', expenseCategories);
app.use('/api', budget);
app.use('/api', searchRoutes);
app.use('/api', excel);
app.use('/api', wallet);
app.use('/api', expenseAnalysis); // เพิ่มเส้นทาง Expense Analysis


// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
