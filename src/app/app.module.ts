import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './admin/login/login.component';
import { HomeComponent } from './home/home.component';
import { FormsModule } from '@angular/forms';
import { RegisterComponent } from './admin/register/register.component';
import { WalletComponent } from './wallet/wallet.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { BudgetComponent } from './budget/budget.component';
import { AdditionalComponent } from './additional/additional.component';
import { CategoriesComponent } from './categories/categories.component';
import { ExcelComponent } from './excel/excel.component'; // Import FormsModule ที่นี่



@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    RegisterComponent,
    WalletComponent,
    AnalysisComponent,
    BudgetComponent,
    AdditionalComponent,
    CategoriesComponent,
    ExcelComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule, // เพิ่มที่นี่เพื่อใช้ ngModel
  ],
  providers: [
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
