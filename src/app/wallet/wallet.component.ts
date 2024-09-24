import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.renderChart();  // เรียกใช้งานกราฟเมื่อ component โหลดเสร็จ
  }

  renderChart() {
    const ctx = document.getElementById('expenseChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'bar',  // กำหนดประเภทของกราฟ (เช่น bar, line, pie)
      data: {
        labels: ['ค่าอาหาร', 'ค่าเดินทาง', 'ค่าที่พัก', 'ค่าอื่นๆ'],  // ป้ายชื่อของแกน X
        datasets: [{
          label: 'ยอดใช้จ่าย (บาท)',
          data: [5000, 3000, 7000, 2000],  // ข้อมูลการใช้จ่ายในแต่ละหมวด
          backgroundColor: ['#ff6b6b', '#4caf50', '#ffa726', '#42a5f5'],
          borderColor: ['#ff6b6b', '#4caf50', '#ffa726', '#42a5f5'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true  // เริ่มต้นแกน Y ที่ค่า 0
          }
        }
      }
    });
  }
}
