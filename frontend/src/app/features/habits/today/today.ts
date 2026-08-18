import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { HabitService } from '../../../services/habit.service';
import { ToastService } from '../../../core/services/toast.service';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../../shared/components/loading/loading';
import { CelebrationComponent } from '../celebration/celebration';
import { HabitWithStatus } from '../../../models/new.model';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [RouterLink, FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent, CelebrationComponent],
  templateUrl: './today.html',
  styleUrl: './today.scss'
})
export class Today implements OnInit {
  private habitService = inject(HabitService);
  private toast = inject(ToastService);

  loading = true;
  error = '';
  habits: HabitWithStatus[] = [];
  habitsCompletedCount = 0;
  allComplete = false;
  formattedTodayDate = '';

  // Form
  showForm = false;
  editingHabit: any = null;
  form = new FormGroup({ name: new FormControl(''), time: new FormControl('') });

  // Delete
  showDeleteConfirm = false;
  deleteTarget: any = null;
  deleteMessage = '';

  ngOnInit() {
    this.formattedTodayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    this.loadToday();
  }

  loadToday() {
    this.loading = true;
    this.habitService.getToday().subscribe({
      next: (d) => {
        this.habits = d.habits;
        this.recalcCounts();
        this.loading = false;
      },
      error: (e) => { this.error = e.message || 'Failed to load'; this.loading = false; }
    });
  }

  private recalcCounts() {
    this.habitsCompletedCount = this.habits.filter(h => h.completed).length;
    this.allComplete = this.habits.length > 0 && this.habitsCompletedCount === this.habits.length;
  }

  refreshToday() {
    this.habitService.getToday().subscribe({
      next: (d) => { this.habits = d.habits; this.recalcCounts(); },
      error: () => {}
    });
  }

  toggleHabit(id: string) {
    const habit = this.habits.find(h => h._id === id);
    if (habit) {
      habit.completed = !habit.completed;
      this.recalcCounts();
    }
    this.habitService.toggleComplete(id).subscribe({
      next: () => this.refreshToday(),
      error: () => this.refreshToday()
    });
  }

  addHabit() {
    this.editingHabit = null;
    this.form.reset();
    this.showForm = true;
  }

  editHabit(h: any) {
    this.editingHabit = h;
    this.form.patchValue({ name: h.name, time: h.time || '' });
    this.showForm = true;
  }

  onCancelForm() { this.showForm = false; this.editingHabit = null; }

  onSave() {
    const val = this.form.value;
    if (!val.name?.trim()) return;
    const rawTime = val.time;
    const time = (rawTime !== null && rawTime !== undefined) ? String(rawTime).trim() : '';
    const payload: any = { name: val.name };
    if (time) payload.time = time; else payload.time = '';
    if (this.editingHabit) {
      this.habitService.update(this.editingHabit._id, payload).subscribe({
        next: () => { this.onCancelForm(); this.loadToday(); this.toast.show('Habit updated', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update habit', 'error'); }
      });
    } else {
      this.habitService.create(payload).subscribe({
        next: () => { this.onCancelForm(); this.loadToday(); this.toast.show('Habit created', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create habit', 'error'); }
      });
    }
  }

  moveHabit(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.habits.length) return;
    const temp = this.habits[index];
    this.habits[index] = this.habits[newIndex];
    this.habits[newIndex] = temp;
    this.reorderOnServer();
  }

  private reorderOnServer() {
    const reorder = this.habits.map((h, i) => ({ id: h._id, order: i }));
    this.habitService.reorder(reorder).subscribe({
      next: (updated) => { this.habits = updated; },
      error: () => { this.loadToday(); }
    });
  }

  confirmDelete(h: any) {
    this.deleteTarget = h;
    this.deleteMessage = `Delete "${h.name}"? This cannot be undone.`;
    this.showDeleteConfirm = true;
  }
  cancelDelete() { this.showDeleteConfirm = false; this.deleteTarget = null; }
  doDelete() {
    if (!this.deleteTarget) return;
    this.habitService.delete(this.deleteTarget._id).subscribe({
      next: () => { this.cancelDelete(); this.loadToday(); this.toast.show('Habit deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete habit', 'error'); }
    });
  }
}
