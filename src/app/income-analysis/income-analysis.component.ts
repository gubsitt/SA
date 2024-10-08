import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  
import { Chart, registerables } from 'chart.js';
import { IncomeExpenseService } from '../service/income-expene.service'; 

@Component({
  selector: 'app-income-analysis',
  templateUrl: './income-analysis.component.html',
  styleUrls: ['./income-analysis.component.css']
})
export class IncomeAnalysisComponent implements OnInit {
  incomeDetails: any[] = [];  // เก็บข้อมูลรายละเอียดรายรับ
  totalIncome: number = 0;    // เก็บยอดรายรับรวม

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object, 
    private incomeExpenseService: IncomeExpenseService  // ใช้ service
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadIncomeData();  // โหลดข้อมูลจาก backend
    }
  }

  loadIncomeData() {
    const userId = sessionStorage.getItem('userId'); // เพิ่มการดึง userId จาก sessionStorage
    
    if (userId) {
      // ดึงข้อมูลหมวดหมู่รายรับจากฐานข้อมูล
      this.incomeExpenseService.getIncomeCategories(parseInt(userId, 10)).subscribe(
        (categories: any[]) => {
          this.incomeExpenseService.getIncomes(parseInt(userId, 10)).subscribe(
            (incomes: any) => {
              this.processIncomeData(incomes.incomes, categories); // ส่งข้อมูลหมวดหมู่เข้าไปด้วย
              this.renderIncomeChart();
            },
            (error) => {
              console.error('Error fetching incomes:', error);
            }
          );
        },
        (error) => {
          console.error('Error fetching income categories:', error);
        }
      );
    } else {
      console.error('User ID is not available.');
    }
  }

  processIncomeData(incomes: any[], categories: any[]) {
    this.totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  
    // สร้างออบเจ็กต์เพื่อรวมรายรับแต่ละหมวดหมู่ รวม categoryId ด้วย
    const categoryDetails = categories.map(category => ({
      name: category.CategoryName,  // ใช้ชื่อหมวดหมู่จากฐานข้อมูล
      icon: 'https://cdn-icons-png.flaticon.com/128/817/817729.png',  // คุณอาจใช้ไอคอนจากฐานข้อมูลหรือกำหนดเอง
      categoryId: category.CategoryId,  // เพิ่ม categoryId ที่ดึงจากฐานข้อมูล
      amount: 0
    }));
  
    // รวมรายรับแต่ละหมวดหมู่โดยใช้ categoryId
    incomes.forEach(income => {
      const category = categoryDetails.find(cat => cat.categoryId === income.CategoryId);
      if (category) {
        category.amount += income.amount;
      }
    });
  
    // คำนวณเปอร์เซ็นต์
    this.incomeDetails = categoryDetails.map(category => {
      const percentage = ((category.amount / this.totalIncome) * 100).toFixed(2);
      return {
        ...category,
        percentage
      };
    });
  }
  

  renderIncomeChart() {
    const ctx = document.getElementById('myIncomeChart') as HTMLCanvasElement;
  
    // ตรวจสอบว่า ctx มีค่าหรือไม่
    if (!ctx) {
      console.error('ไม่พบ canvas element!');
      return;
    }
  
    console.log('Chart data:', this.incomeDetails); // ดีบักข้อมูล
    const chartData = this.incomeDetails.map(detail => detail.amount);
    const chartLabels = this.incomeDetails.map(detail => detail.name);
  
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'รายรับ',
          data: chartData,
          backgroundColor: [
            '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40', // สีเดิม
            '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', // สีเพิ่มเติม
            '#1abc9c', '#e84393', '#34495e', '#16a085', '#27ae60', '#d35400', // สีเพิ่มเติม
            '#7f8c8d', '#8e44ad', '#2c3e50', '#c0392b', '#2980b9', '#f39c12', // สีเพิ่มเติม
        ]        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
