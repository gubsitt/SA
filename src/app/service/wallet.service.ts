import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  private apiUrl = 'http://localhost:3000/api';  // URL ของ API ที่คุณตั้งค่าไว้

  constructor(private http: HttpClient) { }

  // ฟังก์ชันดึงข้อมูลรายรับของผู้ใช้
  getIncomes(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/incomes?userId=${userId}`);
  }

  // ฟังก์ชันดึงข้อมูลรายจ่ายของผู้ใช้
  getExpenses(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expenses?userId=${userId}`);
  }
}
