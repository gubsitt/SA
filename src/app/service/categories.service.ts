import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/api'; // URL ของ API

  constructor(private http: HttpClient) {}

  // ฟังก์ชันเพิ่มหมวดหมู่รายรับ
  addIncomeCategory(categoryName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/income-categories`, { categoryName });
  }

  // ฟังก์ชันลบหมวดหมู่รายรับ
  deleteIncomeCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/income-categories/${categoryId}`);
  }

  // ฟังก์ชันดึงหมวดหมู่รายรับ
  getIncomeCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/income-categories`);
  }

  // ฟังก์ชันเพิ่มหมวดหมู่รายจ่าย
  addExpenseCategory(categoryName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/expense-categories`, { categoryName });
  }

  // ฟังก์ชันลบหมวดหมู่รายจ่าย
  deleteExpenseCategory(categoryId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/expense-categories/${categoryId}`);
  }

  // ฟังก์ชันดึงหมวดหมู่รายจ่าย
  getExpenseCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/expense-categories`);
  }
}
