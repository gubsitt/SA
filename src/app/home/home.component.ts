import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IncomeExpenseService } from '../service/income-expene.service'; 
import { BalanceService } from '../service/balance.service';
import { BudgetService } from '../service/budget.service'; 
import Swal from 'sweetalert2';

interface Income {
  incomeId?: number; // เพิ่ม id สำหรับการอ้างอิง
  amount: number;
  description: string;
  CategoryId: number;
  date?: Date;
}

interface Expense {
  expenseId?: number; // เพิ่ม id สำหรับการอ้างอิง
  amount: number;
  description: string;
  isRecurring: boolean;
  CategoryId: number;
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
  income: Income = { incomeId: 0, amount: 0, description: '', CategoryId: 0 };  // เพิ่ม id
  expense: Expense = { expenseId: 0, amount: 0, description: '', isRecurring: false, CategoryId: 0 }; // เพิ่ม id

  incomes: Income[] = [];
  expenses: Expense[] = [];

  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];

  balance: number = 0;
  totalBudget: number = 0;
  userId: number = 0;

  constructor(
      private incomeExpenseService: IncomeExpenseService,
      private balanceService: BalanceService,
      private budgetService: BudgetService,
      private cdRef: ChangeDetectorRef // เพิ่มนี้
  ) {}

  ngOnInit() {
    this.loadUserId();
    this.loadCategories();
    this.loadBalance();
    this.loadIncomesAndExpenses();
    this.loadTotalBudget();
    
    console.log("Incomes:", this.incomes);
    console.log("Expenses:", this.expenses);
     
  // ตรวจสอบ recurring expense พร้อมกับส่ง userId
  this.incomeExpenseService.checkRecurringExpense(this.userId).subscribe(
    (response: any) => {
      if (response.success && response.isNewMonth) {  // เพิ่มการตรวจสอบว่าเป็นเดือนใหม่หรือไม่
        Swal.fire({
          title: 'การแจ้งเตือน',
          text: response.message,
          icon: 'info',
          confirmButtonText: 'ตกลง'
        });
      }
    },
    (error) => {
      console.error('Error checking recurring expenses:', error);
    }
  );
     
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
    const userId = sessionStorage.getItem('userId');  // ดึง userId จาก sessionStorage
    if (!userId) {
      Swal.fire('Error', 'User is not logged in', 'error');
      return;
    }
  
    // ดึงหมวดหมู่รายรับที่สัมพันธ์กับ userId
    this.incomeExpenseService.getIncomeCategories(parseInt(userId)).subscribe(
      (categories: Category[]) => {
        this.incomeCategories = categories;
      },
      (error) => {
        console.error('Error loading income categories:', error);
      }
    );
  
    // ดึงหมวดหมู่รายจ่ายที่สัมพันธ์กับ userId
    this.incomeExpenseService.getExpenseCategories(parseInt(userId)).subscribe(
      (categories: Category[]) => {
        this.expenseCategories = categories;
      },
      (error) => {
        console.error('Error loading expense categories:', error);
      }
    );
  }
    // โหลดงบประมาณรวมจาก BudgetService
    loadTotalBudget() {
      if (this.userId) {
        this.budgetService.getTotalBudget(this.userId).subscribe(
          (response) => {
            this.totalBudget = response.totalBudget;
  
            // ตรวจสอบว่าหากยอดคงเหลือน้อยกว่างบประมาณรวม
            if (this.balance < this.totalBudget) {
              Swal.fire('คำเตือน', 'ยอดเงินคงเหลือของคุณน้อยกว่างบประมาณที่ตั้งไว้', 'warning');
            }
          },
          (error) => {
            console.error('Error loading total budget:', error);
          }
        );
      }
    }   
  

  loadIncomesAndExpenses() {
    if (this.userId > 0) {
      this.incomeExpenseService.getIncomes(this.userId).subscribe(
        (response: any) => {
          this.incomes = response.incomes;
          this.cdRef.detectChanges();
          console.log(this.incomes);  // ตรวจสอบข้อมูลใน console
        },
        (error) => {
          console.error('Error loading incomes:', error);
        }
      );
  
      this.incomeExpenseService.getExpenses(this.userId).subscribe(
        (response: any) => {
          this.expenses = response.expenses;
          this.cdRef.detectChanges();
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
    if (this.income.incomeId) {
      // แก้ไขรายรับที่มีอยู่
      this. updateIncome();
    } else {
      // เพิ่มรายรับใหม่
      this.incomeExpenseService.submitIncome(this.income.amount, this.income.description, this.income.CategoryId, this.userId).subscribe(
        (response: any) => {
          Swal.fire('Success', 'Income added successfully!', 'success');
          this.loadIncomesAndExpenses(); // เรียกใช้หลังจากบันทึกสำเร็จเพื่อโหลดข้อมูลใหม่
          this.income = { incomeId: 0, amount: 0, description: '', CategoryId: 0 }; // ล้างข้อมูลในฟอร์ม
          this.updateBalance();
        },
        (error) => {
          console.error('Error submitting income:', error);
        }
      );
    }
  }
  
  submitExpense() {
    if (this.expense.amount > this.balance) {
      Swal.fire({
        title: 'คำเตือน',
        text: 'จำนวนรายจ่ายมากกว่ายอดคงเหลือ คุณต้องการดำเนินการต่อหรือไม่?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ดำเนินการต่อ',
        cancelButtonText: 'ยกเลิก'
      }).then((result) => {
        if (result.isConfirmed) {
          this.saveExpense(); // เรียกฟังก์ชันบันทึกรายจ่าย
        }
      });
    } else {
      this.saveExpense(); // บันทึกรายจ่ายทันทีถ้าจำนวนไม่เกินยอดคงเหลือ  
    }
  }
  
  saveExpense() {
    if (this.expense.expenseId) {
      // แก้ไขรายจ่ายที่มีอยู่
      this.updateExpense();
    } else {
      // เพิ่มรายจ่ายใหม่
      this.incomeExpenseService.submitExpense(this.expense.amount, this.expense.description, this.expense.CategoryId, this.expense.isRecurring, this.userId).subscribe(
        (response: any) => {
          Swal.fire('สำเร็จ', 'เพิ่มรายจ่ายเรียบร้อยแล้ว!', 'success');
          this.loadIncomesAndExpenses(); // เรียกใช้หลังจากบันทึกสำเร็จเพื่อโหลดข้อมูลใหม่
          this.expense = { expenseId: 0, amount: 0, description: '', isRecurring: false, CategoryId: 0 }; // ล้างข้อมูลในฟอร์ม
          this.updateBalance();
        },
        (error) => {
          console.error('เกิดข้อผิดพลาดในการเพิ่มรายจ่าย:', error);
        }
      );
    }
  }

  

  // โหลดยอดคงเหลือ
  loadBalance() {
    this.balanceService.getBalance(this.userId).subscribe(
      (response) => {
        this.balance = response.balance;
        this.checkBalanceVsBudget(); // ตรวจสอบยอดคงเหลือกับงบประมาณ
      },
      (error) => {
        console.error('Error loading balance:', error);
      }
    );
  }

   // ตรวจสอบยอดคงเหลือเมื่อเปรียบเทียบกับงบประมาณรวม
   checkBalanceVsBudget() {
    if (this.balance < this.totalBudget) {
      Swal.fire('คำเตือน', 'ยอดเงินคงเหลือของคุณน้อยกว่างบประมาณที่ตั้งไว้', 'warning');
    }
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
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบรายรับนี้จริงหรือ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incomeExpenseService.deleteIncome(incomeId).subscribe(
          () => {
            this.loadIncomesAndExpenses(); // เรียกใช้หลังจากลบสำเร็จเพื่อโหลดข้อมูลใหม่
            this.updateBalance();  // อัปเดตยอดคงเหลือ
            Swal.fire('ลบเรียบร้อย!', 'รายรับของคุณถูกลบแล้ว', 'success');
          },
          (error) => {
            console.error('Error deleting income:', error);
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบรายรับได้', 'error');
          }
        );
      }
    });
  } else {
    console.error('Invalid income ID');
  }
}


  // ฟังก์ชันแก้ไขรายจ่าย
