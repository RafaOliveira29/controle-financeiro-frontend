export interface PaymentMock {
  id: string;
  description: string;
  category: string;
  dueDate: Date;
  amount: number;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
}

export interface CategoryExpenseMock {
  name: string;
  amount: number;
  percentage: number;
  colorClass: string;
}

export interface DashboardSummaryMock {
  expectedIncome: number;
  expectedExpense: number;
  expectedBalance: number;
  currentBalance: number;
  totalPaid: number;
  totalPending: number;
  entriesCount: number;
  installmentsCount: number;
}

export const DASHBOARD_MOCK_DATA = {
  summary: {
    expectedIncome: 4650.00,
    expectedExpense: 2843.94,
    expectedBalance: 1806.06,
    currentBalance: 1320.50,
    totalPaid: 1980.40,
    totalPending: 863.54,
    entriesCount: 42,
    installmentsCount: 4
  } as DashboardSummaryMock,

  upcomingPayments: [
    { id: '1', description: 'Internet', category: 'Moradia', dueDate: new Date(2026, 2, 10), amount: 120.00, status: 'PAGO' },
    { id: '2', description: 'Academia', category: 'Saúde', dueDate: new Date(2026, 2, 15), amount: 110.00, status: 'PAGO' },
    { id: '3', description: 'Plano de Saúde', category: 'Saúde', dueDate: new Date(2026, 2, 20), amount: 450.00, status: 'PENDENTE' },
    { id: '4', description: 'Parcela iPhone 15 (3/10)', category: 'Eletrônicos', dueDate: new Date(2026, 2, 25), amount: 550.00, status: 'PENDENTE' },
    { id: '5', description: 'Energia Elétrica', category: 'Moradia', dueDate: new Date(2026, 2, 8), amount: 185.40, status: 'ATRASADO' }
  ] as PaymentMock[],

  expensesByCategory: [
    { name: 'Moradia', amount: 1250.00, percentage: 44, colorClass: 'bg-indigo-500' },
    { name: 'Saúde', amount: 560.00, percentage: 20, colorClass: 'bg-emerald-500' },
    { name: 'Eletrônicos', amount: 550.00, percentage: 19, colorClass: 'bg-blue-500' },
    { name: 'Assinaturas', amount: 150.00, percentage: 5, colorClass: 'bg-purple-500' },
    { name: 'Transporte', amount: 333.94, percentage: 12, colorClass: 'bg-amber-500' }
  ] as CategoryExpenseMock[]
};
