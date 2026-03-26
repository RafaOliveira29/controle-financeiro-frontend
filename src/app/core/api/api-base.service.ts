import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiError, parseApiError } from './api-error';

/**
 * Base API service providing common HTTP operations.
 *
 * All feature-specific services should extend this class to gain:
 * - Centralized base URL resolution
 * - Consistent error handling
 * - Typed HTTP methods
 *
 * Usage:
 *   @Injectable({ providedIn: 'root' })
 *   export class CategoryService extends ApiBaseService {
 *     protected override basePath = '/categories';
 *   }
 */
@Injectable({ providedIn: 'root' })
export abstract class ApiBaseService {
  protected readonly http = inject(HttpClient);
  protected abstract readonly basePath: string;

  /** Builds the full URL for a given endpoint path. */
  protected url(path: string = ''): string {
    return `${environment.apiUrl}${this.basePath}${path}`;
  }

  /** GET request */
  protected get<T>(path: string = '', params?: HttpParams): Observable<T> {
    return this.http
      .get<T>(this.url(path), { params })
      .pipe(catchError((err) => this.handleError(err)));
  }

  /** POST request */
  protected post<T>(path: string = '', body: unknown = {}): Observable<T> {
    return this.http
      .post<T>(this.url(path), body)
      .pipe(catchError((err) => this.handleError(err)));
  }

  /** PUT request */
  protected put<T>(path: string = '', body: unknown = {}): Observable<T> {
    return this.http
      .put<T>(this.url(path), body)
      .pipe(catchError((err) => this.handleError(err)));
  }

  /** PATCH request */
  protected patch<T>(path: string = '', body: unknown = {}): Observable<T> {
    return this.http
      .patch<T>(this.url(path), body)
      .pipe(catchError((err) => this.handleError(err)));
  }

  /** DELETE request */
  protected delete<T>(path: string = ''): Observable<T> {
    return this.http
      .delete<T>(this.url(path))
      .pipe(catchError((err) => this.handleError(err)));
  }

  /** Centralized error handler — arrow function ensures proper `this` binding. */
  private handleError = (error: any): Observable<never> => {
    const apiError: ApiError = parseApiError(error);
    console.error(`[API Error] ${apiError.statusCode}: ${apiError.message}`, error);
    return throwError(() => apiError);
  };
}
