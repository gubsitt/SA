import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from './service/auth.service'; // นำเข้า AuthService

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'My Angular App';  // เพิ่มคุณสมบัติ title ที่นี่

  showNavbar: boolean = true; // ตัวแปรสำหรับควบคุมการแสดง Navbar

  // Inject AuthService เข้ามาใน constructor เพื่อใช้งาน
  constructor(private router: Router, private authService: AuthService) { 
    // ตรวจสอบเส้นทางทุกครั้งที่เปลี่ยนเส้นทาง
    this.router.events.subscribe(() => {
      // ซ่อน Navbar เมื่ออยู่ในหน้า login หรือ register
      const currentUrl = this.router.url;
      this.showNavbar = !(currentUrl.includes('/login') || currentUrl.includes('/register'));
    });
  }

  // ฟังก์ชัน logout
  logout() {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'คุณต้องการออกจากระบบหรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ออกจากระบบ',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout(); // เรียกฟังก์ชัน logout จาก AuthService
        Swal.fire({
          icon: 'success',
          title: 'ออกจากระบบสำเร็จ',
          text: 'คุณได้ออกจากระบบแล้ว',
        }).then(() => {
          // นำทางไปยังหน้า login ที่ถูกต้อง
          this.router.navigateByUrl('/login').then(() => {
            window.location.reload(); // บังคับให้รีเฟรชหน้าเว็บเพื่อเคลียร์ state
          });
        });
      }
    });
  }
   
}
