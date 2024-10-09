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
  addIncomeCategory(categoryName: string, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/income-categories`, { categoryName, userId });
  }

  // ฟังก์ชันลบหมวดหมู่รายรับ
  deleteIncomeCategory(categoryId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/income-categories/${categoryId}?userId=${userId}`);
  } 

  // ฟังก์ชันดึงหมวดหมู่รายรับ
  getIncomeCategories(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/income-categories?userId=${userId}`);
  }

  // ฟังก์ชันเพิ่มหมวดหมู่รายจ่าย
  addExpenseCategory(categoryName: string, userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/expense-categories`, { categoryName, userId });
  }

  // ฟังก์ชันลบหมวดหมู่รายจ่าย
  deleteExpenseCategory(categoryId: number, userId: number) {
    return this.http.delete(`${this.apiUrl}/expense-categories/${categoryId}?userId=${userId}`);
  }
  

  // ฟังก์ชันดึงหมวดหมู่รายจ่าย
  getExpenseCategories(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/expense-categories?userId=${userId}`);
  }
}
