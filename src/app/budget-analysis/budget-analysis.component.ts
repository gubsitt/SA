import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { BudgetService } from '../service/budget.service';  // ดึงข้อมูลงบประมาณจาก service

@Component({
  selector: 'app-budget-analysis',
  templateUrl: './budget-analysis.component.html',
  styleUrls: ['./budget-analysis.component.css']
})
export class BudgetAnalysisComponent implements OnInit {
  budgetDetails: any[] = [];  // เก็บข้อมูลรายละเอียดงบประมาณ
  totalBudget: number = 0;    // เก็บงบประมาณรวม

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private budgetService: BudgetService  // ใช้ BudgetService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBudgetData();  // โหลดข้อมูลงบประมาณจาก backend
    }
  }

  loadBudgetData() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.budgetService.getBudget(parseInt(userId, 10)).subscribe(
        (data: any) => {
          console.log('Data from API:', data);  // ตรวจสอบข้อมูลที่ได้รับจาก API
          this.processBudgetData(data.budgets, data.totalBudget);  // ใช้ข้อมูลจาก API ที่ดึงหมวดหมู่และ totalBudget
          this.renderChart(); // เรนเดอร์กราฟหลังจากประมวลผลข้อมูล
        },
        (error) => {
          console.error('Error fetching budget:', error);
        }
      );
    }
  }
  

  processBudgetData(budgets: any[], totalBudget: number) {
    console.log('Budgets:', budgets);
    console.log('Total Budget:', totalBudget);
  
    // ตรวจสอบว่ามี totalBudget หรือไม่ หากไม่มีให้ตั้งค่าเป็น 1 เพื่อป้องกันการหารด้วย 0
    this.totalBudget = totalBudget || 1;
  
    // ประมวลผลหมวดหมู่เพื่อคำนวณสัดส่วนงบประมาณ
    this.budgetDetails = budgets.map(budget => {
      const amount = budget.Amount || 0;  // ตรวจสอบว่า Amount มีอยู่
      const percentage = totalBudget > 0 ? ((amount / totalBudget) * 100).toFixed(2) : '0';  // คำนวณเปอร์เซ็นต์
  
      console.log(`Category: ${budget.CategoryName}, Amount: ${amount}, Percentage: ${percentage}`);
  
      return {
        name: budget.CategoryName,  // ชื่อหมวดหมู่
        amount,
        percentage
      };
    });
  }
  

  renderChart() {
    const ctx = document.getElementById('budgetChart') as HTMLCanvasElement;

    if (!ctx) {
      console.error('ไม่พบ canvas element!');
      return;
    }

    const chartData = this.budgetDetails.map(detail => detail.amount);
    const chartLabels = this.budgetDetails.map(detail => detail.name);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'งบประมาณ',
          data: chartData,
          backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40', '#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0', '#9966ff', '#ff9f40'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

}
