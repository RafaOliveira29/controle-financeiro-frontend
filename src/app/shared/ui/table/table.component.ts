import { Component } from '@angular/core';

@Component({
  selector: 'app-table',
  standalone: true,
  template: `
    <div class="overflow-x-auto w-full rounded-lg border border-border bg-surface shadow-sm">
      <table class="min-w-full divide-y divide-border text-left text-sm">
        <thead class="bg-background text-text-secondary text-xs uppercase tracking-wider">
          <ng-content select="[thead]"></ng-content>
        </thead>
        <tbody class="divide-y divide-border bg-surface text-text-primary">
          <ng-content select="[tbody]"></ng-content>
        </tbody>
      </table>
    </div>
  `
})
export class TableComponent {}
