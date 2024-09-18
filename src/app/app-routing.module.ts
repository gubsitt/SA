import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './admin/login/login.component';
import { RegisterComponent } from './admin/register/register.component';
import { WalletComponent } from './wallet/wallet.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { BudgetComponent } from './budget/budget.component';
import { AdditionalComponent } from './additional/additional.component';

const routes: Routes = [ 
  { path: '', redirectTo: 'home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'admin/login', component: LoginComponent },
  { path: 'admin/register', component: RegisterComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'analysis', component: AnalysisComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'additional', component: AdditionalComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
