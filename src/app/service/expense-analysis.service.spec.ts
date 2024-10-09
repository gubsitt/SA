import { TestBed } from '@angular/core/testing';

import { ExpenseAnalysisService } from './expense-analysis.service';

describe('ExpenseAnalysisService', () => {
  let service: ExpenseAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExpenseAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
