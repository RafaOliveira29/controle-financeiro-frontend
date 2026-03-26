import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
      [class]="getVariantClasses()"
    >
      <ng-content></ng-content>
    </span>
  `
})
export class BadgeComponent {
  @Input() variant: 'success' | 'warning' | 'danger' | 'neutral' | 'primary' = 'neutral';

  getVariantClasses(): string {
    switch(this.variant) {
      case 'success': return 'bg-green-100 text-green-800 border-none';
      case 'warning': return 'bg-amber-100 text-amber-800 border-none';
      case 'danger': return 'bg-red-100 text-red-800 border-none';
      case 'primary': return 'bg-blue-100 text-blue-800 border-none';
      case 'neutral': return 'bg-gray-100 text-gray-800 border-none';
    }
  }
}
