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

  // ฟังก์ชันสำหรับออกจากระบบ
  logout(): void {
    sessionStorage.removeItem('userId'); // ลบข้อมูล userId จาก sessionStorage
    sessionStorage.clear(); // หรือล้างข้อมูลทั้งหมดใน sessionStorage ถ้าต้องการ
  }

  // ฟังก์ชันสำหรับตรวจสอบสถานะการล็อกอิน
  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('userId'); // ตรวจสอบว่ามี userId ใน sessionStorage หรือไม่
  }
}
