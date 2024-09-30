import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './admin/login/login.component';
import { RegisterComponent } from './admin/register/register.component';
import { WalletComponent } from './wallet/wallet.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { BudgetComponent } from './budget/budget.component';
import { AdditionalComponent } from './additional/additional.component';  
import { CategoriesComponent } from './categories/categories.component';
import { ExcelComponent } from './excel/excel.component';
import { AuthGuard } from './guards/auth.guard'; // นำเข้า AuthGuard
import { IncomeAnalysisComponent } from './income-analysis/income-analysis.component';
import { BudgetAnalysisComponent } from './budget-analysis/budget-analysis.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [ 
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent,canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: 'admin/register', component: RegisterComponent },
  { path: 'wallet', component: WalletComponent, canActivate: [AuthGuard] }, // เพิ่มการป้องกันด้วย Guard
  { path: 'analysis', component: AnalysisComponent, canActivate: [AuthGuard] },
  { path: 'budget', component: BudgetComponent, canActivate: [AuthGuard] },
  { path: 'additional', component: AdditionalComponent, canActivate: [AuthGuard] },
  { path: 'categories', component: CategoriesComponent, canActivate: [AuthGuard] },
  { path: 'excel', component: ExcelComponent, canActivate: [AuthGuard] },
  { path: 'income-analysis', component: IncomeAnalysisComponent, canActivate: [AuthGuard] },
  { path: 'budget-analysis', component: BudgetAnalysisComponent, canActivate: [AuthGuard] },
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
