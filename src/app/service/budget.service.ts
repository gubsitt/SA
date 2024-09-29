import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = 'http://localhost:3000/api';  // ปรับ URL ให้ตรงกับเส้นทาง API

  constructor(private http: HttpClient) { }

  // ดึงหมวดหมู่รายจ่าย
  getExpenseCategories(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/expense-categories-budget?userId=${userId}`);
  }

  // ดึงงบประมาณรวม
  getTotalBudget(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/total-budget?userId=${userId}`);
  }

  // บันทึกงบประมาณ
  saveBudgets(categories: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/save-budgets`, { categories });
  }

  // ฟังก์ชันดึงหมวดหมู่รายจ่ายพร้อมงบประมาณที่ตั้งไว้
  getBudget(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getbudget?userId=${userId}`);
  }
}
