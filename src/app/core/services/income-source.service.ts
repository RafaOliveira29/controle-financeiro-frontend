import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  IncomeSource,
  CreateIncomeSourceRequest,
  UpdateIncomeSourceRequest,
} from '../models/income-source.model';

/**
 * Service responsible for all IncomeSource-related API operations.
 *
 * Endpoints consumed (matching .NET backend):
 *   GET    /api/incomesources?userId={guid}            → list all for user
 *   GET    /api/incomesources/{id}                     → get by id
 *   POST   /api/incomesources                          → create
 *   PUT    /api/incomesources/{id}                     → update
 *   PATCH  /api/incomesources/{id}/deactivate          → deactivate (soft-delete)
 */
@Injectable({ providedIn: 'root' })
export class IncomeSourceService extends ApiBaseService {
  protected readonly basePath = '/incomesources';

  /**
   * Lists all income sources for a given user.
   * Backend uses query param: GET /api/incomesources?userId={guid}
   */
  listByUser(userId: string): Observable<IncomeSource[]> {
    const params = new HttpParams().set('userId', userId);
    return this.get<IncomeSource[]>('', params);
  }

  /** Gets a single income source by its ID. */
  getById(id: string): Observable<IncomeSource> {
    return this.get<IncomeSource>(`/${id}`);
  }

  /** Creates a new income source. */
  create(request: CreateIncomeSourceRequest): Observable<IncomeSource> {
    return this.post<IncomeSource>('', request);
  }

  /** Updates an existing income source. */
  update(id: string, request: UpdateIncomeSourceRequest): Observable<IncomeSource> {
    return this.put<IncomeSource>(`/${id}`, request);
  }

  /** Deactivates an income source (soft-delete). PATCH without body. */
  deactivate(id: string): Observable<void> {
    return this.patch<void>(`/${id}/deactivate`);
  }
}
