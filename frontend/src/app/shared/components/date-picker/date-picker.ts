import { Component, forwardRef, Input, OnChanges, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DatePicker),
    multi: true
  }]
})
export class DatePicker implements ControlValueAccessor, OnChanges {
  @Input() placeholder = 'Select date';

  private el = inject(ElementRef);
  isOpen = false;
  displayValue = '';
  private _value = '';

  viewDate = new Date();
  selectedDate: Date | null = null;
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarDays: (Date | null)[][] = [];

  // Year picker state
  viewMode: 'calendar' | 'year' = 'calendar';
  yearRangeStart = 0;
  yearGrid: number[] = [];

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnChanges() {}

  writeValue(val: string) {
    this._value = val || '';
    if (val) {
      const d = new Date(val + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        this.selectedDate = d;
        this.displayValue = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        this.viewDate = new Date(d);
      }
    } else {
      this.selectedDate = null;
      this.displayValue = '';
    }
  }

  registerOnChange(fn: (val: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event) {
    if (this.isOpen && !this.el.nativeElement.contains(e.target)) {
      this.close();
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.viewMode = 'calendar';
      if (this.selectedDate) {
        this.viewDate = new Date(this.selectedDate);
      } else {
        this.viewDate = new Date();
      }
      this.buildCalendar();
    }
  }

  close() { this.isOpen = false; this.onTouched(); }

  // === Month Navigation ===
  prevMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToday() {
    this.viewDate = new Date();
    this.buildCalendar();
  }

  // === Year Picker ===
  openYearPicker() {
    this.viewMode = 'year';
    const currentYear = this.viewDate.getFullYear();
    this.yearRangeStart = currentYear - (currentYear % 10) - 1;
    this.buildYearGrid();
  }

  buildYearGrid() {
    this.yearGrid = [];
    for (let i = 0; i < 20; i++) {
      this.yearGrid.push(this.yearRangeStart + i);
    }
  }

  prevYearPage() {
    this.yearRangeStart -= 20;
    this.buildYearGrid();
  }

  nextYearPage() {
    this.yearRangeStart += 20;
    this.buildYearGrid();
  }

  selectYear(y: number) {
    this.viewDate = new Date(y, this.viewDate.getMonth(), 1);
    this.viewMode = 'calendar';
    this.buildCalendar();
  }

  backToCalendar() {
    this.viewMode = 'calendar';
    this.buildCalendar();
  }

  selectDay(d: Date) {
    this.selectedDate = d;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    this._value = `${y}-${m}-${day}`;
    this.displayValue = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    this.onChange(this._value);
    this.close();
  }

  isToday(d: Date): boolean {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  }

  isSelected(d: Date): boolean {
    if (!this.selectedDate) return false;
    return d.getFullYear() === this.selectedDate.getFullYear() && d.getMonth() === this.selectedDate.getMonth() && d.getDate() === this.selectedDate.getDate();
  }

  isCurrentMonth(d: Date): boolean {
    return d.getMonth() === this.viewDate.getMonth() && d.getFullYear() === this.viewDate.getFullYear();
  }

  isCurrentYear(y: number): boolean {
    return y === new Date().getFullYear();
  }

  isViewYear(y: number): boolean {
    return y === this.viewDate.getFullYear();
  }

  get monthLabel(): string {
    return this.viewDate.toLocaleDateString('en-US', { month: 'long' });
  }

  get yearLabel(): string {
    return String(this.viewDate.getFullYear());
  }

  get yearRangeLabel(): string {
    return `${this.yearRangeStart} – ${this.yearRangeStart + 19}`;
  }

  private buildCalendar() {
    const year = this.viewDate.getFullYear();
    const month = this.viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    this.calendarDays = [];
    const weeks: (Date | null)[][] = [];
    let week: (Date | null)[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      week.push(new Date(year, month - 1, daysInPrevMonth - i));
    }
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(new Date(year, month, d));
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    let nextDay = 1;
    while (week.length > 0 && week.length < 7) {
      week.push(new Date(year, month + 1, nextDay++));
    }
    if (week.length > 0) weeks.push(week);
    this.calendarDays = weeks;
  }
}
