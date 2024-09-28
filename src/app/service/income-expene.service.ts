import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IncomeExpenseService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // ฟังก์ชันส่งข้อมูลรายรับ
  submitIncome(amount: number, description: string, categoryId: number, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/incomes`, { amount, description, categoryId, userId });
  }

  // ฟังก์ชันส่งข้อมูลรายจ่าย
  submitExpense(amount: number, description: string, categoryId: number, isRecurring: boolean, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/expenses`, { amount, description, categoryId, isRecurring, userId });
  }

  // ฟังก์ชันดึงหมวดหมู่รายรับของผู้ใช้เฉพาะ userId
  getIncomeCategories(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/income-categories?userId=${userId}`);
  }

  // ฟังก์ชันดึงหมวดหมู่รายจ่ายของผู้ใช้เฉพาะ userId
  getExpenseCategories(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/expense-categories?userId=${userId}`);
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

  // ฟังก์ชันแก้ไขรายรับ
  updateIncome(income: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/incomes/${income.incomeId}`, income);
  }

  // ฟังก์ชันแก้ไขรายจ่าย
  updateExpense(expense: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/expenses/${expense.expenseId}`, expense);
  }

  // ฟังก์ชันสำหรับดึงงบประมาณรวม
  getTotalBudget(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/total-budget/${userId}`);
  }

  checkRecurringExpense(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/check-recurring-expense?userId=${userId}`);
  }
  
  
  
}
