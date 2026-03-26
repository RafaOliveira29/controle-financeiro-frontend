import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { MonthlyEntryService } from '../../core/services/monthly-entry.service';
import { PaymentService } from '../../core/services/payment.service';
import { MonthlyEntry, GenerateMonthlyEntriesRequest, EntryStatus } from '../../core/models/monthly-entry.model';
import { CreatePaymentRequest, PaymentMethod } from '../../core/models/payment.model';
import { ApiError } from '../../core/api/api-error';
import { TEMP_USER_ID } from '../../core/config/auth.config';

import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { TableComponent } from '../../shared/ui/table/table.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SelectComponent } from '../../shared/ui/select/select.component';

@Component({
  selector: 'app-monthly-entries',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    TableComponent,
    BadgeComponent,
    EmptyStateComponent,
    LoadingStateComponent,
    ModalComponent,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './monthly-entries.component.html',
  styleUrl: './monthly-entries.component.scss'
})
export class MonthlyEntriesComponent implements OnInit {
  private readonly monthlyEntryService = inject(MonthlyEntryService);
  private readonly paymentService = inject(PaymentService);
  private readonly fb = inject(FormBuilder);

  // State
  entries: MonthlyEntry[] = [];
  isLoading = signal<boolean>(false);
  isGenerating = signal<boolean>(false);
  errorMessage = '';
  successMessage = '';

  // Form Control for Month Selection (YYYY-MM)
  monthControl = new FormControl('');

  // ---------- PAYMENT MODAL STATE ----------
  isPaymentModalOpen = false;
  isPaying = false;
  paymentError = '';
  selectedEntryForPayment: MonthlyEntry | null = null;
  paymentForm!: FormGroup;

  paymentMethodOptions: { label: string; value: PaymentMethod }[] = [
    { label: 'Pix', value: 'Pix' },
    { label: 'Cartão de Crédito', value: 'CreditCard' },
    { label: 'Cartão de Débito', value: 'DebitCard' },
    { label: 'Dinheiro', value: 'Cash' },
    { label: 'Boleto', value: 'BankSlip' },
    { label: 'Outro', value: 'Other' }
  ];

  ngOnInit(): void {
    this.initMonthControl();
    this.initPaymentForm();
  }

  // ---------- Initialization & Subscriptions ----------

  private initMonthControl(): void {
    const today = new Date();
    // Format to YYYY-MM
    const currentMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    this.monthControl.setValue(currentMonthStr);

    // Initial load
    this.loadEntries();

    // Listen to changes
    this.monthControl.valueChanges.subscribe(() => {
      this.loadEntries();
    });
  }

