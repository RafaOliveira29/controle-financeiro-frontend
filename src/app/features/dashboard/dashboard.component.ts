import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { MonthlySummaryService } from '../../core/services/monthly-summary.service';
import { MonthlySummary } from '../../core/models/monthly-summary.model';
import { CategoryType } from '../../core/models/category.model';
import { PaymentMethod } from '../../core/models/payment.model';
import { ApiError } from '../../core/api/api-error';
import { TEMP_USER_ID } from '../../core/config/auth.config';

import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    BadgeComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    ButtonComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly summaryService = inject(MonthlySummaryService);

  // Core Data & State
  summary = signal<MonthlySummary | null>(null);
  isLoading = signal<boolean>(false);
  errorMessage = '';

  // Form Control for Month Selection (YYYY-MM)
  monthControl = new FormControl('');

  ngOnInit(): void {
    this.initMonthControl();
  }

  // ---------- Initialization & Listeners ----------

  private initMonthControl(): void {
    const today = new Date();
    // Default to YYYY-MM
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    this.monthControl.setValue(currentMonthStr);

    // Initial Fetch
    this.loadSummary();

    // Re-fetch on distinct change
    this.monthControl.valueChanges.subscribe(() => {
      this.loadSummary();
    });
  }

  // ---------- Data Fetching ----------

  loadSummary(): void {
    const monthValue = this.monthControl.value;
    if (!monthValue) return;

    // Convert YYYY-MM to ISO date Start of Month: YYYY-MM-01T00:00:00Z
    const [year, month] = monthValue.split('-');
    const referenceDate = new Date(Date.UTC(+year, +month - 1, 1)).toISOString();

    this.isLoading.set(true);
    this.errorMessage = '';
    this.summary.set(null); // Clear context while fetching new data

    this.summaryService.getSummary(TEMP_USER_ID, referenceDate)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.summary.set(data);
        },
        error: (err: ApiError) => {
          this.errorMessage = err.message || 'Erro ao carregar o resumo mensal.';
        }
      });
  }

  // ---------- Evaluation Helpers ----------

  hasBreakdownData(): boolean {
    const s = this.summary();
    if (!s) return false;
    
    const hasCategory = s.categoryBreakdown && s.categoryBreakdown.length > 0;
    const hasExpenseKind = s.expenseKindBreakdown && (
      s.expenseKindBreakdown.fixedExpected > 0 ||
      s.expenseKindBreakdown.variableExpected > 0 ||
      s.expenseKindBreakdown.installmentExpected > 0
    );
    const hasPaymentMethod = s.paymentMethodBreakdown && s.paymentMethodBreakdown.length > 0;

    return hasCategory || hasExpenseKind || hasPaymentMethod;
  }

  // ---------- UI Formatting Helpers ----------

  getCategoryTypeLabel(type: CategoryType): string {
    return type === 'Income' ? 'Receita' : 'Despesa';
  }

  getCategoryBadge(type: CategoryType): 'success' | 'danger' {
    return type === 'Income' ? 'success' : 'danger';
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const dictionary: Record<string, string> = {
      Pix: 'Pix',
      CreditCard: 'Cartão de Crédito',
      DebitCard: 'Cartão de Débito',
      Cash: 'Dinheiro',
      BankSlip: 'Boleto',
      Other: 'Outro'
    };
    return dictionary[method as string] || method.toString();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatPercent(paid: number, expected: number): string {
    if (!expected || expected === 0) return '0%';
    const pct = (paid / expected) * 100;
    // Cap at 100 on visual side to prevent odd overflow representations
    return `${Math.min(pct, 100).toFixed(0)}%`;
  }
}
