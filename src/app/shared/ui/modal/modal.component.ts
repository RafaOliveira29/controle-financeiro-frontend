import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-0">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" (click)="close.emit()"></div>
        
        <!-- Modal panel -->
        <div class="relative transform overflow-hidden rounded-xl bg-surface text-left shadow-2xl ring-1 ring-black/5 transition-all sm:my-8 w-full sm:max-w-lg flex flex-col max-h-[90vh]">
          
          @if (title) {
            <div class="bg-surface px-6 py-4 border-b border-border flex justify-between items-center shrink-0">
              <h3 class="text-lg font-semibold leading-6 text-text-primary">{{ title }}</h3>
              <button (click)="close.emit()" class="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-background cursor-pointer">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          }

          <div class="px-6 py-5 overflow-y-auto bg-surface grow">
            <ng-content></ng-content>
          </div>
          
          <!-- footer -->
          <div class="bg-background px-6 py-4 border-t border-border shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 sm:space-x-reverse gap-3 sm:gap-0">
            <ng-content select="[modal-actions]"></ng-content>
          </div>
        </div>
      </div>
    }
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}
