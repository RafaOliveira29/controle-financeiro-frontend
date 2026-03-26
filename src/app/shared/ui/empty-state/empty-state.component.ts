import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center p-8 md:p-16 text-center rounded-xl border-2 border-dashed border-border bg-surface/50 w-full">
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background mb-4 text-text-secondary ring-8 ring-background/50">
        <ng-content select="[icon]">
          <!-- Default generic icon if none provided -->
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </ng-content>
      </div>
      <h3 class="mt-2 text-base font-semibold text-text-primary">{{ title }}</h3>
      <p class="mt-2 text-sm text-text-secondary max-w-sm mx-auto">{{ description }}</p>
      <div class="mt-8">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() title = 'Nenhum resultado';
  @Input() description = 'Não existem registros para exibir neste momento.';
}
