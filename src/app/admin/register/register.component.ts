import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service'; // ปรับเส้นทางให้ถูกต้อง
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register(this.username, this.email, this.password).subscribe(
      response => {
        Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          text: 'คุณสามารถเข้าสู่ระบบได้แล้ว!'
        }).then(() => {
          this.router.navigate(['/login']); // นำทางไปยังหน้า login หลังจากลงทะเบียนสำเร็จ
        });
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'ลงทะเบียนไม่สำเร็จ',
          text: 'มีบางอย่างผิดพลาด, โปรดลองอีกครั้ง'
        });
      }
    );
  }
}
