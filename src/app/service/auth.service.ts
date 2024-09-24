import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/users'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ฟังก์ชันสำหรับลงทะเบียนผู้ใช้
  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, email, password });
  }
  // ฟังก์ชันสำหรับล็อกอิน
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password });
  }

   // ฟังก์ชันสำหรับบันทึกรายรับ
   submitIncome(amount: number, description: string, categoryId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/incomes`, { amount, description, categoryId });
  }

  // ฟังก์ชันสำหรับบันทึกรายจ่าย
  submitExpense(amount: number, description: string, categoryId: number, isRecurring: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/expenses`, { amount, description, categoryId, isRecurring });
  }

  // ฟังก์ชันสำหรับดึงหมวดหมู่รายรับ
  getIncomeCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/income-categories`);
  }

  // ฟังก์ชันสำหรับดึงหมวดหมู่รายจ่าย
  getExpenseCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/expense-categories`);
  }
}