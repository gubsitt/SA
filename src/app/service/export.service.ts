import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExportService {
  private baseUrl = 'http://localhost:3000/api/export-transactions-excel'; // แก้ไข URL ตามที่ใช้งานจริง

  constructor(private http: HttpClient) {}

    // ฟังก์ชันเพื่อดาวน์โหลดไฟล์ Excel ตามช่วงวันที่ที่ผู้ใช้เลือก
    exportTransactions(userId: number, startDate: string, endDate: string, type: string): void {
      const params = new HttpParams()
        .set('userId', userId.toString())
        .set('startDate', startDate)
        .set('endDate', endDate)
        .set('type', type);
    
      this.http.get(`${this.baseUrl}`, { params, responseType: 'blob' }).subscribe((response: Blob) => {
        console.log('API Response:', response); // เพิ่ม log ตรงนี้
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${type}_report_${startDate}_to_${endDate}.xlsx`;
        anchor.click();
        window.URL.revokeObjectURL(url);
      }, error => {
        console.error('Error downloading the file', error);
      });
    }
    
}
