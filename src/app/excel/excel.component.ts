import { Component } from '@angular/core';
import { ExportService } from '../service/export.service';  // นำเข้า ExportService

@Component({
  selector: 'app-excel-component',
  templateUrl: './excel.component.html',
  styleUrls: ['./excel.component.css']
})
export class ExcelComponent {
  userId: number | null = null; // กำหนดเป็น null เพื่อรองรับการดึงจาก session
  startDate: string | null = null; // วันที่เริ่มต้นที่ผู้ใช้เลือก
  endDate: string | null = null; // วันที่สิ้นสุดที่ผู้ใช้เลือก

  constructor(private exportService: ExportService) {}

  ngOnInit(): void {
    // ดึง userId จาก sessionStorage
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    }
  }

  // ฟังก์ชันตรวจสอบและส่งออกข้อมูลรายรับ
  exportIncome(): void {
    if (this.startDate && this.endDate && this.userId) {
      console.log('Exporting Income - UserID:', this.userId, 'StartDate:', this.startDate, 'EndDate:', this.endDate);
      this.exportService.exportTransactions(this.userId, this.startDate, this.endDate, 'income');
    } else {
      alert('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุดก่อนส่งออกข้อมูล');
    }
  }
  

  // ฟังก์ชันตรวจสอบและส่งออกข้อมูลรายจ่าย
  exportExpense(): void {
    if (this.startDate && this.endDate && this.userId) {
      console.log('Exporting Expense - UserID:', this.userId, 'StartDate:', this.startDate, 'EndDate:', this.endDate);
      this.exportService.exportTransactions(this.userId, this.startDate, this.endDate, 'expense');
    } else {
      alert('กรุณาเลือกวันที่เริ่มต้นและวันที่สิ้นสุดก่อนส่งออกข้อมูล');
    }
  }
}
  