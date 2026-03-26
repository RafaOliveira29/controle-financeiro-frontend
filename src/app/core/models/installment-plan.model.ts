export interface InstallmentPlan {
  id: string;
  expenseSourceId: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  installmentAmount: number;
  startDate: string; // ISO date string
}

export interface CreateInstallmentPlanRequest {
  userId: string;
  expenseSourceId: string;
  description: string;
  totalAmount: number;
  totalInstallments: number;
  startDate: string; // ISO date string
}