  private initPaymentForm(): void {
    const today = new Date().toISOString().substring(0, 10);
    this.paymentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(0.01)]],
      type: ['Pix', [Validators.required]],
      date: [today, [Validators.required]]
    });
  }

  // ---------- Data Fetching ----------

  loadEntries(): void {
    const monthValue = this.monthControl.value;
    if (!monthValue) return;

    // Convert YYYY-MM to ISO date: YYYY-MM-01T00:00:00Z for the backend referenceMonth
    const [year, month] = monthValue.split('-');
    const referenceDate = new Date(Date.UTC(+year, +month - 1, 1)).toISOString();

    this.isLoading.set(true);
    this.errorMessage = '';

    this.monthlyEntryService.getAll(TEMP_USER_ID, referenceDate)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          // Try to sort by Description to keep predictable order
          this.entries = data.sort((a, b) => a.description.localeCompare(b.description));
        },
        error: (err: ApiError) => {
          this.errorMessage = err.message || 'Erro ao carregar os lançamentos locais.';
        }
      });
  }

  // ---------- Actions ----------

  generateMonth(): void {
    const monthValue = this.monthControl.value;
    if (!monthValue) return;

    const [year, month] = monthValue.split('-');
    const referenceDate = new Date(Date.UTC(+year, +month - 1, 1)).toISOString();

    const request: GenerateMonthlyEntriesRequest = {
      userId: TEMP_USER_ID,
      referenceMonth: referenceDate
    };

    this.isGenerating.set(true);
    this.errorMessage = '';

    this.monthlyEntryService.generate(request)
      .pipe(finalize(() => this.isGenerating.set(false)))
      .subscribe({
        next: (res) => {
          this.showSuccess(`Mês gerado! (Novos: ${res.generatedIncomeEntries} receitas, ${res.generatedExpenseEntries} despesas. ${res.skippedExistingEntries} ignorados.)`);
          this.loadEntries(); // Reload table
        },
        error: (err: ApiError) => {
          this.errorMessage = err.message || 'Erro ao gerar lançamentos do mês.';
        }
      });
  }

  // ---------- Payment Modal Actions ----------

  canPay(entry: MonthlyEntry): boolean {
    // Only allow paying entries that are Pending, Overdue, or PartiallyPaid.
    // Also, we probably only "pay" expenses or installments, but "receive" incomes.
    // The abstraction fits all: registering a payment transaction settles the entry.
    return ['Pending', 'Overdue', 'PartiallyPaid'].includes(entry.status);
  }

  openPaymentModal(entry: MonthlyEntry): void {
    this.selectedEntryForPayment = entry;
    this.paymentError = '';
    
    const today = new Date().toISOString().substring(0, 10);
    this.paymentForm.patchValue({
      amount: entry.amountExpected,
      date: today,
      type: 'Pix' // Default
    });

    this.isPaymentModalOpen = true;
  }

  closePaymentModal(): void {
    this.isPaymentModalOpen = false;
    this.selectedEntryForPayment = null;
    this.paymentError = '';
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || !this.selectedEntryForPayment) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isPaying = true;
    this.paymentError = '';

    const { amount, type, date } = this.paymentForm.value;

    const request: CreatePaymentRequest = {
      monthlyEntryId: this.selectedEntryForPayment.id,
      amount: +amount,
      type: type,
      date: new Date(date).toISOString()
    };

    this.paymentService.create(request)
      .pipe(finalize(() => this.isPaying = false))
      .subscribe({
        next: () => {
          this.closePaymentModal();
          this.showSuccess('Pagamento registrado com sucesso!');
          this.loadEntries(); // Reloads list to fetch the new Status (e.g., Paid)
        },
        error: (err: ApiError) => {
          this.paymentError = err.message || 'Erro ao registrar pagamento.';
        }
      });
  }

  get amountError(): string {
    const ctrl = this.paymentForm.get('amount');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O valor é obrigatório.';
      if (ctrl.errors['min']) return 'O valor deve ser maior que zero.';
    }
    return '';
  }

  // ---------- UI Helpers (Visual Inference) ----------

  getEntryType(entry: MonthlyEntry): { label: string; badge: 'success' | 'danger' | 'warning' } {
    if (entry.incomeSourceId) {
      return { label: 'Receita', badge: 'success' };
    }
    if (entry.installmentPlanId) {
      return { label: 'Parcela', badge: 'warning' };
    }
    if (entry.expenseSourceId) {
      return { label: 'Despesa', badge: 'danger' };
    }
    return { label: 'Lançamento', badge: 'warning' }; // Fallback
  }

  getEntryStatus(status: EntryStatus): { label: string; badge: 'success' | 'danger' | 'warning' | 'primary' | 'neutral' } {
    switch (status) {
      case 'Pending':
        return { label: 'Pendente', badge: 'warning' };
      case 'Paid':
        return { label: 'Pago', badge: 'success' };
      case 'Overdue':
        return { label: 'Atrasado', badge: 'danger' };
      case 'PartiallyPaid':
        return { label: 'Pago Parc.', badge: 'primary' };
      case 'Cancelled':
        return { label: 'Cancelado', badge: 'neutral' };
      default:
        return { label: status, badge: 'neutral' };
    }
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }
}

