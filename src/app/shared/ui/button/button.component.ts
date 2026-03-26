import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      class="inline-flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer rounded-md text-sm px-4 py-2 w-full sm:w-auto"
      [class]="getVariantClasses()"
      (click)="onClick.emit($event)"
    >
      @if (loading) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'primary';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  getVariantClasses(): string {
    switch (this.variant) {
      case 'primary': return 'bg-primary hover:bg-primary-hover text-surface focus:ring-primary shadow-sm';
      case 'secondary': return 'bg-surface border border-border text-text-primary hover:bg-background focus:ring-border shadow-sm';
      case 'ghost': return 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background focus:ring-border';
      case 'danger': return 'bg-danger hover:bg-red-700 text-surface focus:ring-danger shadow-sm';
    }
  }
}
