import { Component, forwardRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  label: string;
  value: any;
  icon?: string;
}

@Component({
  selector: 'app-custom-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-dropdown.html',
  styleUrl: './custom-dropdown.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomDropdown),
    multi: true
  }]
})
export class CustomDropdown implements ControlValueAccessor, OnChanges {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() label = '';
  @Output() change = new EventEmitter<any>();

  private el = inject(ElementRef);
  isOpen = false;
  selectedOption: DropdownOption | null = null;
  displayValue = '';

  private _value: any = '';
  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this._value !== '') {
      this.syncDisplay();
    }
  }

  writeValue(val: any) {
    this._value = val;
    this.syncDisplay();
  }

  registerOnChange(fn: (val: any) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (this.isOpen && !this.el.nativeElement.contains(e.target as Node)) {
      this.close();
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.scrollToSelected();
    }
  }

  close() {
    this.isOpen = false;
    this.onTouched();
  }

  selectOption(opt: DropdownOption) {
    this.selectedOption = opt;
    this._value = opt.value;
    this.displayValue = opt.label;
    this.onChange(opt.value);
    this.change.emit(opt.value);
    this.close();
  }

  private syncDisplay() {
    const found = this.options.find(o => o.value === this._value);
    if (found) {
      this.selectedOption = found;
      this.displayValue = found.label;
    } else {
      this.selectedOption = null;
      this.displayValue = '';
    }
  }

  private scrollToSelected() {
    requestAnimationFrame(() => {
      const container = this.el.nativeElement.querySelector('.cd-options-list');
      const selected = this.el.nativeElement.querySelector('.cd-option.active');
      if (container && selected) {
        selected.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }
}
