import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { Payment, CreatePaymentRequest } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService extends ApiBaseService {
  protected readonly basePath = '/payments';

  /** Registers a new payment for a monthly entry. */
  create(request: CreatePaymentRequest): Observable<Payment> {
    return this.post<Payment>('', request);
  }
}
