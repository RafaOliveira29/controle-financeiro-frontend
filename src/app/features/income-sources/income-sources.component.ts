import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';

import { IncomeSourceService } from '../../core/services/income-source.service';
import { CategoryService } from '../../core/services/category.service';
import { IncomeSource, CreateIncomeSourceRequest, UpdateIncomeSourceRequest } from '../../core/models/income-source.model';
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
  selector: 'app-income-sources',
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
  templateUrl: './income-sources.component.html',
  styleUrl: './income-sources.component.scss',
})
export class IncomeSourcesComponent implements OnInit {
  private readonly incomeSourceService = inject(IncomeSourceService);
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  // State
  incomeSources: IncomeSource[] = [];
  categories: Category[] = [];
  isLoading = signal<boolean>(false);
  errorMessage = '';
  activeFilter: FilterTab = 'all';
  successMessage = '';

  // Modal state
  isFormModalOpen = false;
  isConfirmModalOpen = false;
  editingSource: IncomeSource | null = null;
  deactivatingSource: IncomeSource | null = null;
  isSaving = false;
  isDeactivating = false;
  formError = '';

  // Form
  sourceForm!: FormGroup;

  // Category select options (built from loaded categories)
  categoryOptions: { label: string; value: string }[] = [];

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
      sources: this.incomeSourceService.listByUser(TEMP_USER_ID),
      categories: this.categoryService.listByUser(TEMP_USER_ID),
    })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: ({ sources, categories }) => {
          this.incomeSources = sources.sort((a, b) => a.name.localeCompare(b.name));

          // Filter: only active Income-type categories, sorted by name
          this.categories = categories
            .filter(c => c.isActive && c.type === 'Income')
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

  get filteredSources(): IncomeSource[] {
    switch (this.activeFilter) {
      case 'active':
        return this.incomeSources.filter(s => s.isActive);
      case 'inactive':
        return this.incomeSources.filter(s => !s.isActive);
      default:
        return this.incomeSources;
    }
  }

  get activeCount(): number {
    return this.incomeSources.filter(s => s.isActive).length;
  }

  get inactiveCount(): number {
    return this.incomeSources.filter(s => !s.isActive).length;
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter = filter;
  }

  // ---------- Form modal ----------

  private initForm(): void {
    this.sourceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      categoryId: ['', [Validators.required]],
      defaultAmount: [null, [Validators.required, Validators.min(0.01)]],
      competenceDay: [null, [Validators.required, Validators.min(1), Validators.max(31)]],
      isActive: [true],
    });
  }

  openCreateModal(): void {
    this.editingSource = null;
    this.formError = '';
    this.sourceForm.reset({
      name: '',
      categoryId: '',
      defaultAmount: null,
      competenceDay: null,
      isActive: true,
    });
    this.isFormModalOpen = true;
  }

  openEditModal(source: IncomeSource): void {
    this.editingSource = source;
    this.formError = '';
    this.sourceForm.patchValue({
      name: source.name,
      categoryId: source.categoryId,
      defaultAmount: source.defaultAmount,
      competenceDay: source.competenceDay,
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
    return this.isEditing ? 'Editar fonte de receita' : 'Nova fonte de receita';
  }

  saveSource(): void {
    if (this.sourceForm.invalid) {
      this.sourceForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const { name, categoryId, defaultAmount, competenceDay, isActive } = this.sourceForm.value;
    const trimmedName = (name as string).trim();

    if (this.isEditing) {
      const request: UpdateIncomeSourceRequest = {
        name: trimmedName,
        categoryId,
        defaultAmount: +defaultAmount,
        competenceDay: +competenceDay,
        isActive,
      };

      this.incomeSourceService.update(this.editingSource!.id, request)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            const wasInactive = !this.editingSource!.isActive;
            const isReactivation = wasInactive && isActive;

            this.closeFormModal();

            this.showSuccess(
              isReactivation
                ? 'Fonte de receita reativada com sucesso.'
                : 'Fonte de receita atualizada com sucesso.'
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
      const request: CreateIncomeSourceRequest = {
        userId: TEMP_USER_ID,
        name: trimmedName,
        categoryId,
        defaultAmount: +defaultAmount,
        competenceDay: +competenceDay,
      };

      this.incomeSourceService.create(request)
        .pipe(finalize(() => this.isSaving = false))
        .subscribe({
          next: () => {
            this.closeFormModal();
            this.showSuccess('Fonte de receita criada com sucesso.');
            this.loadData();
          },
          error: (err: ApiError) => {
            this.formError = this.getFormErrorMessage(err);
          },
        });
    }
  }

  // ---------- Deactivation ----------

  openDeactivateConfirm(source: IncomeSource): void {
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

    this.incomeSourceService.deactivate(this.deactivatingSource.id)
      .pipe(finalize(() => this.isDeactivating = false))
      .subscribe({
        next: () => {
          this.closeConfirmModal();
          this.showSuccess('Fonte de receita inativada com sucesso.');
          this.loadData();
        },
        error: (err: ApiError) => {
          this.closeConfirmModal();
          this.errorMessage = err.message;
        },
      });
  }

  // ---------- Helpers ----------

  getCategoryName(categoryId: string): string {
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

  get defaultAmountError(): string {
    const ctrl = this.sourceForm.get('defaultAmount');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O valor padrão é obrigatório.';
      if (ctrl.errors['min']) return 'O valor deve ser maior que zero.';
    }
    return '';
  }

  get competenceDayError(): string {
    const ctrl = this.sourceForm.get('competenceDay');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O dia de competência é obrigatório.';
      if (ctrl.errors['min'] || ctrl.errors['max']) return 'Informe um dia entre 1 e 31.';
    }
    return '';
  }

  private getFormErrorMessage(err: ApiError): string {
    if (err.statusCode === 409) return 'Já existe uma fonte de receita com esse nome.';
    if (err.statusCode === 400) return err.message || 'Dados inválidos. Verifique os campos.';
    if (err.statusCode === 404) return 'Fonte de receita não encontrada.';
    return err.message || 'Erro inesperado. Tente novamente.';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 4000);
  }
}