editExpense(expense: Expense) {
  // นำข้อมูลของ expense ที่ต้องการแก้ไขมาแสดงในฟอร์ม
  this.expense = { ...expense }; 
}

updateIncome() {
  this.incomeExpenseService.updateIncome(this.income).subscribe(
    (response: any) => {
      Swal.fire('Success', 'Income updated successfully!', 'success');
      this.loadIncomesAndExpenses(); // โหลดข้อมูลใหม่หลังจากอัปเดต
      this.income = { incomeId: 0, amount: 0, description: '', CategoryId: 0 }; // ล้างข้อมูลในฟอร์ม
      this.updateBalance();
    },
    (error) => {
      console.error('Error updating income:', error);
      Swal.fire('ล้มเหลว', 'เกิดข้อผิดพลาดในการแก้ไข', 'error');
    }
  );
}

updateExpense() {
  // ตรวจสอบค่าที่ถูกส่งไปยัง backend
  console.log(this.expense);

  this.incomeExpenseService.updateExpense(this.expense).subscribe(
    (response: any) => {
      Swal.fire('Success', 'Expense updated successfully!', 'success');
      this.loadIncomesAndExpenses(); // โหลดข้อมูลใหม่หลังจากอัปเดต
      this.expense = { expenseId: 0, amount: 0, description: '', isRecurring: false, CategoryId: 0 }; // ล้างข้อมูลในฟอร์ม
      this.updateBalance();
    },
    (error) => {
      console.error('Error updating expense:', error);
      Swal.fire('ล้มเหลว', 'เกิดข้อผิดพลาดในการแก้ไข', 'error');
    }
  );
}





// ฟังก์ชันลบรายจ่าย
deleteExpense(expenseId: number) {
  console.log('กำลังลบรายจ่ายที่มี ID:', expenseId); // เพิ่มการพิมพ์ค่า expenseId
  if (expenseId) {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการลบรายจ่ายนี้จริงหรือ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.incomeExpenseService.deleteExpense(expenseId).subscribe(
          () => {
            this.loadIncomesAndExpenses(); // เรียกใช้หลังจากลบสำเร็จเพื่อโหลดข้อมูลใหม่
            this.updateBalance();  // อัปเดตยอดคงเหลือ
            Swal.fire('ลบเรียบร้อย!', 'รายจ่ายของคุณถูกลบแล้ว', 'success');
          },
          (error) => {
            console.error('Error deleting expense:', error);
            Swal.fire('เกิดข้อผิดพลาด!', 'ไม่สามารถลบรายจ่ายได้', 'error');
          }
        );
      }
    });
  } else {
    console.error('Invalid expense ID');
  }
}


  
  

}
