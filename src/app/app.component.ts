import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNavbar: boolean = true; // ตัวแปรสำหรับควบคุมการแสดง Navbar

  constructor(private router: Router) {
    // ตรวจสอบเส้นทางทุกครั้งที่เปลี่ยนเส้นทาง
    this.router.events.subscribe(() => {
      // ซ่อน Navbar เมื่ออยู่ในหน้า login หรือ register
      const currentUrl = this.router.url;
      this.showNavbar = !(currentUrl.includes('/login') || currentUrl.includes('/register'));
    });
  }
}
