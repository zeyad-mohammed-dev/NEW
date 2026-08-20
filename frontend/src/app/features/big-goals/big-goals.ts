import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { BigGoalService } from '../../services/big-goal.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { DatePicker } from '../../shared/components/date-picker/date-picker';
import { BigGoal } from '../../models/new.model';

@Component({
  selector: 'app-big-goals',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent, DatePicker],
  templateUrl: './big-goals.html',
  styleUrl: './big-goals.scss'
})
export class BigGoals implements OnInit {
  private bigGoalService = inject(BigGoalService);
  private toast = inject(ToastService);

  loading = true;
  error = '';
  goals: BigGoal[] = [];
  statusFilter = 'all';

  // Form
  showForm = false;
  editing = false;
  editingGoal: BigGoal | null = null;
  form = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    targetDate: new FormControl('')
  });

  // Delete
  showDeleteConfirm = false;
  deleteTarget: BigGoal | null = null;
  deleteMessage = '';

  showDetailModal = false;
detailEntry: BigGoal | null = null;

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const status = this.statusFilter === 'all' ? undefined : this.statusFilter;
    this.bigGoalService.getAll(status).subscribe({
      next: (g) => { this.goals = g; this.loading = false; },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
  }

  filterByStatus(s: string) { this.statusFilter = s; this.load(); }

  openDetail(g: BigGoal) { this.detailEntry = g; this.showDetailModal = true; }
closeDetail() { this.showDetailModal = false; this.detailEntry = null; }

  openCreate() {
    this.editing = false;
    this.editingGoal = null;
    this.form.reset();
    this.showForm = true;
  }

  openEdit(g: BigGoal) {
    this.editing = true;
    this.editingGoal = g;
    this.form.patchValue({
      title: g.title,
      description: g.description || '',
      targetDate: g.targetDate ? g.targetDate.split('T')[0] : ''
    });
    this.showForm = true;
  }

  cancelForm() { this.showForm = false; this.editingGoal = null; }

  submit() {
    const val = this.form.value;
    if (!val.title?.trim()) return;
    const rawDesc = val.description;
    const payload: any = { title: val.title, description: (rawDesc !== null && rawDesc !== undefined) ? String(rawDesc) : '', targetDate: val.targetDate || null };
    if (this.editing && this.editingGoal) {
      this.bigGoalService.update(this.editingGoal._id, payload).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Big goal updated', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update big goal', 'error'); }
      });
    } else {
      this.bigGoalService.create(payload).subscribe({
        next: () => { this.cancelForm(); this.load(); this.toast.show('Big goal created', 'success'); },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create big goal', 'error'); }
      });
    }
  }

  toggleStatus(g: BigGoal) {
    const newStatus = g.status === 'active' ? 'completed' : 'active';
    this.bigGoalService.update(g._id, { status: newStatus }).subscribe({
      next: () => { this.load(); this.toast.show(newStatus === 'completed' ? 'Big goal completed!' : 'Big goal reactivated', 'success'); },
      error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update status', 'error'); }
    });
  }

  confirmDelete(g: BigGoal) {
    this.deleteTarget = g;
    this.deleteMessage = `Delete "${g.title}"? This cannot be undone.`;
    this.showDeleteConfirm = true;
  }
  cancelDelete() { this.showDeleteConfirm = false; this.deleteTarget = null; }
  doDelete() {
    if (!this.deleteTarget) return;
    this.bigGoalService.delete(this.deleteTarget._id).subscribe({
      next: () => { this.cancelDelete(); this.load(); this.toast.show('Big goal deleted', 'success'); },
      error: (e) => { this.cancelDelete(); this.toast.show(e.error?.message || e.message || 'Failed to delete big goal', 'error'); }
    });
  }

  formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
