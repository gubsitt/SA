import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service'; // ตรวจสอบให้แน่ใจว่าเส้นทางถูกต้อง

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const isLoggedIn = !!sessionStorage.getItem('userId'); // ตรวจสอบว่า userId ถูกบันทึกไว้ใน sessionStorage หรือไม่
    if (!isLoggedIn) {
      this.router.navigate(['/login']); // นำทางไปหน้า login ถ้ายังไม่ได้ล็อกอิน
      return false;
    }
    return true;
  }
}
