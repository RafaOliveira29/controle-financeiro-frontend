export interface IncomeSource {
  id: string;
  userId: string;
  categoryId: string;
  name: string;
  defaultAmount: number;
  competenceDay: number;
  isActive: boolean;
  createdAt: string; // ISO date string
}

export interface CreateIncomeSourceRequest {
  userId: string;
  categoryId: string;
  name: string;
  defaultAmount: number;
  competenceDay: number;
}

export interface UpdateIncomeSourceRequest {
  categoryId: string;
  name: string;
  defaultAmount: number;
  competenceDay: number;
  isActive: boolean;
}
