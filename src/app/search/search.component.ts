import { Component } from '@angular/core';
import { IncomeExpenseService } from '../service/income-expene.service'; 

interface Transaction {
  amount: number;
  description: string;
  type: string; // 'income' หรือ 'expense'
  date: Date;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {
  query: string = ''; // คำค้นหาจาก input
  transactions: Transaction[] = []; // เก็บผลลัพธ์ที่ได้จากการค้นหา
  userId: number | null = null; // เก็บ userId
  isSearchClicked: boolean = false; // เก็บสถานะการคลิกค้นหา

  constructor(private incomeExpenseService: IncomeExpenseService) {}

  ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('userId');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
    }
  }

  searchTransactions() {
    this.isSearchClicked = true; // ตั้งค่าให้รู้ว่าผู้ใช้กดปุ่มค้นหาแล้ว
    if (this.query && this.userId) {
      this.incomeExpenseService.searchTransactions(this.query, this.userId).subscribe(
        (data) => {
          this.transactions = [
            ...data.incomes.map((income: any) => ({ ...income, type: 'income' })),
            ...data.expenses.map((expense: any) => ({ ...expense, type: 'expense' }))
          ];
        },
        (error) => {
          console.error('Error searching transactions:', error);
        }
      );
    }
  }
}
