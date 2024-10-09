import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  
import { Chart, registerables } from 'chart.js';
import { IncomeExpenseService } from '../service/income-expene.service'; 

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {
  expenseDetails: any[] = [];  // เก็บข้อมูลรายละเอียดรายจ่าย
  totalExpense: number = 0;    // เก็บยอดรายจ่ายรวม
  startDate: string = '';  // เก็บวันที่เริ่มต้น
  endDate: string = '';    // เก็บวันที่สิ้นสุด
  myChart: any;  // ตัวแปรเก็บแผนภูมิที่สร้าง

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private incomeExpenseService: IncomeExpenseService  // ใช้ service
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadExpenseData();  // โหลดข้อมูลจาก backend
    }
  }

  loadExpenseData() {
    const userId = sessionStorage.getItem('userId'); // ดึง userId จาก sessionStorage
  
    if (userId) {
      // ตรวจสอบและกำหนดค่าของ startDate และ endDate โดยใช้ setHours
      const queryParams: any = { userId: parseInt(userId, 10) };

      if (this.startDate) {
        const start = new Date(this.startDate).setHours(0, 0, 0, 0);
        queryParams.startDate = new Date(start).toISOString();
      }
      if (this.endDate) {
        const end = new Date(this.endDate).setHours(23, 59, 59, 999);
        queryParams.endDate = new Date(end).toISOString();
      }

      // ดึงข้อมูลหมวดหมู่รายจ่ายจากฐานข้อมูล
      this.incomeExpenseService.getExpenseCategories(queryParams.userId).subscribe(
        (categories: any[]) => {
          this.incomeExpenseService.getExpensesByDate(queryParams).subscribe(
            (expenses: any) => {
              this.processExpenseData(expenses.expenses, categories); // ส่งข้อมูลหมวดหมู่เข้าไปด้วย
              this.renderChart();
            },
            (error) => {
              console.error('Error fetching expenses:', error);
            }
          );
        },
        (error) => {
          console.error('Error fetching expense categories:', error);
        }
      );
    } else {
      console.error('User ID is not available.');
    }
  }


  processExpenseData(expenses: any[], categories: any[]) {
    this.totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
    // สร้างออบเจ็กต์เพื่อรวมค่าใช้จ่ายแต่ละหมวดหมู่ รวม categoryId ด้วย
    const categoryDetails = categories.map(category => ({
      name: category.CategoryName,  // ใช้ชื่อหมวดหมู่จากฐานข้อมูล
      icon: 'https://cdn-icons-png.flaticon.com/512/1037/1037762.png',  // คุณอาจใช้ไอคอนจากฐานข้อมูลหรือกำหนดเอง
      categoryId: category.CategoryId,  // เพิ่ม categoryId ที่ดึงจากฐานข้อมูล
      amount: 0
    }));
  
    // รวมค่าใช้จ่ายแต่ละหมวดหมู่โดยใช้ categoryId
    expenses.forEach(expense => {
      const category = categoryDetails.find(cat => cat.categoryId === expense.CategoryId);
      if (category) {
        category.amount += expense.amount;
      }
    });
  
    // คำนวณเปอร์เซ็นต์
    this.expenseDetails = categoryDetails.map(category => {
      const percentage = ((category.amount / this.totalExpense) * 100).toFixed(2);
      return {
        ...category,  
        percentage
      };
    });
  }

  renderChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;

    // ตรวจสอบและทำลายแผนภูมิเดิมหากมีอยู่
    if (this.myChart) {
      this.myChart.destroy();
    }

    // ตรวจสอบว่า ctx มีค่าหรือไม่
    if (!ctx) {
      console.error('ไม่พบ canvas element!');
      return;
    }

    console.log('Chart data:', this.expenseDetails); // ดีบักข้อมูล
    const chartData = this.expenseDetails.map(detail => detail.amount);
    const chartLabels = this.expenseDetails.map(detail => detail.name);

    this.myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'ค่าใช้จ่าย',
          data: chartData,
          backgroundColor: [
            '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40',
            '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22',
            '#1abc9c', '#e84393', '#34495e', '#16a085', '#27ae60', '#d35400',
            '#7f8c8d', '#8e44ad', '#2c3e50', '#c0392b', '#2980b9', '#f39c12',
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
