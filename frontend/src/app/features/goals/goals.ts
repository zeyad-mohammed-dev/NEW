import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CycleService } from '../../services/cycle.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog';
import { LoadingComponent } from '../../shared/components/loading/loading';
import { DatePicker } from '../../shared/components/date-picker/date-picker';
import { CustomDropdown, DropdownOption } from '../../shared/components/custom-dropdown/custom-dropdown';
import { TitlecasePipe } from '../../pipes/titlecase.pipe';
import { TenDayCycle, TenDayTask } from '../../models/new.model';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, EmptyStateComponent, ConfirmDialogComponent, LoadingComponent, DatePicker, TitlecasePipe, CustomDropdown],
  templateUrl: './goals.html',
  styleUrl: './goals.scss'
})
export class Goals implements OnInit {
  private cycleService = inject(CycleService);
  private toast = inject(ToastService);

  loading = true;
  error = '';
  cycle: TenDayCycle | null = null;
  tasks: TenDayTask[] = [];
  history: TenDayCycle[] = [];

  // History expansion
  expandedHistoryId: string | null = null;
  historyTasks: TenDayTask[] = [];
  historyTasksLoading = false;

  showCycleForm = false;
  showEndCycleConfirm = false;
  showCompleteCycleConfirm = false;
  showDeleteHistoryConfirm = false;
  deletingHistoryCycle: TenDayCycle | null = null;
  showDeleteTaskConfirm = false;
  deletingTask: TenDayTask | null = null;
  showEditHistoryForm = false;
  editingHistoryCycle: TenDayCycle | null = null;
  historyEditForm = new FormGroup({ startDate: new FormControl(''), endDate: new FormControl('') });
  readonly priorityOptions: DropdownOption[] = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
  ];

  showTaskForm = false;
  editingTask: TenDayTask | null = null;
  cycleForm = new FormGroup({ startDate: new FormControl(''), endDate: new FormControl('') });
  taskForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    priority: new FormControl('medium')
  });

  ngOnInit() {
    const d = new Date();
    this.cycleForm.patchValue({ startDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` });
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.cycleService.getActive().subscribe({
      next: (c) => {
        this.cycle = c;
        this.loading = false;
        if (c) this.loadTasks();
      },
      error: (e) => { this.error = e.message; this.loading = false; }
    });
    this.cycleService.getHistory().subscribe({
      next: (h) => { this.history = h; },
      error: () => {}
    });
  }

  loadTasks() {
    if (!this.cycle) return;
    this.cycleService.getTasks(this.cycle._id).subscribe({
      next: (t) => { this.tasks = t; },
      error: () => {}
    });
  }

  // History expansion
  toggleHistoryDetail(h: TenDayCycle) {
    if (this.expandedHistoryId === h._id) {
      this.expandedHistoryId = null;
      this.historyTasks = [];
    } else {
      this.expandedHistoryId = h._id;
      this.historyTasksLoading = true;
      this.historyTasks = [];
      this.cycleService.getTasks(h._id).subscribe({
        next: (t) => { this.historyTasks = t; this.historyTasksLoading = false; },
        error: () => { this.historyTasksLoading = false; }
      });
    }
  }

  createCycle() {
    const d = this.cycleForm.value.startDate;
    if (!d) return;
    const ed = this.cycleForm.value.endDate || '';
    this.cycleService.create(d, ed || undefined).subscribe({
      next: () => { this.showCycleForm = false; this.loadData(); this.toast.show('Cycle started!', 'success'); },
      error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to create cycle', 'error'); }
    });
  }

  openTaskForm() { this.editingTask = null; this.taskForm.reset({ name: '', priority: 'medium' }); this.showTaskForm = true; }
  editTask(t: TenDayTask) { this.editingTask = t; this.taskForm.patchValue({ name: t.name, priority: t.priority }); this.showTaskForm = true; }
  cancelTaskForm() { this.showTaskForm = false; this.editingTask = null; }

  submitTask() {
    if (!this.cycle) return;
    const val = this.taskForm.value;
    if (!val.name?.trim()) {
      this.toast.show('Task name is required', 'error');
      return;
    }
    if (this.editingTask) {
      this.cycleService.updateTask(this.cycle._id, this.editingTask._id, { name: val.name, priority: val.priority || 'medium' }).subscribe({
        next: (updated) => {
          const idx = this.tasks.findIndex(x => x._id === this.editingTask!._id);
          if (idx >= 0) this.tasks[idx] = updated;
          this.cancelTaskForm();
          this.toast.show('Task updated', 'success');
        },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update task', 'error'); }
      });
    } else {
      this.cycleService.createTask(this.cycle._id, { name: val.name, priority: val.priority || 'medium' }).subscribe({
        next: (created) => {
          this.tasks.push(created);
          this.cancelTaskForm();
          this.toast.show('Task added', 'success');
        },
        error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to add task', 'error'); }
      });
    }
  }

  toggleTask(t: TenDayTask) {
    if (!this.cycle) return;
    const idx = this.tasks.findIndex(x => x._id === t._id);
    if (idx >= 0) this.tasks[idx] = { ...t, completed: !t.completed };
    this.cycleService.toggleTask(this.cycle._id, t._id).subscribe({
      next: (updated) => {
        const i = this.tasks.findIndex(x => x._id === t._id);
        if (i >= 0) this.tasks[i] = updated;
      },
      error: () => this.loadTasks()
    });
  }

  confirmDeleteTask(t: TenDayTask) {
    this.deletingTask = t;
    this.showDeleteTaskConfirm = true;
  }
  cancelDeleteTask() { this.showDeleteTaskConfirm = false; this.deletingTask = null; }
  get deleteTaskMessage(): string {
    return `Delete "${this.deletingTask?.name || ''}"? This cannot be undone.`;
  }
  doDeleteTask() {
    if (!this.cycle || !this.deletingTask) return;
    const t = this.deletingTask;
    this.cycleService.deleteTask(this.cycle._id, t._id).subscribe({
      next: () => { this.cancelDeleteTask(); this.tasks = this.tasks.filter(x => x._id !== t._id); this.toast.show('Task deleted', 'success'); },
      error: (e) => { this.cancelDeleteTask(); this.toast.show(e.error?.message || e.message || 'Failed to delete task', 'error'); }
    });
  }

  getTotalDays(): number {
    if (!this.cycle) return 10;
    const start = new Date(this.cycle.startDate);
    const end = new Date(this.cycle.endDate);
    return Math.max(Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1, 1);
  }

  getCurrentDay() {
    if (!this.cycle) return 0;
    const start = new Date(this.cycle.startDate);
    const now = new Date();
    const total = this.getTotalDays();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diff, 1), total);
  }

  getProgress() {
    if (!this.tasks.length) return 0;
    const done = this.tasks.filter(t => t.completed).length;
    return Math.round((done / this.tasks.length) * 100);
  }

  allTasksCompleted(): boolean {
    return this.tasks.length > 0 && this.tasks.every(t => t.completed);
  }

  endCycle() { this.showEndCycleConfirm = true; }
  cancelEndCycle() { this.showEndCycleConfirm = false; }
  doEndCycle() {
    if (!this.cycle) return;
    this.cycleService.end(this.cycle._id).subscribe({
      next: () => { this.showEndCycleConfirm = false; this.cycle = null; this.tasks = []; this.loadData(); this.toast.show('Cycle ended and saved to history', 'success'); },
      error: (e) => { this.showEndCycleConfirm = false; this.toast.show(e.error?.message || e.message || 'Failed to end cycle', 'error'); }
    });
  }

  completeCycle() {
    if (!this.allTasksCompleted()) {
      this.toast.show('Complete all tasks first to mark the cycle as completed', 'error');
      return;
    }
    this.showCompleteCycleConfirm = true;
  }
  cancelCompleteCycle() { this.showCompleteCycleConfirm = false; }
  doCompleteCycle() {
    if (!this.cycle) return;
    this.cycleService.complete(this.cycle._id).subscribe({
      next: () => { this.showCompleteCycleConfirm = false; this.cycle = null; this.tasks = []; this.loadData(); this.toast.show('Cycle completed!', 'success'); },
      error: (e) => { this.showCompleteCycleConfirm = false; this.toast.show(e.error?.message || e.message || 'Failed to complete cycle', 'error'); }
    });
  }

  openEditHistory(h: TenDayCycle) {
    this.editingHistoryCycle = h;
    this.historyEditForm.patchValue({
      startDate: h.startDate ? h.startDate.split('T')[0] : '',
      endDate: h.endDate ? h.endDate.split('T')[0] : ''
    });
    this.showEditHistoryForm = true;
  }
  cancelEditHistory() { this.showEditHistoryForm = false; this.editingHistoryCycle = null; }
  // History task editing
  editingHistoryTask: TenDayTask | null = null;
  showEditHistoryTaskForm = false;
  historyTaskForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1)]),
    priority: new FormControl('medium')
  });

  openEditHistoryTask(t: TenDayTask) {
    this.editingHistoryTask = t;
    this.historyTaskForm.patchValue({ name: t.name, priority: t.priority });
    this.showEditHistoryTaskForm = true;
  }
  cancelEditHistoryTask() { this.showEditHistoryTaskForm = false; this.editingHistoryTask = null; }
  submitEditHistoryTask() {
    if (!this.editingHistoryTask || !this.expandedHistoryId) return;
    const val = this.historyTaskForm.value;
    if (!val.name?.trim()) return;
    this.cycleService.updateTask(this.expandedHistoryId, this.editingHistoryTask._id, { name: val.name, priority: val.priority || 'medium' }).subscribe({
      next: (updated) => {
        const idx = this.historyTasks.findIndex(x => x._id === this.editingHistoryTask!._id);
        if (idx >= 0) this.historyTasks[idx] = updated;
        this.cancelEditHistoryTask();
        this.toast.show('Task updated', 'success');
      },
      error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update task', 'error'); }
    });
  }
  toggleHistoryTask(t: TenDayTask) {
    if (!this.expandedHistoryId) return;
    const newCompleted = !t.completed;
    const idx = this.historyTasks.findIndex(x => x._id === t._id);
    if (idx >= 0) this.historyTasks[idx] = { ...t, completed: newCompleted };
    this.cycleService.toggleTask(this.expandedHistoryId, t._id).subscribe({
      next: (updated) => {
        const i = this.historyTasks.findIndex(x => x._id === t._id);
        if (i >= 0) this.historyTasks[i] = updated;
        const allDone = this.historyTasks.length > 0 && this.historyTasks.every(ht => ht.completed);
        if (this.expandedHistoryId) {
          if (allDone) {
            this.cycleService.complete(this.expandedHistoryId).subscribe({
              next: () => {
                this.cycleService.getHistory().subscribe({ next: (h) => { this.history = h; } });
                this.toast.show('All tasks completed! Cycle marked as Complete.', 'success');
              },
              error: () => {}
            });
          } else {
            const cycle = this.history.find(h => h._id === this.expandedHistoryId);
            if (cycle?.status === 'completed') {
              this.cycleService.update(this.expandedHistoryId, { status: 'incomplete' }).subscribe({
                next: () => {
                  this.cycleService.getHistory().subscribe({ next: (h) => { this.history = h; } });
                },
                error: () => {}
              });
            }
          }
        }
      },
      error: () => {
        if (this.expandedHistoryId) this.cycleService.getTasks(this.expandedHistoryId).subscribe({
          next: (tasks) => { this.historyTasks = tasks; }, error: () => {}
        });
      }
    });
  }

  submitEditHistory() {
    if (!this.editingHistoryCycle) return;
    const d = this.historyEditForm.value.startDate;
    const ed = this.historyEditForm.value.endDate;
    if (!d) return;
    const data: any = { startDate: d };
    if (ed) data.endDate = ed;
    this.cycleService.update(this.editingHistoryCycle._id, data).subscribe({
      next: () => {
        this.showEditHistoryForm = false;
        this.editingHistoryCycle = null;
        this.expandedHistoryId = null;
        this.historyTasks = [];
        this.cycleService.getHistory().subscribe({ next: (h) => { this.history = h; } });
        this.toast.show('Cycle updated', 'success');
      },
      error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to update cycle', 'error'); }
    });
  }

  confirmDeleteHistory(h: TenDayCycle) { this.deletingHistoryCycle = h; this.showDeleteHistoryConfirm = true; }
  cancelDeleteHistory() { this.showDeleteHistoryConfirm = false; this.deletingHistoryCycle = null; }
  doDeleteHistory() {
    if (!this.deletingHistoryCycle) return;
    const id = this.deletingHistoryCycle._id;
    this.cycleService.delete(id).subscribe({
      next: () => {
        this.showDeleteHistoryConfirm = false;
        if (this.expandedHistoryId === id) {
          this.expandedHistoryId = null;
          this.historyTasks = [];
        }
        this.deletingHistoryCycle = null;
        this.cycleService.getHistory().subscribe({ next: (h) => { this.history = h; } });
        this.toast.show('Cycle deleted from history', 'success');
      },
      error: (e) => { this.toast.show(e.error?.message || e.message || 'Failed to delete', 'error'); }
    });
  }

  get historyCompletedCount(): number {
    return this.historyTasks.filter(t => t.completed).length;
  }

  get historyTotalCount(): number {
    return this.historyTasks.length;
  }

  formatDate(d: string) { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
}