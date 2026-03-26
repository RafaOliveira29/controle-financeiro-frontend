import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  MonthlyEntry,
  GenerateMonthlyEntriesRequest,
  GenerateMonthlyEntriesResponse,
} from '../models/monthly-entry.model';

@Injectable({ providedIn: 'root' })
export class MonthlyEntryService extends ApiBaseService {
  protected readonly basePath = '/monthlyentries';

  /** Lists all monthly entries for a user in a specific reference month. */
  getAll(userId: string, referenceMonth: string): Observable<MonthlyEntry[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('referenceMonth', referenceMonth);
    return this.get<MonthlyEntry[]>('', params);
  }

  /** Generates monthly entries logic invoking the backend routine. */
  generate(request: GenerateMonthlyEntriesRequest): Observable<GenerateMonthlyEntriesResponse> {
    return this.post<GenerateMonthlyEntriesResponse>('/generate', request);
  }
}
