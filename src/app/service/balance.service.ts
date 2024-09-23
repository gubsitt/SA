import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BalanceService {
  private apiUrl = 'http://localhost:3000/api'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับดึงยอดคงเหลือ
  getBalance(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/balance/${userId}`);
  }

  // ฟังก์ชันสำหรับอัปเดตยอดคงเหลือ
  updateBalance(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/balance/update`, { userId });
  }
}
