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
  remainingBudgetTotal: number = 0;  // เก็บงบประมาณรวมที่เหลือทั้งหมด
  daysInMonth: number = this.getDaysInCurrentMonth();  // จำนวนวันในเดือนปัจจุบัน

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

  // โหลดข้อมูลจาก API
  loadBudgetData() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      this.budgetService.getBudget(parseInt(userId, 10)).subscribe(
        (data: any) => {
          console.log('Data from API:', data);  // ตรวจสอบข้อมูลที่ได้รับจาก API
          this.processBudgetData(data.budgets);  // ใช้ข้อมูลจาก API ที่ดึงหมวดหมู่
          this.renderChart();  // เรนเดอร์กราฟหลังจากประมวลผลข้อมูล
        },
        (error) => {
          console.error('Error fetching budget:', error);
        }
      );
    }
  }

  // ฟังก์ชันคำนวณจำนวนวันในเดือนปัจจุบัน
  getDaysInCurrentMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  // ฟังก์ชันคำนวณจำนวนวันที่เหลือในเดือนปัจจุบัน
  getDaysRemaining(): number {
    const today = new Date();
    return this.daysInMonth - today.getDate(); // จำนวนวันที่เหลือในเดือนนี้
  }

  // ประมวลผลข้อมูลงบประมาณและคำนวณเปอร์เซ็นต์
  processBudgetData(budgets: any[]) {
    const daysRemaining = this.getDaysRemaining();  // จำนวนวันที่เหลือในเดือน
  
    // คำนวณงบประมาณที่ควรเหลือรวมทั้งหมด
    this.remainingBudgetTotal = budgets.reduce((sum, budget) => {
      const dailyBudget = budget.Budget;  // งบประมาณที่ตั้งไว้ต่อวัน
      const remainingBudget = dailyBudget * daysRemaining;  // คำนวณงบประมาณที่ควรเหลือ
      return sum + remainingBudget;
    }, 0);
  
    console.log('Remaining Budget Total:', this.remainingBudgetTotal);  // ตรวจสอบค่า remainingBudgetTotal
  
    // ประมวลผลงบประมาณสำหรับแต่ละหมวดหมู่
    this.budgetDetails = budgets.map(budget => {
      const dailyBudget = budget.Budget;  // งบประมาณที่ตั้งไว้สำหรับแต่ละวัน
      const remainingBudget = dailyBudget * daysRemaining;  // คำนวณงบประมาณที่ควรมีในวันที่เหลือ
  
      // คำนวณเปอร์เซ็นต์ของหมวดหมู่โดยเปรียบเทียบกับ remainingBudgetTotal
      const percentage = this.remainingBudgetTotal > 0 
        ? (remainingBudget / this.remainingBudgetTotal) * 100 
        : 0;
  
      console.log(`Category: ${budget.CategoryName}, Daily Budget: ${dailyBudget}, Remaining Budget: ${remainingBudget}, Percentage: ${percentage}`);
  
      return {
        name: budget.CategoryName,  // ชื่อหมวดหมู่
        remainingBudget,  // งบประมาณที่ควรเหลือ
        percentage: percentage.toFixed(2)  // คำนวณเปอร์เซ็นต์และแปลงเป็นทศนิยม 2 ตำแหน่ง
      };
    });
  }

  // ฟังก์ชันเรนเดอร์กราฟโดยใช้ข้อมูลจาก budgetDetails
  renderChart() {
    const ctx = document.getElementById('budgetChart') as HTMLCanvasElement;

    if (!ctx) {
      console.error('ไม่พบ canvas element!');
      return;
    }

    const chartData = this.budgetDetails.map(detail => detail.remainingBudget);  // ใช้ข้อมูลงบประมาณที่ควรมีในวันที่เหลือ
    const chartLabels = this.budgetDetails.map(detail => detail.name);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'งบประมาณที่ควรเหลือในวันที่เหลือ',
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
