import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  InstallmentPlan,
  CreateInstallmentPlanRequest,
} from '../models/installment-plan.model';

@Injectable({ providedIn: 'root' })
export class InstallmentPlanService extends ApiBaseService {
  protected readonly basePath = '/installmentplans';

  /** Lists all installment plans for a given user. */
  listByUser(userId: string): Observable<InstallmentPlan[]> {
    const params = new HttpParams().set('userId', userId);
    return this.get<InstallmentPlan[]>('', params);
  }

  /** Gets a single installment plan by its ID. */
  getById(id: string): Observable<InstallmentPlan> {
    return this.get<InstallmentPlan>(`/${id}`);
  }

  /** Creates a new installment plan. */
  create(request: CreateInstallmentPlanRequest): Observable<InstallmentPlan> {
    return this.post<InstallmentPlan>('', request);
  }
}
