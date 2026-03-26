export type PaymentMethod =
  | 'Pix'
  | 'CreditCard'
  | 'DebitCard'
  | 'Cash'
  | 'BankSlip'
  | 'Other';

export interface Payment {
  id: string;
  monthlyEntryId: string;
  amount: number;
  date: string; // ISO date string
  type: PaymentMethod;
}

export interface CreatePaymentRequest {
  monthlyEntryId: string;
  amount: number;
  date: string; // ISO date string
  type: PaymentMethod;
}
