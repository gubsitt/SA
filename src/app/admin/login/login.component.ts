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
        Swal.fire({
          icon: 'success',
          title: 'Login successful',
          text: 'Welcome back!',
        }).then(() => {
          // นำทางไปยังหน้า dashboard หรือหน้าที่คุณต้องการหลังจากล็อกอินสำเร็จ
          this.router.navigate(['/home']);
        });
      },
      error => {
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: 'Invalid username or password',
        });
      }
    );
  }
}
