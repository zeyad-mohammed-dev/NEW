import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { GoalService } from '../../services/goal.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { Goal } from '../../models/new.model';

@Component({
  selector: 'app-oog',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent],
  templateUrl: './oog.html',
  styleUrl: './oog.scss'
})
export class Oog implements OnInit {
  private goalService = inject(GoalService);
  private toast = inject(ToastService);

  loading = true;
  error = '';
  activeOOG: Goal | null = null;
  history: Goal[] = [];

  showForm = false;
  editing = false;
  editingGoal: Goal | null = null;
  form = new FormGroup({ title: new FormControl(''), description: new FormControl('') });

  showDeleteConfirm = false;
  deleteMessage = '';

  ngOnInit() { this.loadAll(); }

  loadAll() {
    this.loading = true;
    this.goalService.getActive().subscribe({
      next: (g) => { this.activeOOG = g; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.goalService.getHistory().subscribe({
      next: (h) => { this.history = h; },
      error: () => {}
    });
  }

  openCreate() { this.editing = false; this.editingGoal = null; this.form.reset(); this.showForm = true; }
  openEdit(goal?: Goal) {
    const g = goal || this.activeOOG;
    if (!g) return;
    this.editing = true;
    this.editingGoal = g;
    this.form.patchValue({ title: g.title, description: g.description || '' });
    this.showForm = true;
  }
  cancelForm() { this.showForm = false; this.editingGoal = null; }

  submitForm() {
    const val = this.form.value;
    if (!val.title?.trim()) return;
    const rawDesc = val.description;
    const desc = (rawDesc !== null && rawDesc !== undefined) ? String(rawDesc) : '';
    if (this.editing && this.editingGoal) {
      this.goalService.update(this.editingGoal._id, { title: val.title, description: desc }).subscribe({
        next: () => { this.cancelForm(); this.loadAll(); this.toast.show('Goal updated', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update goal', 'error'); }
      });
    } else {
      this.goalService.create({ title: val.title, description: desc || undefined }).subscribe({
        next: () => { this.cancelForm(); this.loadAll(); this.toast.show('Goal created', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create goal', 'error'); }
      });
    }
  }

  completeOOG() {
    if (!this.activeOOG) return;
    this.goalService.complete(this.activeOOG._id).subscribe({
      next: () => { this.loadAll(); this.toast.show('Goal completed!', 'success'); },
      error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to complete goal', 'error'); }
    });
  }

  confirmDelete(goal: Goal) {
    this.editingGoal = goal;
    this.deleteMessage = `Delete goal "${goal.title}"?`;
    this.showDeleteConfirm = true;
  }
  cancelDelete() { this.showDeleteConfirm = false; this.editingGoal = null; }
  doDelete() {
    if (!this.editingGoal) return;
    this.goalService.delete(this.editingGoal._id).subscribe({
      next: () => { this.cancelDelete(); this.loadAll(); this.toast.show('Goal deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete goal', 'error'); }
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}