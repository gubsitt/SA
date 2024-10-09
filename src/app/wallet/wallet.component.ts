import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { WalletService } from '../service/wallet.service';  // ใช้ WalletService ที่คุณสร้างไว้

interface Income {
  incomeId: number;
  amount: number;
  description: string;
  categoryId: number;
  userId: number;
  date: string;
}

interface Expense {
  expenseId: number;
  amount: number;
  description: string;
  categoryId: number;
  userId: number;
  date: string;
}

interface Transaction {
  type: 'income' | 'expense';
  description: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {
  totalBalance: number = 0;
  totalIncome: number = 0;
  totalExpense: number = 0;
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  startDate: string | null = null;
  endDate: string | null = null;
  financeChart: any;  // เก็บตัวแปรของ chart เพื่ออัปเดตได้ภายหลัง

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private walletService: WalletService
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
              this.renderFinanceChart();  // เรนเดอร์แผนภูมิการเงินครั้งแรก
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
    const incomeTransactions: Transaction[] = incomes.map(income => ({
      type: 'income' as 'income',
      description: income.description,
      amount: income.amount,
      date: income.date
    }));

    const expenseTransactions: Transaction[] = expenses.map(expense => ({
      type: 'expense' as 'expense',
      description: expense.description,
      amount: expense.amount,
      date: expense.date
    }));

    this.transactions = [...incomeTransactions, ...expenseTransactions];

    // จัดเรียงตามวันที่ (จากใหม่ไปเก่า)
    this.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    this.filteredTransactions = [...this.transactions];
  }

  // ฟังก์ชันกรองตามวันที่และอัปเดตแผนภูมิ
  filterTransactions() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate).setHours(0, 0, 0, 0);
      const end = new Date(this.endDate).setHours(23, 59, 59, 999);

      this.filteredTransactions = this.transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date).getTime();
        return transactionDate >= start && transactionDate <= end;
      });
    } else {
      this.filteredTransactions = [...this.transactions];
    }

    // คำนวณรายรับและรายจ่ายจากข้อมูลที่กรอง
    this.totalIncome = this.filteredTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, income) => sum + income.amount, 0);

    this.totalExpense = this.filteredTransactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((sum, expense) => sum + expense.amount, 0);

    // อัปเดตยอดคงเหลือและกราฟใหม่
    this.calculateTotalBalance();
    this.updateFinanceChart();
  }

  // ฟังก์ชันเรนเดอร์แผนภูมิการเงินครั้งแรก
  renderFinanceChart() {
    const ctx = document.getElementById('financeChart') as HTMLCanvasElement;
    if (!ctx) {
      console.error('ไม่พบ canvas element!');
      return;
    }

    const chartData = [this.totalIncome, this.totalExpense];
    const chartLabels = ['รายได้', 'รายจ่าย'];

    this.financeChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'แผนภูมิการเงิน',
          data: chartData,
          backgroundColor: ['#4caf50', '#ff6b6b'],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }

  // ฟังก์ชันอัปเดตแผนภูมิการเงิน
  updateFinanceChart() {
    if (this.financeChart) {
      this.financeChart.data.datasets[0].data = [this.totalIncome, this.totalExpense];
      this.financeChart.update();
    }
  }
}
