import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="bg-surface rounded-xl border border-border shadow-sm overflow-hidden flex flex-col w-full">
      <ng-content></ng-content>
    </div>
  `
})
export class CardComponent {}
