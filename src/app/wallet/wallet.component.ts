import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { WalletService } from '../service/wallet.service';  // ใช้ WalletService ที่คุณสร้างไว้

// สร้าง interface ภายในไฟล์นี้เลย
interface Income {
  incomeId: number;
  amount: number;
  description: string;
  categoryId: number;
  userId: number;
  date: string;  // เพิ่มฟิลด์วันที่
}

interface Expense {
  expenseId: number;
  amount: number;
  description: string;
  categoryId: number;
  userId: number;
  date: string;  // เพิ่มฟิลด์วันที่
}

interface Transaction {
  type: 'income' | 'expense';  // ระบุชนิดของ transaction
  description: string;
  amount: number;
  date: string;  // เพิ่มฟิลด์วันที่เพื่อจัดเรียง
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
    private walletService: WalletService  // ใช้ WalletService ที่คุณสร้างไว้
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
      this.walletService.getIncomes(parseInt(userId, 10)).subscribe(
        (incomeData: { incomes: Income[] }) => {
          this.totalIncome = this.calculateTotal(incomeData.incomes);
          this.walletService.getExpenses(parseInt(userId, 10)).subscribe(
            (expenseData: { expenses: Expense[] }) => {
              this.totalExpense = this.calculateTotal(expenseData.expenses);

              // รวมรายการรายรับและรายจ่ายเข้าด้วยกัน
              this.combineAndSortTransactions(incomeData.incomes, expenseData.expenses);

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

  // ฟังก์ชันรวมและจัดเรียงรายการรายรับและรายจ่ายตามวันที่
  combineAndSortTransactions(incomes: Income[], expenses: Expense[]) {
    // แปลงรายการรายรับและรายจ่ายเป็นรูปแบบ transaction เดียวกัน
    const incomeTransactions: Transaction[] = incomes.map(income => ({
      type: 'income' as 'income',  // ระบุชนิดของ transaction เป็น 'income'
      description: income.description,
      amount: income.amount,
      date: income.date
    }));

    const expenseTransactions: Transaction[] = expenses.map(expense => ({
      type: 'expense' as 'expense',  // ระบุชนิดของ transaction เป็น 'expense'
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    }));

    // รวมรายการรายรับและรายจ่ายเข้าด้วยกัน
    this.transactions = [...incomeTransactions, ...expenseTransactions];

    // จัดเรียงตามวันที่ (จากใหม่ไปเก่า)
    this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
          backgroundColor: [  '#4caf50', '#ff6b6b' ],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }
}
