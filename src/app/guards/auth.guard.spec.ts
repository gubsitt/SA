import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard'; // เปลี่ยนชื่อเป็น AuthGuard ให้ตรงกับในไฟล์

describe('AuthGuard', () => { // เปลี่ยนชื่อการทดสอบให้ตรงกับ AuthGuard
  let guard: AuthGuard;
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy } // ใช้ Router mock ในการทดสอบ
      ]
    });
    guard = TestBed.inject(AuthGuard); // ใช้ inject แทนการอ้างอิงแบบฟังก์ชัน
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  // ทดสอบสถานการณ์ที่ผู้ใช้ล็อกอินแล้ว
  it('should allow navigation if user is logged in', () => {
    sessionStorage.setItem('userId', '123'); // จำลองสถานการณ์ที่ผู้ใช้ล็อกอิน
    expect(guard.canActivate(null as any, null as any)).toBeTrue();
  });

  // ทดสอบสถานการณ์ที่ผู้ใช้ยังไม่ได้ล็อกอิน
  it('should not allow navigation if user is not logged in', () => {
    sessionStorage.removeItem('userId'); // จำลองสถานการณ์ที่ผู้ใช้ยังไม่ได้ล็อกอิน
    expect(guard.canActivate(null as any, null as any)).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']); // ตรวจสอบว่าไปหน้า login
  });
});
