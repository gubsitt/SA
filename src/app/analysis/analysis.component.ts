import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  // import isPlatformBrowser
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.renderChart();  // ตรวจสอบว่าอยู่ใน browser ก่อนเรียกใช้ document
    }
  }

  renderChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['ที่อยู่อาศัย', 'การเดินทาง', 'อาหาร', 'ความบันเทิง'],
        datasets: [{
          label: 'ค่าใช้จ่าย',
          data: [18500, 17500, 10000, 5000],
          backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }
}
