import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-excel',
  templateUrl: './excel.component.html',
  styleUrls: ['./excel.component.css']
})
export class ExcelComponent{
  startDate: string = '';
  endDate: string = '';

  filterData(filterType: string) {
    // Logic การกรองข้อมูลตาม filterType
    console.log('Selected Filter: ', filterType);
  }

  applyCustomDateFilter() {
    // ตรวจสอบว่ามีการกรอกวันที่เริ่มต้นและสิ้นสุดแล้ว
    if (this.startDate && this.endDate) {
      console.log('Exporting data from', this.startDate, 'to', this.endDate);
      // Logic การกรองข้อมูลตามวันที่เริ่มและจบ
    } else {
      alert('กรุณาเลือกวันที่');
    }
  }

  exportToExcel() {
    // ตัวอย่างข้อมูลที่ส่งออก
    const data = [
      { Category: 'อาหาร', Amount: 2000, Date: '2024-09-01' },
      { Category: 'จราจร', Amount: 1500, Date: '2024-09-02' }
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    XLSX.writeFile(wb, 'data.xlsx');
  }
}

