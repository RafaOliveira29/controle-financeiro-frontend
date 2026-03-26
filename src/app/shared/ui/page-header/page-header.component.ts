import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 w-full gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-text-primary">{{ title }}</h1>
        @if (description) {
          <p class="text-sm text-text-secondary mt-1.5">{{ description }}</p>
        }
      </div>
      <div class="flex items-center space-x-3 shrink-0">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
}
