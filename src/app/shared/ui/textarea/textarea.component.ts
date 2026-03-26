import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextareaComponent), multi: true }],
  template: `
    <div class="flex flex-col w-full text-left">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-text-primary mb-1.5">
          {{ label }}
        </label>
      }
      <textarea
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [value]="value"
        [rows]="rows"
        (input)="onInputChange($event)"
        (blur)="onTouched()"
        class="block w-full rounded-md border bg-surface text-text-primary text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-background disabled:text-text-secondary px-3 py-2.5 shadow-sm resize-y"
        [class]="error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border focus:border-primary focus:ring-primary/20'"
      ></textarea>
      @if (error) {
        <p class="mt-1.5 text-xs font-medium text-danger">{{ error }}</p>
      }
    </div>
  `
})
export class TextareaComponent implements ControlValueAccessor {
  @Input() id = `textarea-${Math.random().toString(36).substr(2, 9)}`;
  @Input() label = '';
  @Input() placeholder = '';
  @Input() error = '';
  @Input() rows = 3;

  value = '';
  disabled = false;
  
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value || '';
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

  onInputChange(event: Event) {
    const val = (event.target as HTMLTextAreaElement).value;
    this.value = val;
    this.onChange(val);
  }
}
