import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeAnalysisComponent } from './income-analysis.component';

describe('IncomeAnalysisComponent', () => {
  let component: IncomeAnalysisComponent;
  let fixture: ComponentFixture<IncomeAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IncomeAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncomeAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
