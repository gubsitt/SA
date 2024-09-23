import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncomeExpenseService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  submitIncome(amount: number, description: string, categoryId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/incomes`, { amount, description, categoryId, userId });
  }

  submitExpense(amount: number, description: string, categoryId: number, isRecurring: boolean, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/expenses`, { amount, description, categoryId, isRecurring, userId });
  }

  getIncomeCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/income-categories`);
  }

  getExpenseCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/expense-categories`);
  }

  // ฟังก์ชันดึงรายการรายรับทั้งหมดของผู้ใช้
  getIncomes(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/incomes?userId=${userId}`);
  }

  // ฟังก์ชันดึงรายการรายจ่ายทั้งหมดของผู้ใช้
  getExpenses(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/expenses?userId=${userId}`);
  }
  
// ฟังก์ชันลบรายรับ
deleteIncome(incomeId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/incomes/${incomeId}`);
}

// ฟังก์ชันลบรายจ่าย
deleteExpense(expenseId: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/expenses/${expenseId}`);
}


}

