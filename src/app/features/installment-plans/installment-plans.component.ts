import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';

import { InstallmentPlanService } from '../../core/services/installment-plan.service';
import { ExpenseSourceService } from '../../core/services/expense-source.service';
import { InstallmentPlan, CreateInstallmentPlanRequest } from '../../core/models/installment-plan.model';
import { ExpenseSource } from '../../core/models/expense-source.model';
import { ApiError } from '../../core/api/api-error';
import { TEMP_USER_ID } from '../../core/config/auth.config';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { TableComponent } from '../../shared/ui/table/table.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-installment-plans',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    ButtonComponent,
    CardComponent,
    TableComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './installment-plans.component.html',
  styleUrl: './installment-plans.component.scss',
})
export class InstallmentPlansComponent implements OnInit {
  private readonly installmentPlanService = inject(InstallmentPlanService);
  private readonly expenseSourceService = inject(ExpenseSourceService);
  private readonly fb = inject(FormBuilder);

  // State
  installmentPlans: InstallmentPlan[] = [];
  expenseSources: ExpenseSource[] = [];
  isLoading = signal<boolean>(false);
  errorMessage = '';
  successMessage = '';

  // Modal state
  isFormModalOpen = false;
  isSaving = false;
  formError = '';

  // Form
  planForm!: FormGroup;

  // Select options
  expenseSourceOptions: { label: string; value: string }[] = [];

  // ---------- Lifecycle ----------

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  // ---------- Data ----------

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage = '';

    forkJoin({
      plans: this.installmentPlanService.listByUser(TEMP_USER_ID),
      sources: this.expenseSourceService.listByUser(TEMP_USER_ID),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ plans, sources }) => {
          this.installmentPlans = plans.sort((a, b) => 
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );

          // Filter: only ExpenseSources of type 'Installment', sorted by name
          this.expenseSources = sources
            .filter(s => s.type === 'Installment')
            .sort((a, b) => a.name.localeCompare(b.name));

          this.expenseSourceOptions = this.expenseSources.map(s => ({
            label: s.name,
            value: s.id,
          }));
        },
        error: (err: ApiError) => {
          this.errorMessage = err.message;
        },
      });
  }

  // ---------- Form modal ----------

  private initForm(): void {
    const today = new Date().toISOString().substring(0, 10); // YYYY-MM-DD
    this.planForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(2)]],
      expenseSourceId: ['', [Validators.required]],
      totalAmount: [null, [Validators.required, Validators.min(0.01)]],
      totalInstallments: [null, [Validators.required, Validators.min(2)]],
      startDate: [today, [Validators.required]],
    });
  }

  openCreateModal(): void {
    this.formError = '';
    const today = new Date().toISOString().substring(0, 10);
    this.planForm.reset({
      description: '',
      expenseSourceId: '',
      totalAmount: null,
      totalInstallments: null,
      startDate: today,
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.formError = '';
  }

  savePlan(): void {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const { description, expenseSourceId, totalAmount, totalInstallments, startDate } = this.planForm.value;
    const request: CreateInstallmentPlanRequest = {
      userId: TEMP_USER_ID,
      description: (description as string).trim(),
      expenseSourceId,
      totalAmount: +totalAmount,
      totalInstallments: +totalInstallments,
      // Ensure date is properly formatted as ISO string.
      // If the input gives us YYYY-MM-DD, convert it to an ISO string
      startDate: new Date(startDate).toISOString(), 
    };

    this.installmentPlanService.create(request)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.closeFormModal();
          this.showSuccess('Parcelamento criado com sucesso.');
          this.loadData();
        },
        error: (err: ApiError) => {
          this.formError = this.getFormErrorMessage(err);
        },
      });
  }

  // ---------- Helpers ----------

  getExpenseSourceName(sourceId: string): string {
    if (!sourceId) return '—';
    const source = this.expenseSources.find(s => s.id === sourceId);
    return source ? source.name : '—';
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  get descriptionError(): string {
    const ctrl = this.planForm.get('description');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'A descrição é obrigatória.';
      if (ctrl.errors['minlength']) return 'A descrição deve ter pelo menos 2 caracteres.';
    }
    return '';
  }

  get expenseSourceIdError(): string {
    const ctrl = this.planForm.get('expenseSourceId');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'A fonte de despesa é obrigatória.';
    }
    return '';
  }

  get totalAmountError(): string {
    const ctrl = this.planForm.get('totalAmount');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O valor total é obrigatório.';
      if (ctrl.errors['min']) return 'O valor deve ser maior que zero.';
    }
    return '';
  }

  get totalInstallmentsError(): string {
    const ctrl = this.planForm.get('totalInstallments');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'A quantidade de parcelas é obrigatória.';
      if (ctrl.errors['min']) return 'O parcelamento deve ter pelo menos 2 parcelas.';
    }
    return '';
  }

  get startDateError(): string {
    const ctrl = this.planForm.get('startDate');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'A data de início é obrigatória.';
    }
    return '';
  }

  private getFormErrorMessage(err: ApiError): string {
    if (err.statusCode === 400) return err.message || 'Dados inválidos. Verifique os campos.';
    return err.message || 'Erro inesperado. Tente novamente.';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 4000);
  }
}


