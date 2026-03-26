import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';

import { ExpenseSourceService } from '../../core/services/expense-source.service';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseSource, CreateExpenseSourceRequest, UpdateExpenseSourceRequest, ExpenseKind } from '../../core/models/expense-source.model';
import { Category } from '../../core/models/category.model';
import { ApiError } from '../../core/api/api-error';
import { TEMP_USER_ID } from '../../core/config/auth.config';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { TableComponent } from '../../shared/ui/table/table.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ModalComponent } from '../../shared/ui/modal/modal.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SelectComponent } from '../../shared/ui/select/select.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/ui/loading-state/loading-state.component';

export type FilterTab = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-expense-sources',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    ButtonComponent,
    CardComponent,
    TableComponent,
    BadgeComponent,
    ModalComponent,
    InputComponent,
    SelectComponent,
    EmptyStateComponent,
    LoadingStateComponent,
  ],
  templateUrl: './expense-sources.component.html',
  styleUrl: './expense-sources.component.scss',
})
export class ExpenseSourcesComponent implements OnInit {
  private readonly expenseSourceService = inject(ExpenseSourceService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  // State
  expenseSources: ExpenseSource[] = [];
  categories: Category[] = [];
  isLoading = signal<boolean>(false);
  errorMessage = '';
  activeFilter: FilterTab = 'all';
  successMessage = '';

  // Modal state
  isFormModalOpen = false;
  isConfirmModalOpen = false;
  editingSource: ExpenseSource | null = null;
  deactivatingSource: ExpenseSource | null = null;
  isSaving = false;
  isDeactivating = false;
  formError = '';

  // Form
  sourceForm!: FormGroup;

  // Select options
  categoryOptions: { label: string; value: string }[] = [];
  typeOptions: { label: string; value: ExpenseKind }[] = [
    { label: 'Fixa', value: 'Fixed' },
    { label: 'Variável', value: 'Variable' },
    { label: 'Parcelada', value: 'Installment' },
  ];

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
      sources: this.expenseSourceService.listByUser(TEMP_USER_ID),
      categories: this.categoryService.listByUser(TEMP_USER_ID),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ sources, categories }) => {
          this.expenseSources = sources.sort((a, b) => a.name.localeCompare(b.name));

          // Filter: only active Expense-type categories, sorted by name
          this.categories = categories
            .filter(c => c.isActive && c.type === 'Expense')
            .sort((a, b) => a.name.localeCompare(b.name));

          this.categoryOptions = this.categories.map(c => ({
            label: c.name,
            value: c.id,
          }));
        },
        error: (err: ApiError) => {
          this.errorMessage = err.message;
        },
      });
  }

  // ---------- Filtering ----------

  get filteredSources(): ExpenseSource[] {
    switch (this.activeFilter) {
      case 'active':
        return this.expenseSources.filter(s => s.isActive);
      case 'inactive':
        return this.expenseSources.filter(s => !s.isActive);
      default:
        return this.expenseSources;
    }
  }

  get activeCount(): number {
    return this.expenseSources.filter(s => s.isActive).length;
  }

  get inactiveCount(): number {
    return this.expenseSources.filter(s => !s.isActive).length;
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter = filter;
  }

  // ---------- Form modal ----------

  private initForm(): void {
    this.sourceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      categoryId: ['', [Validators.required]],
      type: ['', [Validators.required]],
      defaultAmount: [null, [Validators.required, Validators.min(0.01)]],
      isActive: [true],
    });
  }

  openCreateModal(): void {
    this.editingSource = null;
    this.formError = '';
    this.sourceForm.reset({
      name: '',
      categoryId: '',
      type: '',
      defaultAmount: null,
      isActive: true,
    });
    this.isFormModalOpen = true;
  }

  openEditModal(source: ExpenseSource): void {
    this.editingSource = source;
    this.formError = '';
    this.sourceForm.patchValue({
      name: source.name,
      categoryId: source.categoryId,
      type: source.type,
      defaultAmount: source.defaultAmount,
      isActive: source.isActive,
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingSource = null;
    this.formError = '';
  }

  get isEditing(): boolean {
    return this.editingSource !== null;
  }

  get formTitle(): string {
    return this.isEditing ? 'Editar fonte de despesa' : 'Nova fonte de despesa';
  }

  saveSource(): void {
    if (this.sourceForm.invalid) {
      this.sourceForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const { name, categoryId, type, defaultAmount, isActive } = this.sourceForm.value;
    const trimmedName = (name as string).trim();

    if (this.isEditing) {
      const request: UpdateExpenseSourceRequest = {
        name: trimmedName,
        categoryId,
        type,
        defaultAmount: +defaultAmount,
        isActive,
      };

      this.expenseSourceService.update(this.editingSource!.id, request)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            const wasInactive = !this.editingSource!.isActive;
            const isReactivation = wasInactive && isActive;

            this.closeFormModal();

            this.showSuccess(
              isReactivation
                ? 'Fonte de despesa reativada com sucesso.'
                : 'Fonte de despesa atualizada com sucesso.'
            );

            if (isReactivation && this.activeFilter === 'inactive') {
              this.activeFilter = 'active';
            }

            this.loadData();
          },
          error: (err: ApiError) => {
            this.formError = this.getFormErrorMessage(err);
          },
        });
    } else {
      const request: CreateExpenseSourceRequest = {
        userId: TEMP_USER_ID,
        name: trimmedName,
        categoryId,
        type,
        defaultAmount: +defaultAmount,
      };

      this.expenseSourceService.create(request)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            this.closeFormModal();
            this.showSuccess('Fonte de despesa criada com sucesso.');
            this.loadData();
          },
          error: (err: ApiError) => {
            this.formError = this.getFormErrorMessage(err);
          },
        });
    }
  }

  // ---------- Deactivation ----------

  openDeactivateConfirm(source: ExpenseSource): void {
    this.deactivatingSource = source;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.deactivatingSource = null;
  }

  confirmDeactivate(): void {
    if (!this.deactivatingSource) return;

    this.isDeactivating = true;

    this.expenseSourceService.deactivate(this.deactivatingSource.id)
      .pipe(finalize(() => this.isDeactivating = false))
      .subscribe({
        next: () => {
          this.closeConfirmModal();
          this.showSuccess('Fonte de despesa inativada com sucesso.');
          this.loadData();
        },
        error: (err: ApiError) => {
          this.closeConfirmModal();
          this.errorMessage = err.message;
        },
      });
  }

  // ---------- Helpers ----------

  getCategoryName(categoryId: string | null | undefined): string {
    if (!categoryId) return '—';
    const cat = this.categories.find(c => c.id === categoryId);
    return cat ? cat.name : '—';
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'neutral' {
    return isActive ? 'success' : 'neutral';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativa' : 'Inativa';
  }

  getTypeBadgeVariant(type: ExpenseKind): 'primary' | 'warning' | 'danger' {
    switch (type) {
      case 'Fixed': return 'primary';
      case 'Variable': return 'warning';
      case 'Installment': return 'danger';
    }
  }

  getTypeLabel(type: ExpenseKind): string {
    switch (type) {
      case 'Fixed': return 'Fixa';
      case 'Variable': return 'Variável';
      case 'Installment': return 'Parcelada';
    }
  }

  get nameError(): string {
    const ctrl = this.sourceForm.get('name');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O nome é obrigatório.';
      if (ctrl.errors['minlength']) return 'O nome deve ter pelo menos 2 caracteres.';
    }
    return '';
  }

  get categoryIdError(): string {
    const ctrl = this.sourceForm.get('categoryId');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'A categoria é obrigatória.';
    }
    return '';
  }

  get typeError(): string {
    const ctrl = this.sourceForm.get('type');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O tipo de despesa é obrigatório.';
    }
    return '';
  }

  get defaultAmountError(): string {
    const ctrl = this.sourceForm.get('defaultAmount');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O valor padrão é obrigatório.';
      if (ctrl.errors['min']) return 'O valor deve ser maior que zero.';
    }
    return '';
  }

  private getFormErrorMessage(err: ApiError): string {
    if (err.statusCode === 409) return 'Já existe uma fonte de despesa com esse nome.';
    if (err.statusCode === 400) return err.message || 'Dados inválidos. Verifique os campos.';
    if (err.statusCode === 404) return 'Fonte de despesa não encontrada.';
    return err.message || 'Erro inesperado. Tente novamente.';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 4000);
  }
}


