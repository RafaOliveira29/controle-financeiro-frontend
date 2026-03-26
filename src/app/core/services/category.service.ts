import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiBaseService } from '../api/api-base.service';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../models/category.model';

/**
 * Service responsible for all Category-related API operations.
 *
 * Endpoints consumed (matching .NET backend):
 *   GET    /api/categories?userId={guid}    → list all for user
 *   GET    /api/categories/{id}             → get by id
 *   POST   /api/categories                  → create
 *   PUT    /api/categories/{id}             → update
 *   PATCH  /api/categories/{id}/deactivate  → deactivate (soft-delete)
 */
@Injectable({ providedIn: 'root' })
export class CategoryService extends ApiBaseService {
  protected readonly basePath = '/categories';

  /**
   * Lists all categories for a given user.
   * Backend uses query param: GET /api/categories?userId={guid}
   */
  listByUser(userId: string): Observable<Category[]> {
    const params = new HttpParams().set('userId', userId);
    return this.get<Category[]>('', params);
  }

  /** Gets a single category by its ID. */
  getById(id: string): Observable<Category> {
    return this.get<Category>(`/${id}`);
  }

  /** Creates a new category. */
  create(request: CreateCategoryRequest): Observable<Category> {
    return this.post<Category>('', request);
  }

  /** Updates an existing category. */
  update(id: string, request: UpdateCategoryRequest): Observable<Category> {
    return this.put<Category>(`/${id}`, request);
  }

  /** Deactivates a category (soft-delete). PATCH without body. */
  deactivate(id: string): Observable<void> {
    return this.patch<void>(`/${id}/deactivate`);
  }
}
