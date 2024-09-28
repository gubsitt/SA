import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service'; // ปรับเส้นทางให้ถูกต้อง
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    this.authService.login(this.username, this.password).subscribe(
      response => {
        console.log('API response:', response); // เพิ่มการแสดงผล API response

        if (response && response.userId) { 
          // บันทึก userId ลงใน sessionStorage
          sessionStorage.setItem('userId', response.userId.toString());

          Swal.fire({
            icon: 'success',
            title: 'เข้าสู่ระบบสำเร็จ',
            text: 'ยินดีต้อนรับกลับมา!',
          }).then(() => {
            // นำทางไปยังหน้า home หลังจากล็อกอินสำเร็จ
            this.router.navigate(['/home']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เข้าสู่ระบบไม่สำเร็จ',
            text: 'ข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง',
          });
        }
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'เข้าสู่ระบบไม่สำเร็จ',
          text: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        });
      }
    );
  }
}
