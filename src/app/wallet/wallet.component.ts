import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { IncomeExpenseService } from '../service/income-expene.service';  // ใช้ Service ที่คุณส่งมา

// สร้าง interface ภายในไฟล์นี้เลย
interface Income {
  incomeId: number;
  amount: number;
  description: string;
  categoryId: number;
  userId: number;
}

interface Expense {
  expenseId: number;
  amount: number;
  description: string;
  categoryId: number;
  userId: number;
}

interface Transaction {
  type: 'income' | 'expense';  // ระบุชนิดของ transaction
  description: string;
  amount: number;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  totalBalance: number = 0;     // ยอดคงเหลือ
  totalIncome: number = 0;      // รายได้ทั้งหมด
  totalExpense: number = 0;     // รายจ่ายทั้งหมด
  transactions: Transaction[] = [];  // เก็บข้อมูล transaction ทั้งรายรับและรายจ่าย

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private incomeExpenseService: IncomeExpenseService  // ใช้ service ที่คุณให้มา
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadWalletData();  // โหลดข้อมูลจาก backend
    }
  }

  loadWalletData() {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      // ดึงรายได้และรายจ่ายจาก service
      this.incomeExpenseService.getIncomes(parseInt(userId, 10)).subscribe(
        (incomeData: { incomes: Income[] }) => {
          this.totalIncome = this.calculateTotal(incomeData.incomes);
          this.addTransactions(incomeData.incomes, 'income');  // เพิ่ม transaction ของรายรับ

          this.incomeExpenseService.getExpenses(parseInt(userId, 10)).subscribe(
            (expenseData: { expenses: Expense[] }) => {
              this.totalExpense = this.calculateTotal(expenseData.expenses);
              this.addTransactions(expenseData.expenses, 'expense');  // เพิ่ม transaction ของรายจ่าย

              this.calculateTotalBalance();  // คำนวณยอดคงเหลือ
              this.renderFinanceChart();  // เรนเดอร์แผนภูมิการเงิน
            },
            (error) => {
              console.error('Error fetching expenses:', error);
            }
          );
        },
        (error) => {
          console.error('Error fetching incomes:', error);  
        }
      );
    }
  }

  calculateTotal(items: { amount: number }[]): number {
    return items.reduce((sum, item) => sum + item.amount, 0);
  }

  calculateTotalBalance() {
    this.totalBalance = this.totalIncome - this.totalExpense;
  }

  addTransactions(items: any[], type: 'income' | 'expense') {
    const transactions = items.map(item => ({
      type,
      description: item.description,
      amount: item.amount
    }));
    this.transactions.push(...transactions);
  }

  renderFinanceChart() {
    const ctx = document.getElementById('financeChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('ไม่พบ canvas element!');
      return;
    }

    const chartData = [this.totalIncome, this.totalExpense];
    const chartLabels = ['รายได้', 'รายจ่าย'];

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'แผนภูมิการเงิน',
          data: chartData,
          backgroundColor: ['#36A2EB', '#FF6384'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }
}
  