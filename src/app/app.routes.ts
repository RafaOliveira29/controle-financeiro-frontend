import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'categories', loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'incomes', loadComponent: () => import('./features/income-sources/income-sources.component').then(m => m.IncomeSourcesComponent) },
      { path: 'expenses', loadComponent: () => import('./features/expense-sources/expense-sources.component').then(m => m.ExpenseSourcesComponent) },
      { path: 'installments', loadComponent: () => import('./features/installment-plans/installment-plans.component').then(m => m.InstallmentPlansComponent) },
      { path: 'monthly-entries', loadComponent: () => import('./features/monthly-entries/monthly-entries.component').then(m => m.MonthlyEntriesComponent) },
      { path: 'payments', loadComponent: () => import('./features/payments/payments.component').then(m => m.PaymentsComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
