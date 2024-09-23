import { Component, OnInit } from '@angular/core';
import { IncomeExpenseService } from '../service/income-expene.service'; 
import { BalanceService } from '../service/balance.service';

interface Income {
  id?: number; // เพิ่ม id สำหรับการอ้างอิง
  amount: number;
  description: string;
  categoryId: number;
  date?: Date;
}

interface Expense {
  id?: number; // เพิ่ม id สำหรับการอ้างอิง
  amount: number;
  description: string;
  isRecurring: boolean;
  categoryId: number;
  date?: Date;
}

interface Category {
  CategoryId: number;
  CategoryName: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  income: Income = { id: 0, amount: 0, description: '', categoryId: 0 };  // เพิ่ม id
  expense: Expense = { id: 0, amount: 0, description: '', isRecurring: false, categoryId: 0 }; // เพิ่ม id

  incomes: Income[] = [];
  expenses: Expense[] = [];

  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];

  balance: number = 0;
  userId: number = 0;

  constructor(
    private incomeExpenseService: IncomeExpenseService,
    private balanceService: BalanceService
  ) {}

  ngOnInit() {
    this.loadUserId();
    this.loadCategories();
    this.loadBalance();
    this.loadIncomesAndExpenses();
    console.log("Incomes:", this.incomes);
    console.log("Expenses:", this.expenses);
  }

  loadUserId() {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    } else {
      console.error('User is not logged in.');
    }
  }

  loadCategories() {
    this.incomeExpenseService.getIncomeCategories().subscribe(
      (categories: Category[]) => {
        this.incomeCategories = categories;
      },
      (error) => {
        console.error('Error loading income categories:', error);
      }
    );

    this.incomeExpenseService.getExpenseCategories().subscribe(
      (categories: Category[]) => {
        this.expenseCategories = categories;
      },
      (error) => {
        console.error('Error loading expense categories:', error);
      }
    );
  }

  loadIncomesAndExpenses() {
    if (this.userId > 0) {
      this.incomeExpenseService.getIncomes(this.userId).subscribe(
        (response: any) => {
          this.incomes = response.incomes;
          console.log(this.incomes);  // ตรวจสอบข้อมูลใน console
        },
        (error) => {
          console.error('Error loading incomes:', error);
        }
      );
  
      this.incomeExpenseService.getExpenses(this.userId).subscribe(
        (response: any) => {
          this.expenses = response.expenses;
          console.log(this.expenses);  // ตรวจสอบข้อมูลใน console
        },
        (error) => {
          console.error('Error loading expenses:', error);
        }
      );
    } else {
      console.error('No valid userId found.');
    }
  }

  submitIncome() {
    if (this.userId > 0) {
      this.incomeExpenseService.submitIncome(this.income.amount, this.income.description, this.income.categoryId, this.userId).subscribe(
        (response: any) => {
          this.incomes.push(response.income);
          this.income = { id: 0, amount: 0, description: '', categoryId: 0 };
          this.updateBalance();
        },
        (error) => {
          console.error('Error submitting income:', error);
        }
      );
    } else {
      console.error('No valid userId found.');
    }
  }

  submitExpense() {
    if (this.userId > 0) {
      this.incomeExpenseService.submitExpense(this.expense.amount, this.expense.description, this.expense.categoryId, this.expense.isRecurring, this.userId).subscribe(
        (response: any) => {
          this.expenses.push(response.expense);
          this.expense = { id: 0, amount: 0, description: '', isRecurring: false, categoryId: 0 };
          this.updateBalance();
        },
        (error) => {
          console.error('Error submitting expense:', error);
        }
      );
    } else {
      console.error('No valid userId found.');
    }
  }

  loadBalance() {
    this.balanceService.getBalance(this.userId).subscribe(
      (response) => {
        this.balance = response.balance;
      },
      (error) => {
        console.error('Error loading balance:', error);
      }
    );
  }

  updateBalance() {
    this.balanceService.updateBalance(this.userId).subscribe(
      () => {
        this.loadBalance();
      },
      (error) => {
        console.error('Error updating balance:', error);
      }
    );
  }

  // ฟังก์ชันแก้ไขรายรับ
  editIncome(income: Income) {
    this.income = { ...income }; // คัดลอกข้อมูลรายรับเพื่อแก้ไข
  }

  // ฟังก์ชันลบรายรับ
  deleteIncome(incomeId: number) {
    if (incomeId) {
      this.incomeExpenseService.deleteIncome(incomeId).subscribe(
        () => {
          this.incomes = this.incomes.filter(income => income.id !== incomeId);
          this.updateBalance();  // อัปเดตยอดคงเหลือ
        },
        (error) => {
          console.error('Error deleting income:', error);
        }
      );
    } else {
      console.error('Invalid income ID');
    }
  }


  // ฟังก์ชันแก้ไขรายจ่าย
  editExpense(expense: Expense) {
    this.expense = { ...expense }; // คัดลอกข้อมูลรายจ่ายเพื่อแก้ไข
  }

  // ฟังก์ชันลบรายจ่าย
deleteExpense(expenseId: number) {
  if (expenseId) {
    this.incomeExpenseService.deleteExpense(expenseId).subscribe(
      () => {
        this.expenses = this.expenses.filter(expense => expense.id !== expenseId);
        this.updateBalance();  // อัปเดตยอดคงเหลือ
      },
      (error) => {
        console.error('Error deleting expense:', error);
      }
    );
  } else {
    console.error('Invalid expense ID');
  }
}

}
