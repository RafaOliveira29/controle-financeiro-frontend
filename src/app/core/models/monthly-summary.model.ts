import { CategoryType } from './category.model';
import { PaymentMethod } from './payment.model';

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  entryType: CategoryType;
  expectedAmount: number;
  paidAmount: number;
}

export interface ExpenseKindBreakdown {
  fixedExpected: number;
  fixedPaid: number;
  variableExpected: number;
  variablePaid: number;
  installmentExpected: number;
  installmentPaid: number;
}

export interface PaymentMethodBreakdown {
  paymentMethod: PaymentMethod;
  totalAmount: number;
}

export interface MonthlySummary {
  userId: string;
  referenceMonth: string; // ISO date string

  totalIncomeExpected: number;
  totalExpenseExpected: number;
  totalIncomePaid: number;
  totalExpensePaid: number;

  expectedBalance: number;
  actualBalance: number;

  pendingCount: number;
  paidCount: number;
  partiallyPaidCount: number;
  cancelledCount: number;

  categoryBreakdown: CategoryBreakdown[];
  expenseKindBreakdown: ExpenseKindBreakdown;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
}
