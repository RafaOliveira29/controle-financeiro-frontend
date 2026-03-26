import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CategoryService } from '../../core/services/category.service';
import { Category, CategoryType, CreateCategoryRequest, UpdateCategoryRequest } from '../../core/models/category.model';
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
import { finalize } from 'rxjs';

export type FilterTab = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly fb = inject(FormBuilder);

  // State
  categories: Category[] = [];
  isLoading = signal<boolean>(false);
  // isLoading = true;
  errorMessage = '';
  activeFilter: FilterTab = 'all';
  successMessage = '';

  // Modal state
  isFormModalOpen = false;
  isConfirmModalOpen = false;
  editingCategory: Category | null = null;
  deactivatingCategory: Category | null = null;
  isSaving = false;
  isDeactivating = false;
  formError = '';

  // Form
  categoryForm!: FormGroup;

  // Select options
  typeOptions = [
    { label: 'Receita', value: 'Income' },
    { label: 'Despesa', value: 'Expense' },
  ];

  // ---------- Lifecycle ----------

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  // ---------- Data ----------

  loadCategories(): void {
    this.isLoading.set(true);
    this.errorMessage = '';

    this.categoryService.listByUser(TEMP_USER_ID)
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: (categories) => {
        this.categories = categories.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err: ApiError) => {
        this.errorMessage = err.message;
      },
    });
  }

  // ---------- Filtering ----------

  get filteredCategories(): Category[] {
    switch (this.activeFilter) {
      case 'active':
        return this.categories.filter(c => c.isActive);
      case 'inactive':
        return this.categories.filter(c => !c.isActive);
      default:
        return this.categories;
    }
  }

  get activeCount(): number {
    return this.categories.filter(c => c.isActive).length;
  }

  get inactiveCount(): number {
    return this.categories.filter(c => !c.isActive).length;
  }

  setFilter(filter: FilterTab): void {
    this.activeFilter = filter;
  }

  // ---------- Form modal ----------

  private initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      type: ['Expense', [Validators.required]],
      isActive: [true],
    });
  }

  openCreateModal(): void {
    this.editingCategory = null;
    this.formError = '';
    this.categoryForm.reset({ name: '', type: 'Expense', isActive: true });
    this.isFormModalOpen = true;
  }

  openEditModal(category: Category): void {
    this.editingCategory = category;
    this.formError = '';
    this.categoryForm.patchValue({
      name: category.name,
      type: category.type,
      isActive: category.isActive,
    });
    this.isFormModalOpen = true;
  }

  closeFormModal(): void {
    this.isFormModalOpen = false;
    this.editingCategory = null;
    this.formError = '';
  }

  get isEditing(): boolean {
    return this.editingCategory !== null;
  }

  get formTitle(): string {
    return this.isEditing ? 'Editar categoria' : 'Nova categoria';
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.formError = '';

    const { name, type, isActive } = this.categoryForm.value;
    const trimmedName = (name as string).trim();

    if (this.isEditing) {
      const request: UpdateCategoryRequest = {
        name: trimmedName,
        type,
        isActive,
      };

      this.categoryService.update(this.editingCategory!.id, request)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          const wasInactive = !this.editingCategory!.isActive;
          const isReactivation = wasInactive && isActive;

          this.closeFormModal();

          this.showSuccess(
            isReactivation
              ? 'Categoria reativada com sucesso.'
              : 'Categoria atualizada com sucesso.'
          );

          // If reactivating while viewing inactive list, switch filter so the
          // user can see the category in the active list instead of it vanishing.
          if (isReactivation && this.activeFilter === 'inactive') {
            this.activeFilter = 'active';
          }

          this.loadCategories();
        },
        error: (err: ApiError) => {
          this.formError = this.getFormErrorMessage(err);
        },
      });
    } else {
      const request: CreateCategoryRequest = {
        userId: TEMP_USER_ID,
        name: trimmedName,
        type,
      };

      this.categoryService.create(request)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: () => {
          this.closeFormModal();
          this.showSuccess('Categoria criada com sucesso.');
          this.loadCategories();
        },
        error: (err: ApiError) => {
          this.formError = this.getFormErrorMessage(err);
        },
      });
    }
  }

  // ---------- Deactivation ----------

  openDeactivateConfirm(category: Category): void {
    this.deactivatingCategory = category;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.deactivatingCategory = null;
  }

  confirmDeactivate(): void {
    if (!this.deactivatingCategory) return;

    this.isDeactivating = true;

    this.categoryService.deactivate(this.deactivatingCategory.id)
    .pipe(finalize(() => this.isDeactivating = false))
    .subscribe({
      next: () => {
        this.closeConfirmModal();
        this.showSuccess('Categoria inativada com sucesso.');
        this.loadCategories();
      },
      error: (err: ApiError) => {
        this.closeConfirmModal();
        this.errorMessage = err.message;
      },
    });
  }

  // ---------- Helpers ----------

  getTypeBadgeVariant(type: CategoryType): 'primary' | 'warning' {
    return type === 'Income' ? 'primary' : 'warning';
  }

  getTypeLabel(type: CategoryType): string {
    return type === 'Income' ? 'Receita' : 'Despesa';
  }

  getStatusBadgeVariant(isActive: boolean): 'success' | 'neutral' {
    return isActive ? 'success' : 'neutral';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Ativa' : 'Inativa';
  }

  get nameError(): string {
    const ctrl = this.categoryForm.get('name');
    if (ctrl?.touched && ctrl?.errors) {
      if (ctrl.errors['required']) return 'O nome é obrigatório.';
      if (ctrl.errors['minlength']) return 'O nome deve ter pelo menos 2 caracteres.';
    }
    return '';
  }

  private getFormErrorMessage(err: ApiError): string {
    if (err.statusCode === 409) return 'Já existe uma categoria com esse nome e tipo.';
    if (err.statusCode === 400) return err.message || 'Dados inválidos. Verifique os campos.';
    if (err.statusCode === 404) return 'Categoria não encontrada.';
    return err.message || 'Erro inesperado. Tente novamente.';
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 4000);
  }
}
