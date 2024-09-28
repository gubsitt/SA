import { Component, OnInit } from '@angular/core';
import { BudgetService } from '../service/budget.service';
import Swal from 'sweetalert2';

// Interface สำหรับ ExpenseCategory
interface ExpenseCategory {
  CategoryId: number;
  CategoryName: string;
  Budget: number;
  budget?: number; // งบประมาณที่ผู้ใช้กรอก (อาจเป็น undefined)
}

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.css']
})
export class BudgetComponent implements OnInit {
  expenseCategories: ExpenseCategory[] = [];
  userId: number | null = null;
  balance: number = 0;
  totalBudget: number = 0;
  daysInMonth: number = this.getDaysInCurrentMonth();  // จำนวนวันในเดือนปัจจุบัน

  constructor(private budgetService: BudgetService) {}

  ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      this.loadExpenseCategoriesAndBalance();  // โหลดหมวดหมู่พร้อมยอดคงเหลือ
    } else {
      Swal.fire('ข้อผิดพลาด', 'ผู้ใช้ไม่ได้เข้าสู่ระบบ', 'error');
    }
  }

  // ฟังก์ชันโหลดหมวดหมู่รายจ่ายพร้อมยอดคงเหลือและงบประมาณรวมจาก backend
  loadExpenseCategoriesAndBalance(): void {
    if (this.userId) {
      this.budgetService.getExpenseCategories(this.userId).subscribe(
        (data) => {
          this.expenseCategories = data.budgets.map((category: any) => ({
            ...category,
            budget: category.Budget // กำหนดงบประมาณเริ่มต้นจากฐานข้อมูล
          }));
          this.balance = data.balance;
          this.totalBudget = data.totalBudget;

          // เช็คว่ายอดคงเหลือต่ำกว่างบประมาณรวมหรือไม่
          if (data.isBelowBudget) {
            Swal.fire('คำเตือน', 'ยอดเงินคงเหลือของคุณต่ำกว่างบประมาณที่ตั้งไว้', 'warning');
          }
        },
        (error) => {
          console.error('Error loading expense categories or balance', error);
          Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดหมวดหมู่หรือยอดคงเหลือได้', 'error');
        }
      );
    }
  }

  // ฟังก์ชันคำนวณจำนวนวันในเดือนปัจจุบัน
  getDaysInCurrentMonth(): number {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  }

  // ฟังก์ชันคำนวณจำนวนเงินที่ควรใช้ต่อวัน
  getDailyBudget(budget: number): number {
    return budget / this.daysInMonth;
  }

  // ฟังก์ชันบันทึกงบประมาณ
  saveBudgets(): void {
    const filteredCategories = this.expenseCategories.map(category => ({
      UserId: this.userId,
      CategoryId: category.CategoryId,
      budget: category.budget
    }));

    if (filteredCategories.length > 0) {
      this.budgetService.saveBudgets(filteredCategories).subscribe(
        (response) => {
          Swal.fire('สำเร็จ', 'บันทึกงบประมาณสำเร็จและอัปเดตเรียบร้อย', 'success');
          this.loadExpenseCategoriesAndBalance();  // รีโหลดยอดคงเหลือและงบประมาณใหม่หลังจากบันทึก
        },
        (error) => {
          console.error('Error saving budgets:', error);
          Swal.fire('ข้อผิดพลาด', 'ไม่สามารถบันทึกงบประมาณได้', 'error');
        }
      );
    } else {
      Swal.fire('คำเตือน', 'กรุณากำหนดงบประมาณให้ครบทุกหมวดหมู่', 'warning');
    }
  }
}
