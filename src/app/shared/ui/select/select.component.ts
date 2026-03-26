import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [FormsModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }],
  template: `
    <div class="flex flex-col w-full text-left">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-text-primary mb-1.5">
          {{ label }}
        </label>
      }
      <div class="relative w-full">
        <select
          [id]="id"
          [disabled]="disabled"
          [(ngModel)]="value"
          (ngModelChange)="onModelChange($event)"
          (blur)="onTouched()"
          class="block w-full rounded-md border bg-surface text-text-primary text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-background disabled:text-text-secondary disabled:cursor-not-allowed cursor-pointer px-3 py-2.5 shadow-sm appearance-none"
          [class]="error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20'"
        >
          @if (placeholder) {
            <option [ngValue]="''" disabled hidden>{{ placeholder }}</option>
          }
          @for (option of options; track option.value) {
            <option [ngValue]="option.value">{{ option.label }}</option>
          }
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-secondary">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      @if (error) {
        <p class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
      }
    </div>
  `
})
export class SelectComponent implements ControlValueAccessor {
  @Input() id = `select-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() options: {label: string, value: any}[] = [];

  value: any = '';
  disabled = false;
  
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onModelChange(val: any) {
    this.value = val;
    this.onChange(val);
  }
}
