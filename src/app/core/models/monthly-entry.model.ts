export type EntryStatus = 'Pending' | 'Paid' | 'Overdue' | 'PartiallyPaid' | 'Cancelled';

export interface MonthlyEntry {
  id: string;
  userId: string;
  referenceMonth: string; // ISO date string
  incomeSourceId: string | null;
  expenseSourceId: string | null;
  installmentPlanId: string | null;
  currentInstallment: number | null;
  description: string;
  amountExpected: number;
  status: EntryStatus;
}

export interface GenerateMonthlyEntriesRequest {
  userId: string;
  referenceMonth: string; // ISO date string, e.g., "2026-08-01T00:00:00Z"
}

export interface GenerateMonthlyEntriesResponse {
  userId: string;
  referenceMonth: string;
  generatedIncomeEntries: number;
  generatedExpenseEntries: number;
  skippedExistingEntries: number;
  totalGenerated: number;
}
