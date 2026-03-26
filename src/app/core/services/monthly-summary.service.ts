import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import { MonthlySummary } from '../models/monthly-summary.model';

@Injectable({ providedIn: 'root' })
export class MonthlySummaryService extends ApiBaseService {
  protected readonly basePath = '/monthlysummary';

  /** Gets the monthly financial summary for the specified reference month. */
  getSummary(userId: string, referenceMonth: string): Observable<MonthlySummary> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('referenceMonth', referenceMonth);
      
    // The endpoint is a plain GET mapped on the root of controller
    return this.get<MonthlySummary>('', params);
  }
}
