export type CategoryType = 'Income' | 'Expense';

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  isActive: boolean;
  createdAt: string; // ISO date string
}

export interface CreateCategoryRequest {
  userId: string;
  name: string;
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name: string;
  type: CategoryType;
  isActive: boolean;
}
