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
  userId: number | null = null; // เก็บ userId

  constructor(private categoryService: CategoryService) {}

  ngOnInit() {
    this.loadUserId();  // โหลด userId ก่อนทำงานใดๆ
    if (this.userId) {
      this.loadIncomeCategories();  
      this.loadExpenseCategories();
    }
  }

  // ฟังก์ชันโหลด userId
  loadUserId() {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    } else {
      Swal.fire('Error', 'User is not logged in', 'error');
    }
  }

  // โหลดหมวดหมู่รายรับ
  loadIncomeCategories() {
    if (!this.userId) return;
    this.categoryService.getIncomeCategories(this.userId).subscribe(
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
    if (!this.userId) return;
    this.categoryService.getExpenseCategories(this.userId).subscribe(
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
    if (this.newIncomeCategory && this.newIncomeCategory.trim() && this.userId) {
      this.categoryService.addIncomeCategory(this.newIncomeCategory.trim(), this.userId).subscribe(
        (response) => {
          console.log('Income category added successfully', response);
          Swal.fire({
            icon: 'success',
            title: 'เพิ่มหมวดหมู่รายรับสำเร็จ!',
            text: `หมวดหมู่ ${this.newIncomeCategory} ถูกเพิ่มเรียบร้อยแล้ว`,
            timer: 2000,
            showConfirmButton: false
          });
          this.loadIncomeCategories(); // โหลดข้อมูลใหม่หลังจากเพิ่มสำเร็จ
          this.newIncomeCategory = ''; // ล้างข้อมูลในฟอร์ม
        },
        (error) => {
          console.error('Error adding income category', error);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเพิ่มหมวดหมู่รายรับได้',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ข้อผิดพลาด',
        text: 'กรุณากรอกชื่อหมวดหมู่และตรวจสอบว่ามี userId',
      });
    }
  }

// เพิ่มหมวดหมู่รายจ่าย
addExpenseCategory() {
  if (this.newExpenseCategory && this.newExpenseCategory.trim() && this.userId) {
    this.categoryService.addExpenseCategory(this.newExpenseCategory.trim(), this.userId).subscribe(
      (response) => {
        console.log('Expense category added successfully', response);
        Swal.fire({
          icon: 'success',
          title: 'เพิ่มหมวดหมู่รายจ่ายสำเร็จ!',
          text: `หมวดหมู่ ${this.newExpenseCategory} ถูกเพิ่มเรียบร้อยแล้ว`,
          timer: 2000,
          showConfirmButton: false
        });
        this.loadExpenseCategories(); // โหลดข้อมูลใหม่หลังจากเพิ่มสำเร็จ
        this.newExpenseCategory = ''; // ล้างข้อมูลในฟอร์ม
      },
      (error) => {
        console.error('Error adding expense category', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถเพิ่มหมวดหมู่รายจ่ายได้',
        });
      }
    );
  } else {
    Swal.fire({
      icon: 'error',
      title: 'ข้อผิดพลาด',
      text: 'กรุณากรอกชื่อหมวดหมู่และตรวจสอบว่ามี userId',
    });
  }
}

// ลบหมวดหมู่รายรับ
deleteIncomeCategory(categoryId: number) {
  if (!this.userId) return;
  Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'คุณต้องการลบหมวดหมู่รายรับนี้จริงหรือ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      this.categoryService.deleteIncomeCategory(categoryId, this.userId).subscribe(
        () => {
          Swal.fire('สำเร็จ', 'ลบหมวดหมู่รายรับเรียบร้อยแล้ว!', 'success');
          this.loadIncomeCategories(); // โหลดข้อมูลหมวดหมู่ใหม่หลังจากลบสำเร็จ
        },
        (error) => {
          console.error('Error deleting income category:', error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบหมวดหมู่รายรับได้', 'error');
        }
      );
    }
  });
}

// ลบหมวดหมู่รายจ่าย
deleteExpenseCategory(categoryId: number) {
  if (!this.userId) return;
  Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: 'คุณต้องการลบหมวดหมู่รายจ่ายนี้จริงหรือ?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'ใช่, ลบเลย!',
    cancelButtonText: 'ยกเลิก'
  }).then((result) => {
    if (result.isConfirmed) {
      this.categoryService.deleteExpenseCategory(categoryId, this.userId).subscribe(
        () => {
          Swal.fire('สำเร็จ', 'ลบหมวดหมู่รายจ่ายเรียบร้อยแล้ว!', 'success');
          this.loadExpenseCategories(); // โหลดข้อมูลหมวดหมู่ใหม่หลังจากลบสำเร็จ
        },
        (error) => {
          console.error('Error deleting expense category:', error);
          Swal.fire('ผิดพลาด', 'ไม่สามารถลบหมวดหมู่รายจ่ายได้', 'error');
        }
      );
    }
  });
}

}
