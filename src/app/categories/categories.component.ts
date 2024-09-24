import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../service/categories.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  incomeCategories: any[] = [];
  expenseCategories: any[] = [];
  newIncomeCategory: string = '';
  newExpenseCategory: string = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadIncomeCategories();  
    this.loadExpenseCategories();
  }

  // โหลดหมวดหมู่รายรับ
  loadIncomeCategories() {
    this.categoryService.getIncomeCategories().subscribe(
      (data) => {
        this.incomeCategories = data;
      },
      (error) => {
        console.error('Error loading income categories', error);
      }
    );
  }

  // โหลดหมวดหมู่รายจ่าย
  loadExpenseCategories() {
    this.categoryService.getExpenseCategories().subscribe(
      (data) => {
        this.expenseCategories = data;
      },
      (error) => {
        console.error('Error loading expense categories', error);
      }
    );
  }

  // เพิ่มหมวดหมู่รายรับ
  addIncomeCategory() {
    console.log('Adding income category:', this.newIncomeCategory); // ตรวจสอบข้อมูลก่อนส่ง
    if (this.newIncomeCategory && this.newIncomeCategory.trim()) {
      this.categoryService.addIncomeCategory(this.newIncomeCategory.trim()).subscribe(
        (response) => {
          console.log('Income category added successfully', response);
          this.loadIncomeCategories(); // โหลดข้อมูลใหม่หลังจากเพิ่มสำเร็จ
          this.newIncomeCategory = ''; // ล้างข้อมูลในฟอร์ม
        },
        (error) => {
          console.error('Error adding income category', error);
        }
      );
    } else {
      console.error('Category name is required');
    }
  }

  // เพิ่มหมวดหมู่รายจ่าย
  addExpenseCategory() {
    console.log('Adding expense category:', this.newExpenseCategory); // ตรวจสอบข้อมูลก่อนส่ง
    if (this.newExpenseCategory && this.newExpenseCategory.trim()) {
      this.categoryService.addExpenseCategory(this.newExpenseCategory.trim()).subscribe(
        (response) => {
          console.log('Expense category added successfully', response);
          this.loadExpenseCategories(); // โหลดข้อมูลใหม่หลังจากเพิ่มสำเร็จ
          this.newExpenseCategory = ''; // ล้างข้อมูลในฟอร์ม
        },
        (error) => {
          console.error('Error adding expense category', error);
        }
      );
    } else {
      console.error('Category name is required');
    }
  }
  

  // ลบหมวดหมู่รายรับ
  deleteIncomeCategory(categoryId: number) {
    this.categoryService.deleteIncomeCategory(categoryId).subscribe(
      () => {
        Swal.fire('Success', 'Income category deleted!', 'success');
        this.loadIncomeCategories();
      },
      (error) => {
        console.error('Error deleting income category', error);
        Swal.fire('Error', 'Failed to delete income category', 'error');
      }
    );
  }

  // ลบหมวดหมู่รายจ่าย
  deleteExpenseCategory(categoryId: number) {
    this.categoryService.deleteExpenseCategory(categoryId).subscribe(
      () => {
        Swal.fire('Success', 'Expense category deleted!', 'success');
        this.loadExpenseCategories();
      },
      (error) => {
        console.error('Error deleting expense category', error);
        Swal.fire('Error', 'Failed to delete expense category', 'error');
      }
    );
  }
}
