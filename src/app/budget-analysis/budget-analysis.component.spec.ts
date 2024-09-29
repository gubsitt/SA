import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetAnalysisComponent } from './budget-analysis.component';

describe('BudgetAnalysisComponent', () => {
  let component: BudgetAnalysisComponent;
  let fixture: ComponentFixture<BudgetAnalysisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BudgetAnalysisComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
