export type ExpenseKind = 'Fixed' | 'Variable' | 'Installment';

export interface ExpenseSource {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  type: ExpenseKind;
  defaultAmount: number;
  isActive: boolean;
  createdAt: string; // ISO date string
}

export interface CreateExpenseSourceRequest {
  userId: string;
  categoryId: string;
  name: string;
  type: ExpenseKind;
  defaultAmount: number;
}

export interface UpdateExpenseSourceRequest {
  name: string;
  categoryId: string;
  type: ExpenseKind;
  defaultAmount: number;
  isActive: boolean;
}
