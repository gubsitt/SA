import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExpenseAnalysisService {

  private apiUrl = 'http://localhost:3000/api/expense-analysis'; // URL ของ API

  constructor(private http: HttpClient) { }

  // วิเคราะห์รายจ่ายตามวันที่ (แยกตาม userId)
  analyzeByDate(userId: number, startDate: string, endDate: string): Observable<any> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/by-date`, { params });
  }

  // วิเคราะห์รายจ่ายตามหมวดหมู่ (แยกตาม userId)
  analyzeByCategory(userId: number): Observable<any> {
    const params = new HttpParams().set('userId', userId.toString());

    return this.http.get<any>(`${this.apiUrl}/by-category`, { params });
  }
}
