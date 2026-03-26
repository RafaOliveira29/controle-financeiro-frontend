import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  ExpenseSource,
  CreateExpenseSourceRequest,
  UpdateExpenseSourceRequest,
} from '../models/expense-source.model';

@Injectable({ providedIn: 'root' })
export class ExpenseSourceService extends ApiBaseService {
  protected readonly basePath = '/expensesources';

  /** Lists all expense sources for a given user. */
  listByUser(userId: string): Observable<ExpenseSource[]> {
    const params = new HttpParams().set('userId', userId);
    return this.get<ExpenseSource[]>('', params);
  }

  /** Gets a single expense source by its ID. */
  getById(id: string): Observable<ExpenseSource> {
    return this.get<ExpenseSource>(`/${id}`);
  }

  /** Creates a new expense source. */
  create(request: CreateExpenseSourceRequest): Observable<ExpenseSource> {
    return this.post<ExpenseSource>('', request);
  }

  /** Updates an existing expense source. */
  update(id: string, request: UpdateExpenseSourceRequest): Observable<ExpenseSource> {
    return this.put<ExpenseSource>(`/${id}`, request);
  }

  /** Deactivates an expense source (soft-delete). PATCH without body. */
  deactivate(id: string): Observable<void> {
    return this.patch<void>(`/${id}/deactivate`);
  }
}

